import { Entity, EntityTag } from '../../engine/core/Entity';
import { Bullet, BulletConfig } from '../../engine/core/Bullet';

/** Bullet creation hook — lets the game route bullets through its object pool. */
export type BulletFactory = (config: BulletConfig) => Bullet;

export abstract class BulletPattern {
  protected factory: BulletFactory = (config) => new Bullet(config);

  /** Override how spawned bullets are created (used for object pooling). */
  withFactory(factory: BulletFactory): this {
    this.factory = factory;
    return this;
  }

  abstract spawn(emitter: Entity, time: number, player?: Entity): Bullet[];
}

export interface SpreadBulletConfig {
  count: number;
  speed: number;
  baseAngle: number;
  spreadAngle?: number;
  radius?: number;
  color?: number;
  tag?: EntityTag;
  /** Sprite key resolved by the renderer's SpriteManager. */
  sprite?: string;
}

/** Shared fan/spread bullet generator used by Linear & Aiming patterns. */
export function spawnSpread(
  factory: BulletFactory,
  emitter: Entity,
  config: SpreadBulletConfig
): Bullet[] {
  const {
    count,
    speed,
    baseAngle,
    spreadAngle = 0,
    radius = 4,
    color = 0x3388ff,
    tag = 'enemy-bullet',
    sprite,
  } = config;
  const bullets: Bullet[] = [];
  const startAngle = count > 1 ? baseAngle - (spreadAngle * (count - 1)) / 2 : baseAngle;

  for (let i = 0; i < count; i++) {
    const angle = startAngle + spreadAngle * i;
    bullets.push(
      factory({
        position: { x: emitter.position.x, y: emitter.position.y },
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        radius,
        color,
        tag,
        sprite,
      })
    );
  }

  return bullets;
}
