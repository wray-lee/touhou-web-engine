import { describe, it, expect, beforeEach } from 'vitest';
import { Entity } from '../../engine/core/Entity';
import { Item, ITEM_SPECS, ITEM_MAX_FALL, ITEM_MAX_RISE, ItemKind } from './Item';
import { ItemSystem, DROP_TABLE, MAX_ITEMS, ItemCollectResult } from './ItemSystem';

/** Fixed playfield matching the engine default, so culling is exercised. */
const FIELD = { minX: 32, maxX: 416, minY: 32, maxY: 448 };

function playerAt(x: number, y: number): Entity {
  return new Entity({ x, y }, {}, { radius: 2 }, 'player');
}

/** A deterministic rng so drop rolls are assertable. */
function sequencer(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('Item', () => {
  it('takes its hitbox and spec from the kind', () => {
    const item = new Item({ x: 10, y: 20 }, {}, { kind: 'bomb' });
    expect(item.kind).toBe('bomb');
    expect(item.spec).toBe(ITEM_SPECS.bomb);
    expect(item.hitbox.radius).toBe(ITEM_SPECS.bomb.size / 2);
    expect(item.tag).toBe('item');
  });

  it('hops up briefly, then falls and never exceeds terminal speed', () => {
    const item = new Item({ x: 100, y: 200 }, { x: 0, y: -ITEM_MAX_RISE }, { kind: 'power' });
    let apex = 200;
    for (let i = 0; i < 240; i++) {
      item.update(1);
      apex = Math.min(apex, item.position.y);
      expect(item.velocity.y).toBeLessThanOrEqual(ITEM_MAX_FALL + 1e-9);
    }
    // A visible hop, but nowhere near a quarter of the playfield.
    expect(200 - apex).toBeGreaterThan(4);
    expect(200 - apex).toBeLessThan(48);
    expect(item.position.y).toBeGreaterThan(200);
  });

  it('drags horizontal motion toward zero', () => {
    const item = new Item({ x: 100, y: 100 }, { x: 4, y: 0 }, { kind: 'point' });
    for (let i = 0; i < 400; i++) item.update(1);
    expect(Math.abs(item.velocity.x)).toBeLessThan(0.1);
  });

  it('reset() re-arms a pooled item onto a new kind', () => {
    const item = new Item({ x: 1, y: 2 }, { x: 9, y: 9 }, { kind: 'life' });
    item.magnetized = true;
    item.timer = 42;
    item.reset(50, 60, 'powerSmall');
    expect(item.kind).toBe('powerSmall');
    expect(item.spec).toBe(ITEM_SPECS.powerSmall);
    expect(item.position.x).toBe(50);
    expect(item.velocity.x).toBe(0);
    expect(item.magnetized).toBe(false);
    expect(item.timer).toBe(0);
    expect(item.isAlive).toBe(true);
  });

  it('attract() steers velocity toward the target and caps the speed', () => {
    const item = new Item({ x: 0, y: 0 }, {}, { kind: 'power' });
    for (let i = 0; i < 200; i++) item.attract({ x: 100, y: 0 }, 1);
    expect(item.velocity.x).toBeGreaterThan(0);
    expect(Math.hypot(item.velocity.x, item.velocity.y)).toBeLessThanOrEqual(9 + 1e-9);
  });
});

describe('ItemSystem drop rolls', () => {
  it('every kind in the spec table has art and a positive display size', () => {
    for (const [kind, spec] of Object.entries(ITEM_SPECS)) {
      expect(spec.sprite, kind).toMatch(/^taisei:item:/);
      expect(spec.size, kind).toBeGreaterThan(0);
      expect(spec.color, kind).toBeGreaterThan(0);
    }
  });

  it('rolls the configured counts for each tier', () => {
    const items = new ItemSystem(sequencer([0.99]));
    for (const tier of ['fairy', 'elite', 'midboss', 'boss'] as const) {
      const kinds = items.rollDrops(tier);
      const table = DROP_TABLE[tier];
      expect(kinds.filter((k) => k === 'power').length, tier).toBe(table.power);
      expect(kinds.filter((k) => k === 'powerSmall').length, tier).toBe(table.powerSmall);
      expect(kinds.filter((k) => k === 'point').length, tier).toBe(table.point);
      const rares = kinds.filter((k) => k === 'life' || k === 'bomb');
      // A boss kill always banks one bonus item; the rest are chance-based.
      expect(rares.length, tier).toBe(tier === 'boss' ? 1 : 0);
    }
  });

  it('a guaranteed rare roll yields exactly one bonus item for a boss', () => {
    const items = new ItemSystem(sequencer([0]));
    const kinds = items.rollDrops('boss');
    const rares = kinds.filter((k: ItemKind) => k === 'life' || k === 'bomb');
    expect(rares).toHaveLength(1);
  });
});

describe('ItemSystem lifecycle', () => {
  let items: ItemSystem;

  beforeEach(() => {
    items = new ItemSystem(sequencer([0.5]));
  });

  it('spawnDrops puts the rolled items on the field at the kill position', () => {
    const spawned = items.spawnDrops(200, 150, 'elite');
    expect(spawned.length).toBe(
      DROP_TABLE.elite.power + DROP_TABLE.elite.powerSmall + DROP_TABLE.elite.point,
    );
    expect(items.count).toBe(spawned.length);
    for (const item of spawned) {
      expect(Math.abs(item.position.x - 200)).toBeLessThan(20);
      expect(Math.abs(item.position.y - 150)).toBeLessThan(20);
    }
  });

  it('culls items that fall past the bottom of the playfield', () => {
    items.spawn('power', 200, 400);
    const player = playerAt(20, 430);
    for (let i = 0; i < 400; i++) items.update(1, player, FIELD);
    expect(items.count).toBe(0);
  });

  it('collects on contact and reports the pickup effect', () => {
    items.spawn('life', 200, 200);
    const picked = items.update(1, playerAt(202, 202), FIELD);
    expect(picked).toHaveLength(1);
    expect(picked[0].kind).toBe('life');
    expect(picked[0].lives).toBe(1);
    expect(items.count).toBe(0);
    expect(items.collected).toBe(1);
  });

  it('sweeps the whole screen when the player crosses the capture line', () => {
    for (let i = 0; i < 6; i++) items.spawn('point', 60 + i * 50, 300);
    const before = items.count;
    expect(before).toBe(6);
    const picked = items.update(1, playerAt(224, 40), FIELD);
    // Not necessarily all six in one frame, but they must all home in fast.
    let total = picked.length;
    for (let i = 0; i < 240 && items.count > 0; i++) {
      total += items.update(1, playerAt(224, 40), FIELD).length;
    }
    expect(total).toBe(before);
    expect(items.count).toBe(0);
  });

  it('items far away and below the line are left alone', () => {
    items.spawn('power', 60, 420);
    const picked = items.update(1, playerAt(400, 420), FIELD);
    expect(picked).toHaveLength(0);
    expect(items.count).toBe(1);
  });

  it('keeps the pile inside the playfield walls', () => {
    const item = items.spawn('power', 40, 200);
    item.velocity.x = -20;
    items.update(1, playerAt(400, 400), FIELD);
    expect(item.position.x).toBeGreaterThanOrEqual(FIELD.minX);
  });

  it('collectAll returns everything and empties the field', () => {
    items.spawnDrops(200, 200, 'boss');
    const before = items.count;
    expect(before).toBeGreaterThan(0);
    const picked: ItemCollectResult[] = items.collectAll();
    expect(picked).toHaveLength(before);
    expect(items.count).toBe(0);
    expect(items.collected).toBe(before);
  });

  it('clear() removes items without crediting them', () => {
    items.spawn('power', 200, 200);
    items.clear();
    expect(items.count).toBe(0);
    expect(items.collected).toBe(0);
  });

  it('caps the live pool so a long stage cannot grow it without bound', () => {
    for (let i = 0; i < MAX_ITEMS + 60; i++) items.spawn('point', 200, 200);
    expect(items.count).toBeLessThanOrEqual(MAX_ITEMS);
  });

  it('recycles item instances through the pool', () => {
    const first = items.spawn('power', 200, 200);
    items.collectAll();
    const second = items.spawn('bomb', 300, 300);
    expect(second).toBe(first);
    expect(second.kind).toBe('bomb');
  });
});
