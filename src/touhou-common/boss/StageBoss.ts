import { Boss, BossConfig, BossPhase } from './Boss';
import { Bullet } from '../../engine/core/Bullet';
import { Entity } from '../../engine/core/Entity';
import { BulletFactory, BulletPattern } from '../bullet-patterns/BulletPattern';

export interface StageBossPhase extends BossPhase {
  attackPattern?: BulletPattern;
  attackInterval?: number;
  /**
   * Fired every frame instead of on the volley clock. Lasers need a continuous
   * clock to grow, hold and retract, so they cannot ride `attackInterval`.
   */
  continuousPattern?: BulletPattern;
}

export interface StageBossConfig extends Omit<BossConfig, 'phases'> {
  phases: StageBossPhase[];
  displayColor: number;
  accentColor: number;
  entranceFrames?: number;
  entranceY?: number;
  moveAmplitudeX?: number;
  moveAmplitudeY?: number;
  moveSpeed?: number;
  fadeFrames?: number;
}

export class StageBoss extends Boss {
  public readonly displayColor: number;
  public readonly accentColor: number;
  public alpha = 1;

  private readonly entranceFrames: number;
  private readonly entranceY: number;
  private readonly moveAmplitudeX: number;
  private readonly moveAmplitudeY: number;
  private readonly moveSpeed: number;
  private readonly fadeFrames: number;
  private entranceFrame = 0;
  private aiFrame = 0;
  private runtimeFactory: BulletFactory = (config) => new Bullet(config);

  constructor(config: StageBossConfig) {
    super({
      ...config,
      position: config.position ?? { x: 224, y: config.entranceY ?? -50 },
    });
    this.displayColor = config.displayColor;
    this.accentColor = config.accentColor;
    this.entranceFrames = config.entranceFrames ?? 60;
    this.entranceY = config.entranceY ?? -50;
    this.moveAmplitudeX = config.moveAmplitudeX ?? 105;
    this.moveAmplitudeY = config.moveAmplitudeY ?? 24;
    this.moveSpeed = config.moveSpeed ?? 0.018;
    this.fadeFrames = config.fadeFrames ?? 30;
  }

  override withBulletFactory(factory: BulletFactory): this {
    super.withBulletFactory(factory);
    this.runtimeFactory = factory;
    return this;
  }

  private phasePattern(): StageBossPhase | undefined {
    return this.phases[this.currentPhaseIndex] as StageBossPhase | undefined;
  }

  override update(dtFrames: number): void {
    if (this.isDefeated) {
      this.alpha = Math.max(0, this.alpha - dtFrames / this.fadeFrames);
      return;
    }

    if (this.entranceFrame < this.entranceFrames) {
      this.entranceFrame = Math.min(this.entranceFrames, this.entranceFrame + dtFrames);
      const progress = this.entranceFrame / this.entranceFrames;
      this.position.y = this.entranceY + (120 - this.entranceY) * progress;
      return;
    }

    super.update(dtFrames);
    this.aiFrame += dtFrames;
    this.position.x = 224 + Math.sin(this.aiFrame * this.moveSpeed) * this.moveAmplitudeX;
    this.position.y = 120 + Math.cos(this.aiFrame * this.moveSpeed * 0.7) * this.moveAmplitudeY;
  }

  override updateAI(_dtFrames: number, player?: Entity): Bullet[] {
    if (!this.isAlive || this.isDefeated || this.entranceFrame < this.entranceFrames) return [];

    const phase = this.phasePattern();
    const shots: Bullet[] = [];
    const continuous = phase?.continuousPattern;
    if (continuous) {
      continuous.withFactory(this.runtimeFactory);
      shots.push(...continuous.spawn(this, this.aiFrame, player));
    }

    const pattern = phase?.attackPattern ?? phase?.spellCard?.pattern;
    const interval = Math.max(1, phase?.attackInterval ?? 60);
    if (pattern && Math.floor(this.aiFrame) % interval === 0) {
      pattern.withFactory(this.runtimeFactory);
      shots.push(...pattern.spawn(this, this.aiFrame, player));
    }
    return shots;
  }
}
