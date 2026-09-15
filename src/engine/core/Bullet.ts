import { Entity, EntityTag } from './Entity';
import { Vector2 } from './Vector2';

export interface BulletConfig {
  position?: Partial<Vector2>;
  velocity?: Partial<Vector2>;
  radius?: number;
  color?: number;
  sprite?: string;
  damage?: number;
  grazed?: boolean;
  angularVelocity?: number;
  acceleration?: number;
  /** Per-frame change of angularVelocity (th08 v.wa, deg/frame^2 -> rad/frame^2). */
  angularAcceleration?: number;
  /** Per-frame change of angularAcceleration (th08 v.waa). */
  angularJerk?: number;
  /** Per-frame change of acceleration (th08 v.raa) — the radial jerk term. */
  jerk?: number;
  /**
   * Travel direction in radians. Only needed when velocity is (0,0) at spawn —
   * th08 bullets with r:0 + positive ra accelerate *from rest* along theta.
   */
  heading?: number;
  /**
   * Homing turn cap in radians/frame (0 = flies straight). While the homing window
   * lasts the BulletSystem rotates heading toward the aim target by at most this
   * much per frame, which is how th08 player homing shots curve without ever
   * curling back into a circle around the shooter.
   */
  homingTurn?: number;
  /** Game frames the homing turn stays active; after that the shot flies straight. */
  homingFrames?: number;
  /**
   * Total radians a homing shot may deviate from the heading it launched on
   * (0 = uncapped). Without a cap a long homing window lets a shot finish a full
   * circle and come back at the shooter, which is the orbiting-player-shot bug.
   */
  homingMaxTurn?: number;
  /** Visual-only sprite spin in radians/frame. Never touches the trajectory. */
  spin?: number;
  /** Lower speed clamp in px/frame (th08 v.rrange.min); never slows past it. */
  speedMin?: number;
  /** Upper speed clamp in px/frame (th08 v.rrange.max); never ramps past it. */
  speedMax?: number;
  /** Lower angular velocity clamp in rad/frame (th08 v.wrange.min). */
  angularVelocityMin?: number;
  /** Upper angular velocity clamp in rad/frame (th08 v.wrange.max). */
  angularVelocityMax?: number;
  /** Lower radial acceleration clamp in px/frame² (th08 v.rarange.min). */
  accelerationMin?: number;
  /** Upper radial acceleration clamp in px/frame² (th08 v.rarange.max). */
  accelerationMax?: number;
  /** Lower angular acceleration clamp in rad/frame² (th08 v.warange.min). */
  angularAccelerationMin?: number;
  /** Upper angular acceleration clamp in rad/frame² (th08 v.warange.max). */
  angularAccelerationMax?: number;
  /** Lower heading bound in radians (th08 v.trange.min). */
  headingMin?: number;
  /** Upper heading bound in radians (th08 v.trange.max). */
  headingMax?: number;
  /** Frames a bullet stays alive even when it never leaves the playfield (lasers, timed orbs). */
  maxLifetime?: number;
  /** See Bullet.drawRadius. 0 keeps the legacy hit-radius-proportional sizing. */
  drawRadius?: number;
  tag?: EntityTag;
}

/** Default cap for the shared bullet free-list (0 = unlimited). */
export const DEFAULT_BULLET_POOL_CAP = 512;

/** Module-level shared free-list backing obtainBullet()/releaseBullet(). */
const bulletFreeList: Bullet[] = [];

/**
 * Take a Bullet from the shared pool (or allocate one) and arm it with `config`.
 * Prefer this over `new Bullet()` for anything spawned per-frame; pair every
 * obtain with a releaseBullet() when the bullet dies.
 */
export function obtainBullet(config: BulletConfig = {}): Bullet {
  const reused = bulletFreeList.pop();
  if (reused) {
    reused.reset(config);
    return reused;
  }
  return new Bullet(config);
}

/**
 * Return a dead Bullet to the shared pool. Double-release safe (guarded by
 * `isPooled`); live bullets and instances above `cap` are dropped.
 */
