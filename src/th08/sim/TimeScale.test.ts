/**
 * The global time scale, `g_EclGameTimeScale`.
 *
 * `EclGlobals.cpp:117` makes that one global *be*
 * `g_Supervisor.framerateMultiplier`, and retail then multiplies its way through
 * every subsystem that steps anything: bullets at launch (`BulletManager.cpp:184`)
 * and again wherever a handler rewrites a velocity (`:1192`, `:1242-1251`,
 * `:1292`, `:1332`, `:1373`, `:1416`), lasers (`:1046`), items
 * (`ItemManager.cpp:210`, `:234`, `:251`, `:284`, `:301`, `:313`), the ship
 * itself (`Player.cpp:880`) and its 妖力 meter (`:939`).
 *
 * The two properties this file exists to hold are the ones a naive
 * "multiply the frame delta" port gets wrong: a scale change reaches bullets that
 * are *already flying*, and the raw speed field stays unscaled so the old speed
 * comes back when the scale is restored. Stage 6b leans on both, opening a spell
 * card with `ex 18 4` and closing it with `ex 18 1`.
 */
import { describe, expect, it } from 'vitest';
import { BulletPool, type Bullet } from './BulletPool';
import { REC, launchPattern, simplePattern, blankShotRecords, type BulletWorld, type ShotRecord } from './BulletTransform';
import { EnemySlot } from './EnemySlot';
import { createGameState } from './GameState';
import { LaserPool } from './LaserPool';
import { ItemPool } from './ItemPool';
import { PlayerSim } from './PlayerSim';

function world(over: Partial<BulletWorld> = {}): BulletWorld {
  return {
    playerX: 192,
    playerY: 384,
    rng: { randomF32InRange: (range: number) => range * 0.5 },
    radiusFor: () => 4,
    sizeFor: () => 8,
    onSound: () => {},
    ...over,
  };
}

function chain(...records: Array<Partial<ShotRecord>>): ShotRecord[] {
  const all = blankShotRecords();
  records.forEach((r, i) => Object.assign(all[i], r));
  return all;
}

const speedOf = (b: Bullet) => Math.hypot(b.vx, b.vy);

/** One bullet from a pattern, launched by a pool that already carries `ts`. */
function fire(records: ShotRecord[], flags: number, ts: number, speed: number) {
  const pool = new BulletPool();
  pool.timeScale = ts;
  const w = world({ timeScale: ts });
  launchPattern(
    pool,
    w,
    simplePattern({ aimMode: 1, count1: 1, count2: 1, angle: 0, speed1: speed, radius: 4, halfSize: 8, transformFlags: flags, records }),
    192,
    200,
  );
  return { pool, w, b: pool.bullets.find((x) => x.active)! };
}

describe('ex 18 writes the one global retail uses', () => {
  it('takes 1/value and gives 1 back, through the ECL op 136 route', () => {
    const gs = createGameState();
    const slot = new EnemySlot(gs);
    expect(gs.timeScale).toBe(1);
    slot.setMisc136(18, 4);
    expect(gs.timeScale).toBeCloseTo(0.25, 10);
    slot.setMisc136(18, 2);
    expect(gs.timeScale).toBeCloseTo(0.5, 10);
    slot.setMisc136(18, 1);
    expect(gs.timeScale).toBe(1);
  });

  it('leaves the scale alone for the ex handlers that are post-process only', () => {
    const gs = createGameState();
    const slot = new EnemySlot(gs);
    slot.setMisc136(12, 0);
    slot.setMisc136(30, 1);
    expect(gs.timeScale).toBe(1);
  });
});

