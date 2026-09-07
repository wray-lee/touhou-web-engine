import { Vector2, createVector2, distanceBetween, angleBetween } from './Vector2';
import { EventEmitter } from './EventEmitter';

export interface Hitbox {
  radius: number;
  offset?: Vector2;
}

/** Discriminates entity kinds for collision & rendering logic. */
export type EntityTag = 'default' | 'player' | 'enemy' | 'boss' | 'player-bullet' | 'enemy-bullet';

/** Live motion state of an entity; `position`/`velocity` alias the entity's own vectors. */
export interface Transform {
  position: Vector2;
  velocity: Vector2;
  rotation: number;
}

/** Typed events emitted by Entity and its subclasses; unknown names stay allowed. */
export interface EntityEvents {
  destroy: void;
  collided: { other: Entity };
  [event: string]: any;
}

export class Entity extends EventEmitter<EntityEvents> {
  public id: string;
  public position: Vector2;
  public velocity: Vector2;
  public hitbox: Hitbox;
  public isAlive: boolean;
  public tag: EntityTag;

  private readonly _transform: Transform;
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
    this._transform = { position: this.position, velocity: this.velocity, rotation: 0 };
    this.hitbox = {
      radius: hitbox.radius ?? 0,
      offset: hitbox.offset ?? { x: 0, y: 0 },
    };
    this.isAlive = true;
    this.tag = tag;
  }

  /** Shared Transform view; `rotation` reads/writes through to keep both sides live. */
  get transform(): Transform {
    return this._transform;
  }

  get rotation(): number {
    return this._transform.rotation;
  }

  set rotation(value: number) {
    this._transform.rotation = value;
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
