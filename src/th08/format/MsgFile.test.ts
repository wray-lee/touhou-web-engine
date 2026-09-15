/**
 * The dialogue scripts are the last big block of retail content the reproduction
 * reads straight out of `th08.dat`, so the parser is checked against the shipped
 * `msg??.dat` files and not a hand-made fixture.
 *
 * The invariants below are all derived from `Gui::RunMsg`: `Gui.cpp:897-902` fixes
 * the `4 + argSize` footprint, `:391` makes opcode 0 the terminator, and
 * `FUN_004353ec` (`:927-938`) defines the 0x77 text obfuscation.
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  MSG_HEADER_BYTES,
  MSG_OP,
  MSG_TEXT_XOR,
  msgI16,
  msgI32,
  msgText,
  msgTextColor,
  msgTextBody,
  msgTextLine,
  parseMsg,
} from './MsgFile';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'msg1a.dat'));
const msgFiles = hasAssets
  ? fs
      .readdirSync(RAW_DIR)
      .filter((name) => /^msg.+\.dat$/.test(name))
      .sort()
  : [];

const load = (name: string) => parseMsg(new Uint8Array(fs.readFileSync(path.join(RAW_DIR, name))));

/** Every `textAppend` string in a script, in the order the VM would draw them. */
function spoken(file: ReturnType<typeof load>, script = 0): string[] {
  return file.scripts[script].instructions
    .filter((ins) => ins.opcode === MSG_OP.textAppend)
    .map((ins) => msgText(ins.args));
}

/** Shift_JIS and ASCII agree below 0x80, so ASCII is enough to build a script. */
const xorText = (value: string): number[] => [...value].map((ch) => ch.charCodeAt(0) ^ MSG_TEXT_XOR);

type Instr = [time: number, opcode: number, args: number[]];

