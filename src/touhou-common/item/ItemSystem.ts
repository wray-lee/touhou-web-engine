import { Entity } from '../../engine/core/Entity';
import { Bounds } from '../../engine/core/BulletSystem';
import { Item, ItemKind, ITEM_MAGNET_RADIUS, ITEM_CAPTURE_LINE, ITEM_DEEP_CULL, ITEM_MAX_RISE } from './Item';

/** How generous a kill is with its drops. */
export type DropTier = 'fairy' | 'elite' | 'midboss' | 'boss';

/**
 * Per-tier drop counts. Power/point items are near-guaranteed so the player can
 * actually reach max power; the rare kinds roll once per kill.
 */
export const DROP_TABLE: Record<
  DropTier,
  { power: number; powerSmall: number; point: number; rare: number }
> = {
  fairy: { power: 0, powerSmall: 1, point: 1, rare: 0.01 },
  elite: { power: 1, powerSmall: 2, point: 2, rare: 0.05 },
  midboss: { power: 3, powerSmall: 4, point: 4, rare: 0.25 },
  boss: { power: 6, powerSmall: 6, point: 8, rare: 1 },
};

/** Cap on live items so a long stage cannot grow the pool without bound. */
export const MAX_ITEMS = 220;

export interface ItemCollectResult {
  kind: ItemKind;
  power: number;
  fillsPower: boolean;
  score: number;
  lives: number;
  bombs: number;
}

/**
 * Owns every collectible on the playfield: spawning drops from kills, applying
 * their arc-and-fall motion, magnetising them to the player, and reporting what
 * was picked up this frame.
 */
export class ItemSystem {
  public items: Item[] = [];
  /** Total items collected since the last reset, for the debug overlay. */
  public collected = 0;
  private pool: Item[] = [];

  constructor(private rng: () => number = Math.random) {}

  /** Number of live items. */
  get count(): number {
    return this.items.length;
  }

  /** Roll and spawn the drop set for a killed enemy of `tier` at (x, y). */
  spawnDrops(x: number, y: number, tier: DropTier): Item[] {
    const kinds = this.rollDrops(tier);
    return kinds.map((kind, i) => this.spawn(kind, x, y, i));
  }

  /** Decide which items a kill of `tier` yields. */
  rollDrops(tier: DropTier): ItemKind[] {
    const table = DROP_TABLE[tier] ?? DROP_TABLE.fairy;
    const kinds: ItemKind[] = [];
    for (let i = 0; i < table.power; i++) kinds.push('power');
    for (let i = 0; i < table.powerSmall; i++) kinds.push('powerSmall');
    for (let i = 0; i < table.point; i++) kinds.push('point');
    const rare = this.rng();
    if (rare < table.rare * 0.4) kinds.push('life');
    else if (rare < table.rare) kinds.push('bomb');
    return kinds;
  }

  /** Spawn one item, arcing it outward so a stack does not collapse into a dot. */
  spawn(kind: ItemKind, x: number, y: number, index = 0): Item {
    const item = this.pool.pop() ?? new Item();
    item.reset(x, y, kind);
    // Fan the initial velocity so simultaneous drops spread into a pile.
    const angle = this.rng() * Math.PI * 2;
    const speed = 0.6 + this.rng() * 1.5;
    item.velocity.x = Math.cos(angle) * speed;
    item.velocity.y = Math.max(-ITEM_MAX_RISE, -Math.abs(Math.sin(angle)) * speed - 0.4);
    item.position.x += Math.cos(angle) * index * 0.5;
    item.isAlive = true;
    this.items.push(item);
    if (this.items.length > MAX_ITEMS) this.release(this.items.shift() as Item);
    return item;
  }

  /**
   * Advance every item and return the ones the player touched.
   *
   * Items home in when the player is within `ITEM_MAGNET_RADIUS`, or whenever
   * the player sits above the capture line, which is how TH08 sweeps the screen.
   */
  update(dt: number, player: Entity, bounds: Bounds): ItemCollectResult[] {
    const picked: ItemCollectResult[] = [];
    const px = player.position.x;
    const py = player.position.y;
    const sweeping = py <= ITEM_CAPTURE_LINE;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (!item.isAlive) {
        this.items.splice(i, 1);
        continue;
      }

      const dx = px - item.position.x;
      const dy = py - item.position.y;
      const dist = Math.hypot(dx, dy);
      if (sweeping || dist < ITEM_MAGNET_RADIUS) item.attract(player.position, dt, sweeping ? 1.6 : 1);
      item.update(dt);

      // Keep the pile inside the playfield walls.
      const r = item.hitbox.radius;
      if (item.position.x < bounds.minX + r) {
        item.position.x = bounds.minX + r;
        item.velocity.x = Math.abs(item.velocity.x) * 0.5;
      } else if (item.position.x > bounds.maxX - r) {
        item.position.x = bounds.maxX - r;
        item.velocity.x = -Math.abs(item.velocity.x) * 0.5;
      }

      if (dist <= item.hitbox.radius + 8) {
        picked.push(this.toResult(item));
        this.items.splice(i, 1);
        this.release(item);
        continue;
      }

      if (item.position.y > bounds.maxY + ITEM_DEEP_CULL) {
        this.items.splice(i, 1);
        this.release(item);
      }
    }

    this.collected += picked.length;
    return picked;
  }

  /** Sweep every live item into the player, as TH08 does on boss death. */
  collectAll(): ItemCollectResult[] {
    const picked = this.items.map((item) => this.toResult(item));
    this.collected += picked.length;
    for (const item of this.items) this.release(item);
    this.items = [];
    return picked;
  }

  /** Remove every item without collecting it (stage transitions, resets). */
  clear(): void {
    for (const item of this.items) this.release(item);
    this.items = [];
  }

  private toResult(item: Item): ItemCollectResult {
    return {
      kind: item.kind,
      power: item.spec.power,
      fillsPower: Boolean(item.spec.fillsPower),
      score: item.spec.score,
      lives: item.spec.lives,
      bombs: item.spec.bombs,
    };
  }

  private release(item: Item): void {
    item.magnetized = false;
    item.timer = 0;
    item.alpha = 1;
    item.velocity.x = 0;
    item.velocity.y = 0;
    if (this.pool.length < MAX_ITEMS) this.pool.push(item);
  }
}