export function releaseBullet(bullet: Bullet, cap: number = DEFAULT_BULLET_POOL_CAP): void {
  if (!(bullet instanceof Bullet) || bullet.isAlive || bullet.isPooled) return;
  if (cap > 0 && bulletFreeList.length >= cap) return;
  bullet.isPooled = true;
  bulletFreeList.push(bullet);
}

/** Number of bullets currently held in the shared pool (debug/metrics). */
export function getBulletPoolSize(): number {
  return bulletFreeList.length;
}

/** Empty the shared pool and hand back its contents (test isolation / teardown). */
export function drainBulletPool(): Bullet[] {
  return bulletFreeList.splice(0, bulletFreeList.length).map((b) => {
    b.isPooled = false;
    return b;
  });
}

export class Bullet extends Entity {
  public color: number;
  public sprite: string;
  public damage: number;
  public grazed: boolean;
  public angularVelocity: number;
  public acceleration: number;
  public angularAcceleration: number;
  public angularJerk: number;
  public jerk: number;
  /** Lower speed clamp (px/frame); 0 disables the floor. */
  public speedMin: number;
  /** Upper speed clamp (px/frame); Infinity disables the ceiling. */
  public speedMax: number;
  /** Lower angular velocity clamp (rad/frame); -Infinity disables it. */
  public angularVelocityMin: number;
  /** Upper angular velocity clamp (rad/frame); Infinity disables it. */
  public angularVelocityMax: number;
  /** Lower radial acceleration clamp (px/frame²); -Infinity disables it. */
  public accelerationMin: number;
  /** Upper radial acceleration clamp (px/frame²); Infinity disables it. */
  public accelerationMax: number;
  /** Lower angular acceleration clamp (rad/frame²); -Infinity disables it. */
  public angularAccelerationMin: number;
  /** Upper angular acceleration clamp (rad/frame²); Infinity disables it. */
  public angularAccelerationMax: number;
  /** Lower heading bound (rad); -Infinity disables it. */
  public headingMin: number;
  /** Upper heading bound (rad); Infinity disables it. */
  public headingMax: number;
  /** Authoritative travel direction (radians) — drives velocity even from rest. */
  public heading: number;
  /** See BulletConfig.homingTurn / homingFrames / spin. */
  public homingTurn: number;
  public homingFrames: number;
  public spin: number;
  /** Heading the shot launched along; homing is capped relative to this. */
  public launchHeading: number;
  /** See BulletConfig.homingMaxTurn. */
  public homingMaxTurn: number;
  /**
   * Half the width to paint the sprite at, in playfield pixels. 0 keeps the
   * legacy sizing that scales the texture from the hit radius; real .anm cells
   * are authored 1:1, so a game that ships them sets this to the cell size.
   */
  public drawRadius = 0;
  public lifetime = 0;
  /** See BulletConfig.maxLifetime. 0 disables the timer. */
  public maxLifetime = 0;
  /** True while this instance sits in the shared free-list awaiting reuse. */
  public isPooled = false;

  constructor(config: BulletConfig = {}) {
    super(config.position, config.velocity, { radius: config.radius ?? 4 }, config.tag ?? 'enemy-bullet');
    this.color = config.color ?? 0xff3366;
    this.sprite = config.sprite ?? 'bullet_small';
    this.damage = config.damage ?? 1;
    this.grazed = config.grazed ?? false;
    this.angularVelocity = config.angularVelocity ?? 0;
    this.acceleration = config.acceleration ?? 0;
    this.angularAcceleration = config.angularAcceleration ?? 0;
    this.angularJerk = config.angularJerk ?? 0;
    this.jerk = config.jerk ?? 0;
    this.speedMin = config.speedMin ?? 0;
    this.speedMax = config.speedMax ?? Number.POSITIVE_INFINITY;
    this.angularVelocityMin = config.angularVelocityMin ?? Number.NEGATIVE_INFINITY;
    this.angularVelocityMax = config.angularVelocityMax ?? Number.POSITIVE_INFINITY;
    this.accelerationMin = config.accelerationMin ?? Number.NEGATIVE_INFINITY;
    this.accelerationMax = config.accelerationMax ?? Number.POSITIVE_INFINITY;
    this.angularAccelerationMin = config.angularAccelerationMin ?? Number.NEGATIVE_INFINITY;
    this.angularAccelerationMax = config.angularAccelerationMax ?? Number.POSITIVE_INFINITY;
    this.headingMin = config.headingMin ?? Number.NEGATIVE_INFINITY;
    this.headingMax = config.headingMax ?? Number.POSITIVE_INFINITY;
    this.heading = resolveHeading(config);
    this.homingTurn = config.homingTurn ?? 0;
    this.homingFrames = config.homingFrames ?? 0;
    this.spin = config.spin ?? 0;
    this.launchHeading = this.heading;
    this.homingMaxTurn = config.homingMaxTurn ?? 0;
    this.maxLifetime = config.maxLifetime ?? 0;
  }

