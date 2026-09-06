import { BulletPattern } from './BulletPattern';
import { Entity } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';

export interface LinearPatternConfig {
  count: number;
  speed: number;
  baseAngle: number;
  spreadAngle?: number;
  radius?: number;
  color?: number;
  tag?: string;
}

export class LinearPattern extends BulletPattern {
  constructor(public config: LinearPatternConfig) {
    super();
  }

  spawn(emitter: Entity, _time: number, _player?: Entity): Bullet[] {
    const { count, speed, baseAngle, spreadAngle = 0, radius = 4, color = 0x3388ff, tag = 'enemy-bullet' } = this.config;
    const bullets: Bullet[] = [];

    const startAngle = count > 1 ? baseAngle - (spreadAngle * (count - 1)) / 2 : baseAngle;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + spreadAngle * i;
      bullets.push(
        new Bullet({
          position: { x: emitter.position.x, y: emitter.position.y },
          velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          radius,
          color,
          tag,
        })
      );
    }

    return bullets;
  }
}
