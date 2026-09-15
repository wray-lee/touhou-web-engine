import { BulletPattern } from './BulletPattern';
import { Entity, EntityTag } from '../../engine/core/Entity';
import { Bullet } from '../../engine/core/Bullet';

export type LaserMode = 'beam' | 'sweep' | 'wall';

export interface LaserPatternConfig {
  /** Direction the beam points in, radians (0 = right, PI/2 = down). */
  baseAngle: number;
  /** Beam behaviour. */
  mode?: LaserMode;
  /** Beam length in pixels. */
  length?: number;
  /** Half-thickness of the beam in pixels — also each segment's hitbox radius. */
  radius?: number;
  /** Distance between consecutive segments along the beam. */
  segmentGap?: number;
  /** Number of beams for 'wall' mode. */
  count?: number;
  /** Perpendicular spacing between 'wall' beams. */
  gap?: number;
  /** Rotation per frame for 'sweep' mode, radians/frame. */
  sweepSpeed?: number;
  /** Number of rotating arms for 'sweep' mode, evenly spaced around the emitter. */
  arms?: number;
  /** Frames for the beam to reach full length. */
  growFrames?: number;
  /** Frames the beam stays fully extended. */
  holdFrames?: number;
  /** Frames for the beam to retract back to the emitter. */
  shrinkFrames?: number;
  /** How long each emitted slice survives in 'sweep' mode. */
  tailFrames?: number;
  /** Damage per segment while the beam is live. */
  damage?: number;
  color?: number;
  sprite?: string;
  tag?: EntityTag;
}
/**
 * Danmaku lasers, expressed as a chain of ordinary bullets.
 *
 * Modelling the beam as overlapping segments keeps it inside the existing
 * circle-collision and sprite pipeline, so lasers graze, cancel and render
 * exactly like everything else. Each segment carries a maxLifetime derived from
 * its distance along the beam, which lets a straight beam grow out of the
 * emitter, hold, and then retract tip-first without any per-entity bookkeeping.
 */
export class LaserPattern extends BulletPattern {
  /** Frames this pattern has been asked to fire; drives growth and sweep. */
  private age = 0;

  constructor(public config: LaserPatternConfig) {
    super();
  }

  /** Rewind the growth/sweep clock (used when a spell card restarts). */
  reset(): void {
    this.age = 0;
  }

  /** Total frames one full beam cycle occupies. */
  get cycleFrames(): number {
    const c = this.config;
    return (c.growFrames ?? 12) + (c.holdFrames ?? 24) + (c.shrinkFrames ?? 10);
  }

  /** Frames elapsed since construction — exposed so tests and bosses can sync. */
  get frame(): number {
    return this.age;
  }

  spawn(emitter: Entity, _time: number, _player?: Entity): Bullet[] {
    const c = this.config;
    const mode = c.mode ?? 'beam';
    const gap = c.segmentGap ?? Math.max(4, (c.radius ?? 6) * 1.1);
    const length = c.length ?? 640;
    const radius = c.radius ?? 6;
    const grow = Math.max(1, c.growFrames ?? 12);
    const hold = c.holdFrames ?? 24;
    const shrink = Math.max(0, c.shrinkFrames ?? 10);
    const cycle = grow + hold + shrink;
    // Modulo the cycle so a beam keeps extending, holding and retracting while a boss
    // keeps firing it, instead of going silent after one pass.
    const frame = this.age % cycle;
    this.age += 1;

    const bullets: Bullet[] = [];
    const beams = mode === 'wall' ? Math.max(1, c.count ?? 4) : 1;
    const wallGap = c.gap ?? 40;

    if (mode === 'sweep') {
      // Each frame re-lays the whole arm and lets the previous frames expire,
      // so the arm sweeps as a solid, continuously lethal line rather than a
      // dotted trail of tips.
      const life = c.tailFrames ?? 6;
      const arms = Math.max(1, Math.round(c.arms ?? 1));
      const spin = c.sweepSpeed ?? 0.02;
      for (let a = 0; a < arms; a++) {
        const angle = c.baseAngle + frame * spin + (a * Math.PI * 2) / arms;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        for (let d = gap * 0.5; d < length; d += gap) {
          bullets.push(this.segment(emitter, cos * d, sin * d, radius, life, c, angle));
        }
      }
      return bullets;
    }

    if (frame >= grow) return bullets;
    const from = frame * (length / grow);
    const to = (frame + 1) * (length / grow);
    for (let b = 0; b < beams; b++) {
      const angle = c.baseAngle;
      const offset = (b - (beams - 1) / 2) * wallGap;
      const px = -Math.sin(angle) * offset;
      const py = Math.cos(angle) * offset;
      for (let d = from; d < to; d += gap) {
        // The retract front reaches distance d at grow+hold+shrink*(1-d/length).
        const life = cycle - (grow * d) / length - shrink * (d / length);
        bullets.push(
          this.segment(emitter, px + Math.cos(angle) * d, py + Math.sin(angle) * d, radius, life, c, angle),
        );
      }
    }
    return bullets;
  }

  private segment(
    emitter: Entity,
    dx: number,
    dy: number,
    radius: number,
    maxLifetime: number,
    c: LaserPatternConfig,
    angle: number,
  ): Bullet {
    return this.factory({
      position: { x: emitter.position.x + dx, y: emitter.position.y + dy },
      velocity: { x: 0, y: 0 },
      // Segments sit still, so the renderer needs the beam direction explicitly.
      heading: angle,
      radius,
      color: c.color ?? 0xff55aa,
      sprite: c.sprite ?? 'bullet_laser',
      tag: c.tag ?? 'enemy-bullet',
      damage: c.damage ?? 2,
      maxLifetime: Math.max(1, Math.round(maxLifetime)),
    });
  }
}
