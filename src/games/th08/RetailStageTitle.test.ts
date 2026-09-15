/**
 * The retail 阶段标题卡, pinned to the numbers ZUN authored.
 *
 * `Gui.cpp:2281` preloads `stgNNtxt.anm` for the stage that is loading and
 * `:2307` runs its scripts 0..3 on four VMs as the stage takes the screen;
 * `:766-770` re-runs script 3 with sprite `arg+3` whenever a stage message
 * announces the next boss. All of that motion is data, so this reads the lifted
 * bytecode through the same VM the browser uses and asserts the layout the original
 * draws: the stage number and the stage name stacked over the poem, and the boss
 * line sliding in from the right along the bottom of the arcade.
 */

import { describe, expect, it } from 'vitest';
import { AnmVm } from '../../engine/anm/AnmVm';
import { StageTitleOverlay } from '../../engine/renderer/StageTitleOverlay';
import { STGTXT_BY_ROUTE, TH08_STGTXT } from './data/th08-stgtxt-anm';
import { stageTitleKey, stageTitleScript } from './data/th08-stgtxt-registration';

/** Quiet RNG: no title script randomises. */
const stillRng = { randomU32InRange: () => 0, randomF32InRange: () => 0 };

/** One sampled frame of a running script. */
interface Sample {
  frame: number;
  sprite: number;
  x: number;
  y: number;
  alpha: number;
  deleted: boolean;
}

/** Run one lifted script for `frames`, sampling it once per frame until it deletes. */
function play(pack: string, script: number, frames: number): Sample[] {
  const vm = new AnmVm(stillRng);
  const words = stageTitleScript(pack, script);
  expect(words, pack + ' script ' + script).not.toBeNull();
  vm.attach(words!);
  const samples: Sample[] = [];
  for (let f = 0; f < frames; f++) {
    samples.push({
      frame: f,
      sprite: vm.sprite,
      x: Math.round(vm.pos.x),
      y: Math.round(vm.pos.y),
      alpha: Math.round(vm.color1.a),
      deleted: vm.deleted,
    });
    if (vm.deleted) break;
    vm.step();
  }
  return samples;
}

const at = (samples: Sample[], frame: number): Sample => {
  const found = samples.find((s) => s.frame === frame);
  expect(found, 'frame ' + frame).toBeTruthy();
  return found!;
};

/** The packs whose card holds for the long nine-second opening rather than nine. */
const LONG_CARDS = ['stg5txt', 'stg6txt', 'stg7txt'];

