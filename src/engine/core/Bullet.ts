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
  public lifetime = 0;
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
    this.lifetime = 0;
  }

  override update(dt: number): void {
    if (!this.isAlive) return;

    if (this.angularVelocity !== 0) {
      const speed = Math.hypot(this.velocity.x, this.velocity.y);
      const angle = Math.atan2(this.velocity.y, this.velocity.x) + this.angularVelocity * dt;
      this.velocity.x = Math.cos(angle) * speed;
      this.velocity.y = Math.sin(angle) * speed;
    }

    if (this.acceleration !== 0) {
      const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
      if (currentSpeed > 0.0001) {
        const nextSpeed = Math.max(0, currentSpeed + this.acceleration * dt);
        const ratio = nextSpeed / currentSpeed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
      }
    }

    super.update(dt);
    this.lifetime += dt;
  }
}
