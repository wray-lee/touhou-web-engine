import { Bullet } from './Bullet';

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
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

  constructor(bounds: Partial<Bounds> = {}) {
    this.bounds = {
      minX: bounds.minX ?? DEFAULT_BOUNDS.minX,
      maxX: bounds.maxX ?? DEFAULT_BOUNDS.maxX,
      minY: bounds.minY ?? DEFAULT_BOUNDS.minY,
      maxY: bounds.maxY ?? DEFAULT_BOUNDS.maxY,
    };
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
      }
    }
  }

  clearAll(tag?: string): void {
    for (const b of this.bullets) {
      if (!tag || b.tag === tag) {
        b.destroy();
      }
    }
    this.bullets = tag ? this.bullets.filter((b) => b.isAlive) : [];
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  getCount(): number {
    return this.bullets.length;
  }
}
