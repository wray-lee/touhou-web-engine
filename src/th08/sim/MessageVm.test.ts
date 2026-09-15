/**
 * The message VM is checked against a recording host rather than a renderer:
 * every assertion below is a claim about what `Gui::RunMsg` does, and the
 * stage-one script from `msg1a.dat` is the fixture.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { parseMsg, MSG_OP, type MsgScript } from '../format/MsgFile';
import {
  MessageVm,
  MSG_THRESHOLD_INITIAL,
  MSG_SOUND_MOVE_MENU,
  MSG_SOUND_SELECT,
  idleMessageInput,
  type MessageInput,
  type MessageVmHost,
} from './MessageVm';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'msg1a.dat'));

interface Recorded {
  line: number;
  color: number;
  text: string;
}

function recorder(): {
  host: MessageVmHost;
  draws: Recorded[];
  sprites: Array<[number, number]>;
  interrupts: Array<[number, number]>;
  sounds: number[];
  requests: number[];
  routes: number[];
  flags: string[];
  collects: number[];
  branch: Map<number, MsgScript>;
} {
  const draws: Recorded[] = [];
  const sprites: Array<[number, number]> = [];
  const interrupts: Array<[number, number]> = [];
  const sounds: number[] = [];
  const requests: number[] = [];
  const routes: number[] = [];
  const flags: string[] = [];
  const collects: number[] = [];
  const branch = new Map<number, MsgScript>();
  return {
    draws,
    sprites,
    interrupts,
    sounds,
    requests,
    routes,
    flags,
    collects,
    branch,
    host: {
      portraitScript: (slot, script) => flags.push(`script ${slot}/${script}`),
      portraitSprite: (slot, sprite) => sprites.push([slot, sprite]),
      portraitInterrupt: (slot, code) => interrupts.push([slot, code]),
      drawLine: (line, color, text) => draws.push({ line, color, text }),
      clearLine: (line) => flags.push(`clear ${line}`),
      bgm: (track) => flags.push(`bgm ${track}`),
      fadeBgm: () => flags.push('fade'),
      faceCutIn: () => flags.push('cutin'),
      screenEffect: () => flags.push('effect'),
      stageResult: () => flags.push('result'),
      stageClear: () => flags.push('clear-flag'),
      sound: (id) => sounds.push(id),
      routeChosen: (choice) => routes.push(choice),
      requestMessage: (id) => requests.push(id),
      branchScript: (id) => branch.get(id) ?? null,
      autoCollectItems: () => collects.push(1),
    },
  };
}

/** Hand-built streams use the same `4 + argSize` shape the real files do. */
const xorText = (value: string): number[] => [...value].map((ch) => ch.codePointAt(0)! ^ 0x77);

/** Every multi-byte operand in a `.dat` script is little-endian. */
const i16v = (v: number): number[] => [v & 0xff, (v >> 8) & 0xff];
const i32v = (v: number): number[] => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >> 24) & 0xff];

function script(instructions: Array<[number, number, number[]]>): MsgScript {
  return {
    offset: 0,
    truncated: false,
    instructions: instructions.map(([time, opcode, args]) => ({
      time,
      opcode,
      args: Uint8Array.from(args),
    })),
  };
}

const press = (over: Partial<MessageInput> = {}): MessageInput => ({
  ...idleMessageInput(),
  ...over,
});

