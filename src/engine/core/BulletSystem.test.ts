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

  describe('Object Pool', () => {
    it('reuses recycled bullets instead of allocating new instances', () => {
      const system = new BulletSystem({ maxPoolSize: 32 });
      const b1 = system.createBullet({ position: { x: 100, y: 100 }, velocity: { x: 1, y: 2 } });
      const b2 = system.createBullet({ position: { x: 200, y: 200 } });
      expect(b1.isAlive).toBe(true);

      system.add(b1, b2);

      // Send both bullets out of bounds -> recycled into the pool
      b1.position.y = 9999;
      b2.position.y = -9999;
      system.update(1);

      expect(b1.isAlive).toBe(false);
      expect(system.poolSize).toBe(2);

      const b3 = system.createBullet({ position: { x: 50, y: 50 } });
      expect(b3).toBe(b1); // same instance reused
      expect(b3.isAlive).toBe(true);
      expect(b3.position.x).toBe(50);
      expect(b3.position.y).toBe(50);
      // Old state must not leak
      expect(b3.velocity.x).toBe(0);
      expect(b3.lifetime).toBe(0);
      // Reused count tracked for debug overlay
      expect(system.getStats().reused).toBe(1);
    });

    it('recycles bullets on clearAll (bomb effect)', () => {
      const system = new BulletSystem();
      const a = system.createBullet();
      system.add(a);
      system.clearAll();
      expect(system.poolSize).toBe(1);

      const b = system.createBullet();
      expect(b).toBe(a);
    });

    it('recycles externally created bullets when they die', () => {
      const system = new BulletSystem();
      const ext = new Bullet({ position: { x: 100, y: 100 } });
      system.add(ext);
      ext.destroy();
      system.update(1);
      expect(system.poolSize).toBe(1);
    });

    it('respects maxPoolSize cap', () => {
      const system = new BulletSystem({ maxPoolSize: 3 });
      const bullets = [0, 1, 2, 3, 4].map(() => system.createBullet());
      system.add(...bullets);
      system.clearAll();
      expect(system.poolSize).toBe(3);
    });
  });
});
