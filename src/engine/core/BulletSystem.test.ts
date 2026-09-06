import { describe, it, expect } from 'vitest';
import { BulletSystem } from './BulletSystem';
import { Bullet } from './Bullet';

describe('BulletSystem', () => {
  it('manages bullets update and culling outside boundary', () => {
    const system = new BulletSystem({
      minX: 0,
      maxX: 400,
      minY: 0,
      maxY: 600,
    });

    const b1 = new Bullet({ position: { x: 200, y: 300 }, velocity: { x: 0, y: 10 } });
    const b2 = new Bullet({ position: { x: 200, y: 650 }, velocity: { x: 0, y: 10 } }); // outside

    system.add(b1);
    system.add(b2);

    expect(system.getBullets().length).toBe(2);

    system.update(1);

    // b2 should be culled
    expect(b1.isAlive).toBe(true);
    expect(b2.isAlive).toBe(false);
    expect(system.getBullets().length).toBe(1);
  });

  it('can clear all bullets (bomb effect)', () => {
    const system = new BulletSystem();
    system.add(new Bullet());
    system.add(new Bullet());
    expect(system.getBullets().length).toBe(2);

    system.clearAll();
    expect(system.getBullets().length).toBe(0);
  });
});
