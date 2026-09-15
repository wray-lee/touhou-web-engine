/**
 * Lasers, ported from `BulletManager::SpawnLaserPattern` (`BulletManager.cpp:711`)
 * and the laser half of the bullet update loop (`BulletManager.cpp:1038-1153`).
 *
 * A laser is not a moving object: it is a segment pinned to its spawn point that
 * grows along its own heading. Two scalars describe it — `tail` and `head`, both
 * measured along the beam from the spawn point — and every frame `head` advances
 * by `speed` while `tail` is dragged behind so the visible span never exceeds
 * `startLength`. `startOffset`/`endOffset` at spawn time are the initial
 * `tail`/`head`, which is how the scripts get both instant beams (`head` already
 * at 640, `speed` 0) and slow-growing ones (`tail` = `head` = 0, `speed` > 0)
 * from the same opcode.
 *
 * Three phases run off one frame counter: 0 grows the width in, 1 holds, 2 shrinks
 * it out. `transformFlags & 1` swaps the width ramp for an alpha ramp instead.
 */

/** Laser slots are a fixed pool, exactly like retail's 0x100. */
export const MAX_LASERS = 256;

/** `descriptor->transformFlags` bit 0: fade with alpha rather than ramping width. */
export const LASER_FLAG_ALPHA_FADE = 1;

/** A laser whose tail passes this has left the field for good. */
const LASER_DESPAWN_TAIL = 640;

export interface Laser {
  active: boolean;
  /** World anchor the beam is pinned to (`laser + 0x548`/`0x54C`). */
  x: number;
  y: number;
  /** Beam heading; the hitbox frame is the world rotated by this about `x,y`. */
  angle: number;
  /** Near end of the beam, measured along `angle` from the anchor. */
  tail: number;
  /** Far end of the beam, advanced by `speed` each frame. */
  head: number;
  /** Longest span `head - tail` may reach. */
  startLength: number;
  /** Full beam width in pixels. */
  width: number;
  /** Width the body is actually drawn at during the ramp phases. */
  currentWidth: number;
  /** Pixels the head advances per frame. */
  speed: number;
  /** Frames the grow phase lasts; 0 skips it entirely. */
  startTime: number;
  /** Frames counted before the beam starts hurting. */
  hitboxStartTime: number;
  /** Frames the beam holds at full width. */
  duration: number;
  /** Frames the beam takes to shrink out; 0 deletes it at the end of `duration`. */
  despawnDuration: number;
  /** Frames past the end of `duration` that the beam still hurts. */
  hitboxEndDelay: number;
  /** Frames since the current phase began. */
  timer: number;
  /** 0 = growing, 1 = holding, 2 = shrinking. */
  state: number;
  /** `descriptor->transformFlags`. */
  flags: number;
  /** Etama colour index. */
  color: number;
  /** ECL laser type; picks the body ANM script (`type + 10`). */
  bulletType: number;
  /** Body alpha from the `transformFlags & 1` ramp, 0..1. */
  alpha: number;
  /**
   * Hitbox centre in beam space: how far along the beam from the anchor, then the
   * lateral offset. Retail keeps it in the frame the world is rotated into
   * (`laserCenter`), where the anchor itself is the origin, so the lateral half is
   * always 0 and only the along-beam term carries information.
   */
  centerX: number;
  centerY: number;
  /**
   * Full hitbox extents in beam space. `CalcLaserHitbox` tests against
   * `centre ± size/2`, so these are diameters, not half-extents: the lateral one is
   * `width / 2`, half the drawn beam, which is what makes EoSD lasers forgiving.
   */
  sizeX: number;
  sizeY: number;
  /** Lethal this frame; the graze pulse is `timer % 20 == 0`, per retail. */
  lethal: boolean;
  graze: boolean;
}

function createLaser(): Laser {
  return {
    active: false,
    x: 0,
    y: 0,
    angle: 0,
    tail: 0,
    head: 0,
    startLength: 0,
    width: 0,
    currentWidth: 0,
    speed: 0,
    startTime: 0,
    hitboxStartTime: 0,
    duration: 0,
    despawnDuration: 0,
    hitboxEndDelay: 0,
    timer: 0,
    state: 1,
    flags: 0,
    color: 0,
    bulletType: 0,
    alpha: 1,
    centerX: 0,
    centerY: 0,
    sizeX: 0,
    sizeY: 0,
    lethal: false,
    graze: false,
  };
}

export interface LaserSpawnArgs {
  x: number;
  y: number;
  angle: number;
  tail: number;
  head: number;
  startLength: number;
  width: number;
  speed: number;
  startTime: number;
  hitboxStartTime: number;
  duration: number;
  despawnDuration: number;
  hitboxEndDelay: number;
  flags: number;
  color: number;
  bulletType: number;
}

export class LaserPool {
  readonly lasers: Laser[];

  constructor() {
    this.lasers = Array.from({ length: MAX_LASERS }, createLaser);
  }

