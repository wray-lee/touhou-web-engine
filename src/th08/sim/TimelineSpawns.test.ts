/**
 * Timeline spawn instructions carry a drop type, a score, queued items and a
 * horizontal mirror, none of which the runner used to read.
 *
 * `EnemyTimeline.cpp:136-234` names the argument layout per opcode, `:44-63` shows
 * how `SpawnEnemy1` stores them (`0x3304` through an `(i8)` cast, `0x2E08` only when
 * not negative, HP only when not negative), and `:16`/`:42` reveal that the odd-numbered
 * spawn ops differ from their even twins only by setting `0x3324` bit 18.
 */
import { describe, expect, it } from 'vitest';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import type { EnemySlot } from './EnemySlot';
import type { EclTimelineInstruction } from '../format/EclFile';

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

const bits = (v: number): number => new Int32Array(new Float32Array([v]).buffer)[0];
const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;

/** One instruction with the shipped stages' all-difficulty mask. */
const ins = (time: number, opcode: number, args: number[]): EclTimelineInstruction =>
  ({
    offset: 0,
    time,
    opcode,
    size: 8 + args.length * 4,
    difficultyMask: 0xff,
    args: new Int32Array(args),
  }) as unknown as EclTimelineInstruction;

function harness(instructions: EclTimelineInstruction[], subs: Record<number, SubFn> = {}) {
  const gs = createGameState('hard', 11);
  const runner = new StageRunner({
    gs,
    ecl: {
      version: 2048,
      subCount: 1,
      subs: [],
      timelines: [{ index: 0, offset: 0, instructions }],
    } as never,
    subFactory: (id: number) =>
      subs[id] ??
      ((_e: EnemySlot) =>
        (function* () {
          yield 6000;
        })()),
  });
  return { runner, gs };
}

const run = (runner: StageRunner, frames: number): void => {
  for (let f = 0; f < frames; f++) runner.tick(noInput);
};

const only = (runner: StageRunner): EnemySlot => {
  const live = runner.enemies.getActive();
  expect(live).toHaveLength(1);
  return live[0];
};

describe('timeline spawn arguments', () => {
  it('gives op 0 hp, the drop type and the score', () => {
    const { runner } = harness([ins(10, 0, [0, bits(50), bits(20), 20, 3, 500])]);
    run(runner, 12);
    const slot = only(runner);
    expect(slot.hp).toBe(20);
    expect(slot.dropType).toBe(3);
    expect(slot.scoreValue).toBe(500);
    expect(slot.mirrorMovement).toBe(false);
  });

  it('casts the drop type through i8 so 254 means "drop nothing"', () => {
    const { runner } = harness([ins(10, 0, [0, bits(50), bits(20), 20, 254, 1000])]);
    run(runner, 12);
    expect(only(runner).dropType).toBe(-2);
  });

  it('reads op 2 as an x range, not a position', () => {
    const { runner, gs } = harness([ins(10, 2, [0, bits(100), bits(200), bits(60), 33, 1, 4000])]);
    run(runner, 12);
    const slot = only(runner);
    // The old case used the range maximum as the y coordinate and the y float bits
    // as the hp, which put every ranged wave off screen with garbage health.
    expect(slot.posY).toBeCloseTo(60, 3);
    expect(slot.posX).toBeGreaterThanOrEqual(100);
    expect(slot.posX).toBeLessThan(200);
    expect(slot.hp).toBe(33);
    expect(slot.dropType).toBe(1);
    expect(slot.scoreValue).toBe(4000);
    expect(gs.frame).toBe(12);
  });

  it('drops op 3 anywhere across the playfield at the scripted height', () => {
    const { runner } = harness([ins(10, 3, [0, bits(48), 44, 0, 900])]);
    run(runner, 12);
    const slot = only(runner);
    expect(slot.posX).toBeGreaterThanOrEqual(0);
    expect(slot.posX).toBeLessThan(384);
    expect(slot.posY).toBeCloseTo(48, 3);
    expect(slot.hp).toBe(44);
    expect(slot.scoreValue).toBe(900);
  });

  it('arms the queued item counts and the schedule drop for ops 11/12', () => {
    const { runner } = harness([ins(10, 11, [0, bits(120), bits(30), 25, 2, 3, 1500])]);
    run(runner, 12);
    const slot = only(runner);
    // `EnemyTimeline.cpp:195-198`: the drop type is forced to -1 and args 4/5 become
    // the pending point and power grants.
    expect(slot.dropType).toBe(-1);
    expect(slot.pointDrops).toBe(2);
    expect(slot.powerDrops).toBe(3);
    expect(slot.scoreValue).toBe(1500);
  });

  it('mirrors horizontal movement for the variant spawns only', () => {
    const driftRight: SubFn = (e) =>
      (function* () {
        e.setHeadingSpeed(0, 2);
        yield 6000;
      })();
    const plain = harness([ins(5, 0, [0, bits(120), bits(200), 20, 1, 1000])], { 0: driftRight });
    run(plain.runner, 12);
    expect(only(plain.runner).posX).toBeGreaterThan(120);

    const mirrored = harness([ins(5, 1, [0, bits(120), bits(200), 20, 1, 1000])], {
      0: driftRight,
    });
    run(mirrored.runner, 12);
    const slot = only(mirrored.runner);
    expect(slot.mirrorMovement).toBe(true);
    expect(slot.posX).toBeLessThan(120);
  });
});

