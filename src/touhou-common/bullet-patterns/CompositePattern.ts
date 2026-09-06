import { BulletPattern } from './BulletPattern';
import { Entity } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';

export class CompositePattern extends BulletPattern {
  constructor(public patterns: BulletPattern[]) {
    super();
  }

  spawn(emitter: Entity, time: number, player?: Entity): Bullet[] {
    const bullets: Bullet[] = [];
    for (const pattern of this.patterns) {
      bullets.push(...pattern.spawn(emitter, time, player));
    }
    return bullets;
  }
}
