import { describe, it, expect, beforeEach } from 'vitest';
import { Bullet, drainBulletPool, obtainBullet, releaseBullet } from './Bullet';

/**
 * Motion model tests for the th08-faithful polar bullet integrator:
 * heading / angularVelocity / angularAcceleration / acceleration and the
 * th08-compatible rate windows (speed/heading plus angular/radial rates).
 */
describe('Bullet motion model', () => {
  beforeEach(() => {
    drainBulletPool();
  });

  it('derives heading from the spawn velocity', () => {
    const b = new Bullet({ velocity: { x: 0, y: 4 } });
    expect(b.heading).toBeCloseTo(Math.PI / 2, 6);
  });

  it('curves along angularVelocity while preserving speed', () => {
    const b = new Bullet({ velocity: { x: 3, y: 0 }, angularVelocity: 0.1 });
    b.update(1);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBeCloseTo(3, 6);
    expect(b.heading).toBeCloseTo(0.1, 6);
  });

  it('ramps angularVelocity by angularAcceleration each frame', () => {
    const b = new Bullet({
      velocity: { x: 2, y: 0 },
      angularVelocity: 0.01,
      angularAcceleration: 0.01,
    });
    b.update(1);
    expect(b.angularVelocity).toBeCloseTo(0.02, 8);
    b.update(1);
    expect(b.angularVelocity).toBeCloseTo(0.03, 8);
    expect(b.heading).toBeCloseTo(0.03, 8);
  });

  it('integrates angular jerk and clamps angular velocity/acceleration rates', () => {
    const b = new Bullet({
      velocity: { x: 2, y: 0 },
      angularJerk: 0.01,
      angularVelocityMax: 0.015,
      angularAccelerationMax: 0.02,
    });
    b.update(1);
    expect(b.heading).toBeCloseTo(0, 8);
    expect(b.angularAcceleration).toBeCloseTo(0.01, 8);
    expect(b.angularVelocity).toBeCloseTo(0, 8);
    b.update(1);
    expect(b.heading).toBeCloseTo(0, 8);
    expect(b.angularVelocity).toBeCloseTo(0.01, 8);
    b.update(2);
    expect(b.heading).toBeCloseTo(0.02, 8);
    expect(b.angularVelocity).toBeCloseTo(0.015, 8);
    expect(b.angularAcceleration).toBeCloseTo(0.02, 8);
  });

  it('accelerates a bullet spawned at rest along its explicit heading', () => {
    // th08 ids 9/10 spawn with r:0 + ra:0.1 — they must still move.
    const b = new Bullet({ velocity: { x: 0, y: 0 }, heading: 0, acceleration: 0.1 });
    b.update(1);
    expect(b.velocity.x).toBeCloseTo(0.1, 6);
    expect(b.velocity.y).toBeCloseTo(0, 6);
    b.update(9);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBeCloseTo(1, 6);
  });

  it('clamps acceleration at speedMax (th08 rrange.max)', () => {
    const b = new Bullet({
      velocity: { x: 0, y: 0 },
      heading: Math.PI,
      acceleration: 0.1,
      speedMax: 3,
    });
    for (let i = 0; i < 100; i++) b.update(1);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBeCloseTo(3, 6);
    expect(b.velocity.x).toBeCloseTo(-3, 6);
  });

  it('applies radial acceleration limits even without a jerk term', () => {
    const b = new Bullet({
      velocity: { x: 1, y: 0 },
      acceleration: 0.5,
      accelerationMax: 0.1,
    });
    b.update(1);
    expect(b.acceleration).toBeCloseTo(0.1, 8);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBeCloseTo(1.5, 8);
  });

  it('floors deceleration at speedMin (th08 rrange.min)', () => {
    const b = new Bullet({ velocity: { x: 5, y: 0 }, acceleration: -0.1, speedMin: 2 });
    for (let i = 0; i < 100; i++) b.update(1);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBeCloseTo(2, 6);
  });

  it('never reverses direction when decelerating past zero without a floor', () => {
    const b = new Bullet({ velocity: { x: 1, y: 0 }, acceleration: -0.6 });
    b.update(1);
    b.update(1);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBe(0);
    expect(b.velocity.x).toBe(0);
  });

  it('leaves velocity untouched for straight-line bullets', () => {
    const b = new Bullet({ position: { x: 10, y: 10 }, velocity: { x: 2, y: -1 } });
    b.update(2);
    expect(b.position.x).toBe(14);
    expect(b.position.y).toBe(8);
    expect(b.velocity.x).toBe(2);
    expect(b.velocity.y).toBe(-1);
  });

  it('re-arms heading and clamps when a pooled bullet is reused', () => {
    const first = obtainBullet({ velocity: { x: 4, y: 0 }, speedMax: 9 });
    first.destroy();
    releaseBullet(first);
    const reused = obtainBullet({ velocity: { x: 0, y: 0 }, heading: Math.PI / 2, acceleration: 1 });
    expect(reused).toBe(first);
    expect(reused.speedMax).toBe(Number.POSITIVE_INFINITY);
    expect(reused.heading).toBeCloseTo(Math.PI / 2, 6);
    reused.update(1);
    expect(reused.velocity.y).toBeCloseTo(1, 6);
  });

  it('ramps acceleration by jerk (th08 raa) — bullets curve away over time', () => {
    // id 9: r:0 ra:0.1 raa:0.01 rrange.max:3 -> slow start, then a fast run.
    const b = new Bullet({
      velocity: { x: 0, y: 0 },
      heading: 0,
      acceleration: 0.1,
      jerk: 0.01,
      speedMax: 3,
    });
    const speeds: number[] = [];
    for (let i = 0; i < 5; i++) {
      b.update(1);
      speeds.push(Math.hypot(b.velocity.x, b.velocity.y));
    }
    expect(speeds[0]).toBeCloseTo(0.1, 6);
    expect(speeds[4]).toBeGreaterThan(speeds[0] * 4);
    expect(b.acceleration).toBeCloseTo(0.15, 6);
  });

  it('speeds up then settles on the rrange floor (th08 id 2 ring behaviour)', () => {
    // id 2: r:5 ra:0.1 raa:-0.01 rrange.min:2
    const b = new Bullet({
      velocity: { x: 5, y: 0 },
      acceleration: 0.1,
      jerk: -0.01,
      speedMin: 2,
    });
    let peak = 5;
    for (let i = 0; i < 400; i++) {
      b.update(1);
      peak = Math.max(peak, Math.hypot(b.velocity.x, b.velocity.y));
    }
    expect(peak).toBeGreaterThan(5);
    expect(Math.hypot(b.velocity.x, b.velocity.y)).toBeCloseTo(2, 5);
  });

  it('clamps the sweeping heading at trange bounds (th08 laser sweep)', () => {
    // id 11: theta:180 w:-0.01 wa:-0.01 trange.min:110
    const min = (110 * Math.PI) / 180;
    const b = new Bullet({
      velocity: { x: 0, y: 0 },
      heading: Math.PI,
      angularVelocity: -0.01,
      angularAcceleration: -0.01,
      headingMin: min,
    });
    for (let i = 0; i < 2000; i++) b.update(1);
    expect(b.heading).toBeCloseTo(min, 6);
  });
});

