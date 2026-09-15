import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';
import { Bullet } from '../../engine/core/Bullet';
import { BulletPattern, BulletFactory } from '../bullet-patterns/BulletPattern';
import { DropTier } from '../item/ItemSystem';

export interface EnemyMovementWayPoint {
  time: number;
  velocity: Vector2;
}

export interface EnemyConfig {
  hp?: number;
  scoreValue?: number;
  radius?: number;
  color?: number;
  dropItems?: boolean;
  shootInterval?: number;
  shootPattern?: BulletPattern;
  movementWayPoints?: EnemyMovementWayPoint[];
  bulletFactory?: BulletFactory;
  /** Texture lookup name, e.g. "fairy" -> enemy:fairy. */
  spriteKey?: string;
  /** Drop generosity; defaults from HP when unset. */
  dropTier?: DropTier;
}

export class Enemy extends Entity {
  public hp: number;
  public maxHp: number;
  public scoreValue: number;
  public color: number;
  public shootInterval: number;
  public shootPattern?: BulletPattern;
  public timer = 0;
  public waypoints: EnemyMovementWayPoint[] = [];
  /** Art key resolved by the renderer; defaults to the palette-derived kind. */
  public spriteKey?: string;
  /** Drop tier used when this enemy dies; see `dropTierFor`. */
  public dropTier?: DropTier;
  public alpha = 1;
  /**
   * Extra magnification the renderer applies on top of the art's native size.
   * TH08 keeps this on the enemy's ANM script, which scales sprites in on
   * entry and out on death; 1 leaves the original cell untouched.
   */
  public drawScale = 1;

  constructor(position: Partial<Vector2> = {}, velocity: Partial<Vector2> = {}, config: EnemyConfig = {}) {
    super(position, velocity, { radius: config.radius ?? 14 }, 'enemy');
    this.hp = config.hp ?? 30;
    this.maxHp = this.hp;
    this.scoreValue = config.scoreValue ?? 1000;
    this.color = config.color ?? 0x44aaff;
    this.shootInterval = config.shootInterval ?? 0;
    this.shootPattern = config.shootPattern;
    if (this.shootPattern && config.bulletFactory) {
      this.shootPattern = this.shootPattern.withFactory(config.bulletFactory);
    }
    this.waypoints = config.movementWayPoints ?? [];
    this.spriteKey = config.spriteKey;
    this.dropTier = config.dropTier;
  }

  /**
   * Tier of loot this enemy yields. Explicit config wins; otherwise a tough
   * enemy is treated as an elite and drops the large power item.
   */
  dropTierFor(): DropTier {
    return this.dropTier ?? (this.maxHp > 100 ? 'elite' : 'fairy');
  }

  takeDamage(amount: number): boolean {
    if (!this.isAlive) return false;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.destroy();
      this.emit('killed', this);
      return true;
    }
    return false;
  }

  override update(dt: number): void {
    super.update(dt);
    this.timer += dt;

    // Apply waypoints
    for (const wp of this.waypoints) {
      if (Math.abs(this.timer - wp.time) < dt) {
        this.velocity.x = wp.velocity.x;
        this.velocity.y = wp.velocity.y;
      }
    }
  }

  updateAI(_dt: number, player?: Entity): Bullet[] {
    if (!this.isAlive || this.shootInterval <= 0 || !this.shootPattern) return [];

    if (Math.floor(this.timer) % this.shootInterval === 0) {
      return this.shootPattern.spawn(this, this.timer, player);
    }
    return [];
  }
}