describe('the lifted stgNNtxt packs', () => {
  it('covers every campaign route with four scripts on one page', () => {
    for (const [route, pack] of Object.entries(STGTXT_BY_ROUTE)) {
      const data = TH08_STGTXT[pack];
      expect(data, route).toBeTruthy();
      expect(data.scripts.filter(Boolean).length, pack).toBe(4);
      expect(
        data.cells.every((cell) => cell.tex === 0),
        pack,
      ).toBe(true);
      expect(data.page, pack).toBe('/assets/th08/anm/' + pack + '_t0.png');
    }
  });

  it('stacks the stage number, the stage name and the poem where retail draws them', () => {
    // Sprite ids are the atlas rects: 1 is the 96x32 "Stage N", 0 the 256x48 stage
    // name, 2 the 256x48 poem. Their `POS` values are the retail layout.
    for (const pack of Object.keys(TH08_STGTXT)) {
      const number = play(pack, 0, 20);
      const name = play(pack, 1, 20);
      const poem = play(pack, 2, 20);
      expect(at(number, 0).sprite, pack).toBe(1);
      expect(at(name, 0).sprite, pack).toBe(0);
      expect(at(poem, 0).sprite, pack).toBe(2);
      expect([at(number, 0).x, at(number, 0).y], pack).toEqual([128, 176]);
      expect([at(name, 0).x, at(name, 0).y], pack).toEqual([224, 208]);
      // Stages 5, 6 and 7 author a wider poem cell and shift it one cell right.
      const poemX = LONG_CARDS.includes(pack) ? 240 : 224;
      expect([at(poem, 0).x, at(poem, 0).y], pack).toEqual([poemX, 268]);
      for (const sprite of [0, 1, 2, 3]) {
        const cell = TH08_STGTXT[pack].cells.find((c) => c.id === sprite);
        expect(cell, pack + '#' + sprite).toBeTruthy();
      }
    }
  });

  it('opens transparent, holds a second at full, and retires itself', () => {
    for (const pack of Object.keys(TH08_STGTXT)) {
      const samples = play(pack, 0, 1300);
      expect(at(samples, 0).alpha, pack + ' opens invisible').toBe(0);
      const last = samples[samples.length - 1]!;
      expect(last.deleted, pack + ' deletes itself').toBe(true);
      // `Delete` is stamped with its own time and lands on the following frame, so
      // the VM reports itself retired one tick after the lifted lifetime ends.
      expect(last.frame, pack + ' matches the lifted length').toBe(TH08_STGTXT[pack].scripts[0]!.length + 1);
      expect(
        samples.some((s) => s.alpha === 255),
        pack + ' reaches full alpha',
      ).toBe(true);
    }
  });

  it('fades the short card in over a second at frame 130 and out again at 490', () => {
    const samples = play('stg1txt', 0, 600);
    expect(at(samples, 129).alpha).toBe(0);
    expect(at(samples, 190).alpha, '60 frames of linear fade').toBe(255);
    expect(at(samples, 489).alpha, 'holds').toBe(255);
    expect(at(samples, 549).alpha, 'nearly gone').toBe(4);
    expect(at(samples, 550).alpha, 'and out over the same 60').toBe(0);
  });

  it('slides the boss line in from the right along the bottom of the field', () => {
    const samples = play('stg1txt', 3, 500);
    expect(at(samples, 0).sprite).toBe(3);
    expect(at(samples, 0).x, 'starts off to the right of the arcade').toBe(544);
    expect(at(samples, 0).y).toBe(456);
    expect(at(samples, 199).x, 'holds until frame 200 asks for the move').toBe(544);
    expect(at(samples, 260).x, '60 frames later it is parked').toBe(288);
    expect(at(samples, 260).alpha).toBe(255);
    expect(at(samples, 459).alpha).toBe(4);
    expect(at(samples, 460).alpha).toBe(0);
  });
});

describe('StageTitleOverlay', () => {
  /** A cell stub the overlay can bind without Pixi having loaded anything. */
  const fakeCell = { texture: {} };

  const make = () =>
    new StageTitleOverlay({
      scriptFor: (pack, index) => stageTitleScript(pack, index),
      cellFor: (pack, sprite) => (TH08_STGTXT[pack].cells[sprite] ? fakeCell : null),
    });

  it('runs one script per slot on start, and retires itself when they all delete', () => {
    const card = make();
    card.bind('stg1txt');
    card.start();
    card.step();
    // `Gui.cpp:1114` gates the card on `vm2a44[0].color1.a`, and every script opens
    // at alpha zero, so "not yet on screen" is the faithful answer on frame one.
    expect(card.showing, 'transparent is not showing').toBe(false);
    card.step(200);
    expect(card.showing, 'the fade-in has landed').toBe(true);
    // The longest of the four scripts deletes at frame 550.
    card.step(600);
    expect(card.showing, 'nothing is left to draw').toBe(false);
    card.destroy();
  });

  it('re-runs the boss line on a new sprite without touching the other three', () => {
    const card = make();
    card.bind('stg1txt');
    card.start();
    card.step(10);
    const before = card.debugLines();
    card.executeScript(3, 3);
    card.setSprite(3, 4);
    card.step();
    const after = card.debugLines();
    expect(after[3], 'slot 3 now shows the second boss banner').toContain('#4');
    expect(after.slice(0, 3)).toEqual(before.slice(0, 3));
    card.destroy();
  });

  it('binds nothing at all for a route with no pack, and hides on demand', () => {
    const card = make();
    card.bind(null);
    card.start();
    card.step();
    expect(card.showing).toBe(false);
    card.bind('stg1txt');
    card.start();
    card.step(200);
    expect(card.showing).toBe(true);
    card.hide();
    expect(card.showing).toBe(false);
    card.destroy();
  });

  it('names the cells the renderer registers, per route', () => {
    expect(stageTitleKey('stg1txt', 3)).toBe('stage-text:stg1txt:3');
    expect(STGTXT_BY_ROUTE.stage6b).toBe('stg7txt');
  });
});
