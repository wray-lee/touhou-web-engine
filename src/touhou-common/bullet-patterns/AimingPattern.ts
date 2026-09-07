import { BulletPattern, spawnSpread } from './BulletPattern';
import { Entity } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';
import { EntityTag } from '../../engine/core/Entity';

export interface AimingPatternConfig {
  count?: number;
  speed: number;
  spreadAngle?: number;
  radius?: number;
  color?: number;
  tag?: EntityTag;
  /** Sprite key resolved by the renderer's SpriteManager. */
  sprite?: string;
}

/** Self-aiming spread — targets the player, then delegates to the shared spread generator. */
export class AimingPattern extends BulletPattern {
  constructor(public config: AimingPatternConfig) {
    super();
  }

  spawn(emitter: Entity, _time: number, player?: Entity): Bullet[] {
    const { count = 1, speed, spreadAngle = 0.2, radius = 4, color = 0xee44aa, tag = 'enemy-bullet', sprite } = this.config;
    const targetAngle = player ? emitter.angleTo(player) : Math.PI / 2;
    return spawnSpread(this.factory, emitter, { count, speed, baseAngle: targetAngle, spreadAngle, radius, color, tag, sprite });
  }
}
