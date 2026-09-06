import { describe, it, expect } from 'vitest';
import { CollisionSystem } from './CollisionSystem';
import { Entity } from './Entity';

describe('CollisionSystem', () => {
  function makeEntity(x: number, y: number, radius: number, tag: string, isAlive = true): Entity {
    const e = new Entity({ x, y }, {}, { radius }, tag as never);
    if (!isAlive) e.destroy();
    return e;
  }

  function buildSystem(entities: Entity[]): CollisionSystem {
    const system = new CollisionSystem(64);
    system.update(entities);
    return system;
  }

  it('detects collisions with accurate distance via spatial hash grid', () => {
    const player = makeEntity(100, 100, 2, 'player');
    const bullet = makeEntity(104, 100, 4, 'enemy-bullet');
    const far = makeEntity(300, 300, 4, 'enemy-bullet');

    const system = buildSystem([player, bullet, far]);
    const hits = system.checkCollisions(player, 'enemy-bullet');

    expect(hits.length).toBe(1);
    expect(hits[0].entity).toBe(bullet);
    expect(hits[0].distance).toBeLessThanOrEqual(6);
  });

  it('supports single-tag filtering', () => {
    const player = makeEntity(100, 100, 2, 'player');
    const enemy = makeEntity(103, 100, 4, 'enemy');
    const boss = makeEntity(103, 105, 4, 'boss');

    const system = buildSystem([player, enemy, boss]);
    const enemyHits = system.checkCollisions(player, 'enemy');
    expect(enemyHits.length).toBe(1);
    expect(enemyHits[0].entity).toBe(enemy);

    const bossHits = system.checkCollisions(player, 'boss');
    expect(bossHits.length).toBe(1);
    expect(bossHits[0].entity).toBe(boss);
  });

  it('supports multi-tag filtering (player bullets vs enemy+boss)', () => {
    const bullet = makeEntity(200, 200, 3, 'player-bullet');
    const enemy = makeEntity(203, 200, 4, 'enemy');
    const boss = makeEntity(200, 206, 4, 'boss');
    const otherBullet = makeEntity(200, 250, 3, 'enemy-bullet');

    const system = buildSystem([bullet, enemy, boss, otherBullet]);
    const hits = system.checkCollisions(bullet, ['enemy', 'boss']);

    expect(hits.length).toBe(2);
    const hitTags = hits.map((h) => h.entity.tag);
    expect(hitTags).toContain('enemy');
    expect(hitTags).toContain('boss');
  });

  it('ignores dead entities', () => {
    const player = makeEntity(100, 100, 2, 'player');
    const deadEnemy = makeEntity(103, 100, 4, 'enemy', false);

    const system = buildSystem([player, deadEnemy]);
    const hits = system.checkCollisions(player, 'enemy');
    expect(hits.length).toBe(0);
  });

  it('queryNearby returns entities within the given radius (graze)', () => {
    const player = makeEntity(100, 100, 2, 'player');
    const close = makeEntity(110, 100, 4, 'enemy-bullet'); // dist 10 (<=16)
    const far = makeEntity(120, 100, 4, 'enemy-bullet'); // dist 20 (>16)

    const system = buildSystem([player, close, far]);
    const nearby = system.queryNearby(player, 16, 'enemy-bullet');

    expect(nearby.length).toBe(1);
    expect(nearby[0].entity).toBe(close);
  });

  it('tracks real distance comparisons in totalChecks (F12 metric)', () => {
    const player = makeEntity(100, 100, 2, 'player');
    const b1 = makeEntity(104, 100, 4, 'enemy-bullet'); // dist 4 -> hit
    const b2 = makeEntity(140, 100, 4, 'enemy-bullet'); // same cell, dist 40 -> checked, no hit
    const b3 = makeEntity(150, 100, 4, 'enemy-bullet'); // neighbour cell, dist 50 -> checked, no hit

    const system = buildSystem([player, b1, b2, b3]);
    system.checkCollisions(player, 'enemy-bullet');

    // All three are within the player's 9-cell neighbourhood -> 3 real distance comparisons
    expect(system.totalChecks).toBe(3);
  });
});
