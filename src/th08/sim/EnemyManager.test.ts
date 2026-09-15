import { describe, expect, it } from 'vitest';
import { EnemyManager } from './EnemyManager';
import { EnemySlot } from './EnemySlot';
import { TimelineRunner } from './TimelineRunner';
import { createGameState } from './GameState';
import type { Difficulty } from './GameState';
import { parseEcl } from '../format/EclFile';
import { TIMELINES } from '../stages/stage1/waves';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

describe('EnemyManager', () => {
  it('spawns and ticks an enemy with a trivial generator', () => {
    const gs = createGameState();
    const mgr = new EnemyManager(gs, (id) => {
      if (id === 0)
        return function* (e: EnemySlot) {
          e.setPos(100, 50);
          yield 10;
          e.setPos(200, 100);
          yield 5;
        };
      return null;
    });

    const slot = mgr.spawn(0, 50, 50);
    expect(slot).toBeTruthy();
    expect(slot!.active).toBe(true);
    expect(slot!.posX).toBe(100); // first frame ran setPos

    for (let i = 0; i < 10; i++) mgr.tick();
    expect(slot!.posX).toBe(200);
    expect(slot!.active).toBe(true);

    for (let i = 0; i < 5; i++) mgr.tick();
    expect(slot!.active).toBe(false); // generator returned
  });

  it('pool reports activeCount correctly', () => {
    const gs = createGameState();
    const mgr = new EnemyManager(gs, () => (_e: EnemySlot) => {
      return (function* () {
        yield 100;
      })();
    });
    mgr.spawn(0, 10, 10);
    mgr.spawn(0, 20, 20);
    expect(mgr.activeCount).toBe(2);
    for (let i = 0; i < 100; i++) mgr.tick();
    expect(mgr.activeCount).toBe(0);
  });
});

describe('TimelineRunner', () => {
  it('spawns enemies at the correct frames from a mock timeline', () => {
    const gs = createGameState();
    let spawnCount = 0;
    const mgr = new EnemyManager(gs, () => {
      spawnCount++;
      return (_e: EnemySlot) =>
        (function* () {
          yield 9999;
        })();
    });

    // Float encode helper: i32 bits of a float
    const fi32 = (f: number) => new Int32Array(new Float32Array([f]).buffer)[0];

    const tl = {
      index: 0,
      offset: 0,
      instructions: [
        {
          offset: 0,
          time: 0,
          opcode: 0,
          size: 32,
          difficultyMask: 0xff,
          args: new Int32Array([1, fi32(100), fi32(200), 500, 0, 0]),
        },
        {
          offset: 32,
          time: 60,
          opcode: 0,
          size: 32,
          difficultyMask: 0xff,
          args: new Int32Array([2, fi32(150), fi32(250), 600, 0, 0]),
        },
        {
          offset: 64,
          time: 120,
          opcode: 0,
          size: 32,
          difficultyMask: 0xff,
          args: new Int32Array([3, fi32(50), fi32(100), 400, 0, 0]),
        },
      ],
    };

    const runner = new TimelineRunner(tl, gs, mgr);

    // Frame 0: first spawn
    runner.tick();
    expect(spawnCount).toBe(1);
    expect(mgr.activeCount).toBe(1);

    // Advance to frame 60
    for (let i = 1; i < 60; i++) {
      runner.tick();
      mgr.tick();
    }
    runner.tick();
    expect(spawnCount).toBe(2);

    // Advance to frame 120
    for (let i = 61; i < 120; i++) {
      runner.tick();
      mgr.tick();
    }
    runner.tick();
    expect(spawnCount).toBe(3);
    // After last instruction processes, runner finishes on the next tick.
    runner.tick();
    expect(runner.finished).toBe(true);
  });

  it('filters spawns by the timeline difficulty byte', () => {
    const gs = createGameState('hard'); // timeline bit 0x08 — one above the ECL encoding
    let spawnCount = 0;
    const mgr = new EnemyManager(gs, () => {
      spawnCount++;
      return () =>
        (function* () {
          yield 9999;
        })();
    });

    const fi32 = (f: number) => new Int32Array(new Float32Array([f]).buffer)[0];
    const tl = {
      index: 0,
      offset: 0,
      instructions: [
        {
          offset: 0,
          time: 0,
          opcode: 0,
          size: 32,
          difficultyMask: 0x04,
          args: new Int32Array([1, fi32(100), fi32(200), 0, 0, 0]),
        }, // normal only
        {
          offset: 32,
          time: 0,
          opcode: 0,
          size: 32,
          difficultyMask: 0x08,
          args: new Int32Array([2, fi32(100), fi32(200), 0, 0, 0]),
        }, // hard
        {
          offset: 64,
          time: 0,
          opcode: 0,
          size: 32,
          difficultyMask: 0xff,
          args: new Int32Array([3, fi32(100), fi32(200), 0, 0, 0]),
        }, // all
      ],
    };

    const runner = new TimelineRunner(tl, gs, mgr);
    runner.tick();
    expect(spawnCount).toBe(2); // normal-only is skipped, hard + all are spawned
  });

  it('lets every difficulty see the 0xFE boss spawn', () => {
    // Regression: the retail final-boss spawn in each stage timeline is byte
    // 0xFE. Filtering it with the ECL (unshifted) mask silently skipped the
    // boss on Easy, so stage 1 "cleared" at t=4177 with nothing to fight.
    const spawnCountFor = (difficulty: Difficulty) => {
      const gs = createGameState(difficulty);
      let count = 0;
      const mgr = new EnemyManager(gs, () => {
        count++;
        return () =>
          (function* () {
            yield 9999;
          })();
      });
      const fi32 = (f: number) => new Int32Array(new Float32Array([f]).buffer)[0];
      const tl = {
        index: 0,
        offset: 0,
        instructions: [
          {
            offset: 0,
            time: 0,
            opcode: 0,
            size: 32,
            difficultyMask: 0xfe,
            args: new Int32Array([60, fi32(100), fi32(200), 0, 0, 0]),
          },
        ],
      };
      new TimelineRunner(tl, gs, mgr).tick();
      return count;
    };
    const all: Difficulty[] = ['easy', 'normal', 'hard', 'lunatic'];
    expect(all.map(spawnCountFor)).toEqual([1, 1, 1, 1]);
  });

  it('retail stage 1 spawns its boss on every difficulty', () => {
    // The real byte on the stage 1 boss spawn is 0xFE. Under the old, unshifted
    // reading Easy masked it out and the stage dissolved straight into CLEAR.
    const bossSub = 37;
    const reached = (difficulty: Parameters<typeof createGameState>[0]): boolean => {
      const gs = createGameState(difficulty, 0);
      let spawned = false;
      const mgr = new EnemyManager(gs, (subId) => {
        if (subId === bossSub) spawned = true;
        return () =>
          (function* () {
            yield 9999;
          })();
      });
      const runner = new TimelineRunner(TIMELINES[0], gs, mgr);
      for (let frame = 0; frame < 4400 && !runner.finished; frame++) runner.tick();
      return spawned;
    };

    const ladder: Difficulty[] = ['easy', 'normal', 'hard', 'lunatic', 'extra'];
    expect(ladder.map(reached)).toEqual([true, true, true, true, true]);
  });
});

