import { describe, it, expect, beforeEach } from 'vitest';
import { BulletSystem } from './BulletSystem';
import { Bullet, obtainBullet, releaseBullet, drainBulletPool, getBulletPoolSize } from './Bullet';

describe('BulletSystem', () => {
  // The bullet pool is a shared module-level facility — start every test empty.
  beforeEach(() => {
    drainBulletPool();
  });
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

  describe('Shared module pool (obtainBullet / releaseBullet)', () => {
    it('spawn+kill cycles reuse instances across independent BulletSystems', () => {
      const a = new BulletSystem();
      const b = new BulletSystem();

      const first = a.createBullet({ position: { x: 10, y: 10 } });
      a.add(first);
      first.position.y = 99999; // out of bounds -> culled & released
      a.update(1);
      expect(first.isAlive).toBe(false);
      expect(getBulletPoolSize()).toBe(1);

      // A completely different system draws from the same free-list
      const second = b.createBullet({ position: { x: 20, y: 30 } });
      expect(second).toBe(first);
      expect(getBulletPoolSize()).toBe(0);
      expect(b.getStats().reused).toBe(1);
    });

    it('obtainBullet resets all mutable state from a dirty released bullet', () => {
      const dirty = obtainBullet({
        position: { x: 5, y: 6 },
        velocity: { x: 1, y: 2 },
        radius: 7,
        color: 0x112233,
        sprite: 'bullet_ring',
        damage: 3,
        grazed: true,
        angularVelocity: 0.5,
        acceleration: 0.1,
        tag: 'player-bullet',
      });
      dirty.update(1); // move + tick lifetime
      dirty.rotation = 1.23;
      dirty.destroy();
      releaseBullet(dirty);
      expect(getBulletPoolSize()).toBe(1);

      const fresh = obtainBullet(); // no config -> everything back to defaults
      expect(fresh).toBe(dirty);
      expect(fresh.isAlive).toBe(true);
      expect(fresh.isPooled).toBe(false);
      expect(fresh.position.x).toBe(0);
      expect(fresh.position.y).toBe(0);
      expect(fresh.velocity.x).toBe(0);
      expect(fresh.velocity.y).toBe(0);
      expect(fresh.rotation).toBe(0);
      expect(fresh.hitbox.radius).toBe(4);
      expect(fresh.hitbox.offset).toEqual({ x: 0, y: 0 });
      expect(fresh.color).toBe(0xff3366);
      expect(fresh.sprite).toBe('bullet_small');
      expect(fresh.damage).toBe(1);
      expect(fresh.grazed).toBe(false);
      expect(fresh.angularVelocity).toBe(0);
      expect(fresh.acceleration).toBe(0);
      expect(fresh.lifetime).toBe(0);
      expect(fresh.tag).toBe('enemy-bullet');
    });

    it('releaseBullet is double-release safe and refuses live bullets', () => {
      const live = obtainBullet();
      releaseBullet(live); // still alive -> ignored
      expect(getBulletPoolSize()).toBe(0);

      live.destroy();
      releaseBullet(live);
      expect(getBulletPoolSize()).toBe(1);

      releaseBullet(live); // already pooled -> ignored
      expect(getBulletPoolSize()).toBe(1);
    });

    it('releaseBullet honours the cap', () => {
      const bullets = [0, 1, 2].map((i) => {
        const b = obtainBullet({ position: { x: i, y: i } });
        b.destroy();
        return b;
      });
      for (const b of bullets) releaseBullet(b, 2);
      expect(getBulletPoolSize()).toBe(2);
    });
  });
});