function buildMsg(scripts: Instr[][]): Uint8Array {
  const bodies = scripts.map((instructions) => {
    const bytes: number[] = [];
    for (const [time, opcode, args] of instructions) {
      bytes.push(time & 0xff, (time >> 8) & 0xff, opcode, args.length, ...args);
    }
    return bytes;
  });
  const headerBytes = 4 + scripts.length * 4;
  const total = headerBytes + bodies.reduce((sum, body) => sum + body.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setInt32(0, scripts.length, true);
  let at = headerBytes;
  bodies.forEach((body, i) => {
    view.setInt32(4 + i * 4, at, true);
    out.set(body, at);
    at += body.length;
  });
  return out;
}

describe('MsgFile format', () => {
  it('splits the offset table into one script per entry', () => {
    const file = parseMsg(
      buildMsg([
        [
          [0, MSG_OP.portraitScripts, [0, 0, 0, 0, 6, 0xff, 0xff, 0xff, 0xff]],
          [60, MSG_OP.textAppend, xorText('YUKARI')],
          [0, MSG_OP.end, []],
        ],
        [
          [0, MSG_OP.wait, [0, 2, 0, 0]],
          [0, MSG_OP.end, []],
        ],
      ]),
    );
    expect(file.scripts).toHaveLength(2);
    expect(file.scripts[0].instructions.map((ins) => ins.opcode)).toEqual([15, 16, 0]);
    expect(file.scripts[1].instructions.map((ins) => ins.opcode)).toEqual([4, 0]);
    expect(file.scripts[0].offset).toBe(12);
    expect(file.scripts[1].offset).toBeGreaterThan(file.scripts[0].offset);
    expect(spoken(file)).toEqual(['YUKARI']);
  });

  it('stops a script at its terminator and never reads past it', () => {
    const bytes = buildMsg([
      [
        [0, MSG_OP.end, []],
        [9, MSG_OP.nop, []],
      ],
    ]);
    const [script] = parseMsg(bytes).scripts;
    expect(script.instructions).toHaveLength(1);
    expect(script.truncated).toBe(false);
  });

  it('decodes the 0x77 run and stops at the NUL that the XOR produces', () => {
    const padded = Uint8Array.from([...xorText('REIMU'), ...'wwww'.split('').map((ch) => ch.charCodeAt(0))]);
    expect(msgText(padded)).toBe('REIMU');
    expect(msgText(Uint8Array.from(xorText('AB')), 1)).toBe('B');
  });

  it('reads the GuiMessageTextArgs header before the body', () => {
    const args = Uint8Array.from([2, 0, 1, 0, ...xorText('HOURAI')]);
    expect(msgTextColor(args)).toBe(2);
    expect(msgTextLine(args)).toBe(1);
    expect(msgTextBody(args)).toBe('HOURAI');
    expect(msgText(args)).not.toBe('HOURAI');
  });

  it('reads the little-endian operand widths the VM uses', () => {
    const args = Uint8Array.from([0xf0, 0xff, 0x03, 0x00, 0x20, 0x4e, 0x00, 0x00]);
    expect(msgI16(args, 0)).toBe(-16);
    expect(msgI16(args, 2)).toBe(3);
    expect(msgI32(args, 4)).toBe(20000);
    expect(msgI32(args, 6)).toBe(0);
  });

  it('yields nothing for a header that cannot be a script table', () => {
    expect(parseMsg(new Uint8Array(0)).scripts).toEqual([]);
    expect(parseMsg(new Uint8Array([0, 0, 0, 0])).scripts).toEqual([]);
    const absurd = new Uint8Array(16);
    new DataView(absurd.buffer).setInt32(0, 9999, true);
    expect(parseMsg(absurd).scripts).toEqual([]);
  });
});

describe.skipIf(!hasAssets)('MsgFile (real th08.dat dialogue)', () => {
  it('reads every shipped script to its terminator', () => {
    let scripts = 0;
    let instructions = 0;
    let empty = 0;
    for (const name of msgFiles) {
      for (const script of load(name).scripts) {
        scripts++;
        instructions += script.instructions.length;
        expect(script.truncated).toBe(false);
        if (!script.instructions.length) {
          empty++;
          continue;
        }
        const last = script.instructions[script.instructions.length - 1];
        expect(last.opcode).toBe(MSG_OP.end);
      }
    }
    // Census of the 33 files in th08.dat: eight of the entries are placeholders
    // that the VM is never asked to run, and opcode 0 is the only rewind.
    expect(msgFiles).toHaveLength(33);
    expect(scripts).toBe(144);
    expect(instructions).toBe(6426);
    expect(empty).toBe(8);
  });

  it('keeps frame marks monotonic inside a script', () => {
    for (const name of msgFiles) {
      for (const script of load(name).scripts) {
        for (let i = 1; i < script.instructions.length; i++) {
          const here = script.instructions[i];
          if (here.opcode === MSG_OP.end) continue;
          expect(here.time).toBeGreaterThanOrEqual(script.instructions[i - 1].time);
        }
      }
    }
  });

  it('recovers the stage-one opening in the order the VM draws it', () => {
    expect(spoken(load('msg1a.dat')).slice(0, 5)).toEqual([
      'ほら何も無いじゃないの！',
      'まだ、夜は始まったばっかよ。',
      '焦らないの。',
      '焦って私を連れ出しておいて',
      '焦らないも何も無いでしょ？',
    ]);
  });

  it('keeps the explicit-line joke on op 3, where the colour is named', () => {
    const script = load('msg1a.dat').scripts[0];
    const lines = script.instructions.filter((ins) => ins.opcode === MSG_OP.text);
    expect(lines.map((ins) => msgTextBody(ins.args))).toEqual([
      'って、さっきから何にも無いって……',
      '私が居たでしょ！',
    ]);
    expect(lines.map((ins) => msgTextColor(ins.args))).toEqual([2, 2]);
    expect(lines.map((ins) => msgTextLine(ins.args))).toEqual([0, 1]);
  });

  it('carries the stage-four and stage-one scripts in the same shape', () => {
    expect(spoken(load('msg4ab.dat')).slice(0, 2)).toEqual([
      'ちょっと待て！',
      '何だ、何時までも夜が明けないから',
    ]);
    expect(spoken(load('msg1b.dat')).length).toBeGreaterThan(4);
  });

  it('names the route choice as stage fives, matching isGoingToFinalB', () => {
    const withChoice = msgFiles.filter((name) =>
      load(name).scripts.some((script) =>
        script.instructions.some((ins) => ins.opcode === MSG_OP.routeChoice),
      ),
    );
    expect(withChoice).toEqual(['msg5a.dat', 'msg5b.dat', 'msg5c.dat', 'msg5d.dat']);
    const committed = msgFiles.filter((name) =>
      load(name).scripts.some((script) =>
        script.instructions.some((ins) => ins.opcode === MSG_OP.routeCommit),
      ),
    );
    expect(committed).toEqual(withChoice);
  });

  it('sizes each instruction by 4 + argSize, the VMs own advance', () => {
    for (const name of msgFiles.slice(0, 6)) {
      const bytes = new Uint8Array(fs.readFileSync(path.join(RAW_DIR, name)));
      let consumed = 0;
      for (const script of parseMsg(bytes).scripts) {
        consumed += script.instructions.length
          ? script.instructions.reduce((sum, ins) => sum + MSG_HEADER_BYTES + ins.args.length, 0)
          : 0;
      }
      // Every byte the walker named must sit inside the file, and the terminator
      // means the tail of each script is padding rather than lost instructions.
      expect(consumed).toBeLessThanOrEqual(bytes.length);
    }
  });
});
