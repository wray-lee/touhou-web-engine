import { BulletPattern } from './BulletPattern';
import { Entity, EntityTag } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';

export interface CircularPatternConfig {
  count: number;
  speed: number;
  angleOffset?: number;
  radius?: number;
  color?: number;
  angularVelocity?: number;
  acceleration?: number;
  tag?: EntityTag;
}

export class CircularPattern extends BulletPattern {
  constructor(public config: CircularPatternConfig) {
    super();
  }

  spawn(emitter: Entity, _time: number, _player?: Entity): Bullet[] {
    const { count, speed, angleOffset = 0, radius = 4, color = 0xff3344, angularVelocity = 0, acceleration = 0, tag = 'enemy-bullet' } = this.config;
    const bullets: Bullet[] = [];
    const step = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const angle = step * i + angleOffset;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      bullets.push(
        new Bullet({
          position: { x: emitter.position.x, y: emitter.position.y },
          velocity: { x: vx, y: vy },
          radius,
          color,
          angularVelocity,
          acceleration,
          tag,
        })
      );
    }

    return bullets;
  }
}
