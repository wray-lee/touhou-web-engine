import { describe, expect, it } from 'vitest';
import { Entity } from '../../engine/core/Entity';
import { BulletSystem } from '../../engine/core/BulletSystem';
import { LaserPattern } from './LaserPattern';

const emitter = () => new Entity({ x: 224, y: 120 });

describe('LaserPattern', () => {
  it('grows a straight beam out of the emitter over growFrames', () => {
    const laser = new LaserPattern({
      baseAngle: Math.PI / 2,
      length: 200,
      growFrames: 4,
      holdFrames: 10,
      shrinkFrames: 4,
      segmentGap: 10,
    });
    const e = emitter();
    const first = laser.spawn(e, 0);
    expect(first.length).toBeGreaterThan(0);
    expect(Math.max(...first.map((b) => b.position.y))).toBeLessThan(e.position.y + 100);
    let far: number[] = [];
    for (let i = 1; i < 4; i++) far = laser.spawn(e, i).map((b) => b.position.y);
    // Segments are spaced by segmentGap, so the last one sits within one gap of the tip.
    expect(Math.max(...far)).toBeGreaterThanOrEqual(e.position.y + 200 - 10);
  });

  it('emits nothing once the beam has fully extended', () => {
    const laser = new LaserPattern({
      baseAngle: 0,
      length: 100,
      growFrames: 2,
      holdFrames: 20,
      shrinkFrames: 2,
    });
    const e = emitter();
    laser.spawn(e, 0);
    laser.spawn(e, 1);
    expect(laser.spawn(e, 2).length).toBe(0);
  });

  it('retracts tip-first by giving far segments a shorter life', () => {
    const laser = new LaserPattern({
      baseAngle: 0,
      length: 300,
      growFrames: 6,
      holdFrames: 12,
      shrinkFrames: 6,
      segmentGap: 30,
    });
    const e = emitter();
    let near = laser.spawn(e, 0);
    let far = near;
    for (let i = 1; i < 6; i++) far = laser.spawn(e, i);
    expect(near[0].maxLifetime).toBeGreaterThan(far[0].maxLifetime);
    expect(laser.cycleFrames).toBe(24);
  });

  it('sweep mode rotates the beam by sweepSpeed each frame', () => {
    const laser = new LaserPattern({
      baseAngle: 0,
      mode: 'sweep',
      length: 120,
      growFrames: 1,
      holdFrames: 40,
      shrinkFrames: 0,
      sweepSpeed: 0.2,
      tailFrames: 20,
      segmentGap: 12,
    });
    const e = emitter();
    const a = laser.spawn(e, 0)[0];
    laser.spawn(e, 1);
    const b = laser.spawn(e, 2)[0];
    const angleA = Math.atan2(a.position.y - e.position.y, a.position.x - e.position.x);
    const angleB = Math.atan2(b.position.y - e.position.y, b.position.x - e.position.x);
    expect(angleB - angleA).toBeGreaterThan(0.3);
  });

  it('wall mode fires count parallel beams offset perpendicular to the direction', () => {
    const laser = new LaserPattern({
      baseAngle: Math.PI / 2,
      mode: 'wall',
      count: 3,
      gap: 50,
      length: 100,
      growFrames: 2,
      segmentGap: 25,
    });
    const e = emitter();
    const shots = laser.spawn(e, 0);
    const xs = Array.from(new Set(shots.map((b) => Math.round(b.position.x))));
    expect(xs.length).toBe(3);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(100, 0);
  });

  it('segments are static, lethal, and expire inside the bullet system', () => {
    const system = new BulletSystem();
    const laser = new LaserPattern({
      baseAngle: 0,
      length: 40,
      growFrames: 2,
      holdFrames: 2,
      shrinkFrames: 2,
      segmentGap: 20,
    });
    const e = emitter();
    system.add(...laser.spawn(e, 0));
    expect(system.getBullets().every((b) => b.velocity.x === 0 && b.velocity.y === 0)).toBe(true);
    expect(system.getBullets().every((b) => b.tag === 'enemy-bullet' && b.damage > 0)).toBe(true);
    for (let i = 0; i < 12; i++) system.update(1);
    expect(system.getBullets().length).toBe(0);
  });

  it('reset rewinds the growth clock', () => {
    const laser = new LaserPattern({ baseAngle: 0, length: 100, growFrames: 3, holdFrames: 3 });
    const e = emitter();
    laser.spawn(e, 0);
    laser.spawn(e, 1);
    laser.spawn(e, 2);
    expect(laser.spawn(e, 3).length).toBe(0);
    laser.reset();
    expect(laser.frame).toBe(0);
    expect(laser.spawn(e, 4).length).toBeGreaterThan(0);
  });

  it('sweep mode lays out `arms` evenly spaced rotating beams', () => {
    const laser = new LaserPattern({
      baseAngle: 0,
      mode: 'sweep',
      arms: 4,
      length: 120,
      segmentGap: 20,
      tailFrames: 4,
    });
    const e = emitter();
    const shots = laser.spawn(e, 0);
    const angles = Array.from(
      new Set(
        shots.map(
          (b) => Math.round(Math.atan2(b.position.y - e.position.y, b.position.x - e.position.x) * 100) / 100,
        ),
      ),
    );
    expect(angles.length).toBe(4);
    expect(Math.max(...angles.map((a) => Math.abs(a)))).toBeLessThanOrEqual(Math.PI);
    // Every arm is lethal from the emitter out to the tip, not just its end.
    const radii = shots.map((b) => Math.hypot(b.position.x - e.position.x, b.position.y - e.position.y));
    expect(Math.min(...radii)).toBeLessThan(30);
    expect(Math.max(...radii)).toBeGreaterThan(90);
  });

  it('keeps cycling a beam while the boss keeps firing it', () => {
    const laser = new LaserPattern({
      baseAngle: Math.PI / 2,
      length: 100,
      growFrames: 2,
      holdFrames: 2,
      shrinkFrames: 2,
    });
    const e = emitter();
    laser.spawn(e, 0);
    laser.spawn(e, 1);
    expect(laser.spawn(e, 2).length).toBe(0);
    // Frame 6 wraps back to frame 0 of the next cycle, so the beam grows again.
    for (let i = 3; i < 6; i++) laser.spawn(e, i);
    expect(laser.cycleFrames).toBe(6);
    expect(laser.spawn(e, 6).length).toBeGreaterThan(0);
  });

  it('stamps the beam direction onto every segment', () => {
    const laser = new LaserPattern({ baseAngle: 0.7, length: 90, segmentGap: 15, growFrames: 1 });
    const shots = laser.spawn(emitter(), 0);
    expect(shots.length).toBeGreaterThan(0);
    for (const b of shots) expect(b.heading).toBeCloseTo(0.7, 5);
  });
});
