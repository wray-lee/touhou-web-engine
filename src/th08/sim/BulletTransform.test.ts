/**
 * The bullet transform machine, tested against the record chains that real stage
 * scripts install.
 *
 * Each case uses operands lifted from `ecldataN.ts`, because the point of this
 * file is that the chain in the shipped data actually runs: Kanako's hanging
 * bullets that wait, change sprite, then accelerate out, and Yuuka's flowers that
 * curl. Everything here goes through `launchPattern` and `BulletPool::tick`, which
 * is the same path a stage uses.
 */
import { describe, expect, it } from 'vitest';
import { BulletPool, blankBullet, BULLET_LIVE, type Bullet } from './BulletPool';
import {
  REC,
  launchPattern,
  simplePattern,
  blankShotRecords,
  type BulletWorld,
  type ShotRecord,
} from './BulletTransform';
import { normalizeAngle } from '../core/math';

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

/** One bullet from a pattern, plus the world it lives in. */
function fire(records: ShotRecord[], flags: number, over = {}) {
  const pool = new BulletPool();
  const w = world();
  const pattern = simplePattern({
    aimMode: 1,
    count1: 1,
    count2: 1,
    angle: 0,
    speed1: 0,
    radius: 4,
    halfSize: 8,
    transformFlags: flags,
    records,
    ...over,
  });
  launchPattern(pool, w, pattern, 192, 200);
  const bullet = pool.bullets.find((b) => b.active)!;
  return { pool, world: w, bullet };
}

/** Fill a chain into the 18 slots a descriptor really has. */
function chain(...records: Array<Partial<ShotRecord>>): ShotRecord[] {
  const all = blankShotRecords();
  records.forEach((r, i) => Object.assign(all[i], r));
  return all;
}

const speedOf = (b: Bullet) => Math.hypot(b.vx, b.vy);

describe('the record chain', () => {
  it('arms the first record on the spawn frame, before any motion', () => {
    const { bullet } = fire(chain({ kind: REC.BIRTH_PUSH, allowWhileActive: 1, int0: 0 }), REC.BIRTH_PUSH);
    expect(bullet.tfActive & REC.BIRTH_PUSH).toBe(REC.BIRTH_PUSH);
    expect(bullet.tfIndex).toBe(1);
  });

  it('stops the chain at a hole, because a kind-0 slot terminates the walk', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain(
        { kind: REC.WAIT, allowWhileActive: 0, int0: 3 },
        {},
        { kind: REC.CURL, allowWhileActive: 1, int0: 5, float1: 0.1 },
      ),
      REC.WAIT | REC.CURL,
    );
    for (let f = 0; f < 6; f++) pool.tick(false, w);
    expect(bullet.tfIndex).toBe(1);
    expect(bullet.tfActive & REC.CURL).toBe(0);
  });

  it('holds a record back while another handler is armed', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain(
        { kind: REC.WAIT, allowWhileActive: 0, int0: 10 },
        { kind: REC.RESPRITE, allowWhileActive: 0, int0: 6, int1: 2 },
      ),
      REC.WAIT | REC.RESPRITE,
    );
    pool.tick(false, w);
    expect(bullet.type).toBe(0);
    for (let f = 0; f < 12; f++) pool.tick(false, w);
    expect(bullet.type).toBe(6);
    expect(bullet.color).toBe(2);
  });

  it('skips a record the shot flag word does not admit', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain(
        { kind: REC.WAIT, allowWhileActive: 1, int0: 4 },
        { kind: REC.CURL, allowWhileActive: 1, int0: 4 },
      ),
      REC.WAIT,
    );
    pool.tick(false, w);
    expect(bullet.tfIndex).toBe(2);
    expect(bullet.tfActive & REC.CURL).toBe(0);
  });
});

