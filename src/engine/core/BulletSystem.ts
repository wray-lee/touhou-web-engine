import { Bullet, BulletConfig, obtainBullet, releaseBullet, getBulletPoolSize } from './Bullet';
import { EntityTag } from './Entity';

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface BulletSystemConfig extends Partial<Bounds> {
  /** Max pooled Bullet instances to keep for reuse (0 = unlimited). */
  maxPoolSize?: number;
}

/** Resolve the point a homing shot should steer at, or null to fly straight. */
export type HomingAim = (bullet: Bullet) => { x: number; y: number } | null;

export const DEFAULT_BOUNDS: Bounds = {
  minX: -50,
  maxX: 450,
  minY: -50,
  maxY: 650,
};

export class BulletSystem {
  private bullets: Bullet[] = [];
  public bounds: Bounds;
  /** Cap for the shared bullet free-list (0 = unlimited). */
  public maxPoolSize: number;

  /**
   * Aim provider for bullets carrying a homingTurn. The game layer points this at
   * the nearest live target so player homing shots track it frame by frame.
   */
  public homingAim: HomingAim | null = null;

  /** Debug counters (reported through getStats()). */
  public poolReused = 0;
  public poolAllocated = 0;

  constructor(config: BulletSystemConfig = {}) {
    this.bounds = {
      minX: config.minX ?? DEFAULT_BOUNDS.minX,
      maxX: config.maxX ?? DEFAULT_BOUNDS.maxX,
      minY: config.minY ?? DEFAULT_BOUNDS.minY,
      maxY: config.maxY ?? DEFAULT_BOUNDS.maxY,
    };
    this.maxPoolSize = config.maxPoolSize ?? 512;
  }

  /** Create a bullet from the shared module pool, reusing a dead instance when available. */
  createBullet(config: BulletConfig = {}): Bullet {
    const freeBefore = getBulletPoolSize();
    const bullet = obtainBullet(config);
    if (getBulletPoolSize() < freeBefore) {
      this.poolReused++;
    } else {
      this.poolAllocated++;
    }
    return bullet;
  }

  /** Return a dead bullet to the shared pool (double-release safe, respects the cap). */
  private recycle(bullet: Bullet): void {
    releaseBullet(bullet, this.maxPoolSize);
  }

  add(...newBullets: Bullet[]): void {
    for (const b of newBullets) {
      if (b.isAlive) {
        this.bullets.push(b);
      }
    }
  }

  update(dt: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      // ECL bullets are advanced by the deterministic simulation. They are
      // mirrored here only for rendering and must never move a second time.
      if ((b as Bullet & { _eclSynced?: boolean })._eclSynced) continue;
      if (!b.isAlive) {
        this.bullets.splice(i, 1);
        this.recycle(b);
        continue;
      }

      this.steerHoming(b, dt);
      b.update(dt);

      // Check bounds
      if (
        b.position.x < this.bounds.minX ||
        b.position.x > this.bounds.maxX ||
        b.position.y < this.bounds.minY ||
        b.position.y > this.bounds.maxY
      ) {
        b.destroy();
        this.bullets.splice(i, 1);
        this.recycle(b);
      }
    }
  }

  /**
   * Apply bounded homing steering before the polar integrator runs, so the new
   * heading is the one the frame actually travels along.
   */
  private steerHoming(b: Bullet, dt: number): void {
    if (b.homingTurn <= 0 || !this.homingAim) return;
    if (b.homingFrames > 0 && b.lifetime >= b.homingFrames) return;
    const aim = this.homingAim(b);
    if (!aim) return;
    b.homeToward(Math.atan2(aim.y - b.position.y, aim.x - b.position.x), b.homingTurn * dt);
  }

  clearAll(tag?: EntityTag): void {
    const survivors: Bullet[] = [];
    for (const b of this.bullets) {
      if (!tag || b.tag === tag) {
        b.destroy();
        this.recycle(b);
      } else {
        survivors.push(b);
      }
    }
    this.bullets = tag ? survivors : [];
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  /**
   * Replace the bullet array with externally-managed bullets (ECL adapter).
   * The BulletSystem will render them but not update their physics.
   */
  syncFromEcl(eclBullets: Bullet[]): void {
    // Remove old ECL-synced bullets and keep only engine-managed ones
    this.bullets = this.bullets.filter((b) => !(b as any)._eclSynced);
    for (const b of eclBullets) {
      (b as any)._eclSynced = true;
      this.bullets.push(b);
    }
  }

  getCount(): number {
    return this.bullets.length;
  }

  /** Number of bullets currently held in the shared reuse pool. */
  get poolSize(): number {
    return getBulletPoolSize();
  }

  getStats(): { reused: number; allocated: number; poolSize: number } {
    return {
      reused: this.poolReused,
      allocated: this.poolAllocated,
      poolSize: getBulletPoolSize(),
    };
  }
}
