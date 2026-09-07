import { Vector2, createVector2, distanceBetween, angleBetween } from './Vector2';
import { EventEmitter } from './EventEmitter';

export interface Hitbox {
  radius: number;
  offset?: Vector2;
}

/** Discriminates entity kinds for collision & rendering logic. */
export type EntityTag = 'default' | 'player' | 'enemy' | 'boss' | 'player-bullet' | 'enemy-bullet';

export class Entity extends EventEmitter {
  public id: string;
  public position: Vector2;
  public velocity: Vector2;
  public rotation: number;
  public hitbox: Hitbox;
  public isAlive: boolean;
  public tag: EntityTag;

  private static nextId = 1;

  constructor(
    position: Partial<Vector2> = {},
    velocity: Partial<Vector2> = {},
    hitbox: Partial<Hitbox> = {},
    tag: EntityTag = 'default',
  ) {
    super();
    this.id = `entity_${Entity.nextId++}`;
    this.position = createVector2(position.x ?? 0, position.y ?? 0);
    this.velocity = createVector2(velocity.x ?? 0, velocity.y ?? 0);
    this.rotation = 0;
    this.hitbox = {
      radius: hitbox.radius ?? 0,
      offset: hitbox.offset ?? { x: 0, y: 0 },
    };
    this.isAlive = true;
    this.tag = tag;
  }

  update(dt: number): void {
    if (!this.isAlive) return;
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }

  destroy(): void {
    if (!this.isAlive) return;
    this.isAlive = false;
    this.emit('destroy', this);
    this.removeAllListeners();
  }

  distanceTo(other: Entity): number {
    return distanceBetween(this.position, other.position);
  }

  angleTo(other: Entity): number {
    return angleBetween(this.position, other.position);
  }

  getHitboxCenter(): Vector2 {
    const offset = this.hitbox.offset || { x: 0, y: 0 };
    return {
      x: this.position.x + offset.x,
      y: this.position.y + offset.y,
    };
  }
}
