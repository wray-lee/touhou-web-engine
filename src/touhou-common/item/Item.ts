import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';

/** Collectible drop kinds, mirroring the TH08 item set. */
export type ItemKind = 'power' | 'powerSmall' | 'point' | 'life' | 'bomb' | 'fullpower' | 'surge';

/** Tuning for one item kind: art slot, on-screen size and pickup effect. */
export interface ItemSpec {
  /** Texture slot resolved by the renderer; real Taisei item art. */
  sprite: string;
  /** Display size in playfield pixels. */
  size: number;
  /** Fallback fill when the vendored item art is unavailable. */
  color: number;
  /** Power added to the player, in 1/256 units. */
  power: number;
  /** True when the item fills power to the cap instead of adding a fixed amount. */
  fillsPower?: boolean;
  score: number;
  lives: number;
  bombs: number;
}

export const ITEM_SPECS: Record<ItemKind, ItemSpec> = {
  // Big P is worth 8 units and small P 1, straight from AddPower(8) /
  // AddPower(1) in the reference Item::CollectPower* handlers.
  power: {
    sprite: 'taisei:item:power',
    size: 26,
    color: 0xc03040,
    power: 8,
    score: 0,
    lives: 0,
    bombs: 0,
  },
  powerSmall: {
    sprite: 'taisei:item:minipower',
    size: 18,
    color: 0xff8090,
    power: 1,
    score: 0,
    lives: 0,
    bombs: 0,
  },
  point: { sprite: 'taisei:item:point', size: 20, color: 0x4a7fc0, power: 0, score: 100, lives: 0, bombs: 0 },
  life: { sprite: 'taisei:item:life', size: 26, color: 0xe060a8, power: 0, score: 0, lives: 1, bombs: 0 },
  bomb: { sprite: 'taisei:item:bomb', size: 28, color: 0x40b070, power: 0, score: 0, lives: 0, bombs: 1 },
  fullpower: {
    sprite: 'taisei:item:voltage',
    size: 26,
    color: 0x9050c0,
    power: 0,
    fillsPower: true,
    score: 0,
    lives: 0,
    bombs: 0,
  },
  surge: { sprite: 'taisei:item:surge', size: 22, color: 0xffd870, power: 2, score: 50, lives: 0, bombs: 0 },
};

/**
 * Downward acceleration and air drag, tuned so a drop hops briefly and settles
 * into a loose pile rather than floating back up the screen.
 */
export const ITEM_GRAVITY = 0.08;
export const ITEM_DRAG = 0.955;
export const ITEM_MAX_FALL = 2.2;
/** Strongest upward pop an item may leave a kill with. */
export const ITEM_MAX_RISE = 2.6;
/** Radius within which items curve toward the player. */
export const ITEM_MAGNET_RADIUS = 92;
/** Above this line the player attracts every item on screen, as in TH08. */
export const ITEM_CAPTURE_LINE = 128;
/** Items drift off-screen below this much grace past the playfield bottom. */
export const ITEM_DEEP_CULL = 48;

export interface ItemConfig {
  kind?: ItemKind;
  radius?: number;
}

/**
 * A collectible drop. Items arc outward from the dying enemy, drag back to a
 * gentle fall, and home in on the player once they are close or the player has
 * crossed the capture line.
 */
export class Item extends Entity {
  public kind: ItemKind;
  public spec: ItemSpec;
  public alpha = 1;
  /** Accumulated flight time, used for the spawn pop-in. */
  public timer = 0;
  /** True once the item is being pulled toward the player. */
  public magnetized = false;

  constructor(position: Partial<Vector2> = {}, velocity: Partial<Vector2> = {}, config: ItemConfig = {}) {
    const kind = config.kind ?? 'powerSmall';
    const spec = ITEM_SPECS[kind];
    super(position, velocity, { radius: config.radius ?? spec.size / 2 }, 'item');
    this.kind = kind;
    this.spec = spec;
  }

  /** Re-arm a pooled item at a new spawn position. */
  reset(x: number, y: number, kind: ItemKind = this.kind): void {
    this.kind = kind;
    this.spec = ITEM_SPECS[kind];
    this.hitbox.radius = this.spec.size / 2;
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.alpha = 1;
    this.timer = 0;
    this.magnetized = false;
    this.isAlive = true;
  }

  override update(dt: number): void {
    if (!this.isAlive) return;
    this.timer += dt;
    this.velocity.y = Math.min(ITEM_MAX_FALL, this.velocity.y + ITEM_GRAVITY * dt);
    this.velocity.x *= Math.pow(ITEM_DRAG, dt);
    super.update(dt);
  }

  /** Curve the item toward `target`, ramping up speed the closer it gets. */
  attract(target: Vector2, dt: number, strength = 1): void {
    this.magnetized = true;
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const accel = 0.34 * strength * dt;
    this.velocity.x += (dx / dist) * accel;
    this.velocity.y += (dy / dist) * accel;
    // Cap the homing speed so items read as gliding, not snapping.
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    const max = 9;
    if (speed > max) {
      this.velocity.x = (this.velocity.x / speed) * max;
      this.velocity.y = (this.velocity.y / speed) * max;
    }
  }
}
