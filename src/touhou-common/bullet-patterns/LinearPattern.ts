import { BulletPattern, spawnSpread } from './BulletPattern';
import { Entity } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';
import { EntityTag } from '../../engine/core/Entity';

export interface LinearPatternConfig {
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

export class LinearPattern extends BulletPattern {
  constructor(public config: LinearPatternConfig) {
    super();
  }

  spawn(emitter: Entity, _time: number, _player?: Entity): Bullet[] {
    const {
      count,
      speed,
      baseAngle,
      spreadAngle = 0,
      radius = 4,
      color = 0x3388ff,
      tag = 'enemy-bullet',
      sprite,
    } = this.config;
    return spawnSpread(this.factory, emitter, {
      count,
      speed,
      baseAngle,
      spreadAngle,
      radius,
      color,
      tag,
      sprite,
    });
  }
}
