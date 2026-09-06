import { Entity } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';

export abstract class BulletPattern {
  abstract spawn(emitter: Entity, time: number, player?: Entity): Bullet[];
}