describe('MessageVm', () => {
  it('runs instructions on their frame marks and holds before them', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.textAppend, xorText('ONE')],
        [3, MSG_OP.textAppend, xorText('TWO')],
        [0, MSG_OP.end, []],
      ]),
    );
    vm.tick(press());
    expect(rec.draws.map((d) => d.text)).toEqual(['ONE']);
    vm.tick(press());
    expect(rec.draws).toHaveLength(1);
    vm.tick(press());
    vm.tick(press());
    expect(rec.draws.map((d) => d.text)).toEqual(['ONE', 'TWO']);
    vm.tick(press());
    expect(vm.active).toBe(false);
    expect(vm.messageId).toBe(-1);
  });

  it('keeps a wait on the same instruction without ageing the script', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      1,
      script([
        [0, MSG_OP.wait, i32v(3)],
        [0, MSG_OP.textAppend, xorText('AFTER')],
        [0, MSG_OP.end, []],
      ]),
    );
    // A three-frame wait occupies three ticks and only releases on the fourth.
    // `:736-737` bumps `framesElapsedDuringPause` and then jumps past `timer++`,
    // so a paused script never ages - which is what keeps the frame marks after
    // a wait from drifting.
    const before = vm.framesElapsed;
    vm.tick(press());
    vm.tick(press());
    vm.tick(press());
    expect(vm.instructionIndex).toBe(0);
    expect(vm.framesElapsed).toBe(before);
    expect(rec.draws).toHaveLength(0);
    vm.tick(press());
    expect(rec.draws.map((d) => d.text)).toEqual(['AFTER']);
  });

  it('lets a shoot press cut a wait short only past `waitThreshold`', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.wait, i32v(100)],
        [0, MSG_OP.textAppend, xorText('A')],
        [0, MSG_OP.wait, i32v(100)],
        [0, MSG_OP.textAppend, xorText('B')],
        [0, MSG_OP.end, []],
      ]),
    );
    // `:341` arms a fresh message with a six-frame threshold, and the press is
    // checked against it before the shot count is (`:723-727`).
    for (let f = 0; f < MSG_THRESHOLD_INITIAL; f++) {
      vm.tick(press({ shoot: true, shootPressed: true }));
    }
    expect(rec.draws).toHaveLength(0);
    vm.tick(press({ shoot: true, shootPressed: true }));
    expect(rec.draws.map((d) => d.text)).toEqual(['A']);
    // `:741` a shoot-skipped wait leaves eight frames behind, and op 16 zeroes
    // the pause clock at `:646`, so the second wait needs eight more.
    for (let f = 0; f < 7; f++) {
      vm.tick(press({ shoot: true, shootPressed: true }));
    }
    expect(rec.draws).toHaveLength(1);
    vm.tick(press({ shoot: true, shootPressed: true }));
    expect(rec.draws.map((d) => d.text)).toEqual(['A', 'B']);
    // None of this aged the script: the waits jump past `timer++` entirely.
    expect(vm.framesElapsed).toBe(0);
  });

  it('honours the skippable flag for the whole dialogue', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.skippable, [1]],
        [0, MSG_OP.textAppend, xorText('A')],
        [0, MSG_OP.wait, i32v(200)],
        [0, MSG_OP.textAppend, xorText('B')],
        [0, MSG_OP.end, []],
      ]),
    );
    // Left alone, a two-hundred-frame wait holds the script open.
    for (let f = 0; f < 20; f++) vm.tick(press());
    expect(vm.active).toBe(true);
    expect(rec.draws.map((d) => d.text)).toEqual(['A']);
    // `:373-379` teleports the clock onto the pending instruction and
    // `:721-722` lets a skippable wait fall straight through, so one frame of
    // held skip drains the rest of the script.
    vm.tick(press({ skip: true }));
    expect(vm.active).toBe(false);
    expect(rec.draws.map((d) => d.text)).toEqual(['A', 'B']);
  });

  it('pages two lines then rewinds to the top', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.textAppend, xorText('L0')],
        [0, MSG_OP.textAppend, xorText('L1')],
        [0, MSG_OP.textAppend, xorText('L2')],
        [0, MSG_OP.wait, [0, 0, 0, 0]],
        [0, MSG_OP.textAppend, xorText('PAGE2')],
        [0, MSG_OP.end, []],
      ]),
    );
    for (let f = 0; f < 8; f++) vm.tick(press());
    expect(rec.draws.map((d) => `${d.line}:${d.text}`)).toEqual(['0:L0', '1:L1', '1:L2', '0:PAGE2']);
  });

  it('takes the second line down with a new line-zero page', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.text, [...i16v(0), ...i16v(0), ...xorText('A')]],
        [0, MSG_OP.text, [...i16v(0), ...i16v(1), ...xorText('B')]],
        [0, MSG_OP.text, [...i16v(2), ...i16v(0), ...xorText('C')]],
        [0, MSG_OP.end, []],
      ]),
    );
    for (let f = 0; f < 6; f++) vm.tick(press());
    expect(rec.draws.map((d) => `${d.line}/${d.color}:${d.text}`)).toEqual(['0/0:A', '1/0:B', '0/2:C']);
    expect(rec.flags).toContain('clear 1');
  });

  it('drives the four face slots with the cross-side interrupt', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.portraitScripts, [...i32v(0), ...i32v(6), ...i32v(-1), ...i32v(-1), ...i32v(-1)]],
        [0, MSG_OP.portraitScripts, [...i32v(2), ...i32v(-1), ...i32v(-1), ...i32v(5), ...i32v(-1)]],
        [0, MSG_OP.end, []],
      ]),
    );
    for (let f = 0; f < 4; f++) vm.tick(press());
    // `:345` starts a message with `currentPortrait = 0xff`, so the first op 15
    // matches no slot and arms all four with the plain hide.
    expect(rec.interrupts.slice(0, 5)).toEqual([
      [0, 4],
      [1, 4],
      [2, 4],
      [3, 4],
      [0, 3],
    ]);
    // Crossing from slot 0 to slot 2 straddles the player/enemy divide, so the
    // outgoing face gets code 6 instead of 4 (`:406-411`).
    expect(rec.interrupts).toContainEqual([0, 6]);
    expect(rec.interrupts).toContainEqual([2, 3]);
    expect(rec.sprites).toEqual([
      [0, 6],
      [2, 5],
    ]);
    expect(vm.side).toBe(2);
  });

  it('selects a route on the arrow keys and commits it on shoot', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    // The stage-four branch is script 1 for choice 0 and 2 for choice 1, which
    // is exactly what `FUN_00439810(routeChoice + 1)` asks for.
    rec.branch.set(
      1,
      script([
        [0, MSG_OP.textAppend, xorText('FINAL')],
        [0, MSG_OP.end, []],
      ]),
    );
    vm.play(
      0,
      script([
        [0, MSG_OP.routeChoice, i32v(200)],
        [0, MSG_OP.routeCommit, []],
        [0, MSG_OP.end, []],
      ]),
    );
    vm.tick(press({ downPressed: true }));
    expect(vm.routeChoice).toBe(1);
    expect(rec.sounds).toEqual([MSG_SOUND_MOVE_MENU]);
    vm.tick(press({ upPressed: true }));
    expect(vm.routeChoice).toBe(0);
    expect(rec.sounds).toHaveLength(2);
    // The prompt ignores shoot for its first 60 frames (`:700`).
    for (let f = 0; f < 40; f++) vm.tick(press({ shoot: true, shootPressed: true }));
    expect(vm.instructionIndex).toBe(0);
    expect(rec.routes).toEqual([]);
    for (let f = 0; f < 25; f++) vm.tick(press());
    vm.tick(press({ shoot: true, shootPressed: true }));
    expect(rec.sounds).toContain(MSG_SOUND_SELECT);
    // `:715-719` the commit publishes the choice, starts the branch script, and
    // `continue`s into it, so the old instruction pointer is gone by now.
    expect(rec.routes).toEqual([0]);
    expect(rec.requests).toEqual([1]);
    expect(vm.messageId).toBe(1);
    vm.tick(press());
    expect(rec.draws.at(-1)?.text).toBe('FINAL');
  });

  it('maps the remaining side effects onto the host', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.bgm, [0, 0, 0, 0]],
        [0, MSG_OP.bgm, [0xff, 0xff, 0xff, 0xff]],
        [0, MSG_OP.fadeMusic, []],
        [0, MSG_OP.faceCutIn, []],
        [0, MSG_OP.screenEffect, []],
        [0, MSG_OP.stageResult, []],
        [0, MSG_OP.ignoreWait, []],
        [0, MSG_OP.messageFlag, [3]],
        [0, MSG_OP.nop, []],
        [0, MSG_OP.end, []],
      ]),
    );
    for (let f = 0; f < 12; f++) vm.tick(press());
    expect(rec.flags).toEqual(['clear 0', 'clear 1', 'bgm 0', 'bgm -1', 'fade', 'cutin', 'effect', 'result']);
    expect(vm.flag).toBe(3);
    expect(vm.waitsIgnored).toBe(1);
  });

  it('arms the stage-clear flag exactly once and keeps walking', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(
      0,
      script([
        [0, MSG_OP.stageClear, []],
        [0, MSG_OP.textAppend, xorText('AFTER')],
        [0, MSG_OP.end, []],
      ]),
    );
    vm.tick(press());
    expect(rec.flags).toContain('clear-flag');
    expect(rec.flags.filter((f) => f === 'clear-flag')).toHaveLength(1);
    expect(rec.draws.map((d) => d.text)).toEqual(['AFTER']);
    expect(vm.active).toBe(false);
  });
});