describe('each handler', () => {
  it('BIRTH_PUSH adds 5px/frame that falls away across 16 frames', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(chain({ kind: REC.BIRTH_PUSH, allowWhileActive: 1 }), REC.BIRTH_PUSH, { speed1: 2, angle: 0 });
    expect(bullet.vx).toBeCloseTo(2, 5);
    pool.tick(false, w);
    expect(bullet.vx).toBeCloseTo(7, 4);
    for (let f = 0; f < 20; f++) pool.tick(false, w);
    expect(bullet.tfActive).toBe(0);
    expect(speedOf(bullet)).toBeCloseTo(2, 4);
  });

  it('ACCELERATE walks a bullet fired at speed 0 up to its real speed', () => {
    // ecldata2 sub 54: the hanging bullets of the wind god spell.
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain(
        { kind: REC.WAIT, allowWhileActive: 0, int0: 60 },
        { kind: REC.RESPRITE, allowWhileActive: 0, int0: 6, int1: 2 },
        { kind: REC.ACCELERATE, allowWhileActive: 0, int0: 60, float0: 0.016667, float1: -999.9 },
      ),
      0x24212,
    );
    expect(bullet.x).toBe(192);
    // The 60-frame wait holds the resprite behind it, and the appearing
    // animation holds the wait; nothing moves until both have run out.
    let parked = 0;
    let drifted = 0;
    while (bullet.type !== 6 && parked < 200) {
      pool.tick(false, w);
      parked++;
      // The frame the resprite lands is also the frame the acceleration
      // handler first runs, so only count the drift while it is still parked.
      if (bullet.type === 0) drifted = Math.max(drifted, Math.abs(bullet.x - 192));
    }
    expect(drifted).toBe(0); // it sat still for the whole wait
    expect(parked).toBeGreaterThan(60);
    expect(parked).toBeLessThan(90);
    let moved = 0;
    for (let f = 0; f < 200; f++) {
      pool.tick(false, w);
      moved += bullet.vx;
    }
    expect(speedOf(bullet)).toBeGreaterThan(0.05);
    expect(moved).toBeGreaterThan(1);
  });

  it('CURL turns the heading and retunes the speed every frame', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain({ kind: REC.CURL, allowWhileActive: 1, int0: 100, float0: 0.02, float1: 0.005236 }),
      REC.CURL,
      { speed1: 2, angle: Math.PI / 2 },
    );
    for (let f = 0; f < 60; f++) pool.tick(false, w);
    expect(bullet.angle).toBeGreaterThan(Math.PI / 2);
    expect(bullet.speed).toBeGreaterThan(2.6);
  });

  it('RAMP_TURN bleeds to a stop, steps the heading, and restarts', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain({ kind: REC.RAMP_TURN, allowWhileActive: 1, int0: 30, int1: 1, float0: 1.570796, float1: 2.5 }),
      REC.RAMP_TURN,
      { speed1: 2.5, angle: 0 },
    );
    for (let f = 0; f < 29; f++) pool.tick(false, w);
    expect(speedOf(bullet)).toBeLessThan(0.3);
    for (let f = 0; f < 2; f++) pool.tick(false, w);
    expect(normalizeAngle(bullet.angle)).toBeCloseTo(Math.PI / 2, 4);
    expect(bullet.speed).toBeCloseTo(2.5, 4);
    expect(bullet.tfActive & REC.RAMP_TURN).toBe(0);
  });

  it('RAMP_HOME re-aims at the ship on every restart', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain({ kind: REC.RAMP_HOME, allowWhileActive: 1, int0: 20, int1: 1, float0: 0, float1: 3 }),
      REC.RAMP_HOME,
      { speed1: 3, angle: 0 },
    );
    for (let f = 0; f < 22; f++) pool.tick(false, w);
    expect(bullet.angle).toBeCloseTo(Math.atan2(384 - bullet.y, 192 - bullet.x), 3);
  });

  it('BOUNCE reflects at the frame and keeps its speed', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(chain({ kind: REC.BOUNCE, allowWhileActive: 1, int0: 4, float0: -1 }), REC.BOUNCE, {
      speed1: 4,
      angle: 0,
    });
    bullet.x = 380;
    for (let f = 0; f < 6; f++) pool.tick(false, w);
    expect(bullet.vx).toBeLessThan(0);
    expect(bullet.hBounceDone).toBeGreaterThan(0);
  });

  it('WRAP_X carries a bullet off the right edge back onto the left', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(chain({ kind: REC.WRAP_X, allowWhileActive: 1, int0: 600 }), REC.WRAP_X, {
      speed1: 4,
      angle: 0,
    });
    bullet.x = 382;
    for (let f = 0; f < 8; f++) pool.tick(false, w);
    // It crossed the frame and came back on the left instead of being culled.
    expect(bullet.x).toBeLessThan(40);
    expect(bullet.active).toBe(true);
  });

  it('HOLD keeps a bullet alive outside the playfield for its whole window', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(
      chain(
        { kind: REC.HOLD, allowWhileActive: 1, int0: 600 },
        { kind: REC.CURL, allowWhileActive: 0, int0: 1 },
      ),
      REC.HOLD | REC.CURL,
      { speed1: 4, angle: 0 },
    );
    expect(bullet.hold).toBe(600);
    bullet.x = 500;
    for (let f = 0; f < 40; f++) pool.tick(false, w);
    expect(bullet.active).toBe(true);
  });

  it('FADE_OUT animates the bullet away instead of deleting it', () => {
    const {
      bullet,
      pool,
      world: w,
    } = fire(chain({ kind: REC.FADE_OUT, allowWhileActive: 1 }), REC.FADE_OUT, { speed1: 2, angle: 0 });
    pool.tick(false, w);
    expect(bullet.state).toBe(5);
    for (let f = 0; f < 10; f++) pool.tick(false, w);
    expect(bullet.active).toBe(false);
  });

  it('FORK fires the nested pattern and can retire the parent', () => {
    const records = chain(
      { kind: REC.FORK, allowWhileActive: 1, int0: 0x01020304, int1: 3 },
      { kind: REC.FORK, allowWhileActive: 1, int0: 2, int1: 0 },
    );
    const pool = new BulletPool();
    const w = world();
    launchPattern(
      pool,
      w,
      simplePattern({
        aimMode: 1,
        count1: 1,
        speed1: 1,
        transformFlags: REC.FORK,
        records,
        angle: 0,
      }),
      100,
      200,
    );
    const parent = pool.bullets.find((b) => b.active)!;
    for (let f = 0; f < 4; f++) pool.tick(false, w);
    expect(pool.activeCount).toBeGreaterThan(1);
    const child = pool.bullets.find((b) => b.active && b !== parent)!;
    expect(child.type).toBe(0x02);
    expect(child.color).toBe(0x03);
    expect(child.tfIndex).toBe(0x04);
    void parent;
  });
});