  /**
   * `SpawnLaserPattern`: take the first free slot and copy the descriptor in.
   * A `startTime` of 0 opens straight in the holding phase.
   */
  spawn(args: LaserSpawnArgs): Laser | null {
    const laser = this.lasers.find((l) => !l.active);
    if (!laser) return null;
    laser.active = true;
    laser.x = args.x;
    laser.y = args.y;
    laser.angle = args.angle;
    laser.tail = args.tail;
    laser.head = args.head;
    laser.startLength = args.startLength;
    laser.width = args.width;
    laser.currentWidth = args.width;
    laser.speed = args.speed;
    laser.startTime = args.startTime | 0;
    laser.hitboxStartTime = args.hitboxStartTime | 0;
    laser.duration = args.duration | 0;
    laser.despawnDuration = args.despawnDuration | 0;
    laser.hitboxEndDelay = args.hitboxEndDelay | 0;
    laser.flags = args.flags >>> 0;
    laser.color = args.color;
    laser.bulletType = args.bulletType;
    laser.timer = 0;
    laser.state = laser.startTime === 0 ? 1 : 0;
    laser.alpha = 1;
    laser.lethal = false;
    laser.graze = false;
    return laser;
  }

  /**
   * Advance every live beam by one frame and republish its hitbox.
   *
   * `frozen` is Sakuya's stopped clock: the scripts keep their own time, so the
   * beams hold their geometry the same way enemy bullets hold their position.
   */
  tick(frozen = false): void {
    for (const laser of this.lasers) {
      if (!laser.active) continue;
      if (frozen) {
        laser.lethal = false;
        laser.graze = false;
        continue;
      }
      this.stepLaser(laser);
    }
  }

  /** The body of `BulletManager.cpp:1043-1152`, one beam at a time. */
  private stepLaser(laser: Laser): void {
    laser.head += laser.speed;
    if (laser.head - laser.tail > laser.startLength) {
      laser.tail = laser.head - laser.startLength;
    }
    if (laser.tail < 0) laser.tail = 0;

    const span = laser.head - laser.tail;
    laser.sizeY = laser.width / 2;
    // Once the tail has lifted off the anchor the hitbox is 30% shorter than the
    // physics span, which is what makes a sweeping laser read as a trail.
    laser.sizeX = laser.tail <= 0 ? span : span * 0.7;
    laser.centerX = span / 2 + laser.tail;
    laser.centerY = 0;
    laser.lethal = false;
    laser.graze = false;

    // The phase switch is a fall-through chain: a beam whose grow phase ends on
    // this frame also runs the hold phase, and one whose hold phase ends also
    // runs the shrink phase, all in the same tick.
    if (laser.state === 0) {
      if ((laser.flags & LASER_FLAG_ALPHA_FADE) !== 0) {
        laser.alpha = Math.min(1, (laser.timer * 255) / Math.max(1, laser.startTime) / 255);
      } else {
        const rampWindow = Math.min(laser.startTime, 30);
        laser.currentWidth =
          laser.startTime - rampWindow < laser.timer
            ? (laser.timer * laser.width) / Math.max(1, laser.startTime)
            : 1.2;
        laser.sizeX = laser.currentWidth / 2;
      }
      if (laser.timer >= laser.hitboxStartTime) laser.lethal = true;
      if (laser.timer < laser.startTime) {
        this.finishFrame(laser);
        return;
      }
      laser.timer = 0;
      laser.state = 1;
      laser.currentWidth = laser.width;
    }

    if (laser.state === 1) {
      laser.lethal = true;
      laser.graze = laser.timer % 20 === 0;
      if (laser.timer < laser.duration) {
        this.finishFrame(laser);
        return;
      }
      laser.timer = 0;
      laser.state = 2;
      if (laser.despawnDuration === 0) {
        laser.active = false;
        return;
      }
    }

    if ((laser.flags & LASER_FLAG_ALPHA_FADE) !== 0) {
      laser.alpha = Math.min(1, (laser.timer * 255) / Math.max(1, laser.startTime) / 255);
    } else if (laser.despawnDuration > 0) {
      laser.currentWidth = laser.width - (laser.timer * laser.width) / laser.despawnDuration;
      laser.sizeX = laser.currentWidth / 2;
    }
    laser.lethal = laser.timer < laser.hitboxEndDelay;
    if (laser.timer < laser.despawnDuration) {
      this.finishFrame(laser);
      return;
    }
    laser.active = false;
  }

  /**
   * Tail culling and the phase clock, which retail only reaches for beams that
   * stayed alive through the switch.
   */
  private finishFrame(laser: Laser): void {
    if (laser.tail >= LASER_DESPAWN_TAIL) {
      laser.active = false;
      return;
    }
    laser.timer++;
  }

  /** Live beams, for the renderer and the collision pass. */
  getActive(): Laser[] {
    return this.lasers.filter((l) => l.active);
  }

  get activeCount(): number {
    let n = 0;
    for (const l of this.lasers) if (l.active) n++;
    return n;
  }

  /** Every beam off the field — the stage-clear and death resets. */
  clearAll(): number {
    let n = 0;
    for (const l of this.lasers) {
      if (!l.active) continue;
      l.active = false;
      n++;
    }
    return n;
  }
}
