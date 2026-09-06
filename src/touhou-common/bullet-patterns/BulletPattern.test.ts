import { describe, it, expect } from 'vitest';
import { Entity } from '../../engine/core/Entity';
import { Bullet, BulletConfig } from '../../engine/core/Bullet';
import { CircularPattern } from './CircularPattern';
import { LinearPattern } from './LinearPattern';
import { AimingPattern } from './AimingPattern';
import { CompositePattern } from './CompositePattern';

describe('Bullet Patterns', () => {
  const boss = new Entity({ x: 192, y: 100 });
  const player = new Entity({ x: 192, y: 400 });

  it('CircularPattern generates N bullets equally spaced around a circle', () => {
    const pattern = new CircularPattern({ count: 8, speed: 3, angleOffset: 0 });
    const bullets = pattern.spawn(boss, 0, player);

    expect(bullets.length).toBe(8);
    // First bullet angle should be 0 (vx = 3, vy = 0)
    expect(bullets[0].velocity.x).toBeCloseTo(3);
    expect(bullets[0].velocity.y).toBeCloseTo(0);

    // 90 deg bullet (Math.PI / 2) -> index 2
    expect(bullets[2].velocity.x).toBeCloseTo(0);
    expect(bullets[2].velocity.y).toBeCloseTo(3);
  });

  it('AimingPattern fires towards the player target', () => {
    const pattern = new AimingPattern({ count: 1, speed: 4 });
    const bullets = pattern.spawn(boss, 0, player);

    expect(bullets.length).toBe(1);
    // Player is directly below boss (dx=0, dy=300), so vy should be 4, vx should be 0
    expect(bullets[0].velocity.x).toBeCloseTo(0);
    expect(bullets[0].velocity.y).toBeCloseTo(4);
  });

  it('LinearPattern shoots a spread or stream in a fixed direction', () => {
    const pattern = new LinearPattern({ count: 3, speed: 5, baseAngle: Math.PI / 2, spreadAngle: 0.2 });
    const bullets = pattern.spawn(boss, 0, player);

    expect(bullets.length).toBe(3);
    expect(bullets[1].velocity.y).toBeCloseTo(5); // center bullet points down
  });

  it('CompositePattern combines multiple patterns into one salvo', () => {
    const circ = new CircularPattern({ count: 4, speed: 2 });
    const aim = new AimingPattern({ count: 3, speed: 3 });
    const comp = new CompositePattern([circ, aim]);

    const bullets = comp.spawn(boss, 0, player);
    expect(bullets.length).toBe(7);
  });

  it('withFactory propagates to every child pattern (composite bullets pool)', () => {
    const circ = new CircularPattern({ count: 4, speed: 2 });
    const aim = new AimingPattern({ count: 3, speed: 3 });
    const comp = new CompositePattern([circ, aim]);

    let created = 0;
    const factory = (config: BulletConfig) => {
      created++;
      return new Bullet(config);
    };
    comp.withFactory(factory);

    const bullets = comp.spawn(boss, 0, player);
    expect(bullets.length).toBe(7);
    expect(created).toBe(7); // every child bullet went through the pool factory
  });
});