describe.skipIf(!hasAssets)('MessageVm on retail msg1a.dat', () => {
  const load = (name: string, i = 0): MsgScript =>
    parseMsg(new Uint8Array(fs.readFileSync(path.join(RAW_DIR, name)))).scripts[i];

  it('draws the stage-one opening in retail order and paging', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    vm.play(0, load('msg1a.dat'));
    for (let f = 0; f < 400 && vm.active; f++) vm.tick(press({ shoot: true, shootPressed: f % 9 === 0 }));
    expect(rec.draws.slice(0, 6).map((d) => `${d.line}/${d.color}:${d.text}`)).toEqual([
      '0/0:ほら何も無いじゃないの！',
      '0/1:まだ、夜は始まったばっかよ。',
      '1/1:焦らないの。',
      // `:494` op 17 re-points `currentSide` at slot 0, and op 16 colours from
      // that (`:641`), so the third page is back in Reimu's colour, not Yukari's.
      '0/0:焦って私を連れ出しておいて',
      '1/0:焦らないも何も無いでしょ？',
      '0/0:報酬は高く付くから覚えときなさい。',
    ]);
    expect(vm.active).toBe(false);
  });

  it('vacuum-collects items on every frame a message is up, but not while dying', () => {
    const rec = recorder();
    const vm = new MessageVm(rec.host);
    const script = load('msg1a.dat');
    vm.play(0, script);
    for (let f = 0; f < 20; f++) vm.tick(press());
    expect(rec.collects.length).toBeGreaterThan(0);
    const seen = rec.collects.length;
    for (let f = 0; f < 20; f++) vm.tick(press({ dying: true }));
    expect(rec.collects).toHaveLength(seen);
    vm.stop();
    for (let f = 0; f < 5; f++) vm.tick(press());
    expect(rec.collects).toHaveLength(seen);
  });

  it('keeps every shipped script finite and terminating', () => {
    for (const name of fs
      .readdirSync(RAW_DIR)
      .filter((f) => /^msg.+\.dat$/.test(f))
      .sort()) {
      const rec = recorder();
      const vm = new MessageVm(rec.host);
      const file = parseMsg(new Uint8Array(fs.readFileSync(path.join(RAW_DIR, name))));
      // A host always has the whole file in hand - `LoadMsg` (`:2351`) maps it
      // once - so op 22 can reach its branch script.
      file.scripts.forEach((entry, id) => rec.branch.set(id, entry));
      file.scripts.forEach((entry, id) => {
        if (!entry.instructions.length) return;
        vm.play(id, entry);
        for (let f = 0; f < 4000 && vm.active; f++) vm.tick(press({ shoot: true, shootPressed: true }));
        expect(vm.active, `${name} script ${id} never finished`).toBe(false);
      });
      expect(rec.draws.length).toBeGreaterThanOrEqual(0);
    }
  });
});
