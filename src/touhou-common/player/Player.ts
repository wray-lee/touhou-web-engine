import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';
import { InputSystem } from '../../engine/core/InputSystem';
import { Bullet, BulletConfig } from '../../engine/core/Bullet';
import { Bounds } from '../../engine/core/BulletSystem';
import { BulletFactory } from '../bullet-patterns/BulletPattern';

export interface PlayerConfig {
  fastSpeed?: number;
  slowSpeed?: number;
  hitboxRadius?: number;
  initialLives?: number;
  initialBombs?: number;
  playfield?: Bounds;
  /** Bullet creation hook — lets the game route shots through its object pool. */
  bulletFactory?: BulletFactory;
}

export const DEFAULT_PLAYFIELD: Bounds = {
  minX: 32,
  maxX: 416,
  minY: 32,
  maxY: 480,
};

export class Player extends Entity {
  public fastSpeed: number;
  public slowSpeed: number;
  public isSlowMode = false;
  public lives: number;
  public bombs: number;
  public power = 128;
  public score = 0;
  public graze = 0;
  public isInvulnerable = false;
  public invulnerabilityTimer = 0;
  public shootCooldown = 0;
  public playfield: Bounds;
  public bulletFactory: BulletFactory;

  constructor(position: Partial<Vector2> = {}, config: PlayerConfig = {}) {
    super(
      position,
      {},
      { radius: config.hitboxRadius ?? 2 },
      'player'
    );
    this.fastSpeed = config.fastSpeed ?? 4.5;
    this.slowSpeed = config.slowSpeed ?? 2.0;
    this.lives = config.initialLives ?? 3;
    this.bombs = config.initialBombs ?? 3;
    this.playfield = config.playfield ?? DEFAULT_PLAYFIELD;
    this.bulletFactory = config.bulletFactory ?? ((cfg) => new Bullet(cfg));
  }

  private makeBullet(config: BulletConfig): Bullet {
    // Player shots default to the oriented needle sprite unless overridden
    return this.bulletFactory({ sprite: 'player_needle', ...config });
  }

  handleInput(input: InputSystem): void {
    this.isSlowMode = input.isKeyDown('slow');

    // Touch drag: fly the ship toward the finger, smoothed & speed-capped
    if (input.isDragging) {
      const dx = input.pointerPos.x - this.position.x;
      const dy = input.pointerPos.y - this.position.y;
      const dist = Math.hypot(dx, dy);
      const speed = this.isSlowMode ? this.slowSpeed : this.fastSpeed;
      if (dist > 1) {
        const travel = Math.min(dist, speed);
        this.velocity.x = (dx / dist) * travel;
        this.velocity.y = (dy / dist) * travel;
      } else {
        this.velocity.x = 0;
        this.velocity.y = 0;
      }
      return;
    }

    const dir = input.getMovementVector();
    const speed = this.isSlowMode ? this.slowSpeed : this.fastSpeed;

    this.velocity.x = dir.x * speed;
    this.velocity.y = dir.y * speed;
  }

  shoot(_time: number): Bullet[] {
    if (this.shootCooldown > 0) return [];
    this.shootCooldown = 5; // shoots every 5 frames

    const bullets: Bullet[] = [
      this.makeBullet({
        position: { x: this.position.x - 8, y: this.position.y - 12 },
        velocity: { x: 0, y: -16 },
        radius: 3,
        color: 0xffffff,
        damage: 15,
        tag: 'player-bullet',
      }),
      this.makeBullet({
        position: { x: this.position.x + 8, y: this.position.y - 12 },
        velocity: { x: 0, y: -16 },
        radius: 3,
        color: 0xffffff,
        damage: 15,
        tag: 'player-bullet',
      }),
    ];

    if (!this.isSlowMode) {
      // Homing / wide needles in fast mode
      bullets.push(
        this.makeBullet({
          position: { x: this.position.x - 16, y: this.position.y - 8 },
          velocity: { x: -2, y: -14 },
          radius: 3,
          color: 0xff3344,
          damage: 10,
          tag: 'player-bullet',
        }),
        this.makeBullet({
          position: { x: this.position.x + 16, y: this.position.y - 8 },
          velocity: { x: 2, y: -14 },
          radius: 3,
          color: 0xff3344,
          damage: 10,
          tag: 'player-bullet',
        })
      );
    } else {
      // Focused stream in slow mode
      bullets.push(
        this.makeBullet({
          position: { x: this.position.x - 4, y: this.position.y - 16 },
          velocity: { x: 0, y: -18 },
          radius: 3,
          color: 0xaa2233,
          damage: 12,
          tag: 'player-bullet',
        }),
        this.makeBullet({
          position: { x: this.position.x + 4, y: this.position.y - 16 },
          velocity: { x: 0, y: -18 },
          radius: 3,
          color: 0xaa2233,
          damage: 12,
          tag: 'player-bullet',
        })
      );
    }

    return bullets;
  }

  hit(): boolean {
    if (this.isInvulnerable) return false;
    this.lives = Math.max(0, this.lives - 1);
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 180; // 3 seconds at 60 FPS
    this.emit('hit', this.lives);
    return true;
  }

  useBomb(): boolean {
    if (this.bombs <= 0) return false;
    this.bombs--;
    this.isInvulnerable = true;
    this.invulnerabilityTimer = 300; // 5 seconds invulnerability
    this.emit('bomb', this.bombs);
    return true;
  }

  override update(dt: number): void {
    super.update(dt);

    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    }

    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
      }
    }

    // Clamp playfield
    this.position.x = Math.max(this.playfield.minX, Math.min(this.playfield.maxX, this.position.x));
    this.position.y = Math.max(this.playfield.minY, Math.min(this.playfield.maxY, this.position.y));
  }
}
