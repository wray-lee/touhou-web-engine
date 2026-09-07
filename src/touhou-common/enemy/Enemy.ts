import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';
import { Bullet } from '../../engine/core/Bullet';
import { BulletPattern, BulletFactory } from '../bullet-patterns/BulletPattern';

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