describe('the array ceiling', () => {
  it('ends a pattern where the original would, at 0x600 bullets', () => {
    const pool = new BulletPool();
    const w = world();
    const fired = launchPattern(
      pool,
      w,
      simplePattern({
        aimMode: 3,
        count1: 2000,
        count2: 1,
        speed1: 1,
        angle: 0,
        angleStep: 0,
      }),
      192,
      200,
    );
    expect(fired).toBeLessThan(2000);
    expect(pool.activeCount).toBe(0x600);
    expect(pool.stats.refused).toBeGreaterThan(0);
  });

  it('culls with the drawn sprite box, so a fat bullet outlives a pellet past the edge', () => {
    // IsWithinPlayfield measures the sprite, so a 128px eyeball still has half
    // of itself on screen when a pellet centred on the same pixel is gone.
    const small = {
      ...blankBullet(),
      active: true,
      state: BULLET_LIVE,
      x: 400,
      y: 200,
      fieldW: 16,
      fieldH: 16,
    };
    const big = {
      ...blankBullet(),
      active: true,
      state: BULLET_LIVE,
      x: 400,
      y: 200,
      fieldW: 128,
      fieldH: 128,
    };
    const pool = new BulletPool();
    pool.bullets.push(small, big);
    pool.tick(false, world());
    expect(small.active).toBe(false);
    expect(big.active).toBe(true);
  });
});