/**
 * Bounded homing. A homing charm must bend toward its mark, never curl into a
 * circle around the shooter, so the turn is capped relative to the launch
 * heading and dropped entirely once the target falls behind the shot.
 */
describe('Bullet bounded homing', () => {
  beforeEach(() => {
    drainBulletPool();
  });

  it('steers toward the target but never past homingMaxTurn off the launch heading', () => {
    const b = new Bullet({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: -10 },
      homingTurn: 0.2,
      homingMaxTurn: 0.5,
    });
    const launch = b.heading;
    // Aim far to the right so an uncapped shot would swing all the way over.
    for (let i = 0; i < 60; i++) b.homeToward(Math.atan2(-1, 40), 0.2);
    const dev = Math.abs(((b.heading - launch + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
    expect(dev).toBeLessThanOrEqual(0.5 + 1e-9);
  });

  it('gives up steering when the target sits behind the shot', () => {
    const b = new Bullet({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: -10 },
      homingTurn: 0.2,
      homingMaxTurn: 0.5,
    });
    const before = b.heading;
    expect(b.homeToward(Math.PI / 2, 0.2)).toBe(false);
    expect(b.heading).toBeCloseTo(before, 10);
  });

  it('keeps an upward homing shot above its muzzle for 400 frames', () => {
    const b = new Bullet({
      position: { x: 224, y: 400 },
      velocity: { x: 6, y: -10 },
      homingTurn: 0.05,
      homingFrames: 34,
      homingMaxTurn: 0.62,
    });
    // Target directly above the playfield: the shot overshoots it and must not loop.
    const aim = { x: 224, y: 60 };
    let lowest = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < 400; i++) {
      if (b.lifetime < b.homingFrames)
        b.homeToward(Math.atan2(aim.y - b.position.y, aim.x - b.position.x), b.homingTurn);
      b.update(1);
      lowest = Math.max(lowest, b.position.y);
    }
    // Never falls back to the muzzle line, and it is long gone by the end.
    expect(lowest).toBeLessThan(400);
    expect(b.position.y).toBeLessThan(0);
  });

  it('leaves a shot with no homing cap uncapped but still straight when aim is null', () => {
    const b = new Bullet({ position: { x: 0, y: 0 }, velocity: { x: 0, y: -5 } });
    expect(b.homingMaxTurn).toBe(0);
    expect(b.homeToward(-Math.PI / 4, 0.1)).toBe(true);
  });
});