  /** Re-arm a pooled instance with fresh config so it can be reused. */
  reset(config: BulletConfig = {}): void {
    // Reuse the bullet's existing id; re-arm everything else
    this.isPooled = false;
    this.position.x = config.position?.x ?? 0;
    this.position.y = config.position?.y ?? 0;
    this.velocity.x = config.velocity?.x ?? 0;
    this.velocity.y = config.velocity?.y ?? 0;
    this.rotation = 0;
    this.hitbox.radius = config.radius ?? 4;
    this.hitbox.offset = { x: 0, y: 0 };
    this.isAlive = true;
    this.tag = config.tag ?? 'enemy-bullet';
    this.color = config.color ?? 0xff3366;
    this.sprite = config.sprite ?? 'bullet_small';
    this.damage = config.damage ?? 1;
    this.grazed = config.grazed ?? false;
    this.angularVelocity = config.angularVelocity ?? 0;
    this.acceleration = config.acceleration ?? 0;
    this.angularAcceleration = config.angularAcceleration ?? 0;
    this.angularJerk = config.angularJerk ?? 0;
    this.jerk = config.jerk ?? 0;
    this.speedMin = config.speedMin ?? 0;
    this.speedMax = config.speedMax ?? Number.POSITIVE_INFINITY;
    this.angularVelocityMin = config.angularVelocityMin ?? Number.NEGATIVE_INFINITY;
    this.angularVelocityMax = config.angularVelocityMax ?? Number.POSITIVE_INFINITY;
    this.accelerationMin = config.accelerationMin ?? Number.NEGATIVE_INFINITY;
    this.accelerationMax = config.accelerationMax ?? Number.POSITIVE_INFINITY;
    this.angularAccelerationMin = config.angularAccelerationMin ?? Number.NEGATIVE_INFINITY;
    this.angularAccelerationMax = config.angularAccelerationMax ?? Number.POSITIVE_INFINITY;
    this.headingMin = config.headingMin ?? Number.NEGATIVE_INFINITY;
    this.headingMax = config.headingMax ?? Number.POSITIVE_INFINITY;
    this.heading = resolveHeading(config);
    this.homingTurn = config.homingTurn ?? 0;
    this.homingFrames = config.homingFrames ?? 0;
    this.spin = config.spin ?? 0;
    this.launchHeading = this.heading;
    this.homingMaxTurn = config.homingMaxTurn ?? 0;
    this.drawRadius = config.drawRadius ?? 0;
    this.lifetime = 0;
    this.maxLifetime = config.maxLifetime ?? 0;
  }

  /** Point the bullet along an absolute heading, keeping velocity in sync. */
  setHeading(radians: number): void {
    this.heading = radians;
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    this.velocity.x = Math.cos(radians) * speed;
    this.velocity.y = Math.sin(radians) * speed;
  }

  /**
   * Rotate heading toward target by at most maxTurn radians, then resync velocity.
   * This is the bounded steering th08 homing shots use; unlike a raw angularVelocity
   * it can never curl a projectile back into a loop around its own origin.
   */
  turnToward(target: number, maxTurn: number): void {
    if (!(maxTurn > 0)) return;
    const delta = normalizeAngle(target - this.heading);
    this.setHeading(this.heading + Math.max(-maxTurn, Math.min(maxTurn, delta)));
  }

