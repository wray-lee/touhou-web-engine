import { describe, it, expect } from 'vitest';
import { BulletSystem } from '../core/BulletSystem';
import { CollisionSystem } from '../core/CollisionSystem';
import { Player } from '../../touhou-common/player/Player';
import { Entity } from '../core/Entity';
import { CircularPattern } from '../../touhou-common/bullet-patterns/CircularPattern';
import { CompositePattern } from '../../touhou-common/bullet-patterns/CompositePattern';
import { AimingPattern } from '../../touhou-common/bullet-patterns/AimingPattern';

/**
 * Performance target lock (docs/PLAN.md: "60 FPS 稳定，2000+ 弹幕不掉帧").
 *
 * Simulates the full per-frame logic pipeline headless — bullet motion +
 * angular velocity, spatial-hash rebuild, player-bullet hits, enemy-bullet
 * hit + graze queries — with 2000+ live danmaku on screen. Rendering is
 * GPU-side and excluded; if *logic* fits in a 16.6ms frame budget, the
 * Pixi draw batch (single Graphics, batched fills) does too.
 */
describe('Performance: 60 FPS with 2000+ bullets', () => {
  const FRAME_BUDGET_MS = 16.6; // 60 FPS
  const FRAMES = 300; // 5 seconds of gameplay
  const TARGET_BULLETS = 2000;

  it(`sustains ${TARGET_BULLETS}+ bullets over ${FRAMES} frames under ${FRAME_BUDGET_MS}ms/frame logic`, () => {
    const bullets = new BulletSystem({ maxPoolSize: 4096 });
    const collisions = new CollisionSystem(48);
    const player = new Player({ x: 224, y: 400 });
    player.bulletFactory = (cfg) => bullets.createBullet(cfg);
    const boss = new Entity({ x: 224, y: 120 }, {}, { radius: 20 }, 'boss');

    // Composite ring + aim pattern, pooled through BulletSystem
    const factory = (cfg: Parameters<BulletSystem['createBullet']>[0]) => bullets.createBullet(cfg);
    const salvo = new CompositePattern([
      new CircularPattern({ count: 24, speed: 2.0, color: 0xff3355, angularVelocity: 0.01 }).withFactory(
        factory,
      ),
      new AimingPattern({ count: 3, speed: 3.5, spreadAngle: 0.2 }).withFactory(factory),
    ]);

    let peakLive = 0;
    let peakChecks = 0;
    const frameTimes: number[] = [];

    for (let frame = 0; frame < FRAMES; frame++) {
      const t0 = performance.now();

      // 1. Spawn: keep the screen saturated at >= TARGET_BULLETS
      while (bullets.getCount() < TARGET_BULLETS) {
        bullets.add(...salvo.spawn(boss, frame, player));
      }

      // 2. Player fires (cooldown ticks down in update, shoots every 5 frames)
      player.update(1);
      bullets.add(...player.shoot(frame));

      // 3. Bullet motion (velocity + angular velocity + acceleration)
      bullets.update(1);

      // 4. Spatial hash rebuild + queries — the real per-frame collision load
      const live = bullets.getBullets();
      collisions.update([player, boss, ...live]);
      let playerShots = 0;
      for (const b of live) {
        if (b.tag !== 'player-bullet' || !b.isAlive) continue;
        playerShots++;
        collisions.checkCollisions(b, ['boss']);
      }
      collisions.checkCollisions(player, 'enemy-bullet');
      collisions.queryNearby(player, 16, 'enemy-bullet');

      peakLive = Math.max(peakLive, live.length);
      peakChecks = Math.max(peakChecks, collisions.totalChecks);
      frameTimes.push(performance.now() - t0);
      expect(playerShots).toBeGreaterThan(0);
    }

    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
    const sorted = [...frameTimes].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const worst = sorted[sorted.length - 1];

    // eslint-disable-next-line no-console
    console.log(
      `[perf] ${peakLive} bullets × ${FRAMES} frames | avg ${avg.toFixed(2)}ms | p95 ${p95.toFixed(2)}ms | max ${worst.toFixed(2)}ms | peak checks/frame ${peakChecks}`,
    );

    // The screen really held 2000+ live danmaku
    expect(peakLive).toBeGreaterThanOrEqual(TARGET_BULLETS);
    // 60 FPS budget: average logic must fit well inside a frame
    expect(avg).toBeLessThan(FRAME_BUDGET_MS);
    // p95 also inside budget — no systematic hitching
    expect(p95).toBeLessThan(FRAME_BUDGET_MS);
    // Spatial hash keeps checks near-linear, not O(n²): 2000² = 4,000,000
    expect(peakChecks).toBeLessThan(peakLive * 40);
  });
});
