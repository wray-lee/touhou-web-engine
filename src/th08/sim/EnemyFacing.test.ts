/**
 * The retail facing switch: `Enemy::FUN_00423150` (`EclDependencies.cpp:812-883`)
 * swaps the sprite script off the horizontal motion producer, and ops 58-61
 * retarget every script id from `enemy.anm` onto the stage's own `stgNNenm.anm`.
 *
 * Both were missing. The six scripts were stored in address order instead of
 * operand order and then never read, so a fairy slid sideways on its straight
 * cycle; and the stage-pack ids were resolved against the shared atlas, which is
 * what drew the wrong cells for every boss.
 *
 * The samples below sit mid-window on purpose: `motorX` is produced by the motion
 * step, which runs *after* the facing switch inside `tick()`, so a new heading
 * only shows up in the script one frame later. That lag is retail order of
 * operations, not a bug.
 */
import { describe, expect, it } from 'vitest';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import type { EnemySlot } from './EnemySlot';
import type { EclTimelineInstruction } from '../format/EclFile';
import type { PlayerInput } from './PlayerSim';

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

const bits = (v: number): number => new Int32Array(new Float32Array([v]).buffer)[0];

const ins = (time: number, opcode: number, args: number[]): EclTimelineInstruction =>
  ({
    offset: 0,
    time,
    opcode,
    size: 8 + args.length * 4,
    difficultyMask: 0xff,
    args: new Int32Array(args),
  }) as unknown as EclTimelineInstruction;

const hold: SubFn = () =>
  (function* () {
    yield 6000;
  })();

const idle: PlayerInput = {
  dx: 0,
  dy: 0,
  shoot: false,
  bomb: false,
  slow: false,
} as unknown as PlayerInput;

function harness(subs: Record<number, SubFn> = {}, opcode = 0) {
  const gs = createGameState('normal', 7);
  const runner = new StageRunner({
    gs,
    ecl: {
      version: 2048,
      subCount: 1,
      subs: [],
      timelines: [
        {
          index: 0,
          offset: 0,
          instructions: [ins(2, opcode, [0, bits(120), bits(200), 400, -2, 1000])],
        },
      ],
    } as never,
    subFactory: (id: number) => subs[id] ?? hold,
  });
  const slot = () => runner.enemies.slots.find((s) => s.active) as EnemySlot;
  const to = (frames: number) => {
    while (gs.frame < frames) runner.tick(idle);
    return slot();
  };
  return { runner, slot, to };
}

/** Headings at frame 4 / 14 / 24 / 34 / 44: left, right, stop, left, stop. */
const drive: SubFn = (e) =>
  (function* () {
    e.setAnmScripts6(30);
    for (let i = 0; i < 200; i++) {
      if (i === 4) e.setHeadingSpeed(Math.PI, 2);
      if (i === 14) e.setHeadingSpeed(0, 2);
      if (i === 24) e.setHeadingSpeed(0, 0);
      if (i === 34) e.setHeadingSpeed(Math.PI, 2);
      if (i === 44) e.setHeadingSpeed(0, 0);
      yield 1;
    }
  })();

describe('enemy facing scripts', () => {
  it('arms on the straight script and only then reacts to motion', () => {
    const { to } = harness({ 0: drive });
    const slot = to(3);
    expect(slot.anmDirection).toBe(0);
    expect(slot.anmScript).toBe(30);
    expect(slot.anmUseStagePack).toBe(false);
  });

  it('leans left, leans right, and returns on the matching way back', () => {
    const { to } = harness({ 0: drive });
    expect(to(10)).toMatchObject({ anmDirection: 1, anmScript: 31 });
    expect(to(20)).toMatchObject({ anmDirection: 2, anmScript: 32 });
    // Back to straight from the right is script 4, not the straight cycle.
    expect(to(30)).toMatchObject({ anmDirection: 0, anmScript: 34 });
    expect(to(40)).toMatchObject({ anmDirection: 1, anmScript: 31 });
    // ...and from the left it is script 3.
    expect(to(50)).toMatchObject({ anmDirection: 0, anmScript: 33 });
    expect(to(60)).toMatchObject({ anmDirection: 0, anmScript: 33 });
  });

  it('swaps the lean scripts when the motion mirror is on', () => {
    const { to } = harness({ 0: drive }, 1);
    // The odd spawn op sets bit 18, which negates the producer on the way into the
    // integrator, so a PI heading draws as a rightward move and has to lean right.
    const slot = to(10);
    expect(slot.mirrorMovement).toBe(true);
    expect(slot.anmDirection).toBe(2);
    expect(slot.anmScript).toBe(32);
  });

  it('leaves a bare op 54 script alone however the enemy moves', () => {
    const { to } = harness({
      0: (e) =>
        (function* () {
          e.setAnm(55);
          for (let i = 0; i < 200; i++) {
            if (i === 2) e.setHeadingSpeed(Math.PI, 3);
            yield 1;
          }
        })(),
    });
    const slot = to(20);
    expect(slot.anmScript).toBe(55);
    expect(slot.anmDirection).toBe(-1);
  });

  it('switches the atlas the ids address with ops 58 and 59', () => {
    const { to } = harness({
      0: (e) =>
        (function* () {
          e.setAnmScripts6Alt(0);
          for (let i = 0; i < 200; i++) yield 1;
        })(),
    });
    expect(to(4)).toMatchObject({ anmUseStagePack: true, anmScript: 0 });
  });

  it('drops back to the shared atlas on op 54', () => {
    const { to } = harness({
      0: (e) =>
        (function* () {
          e.setAnmScripts6Alt(0);
          for (let i = 0; i < 200; i++) {
            if (i === 6) e.setAnm(2);
            yield 1;
          }
        })(),
    });
    const slot = to(12);
    expect(slot.anmUseStagePack).toBe(false);
    expect(slot.anmScript).toBe(2);
  });
});