describe('timeline gates and waits', () => {
  it('holds every spawn while op 175 arms the shared table slot', () => {
    const { runner, gs } = harness(
      [ins(5, 0, [0, bits(100), bits(20), 20, -2, 1000]), ins(20, 0, [1, bits(140), bits(20), 20, 1, 1000])],
      {
        0: (e) =>
          (function* () {
            e.pauseEnemySpawns(1);
            yield 6000;
          })(),
        1: () =>
          (function* () {
            yield 6000;
          })(),
      },
    );
    run(runner, 6);
    expect(gs.spawnPaused).toBe(true);
    expect(runner.enemies.activeCount).toBe(1);
    run(runner, 20);
    // Nothing clears it in this script, so the second wave never lands.
    expect(runner.enemies.activeCount).toBe(1);
  });

  it('lets spawns through as soon as op 175 clears it', () => {
    const { runner, gs } = harness(
      [ins(5, 0, [0, bits(100), bits(20), 20, -2, 1000]), ins(20, 0, [1, bits(140), bits(20), 20, 1, 1000])],
      {
        0: (e) =>
          (function* () {
            e.pauseEnemySpawns(1);
            e.pauseEnemySpawns(0);
            yield 6000;
          })(),
        1: () =>
          (function* () {
            yield 6000;
          })(),
      },
    );
    run(runner, 24);
    expect(gs.spawnPaused).toBe(false);
    expect(runner.enemies.activeCount).toBe(2);
  });

  it('op 10 holds the timeline until the marked boss is gone', () => {
    // Op 15 has no boss gate, so the only thing that can be holding this wave back is
    // the wait itself (`EnemyTimeline.cpp:258-266`).
    const { runner } = harness(
      [
        ins(5, 0, [1, bits(100), bits(20), 500, -2, 1000]),
        ins(20, 10, [0]),
        ins(21, 15, [2, bits(140), bits(20), 20, 1, 1000]),
      ],
      {
        1: (e) =>
          (function* () {
            e.setBossPresent(0);
            yield 6000;
          })(),
      },
    );
    run(runner, 40);
    const boss = runner.enemies.getActive().find((s) => s.subId === 1)!;
    expect(boss.isBoss).toBe(true);
    expect(runner.enemies.getActive().some((s) => s.subId === 2)).toBe(false);

    // Once the marker holder is gone the wait clears and the wave lands.
    boss.setBossPresent(-1);
    run(runner, 6);
    expect(runner.enemies.getActive().some((s) => s.subId === 2)).toBe(true);
  });

  it('ops 14 and 13 are a token pair, and an unmatched 13 waits', () => {
    const { runner } = harness([ins(5, 13, [7]), ins(6, 0, [1, bits(140), bits(20), 20, 1, 1000])], {});
    run(runner, 30);
    // Slot values start at 0, so token 7 was never armed and the timeline froze on it.
    expect(runner.enemies.activeCount).toBe(0);
    expect(runner.gs.frame).toBe(30);
  });

  it('op 14 arms every free slot so a later 13 passes', () => {
    const { runner } = harness([
      ins(5, 13, [0]),
      ins(6, 14, [0]),
      ins(7, 13, [0]),
      ins(8, 0, [1, bits(140), bits(20), 20, 1, 1000]),
    ]);
    run(runner, 20);
    expect(runner.enemies.activeCount).toBe(1);
  });
});