  /**
   * One bounded homing step. Steers toward `target` by at most `maxTurn`, but never
   * further than homingMaxTurn radians off the launch heading, and gives up once
   * the target sits behind the shot. Those two guards are what keep a homing charm
   * curving toward its mark instead of looping back over the shooter.
   */
  homeToward(target: number, maxTurn: number): boolean {
    if (!(maxTurn > 0)) return false;
    if (Math.cos(normalizeAngle(target - this.heading)) <= 0) return false;
    this.turnToward(target, maxTurn);
    if (this.homingMaxTurn > 0) {
      const dev = normalizeAngle(this.heading - this.launchHeading);
      const bound = Math.max(-this.homingMaxTurn, Math.min(this.homingMaxTurn, dev));
      if (bound !== dev) this.setHeading(this.launchHeading + bound);
    }
    return true;
  }

  /**
   * Polar integrator mirroring th08 MoveVector.runStep exactly:
   *
   *   theta += w;  r += ra;  w += wa;  ra += raa;  wa += waa;  (then clamp)
   *
   * heading/angularVelocity are the radian equivalents of theta/w, and
   * acceleration/jerk the equivalents of ra/raa. `velocity` is re-derived every
   * frame so consumers (BulletSystem culling, renderer rotation) stay in sync —
   * and so bullets that spawn at r:0 still accelerate along their theta.
   */
  override update(dt: number): void {
    if (!this.isAlive) return;

    const turning = this.angularVelocity !== 0 || this.angularAcceleration !== 0 || this.angularJerk !== 0;
    const ramping = this.acceleration !== 0 || this.jerk !== 0;
    const constrained =
      this.speedMin !== 0 ||
      this.speedMax !== Number.POSITIVE_INFINITY ||
      this.angularVelocityMin !== Number.NEGATIVE_INFINITY ||
      this.angularVelocityMax !== Number.POSITIVE_INFINITY ||
      this.accelerationMin !== Number.NEGATIVE_INFINITY ||
      this.accelerationMax !== Number.POSITIVE_INFINITY ||
      this.angularAccelerationMin !== Number.NEGATIVE_INFINITY ||
      this.angularAccelerationMax !== Number.POSITIVE_INFINITY ||
      this.headingMin !== Number.NEGATIVE_INFINITY ||
      this.headingMax !== Number.POSITIVE_INFINITY;

    if (turning || ramping || constrained) {
      let speed = Math.hypot(this.velocity.x, this.velocity.y);

      // 1. Integrate with the *current* rates (th08 applies before ramping).
      if (turning) this.heading += this.angularVelocity * dt;
      if (ramping) speed += this.acceleration * dt;

      // 2. Ramp the rates for the next frame.
      if (turning) this.angularVelocity += this.angularAcceleration * dt;
      if (ramping) this.acceleration += this.jerk * dt;
      if (turning) this.angularAcceleration += this.angularJerk * dt;

      // 3. Apply the trange / rrange windows.
      if (this.heading < this.headingMin) this.heading = this.headingMin;
      if (this.heading > this.headingMax) this.heading = this.headingMax;
      if (speed < this.speedMin) speed = this.speedMin;
      if (speed > this.speedMax) speed = this.speedMax;
      if (speed < 0) speed = 0;
      this.angularVelocity = clamp(this.angularVelocity, this.angularVelocityMin, this.angularVelocityMax);
      this.acceleration = clamp(this.acceleration, this.accelerationMin, this.accelerationMax);
      this.angularAcceleration = clamp(
        this.angularAcceleration,
        this.angularAccelerationMin,
        this.angularAccelerationMax,
      );

      this.velocity.x = Math.cos(this.heading) * speed;
      this.velocity.y = Math.sin(this.heading) * speed;
    }

    super.update(dt);
    this.lifetime += dt;
    if (this.maxLifetime > 0 && this.lifetime >= this.maxLifetime) this.destroy();
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Wrap an angle into (-PI, PI] so a turn always takes the short way round. */
function normalizeAngle(radians: number): number {
  let a = radians % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a <= -Math.PI) a += Math.PI * 2;
  return a;
}

/** Config heading wins; otherwise derive it from the spawn velocity. */
function resolveHeading(config: BulletConfig): number {
  if (typeof config.heading === 'number') return config.heading;
  const vx = config.velocity?.x ?? 0;
  const vy = config.velocity?.y ?? 0;
  return Math.atan2(vy, vx);
}
