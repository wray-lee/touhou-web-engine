import { BulletPattern, BulletFactory } from './BulletPattern';
import { Entity } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';

export class CompositePattern extends BulletPattern {
  constructor(public patterns: BulletPattern[]) {
    super();
  }

  /** Propagate the factory to every child pattern so composite bullets pool too. */
  override withFactory(factory: BulletFactory): this {
    super.withFactory(factory);
    for (const pattern of this.patterns) {
      pattern.withFactory(factory);
    }
    return this;
  }

  spawn(emitter: Entity, time: number, player?: Entity): Bullet[] {
    const bullets: Bullet[] = [];
    for (const pattern of this.patterns) {
      bullets.push(...pattern.spawn(emitter, time, player));
    }
    return bullets;
  }
}
