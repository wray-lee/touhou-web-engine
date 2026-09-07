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
      if (!b.isAlive) {
        this.bullets.splice(i, 1);
        this.recycle(b);
        continue;
      }

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