describe.skipIf(!hasAssets)('Integration: ecldata1 timeline (real data)', () => {
  it('runs the first 400 frames of ecldata1 and spawns enemies', () => {
    const gs = createGameState('normal', 0x1234);
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));

    let spawnedSubs: number[] = [];
    const mgr = new EnemyManager(gs, (subId) => {
      spawnedSubs.push(subId);
      // Return a trivial generator that just lives for 1000 frames
      return () =>
        (function* () {
          yield 1000;
        })();
    });

    // Run timeline 0 (the main stage timeline)
    const runner = new TimelineRunner(ecl.timelines[0], gs, mgr);

    for (let frame = 0; frame < 400; frame++) {
      runner.tick();
      mgr.tick();
    }

    expect(spawnedSubs.length).toBeGreaterThan(0);
    expect(mgr.activeCount).toBeGreaterThan(0);
    // ecldata1 timeline 0 first instruction spawns sub 14 at frame 1
    expect(spawnedSubs[0]).toBe(14);
  });
});

/**
 * Two rules the reference ties to `Player+0xFDC`, the byte that means "a player card
 * is playing" for the whole card (`Player.cpp:1277`, `:1165-1168`): a slot that armed
 * op 173 holds its script (`EnemyManagerUpdate.cpp:466-472`), and the manager's own
 * clock buys the stage a rank step every `2400 - lives*4*60` frames
 * (`EnemyManager.cpp:919-931`).
 */
describe('the card pause and the rank creep', () => {
  /** Two walkers: sub 0 asks to be held during a card, sub 1 does not. */
  function walkers(gs: ReturnType<typeof createGameState>) {
    return new EnemyManager(gs, (id) => {
      if (id === 0 || id === 1) {
        const base = id === 0 ? 100 : 200;
        return function* (e: EnemySlot) {
          if (id === 0) e.setMisc173(1);
          for (let step = 0; step < 40; step++) {
            e.setPos(base + step, 50);
            yield 1;
          }
        };
      }
      return null;
    });
  }

  it('holds a slot that armed op 173 while a card plays', () => {
    const gs = createGameState('normal');
    const mgr = walkers(gs);
    const held = mgr.spawn(0, 100, 50);
    const running = mgr.spawn(1, 200, 50);
    expect(held?.pauseTimer).toBe(true);
    expect(running?.pauseTimer).toBe(false);

    mgr.tick(true);
    const heldX = held?.posX;
    const runningX = running?.posX;
    for (let i = 0; i < 6; i++) mgr.tick(true);
    expect(held?.posX).toBe(heldX);
    expect(running!.posX).toBeGreaterThan(runningX!);

    for (let i = 0; i < 6; i++) mgr.tick(false);
    expect(held!.posX).toBeGreaterThan(heldX!);
  });

  it('buys one rank per interval, and fewer lives buy it sooner', () => {
    const gs = createGameState('normal');
    const mgr = walkers(gs);
    gs.lives = 3;
    const interval = 2400 - gs.lives * 4 * 60;
    expect(interval).toBe(1680);
    const start = gs.rank;
    mgr.rankTimer = interval - 1;
    mgr.tick();
    expect(gs.rank).toBe(start + 1);

    gs.lives = 0;
    const bare = 2400;
    const before = gs.rank;
    mgr.rankTimer = bare - 2;
    mgr.tick();
    expect(gs.rank).toBe(before);
    mgr.tick();
    expect(gs.rank).toBe(before + 1);
  });
});