describe('bullets', () => {
  it('launch at the scaled speed but keep the raw figure in the speed field', () => {
    const { b } = fire([], 0, 0.25, 2);
    expect(b.speed).toBe(2);
    expect(speedOf(b)).toBeCloseTo(0.5, 10);
  });

  it('that are already flying slow down when the scale drops mid-flight', () => {
    const { pool, w, b } = fire(chain({ kind: REC.BIRTH_PUSH, allowWhileActive: 1 }), REC.BIRTH_PUSH, 1, 2);
    pool.tick(false, w);
    // `FUN_00432210` on its first frame sees a timer of 0, so the push is the
    // full 5 px/frame on top of the raw 2.
    expect(speedOf(b)).toBeCloseTo(7, 10);
    // `ex 18 4` lands between two frames: nothing re-launches these bullets, the
    // birth-push handler just renormalises from the untouched raw speed.
    w.timeScale = 0.25;
    pool.tick(false, w);
    expect(b.speed).toBe(2);
    expect(speedOf(b)).toBeCloseTo((2 + 5 - (1 * 5) / 16) * 0.25, 10);
  });

  it('restore their original speed when the scale goes back to 1', () => {
    const { pool, w, b } = fire(chain({ kind: REC.CURL, allowWhileActive: 1, int0: 60, float0: 0.5, float1: 0.1 }), REC.CURL, 1, 2);
    pool.tick(false, w);
    const afterOneFrame = b.speed;
    w.timeScale = 0.25;
    pool.tick(false, w);
    // A quarter-speed frame adds a quarter of the curl delta to the raw speed.
    expect(b.speed).toBeCloseTo(afterOneFrame + 0.5 * 0.25, 10);
    w.timeScale = 1;
    pool.tick(false, w);
    expect(b.speed).toBeCloseTo(afterOneFrame + 0.5 * 0.25 + 0.5, 10);
  });

  it('accelerate with the scale applied twice, exactly as retail applies it twice', () => {
    // `:362-364` folds the scale into the stored acceleration vector at arm time,
    // and `FUN_004322b0` multiplies by it again on each frame it is used.
    const { pool, w, b } = fire(
      chain({ kind: REC.ACCELERATE, allowWhileActive: 1, int0: 60, float0: 1, float1: 0 }),
      REC.ACCELERATE,
      0.5,
      0,
    );
    pool.tick(false, w);
    expect(speedOf(b)).toBeCloseTo(1 * 0.5 * 0.5, 10);
  });

  it('bounce back at the scaled speed and carry the raw speed into the next leg', () => {
    const { pool, w, b } = fire(
      chain({ kind: REC.BOUNCE, allowWhileActive: 1, int0: 4, float0: 3 }),
      REC.BOUNCE,
      1,
      3,
    );
    // Past the sprite box, which is the question retail asks (`:1400-1408`).
    b.x = -40;
    w.timeScale = 0.25;
    pool.tick(false, w);
    expect(b.speed).toBe(3);
    expect(speedOf(b)).toBeCloseTo(0.75, 10);
  });
});

describe('everything else that steps', () => {
  it('grows a laser by the scaled rate', () => {
    const pool = new LaserPool();
    pool.timeScale = 0.25;
    const laser = pool.spawn({
      x: 32,
      y: 240,
      angle: 0,
      tail: 0,
      head: 0,
      startLength: 640,
      width: 8,
      speed: 8,
      startTime: 60,
      hitboxStartTime: 60,
      duration: 540,
      despawnDuration: 60,
      hitboxEndDelay: 60,
      flags: 0,
      color: 6,
      bulletType: 0,
    })!;
    pool.tick();
    expect(laser.head).toBeCloseTo(2, 10);
  });

  it('crawls the ship and its lean together, the way +0x3F8/+0x3FC do', () => {
    const gs = createGameState();
    const player = new PlayerSim(gs);
    player.fastSpeed = 1.6;
    const input = { dx: 1, dy: 0, shoot: false, bomb: false, slow: false };
    player.tick(input);
    const walked = player.leanX;
    gs.timeScale = 0.25;
    const x = player.x;
    player.tick(input);
    expect(player.x - x).toBeCloseTo(walked * 0.25, 10);
    expect(player.leanX).toBeCloseTo(walked * 0.25, 10);
  });

  it('integrates a grabbed item by the global scale alone', () => {
    const gs = createGameState();
    const pool = new ItemPool(gs);
    pool.spawn('point', 100, 200);
    const item = pool.items.find((i) => i.active)!;
    item.rise = 'none';
    item.magnetized = true;
    item.vx = 0;
    item.vy = -8;
    // `:284`: once the magnet owns an item, only `g_EclGameTimeScale` is left in
    // the step - the team's `+0x34` figure has dropped out of it.
    const before = item.y;
    pool.tick(100, 200, 12, 128, false, false, true, 8, 99, 0.25, true);
    expect(item.y - before).toBeCloseTo(-8 * 0.25, 6);
  });

  it('takes the hover gravity from the global scale alone, not the team clock', () => {
    const gs = createGameState();
    const pool = new ItemPool(gs);
    pool.spawn('point', 100, 200);
    const item = pool.items.find((i) => i.active)!;
    item.rise = 'hover';
    item.vy = -1;
    // `:234` gives the hover its own `0.05 × g_EclGameTimeScale`, and then
    // `moveItem` falls through to the ordinary `0.03 × speed` gravity, where
    // `speed` is the two figures multiplied (`:210`). A `+0x34` of 99 would make
    // the second term dominate and hide the first, so both are held small.
    pool.tick(600, 430, 12, 128, false, false, true, 8, 1, 0.5, true);
    expect(item.vy).toBeCloseTo(-1 + 0.05 * 0.5 + 0.03 * (1 * 0.5), 10);
  });
});
