import { BulletPattern } from '../bullet-patterns/BulletPattern';

export interface SpellCardConfig {
  name: string;
  durationSeconds: number;
  bonusScore?: number;
  maxHp: number;
  pattern?: BulletPattern;
}

export class SpellCard {
  public name: string;
  public durationSeconds: number;
  public bonusScore: number;
  public maxHp: number;
  public pattern?: BulletPattern;

  public timeRemaining: number;
  public currentBonus: number;
  public isActive = false;
  public isCaptured = true;

  constructor(config: SpellCardConfig) {
    this.name = config.name;
    this.durationSeconds = config.durationSeconds;
    this.bonusScore = config.bonusScore ?? 1000000;
    this.maxHp = config.maxHp;
    this.pattern = config.pattern;

    this.timeRemaining = this.durationSeconds;
    this.currentBonus = this.bonusScore;
  }

  start(): void {
    this.isActive = true;
    this.timeRemaining = this.durationSeconds;
    this.currentBonus = this.bonusScore;
    this.isCaptured = true;
  }

  update(dtFrames: number): void {
    if (!this.isActive) return;

    const dtSeconds = dtFrames / 60;
    this.timeRemaining = Math.max(0, this.timeRemaining - dtSeconds);

    if (this.durationSeconds > 0) {
      const ratio = this.timeRemaining / this.durationSeconds;
      this.currentBonus = Math.floor(this.bonusScore * ratio);
    }

    if (this.timeRemaining <= 0) {
      this.isActive = false;
    }
  }

  failCapture(): void {
    this.isCaptured = false;
    this.currentBonus = 0;
  }
}
