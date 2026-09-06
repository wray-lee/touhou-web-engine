import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';
import { SpellCard } from './SpellCard';
import { Bullet } from '../../engine/core/Bullet';
import { BulletPattern, BulletFactory } from '../bullet-patterns/BulletPattern';

export interface BossPhase {
  maxHp: number;
  isSpellCard: boolean;
  spellCard?: SpellCard;
  pattern?: BulletPattern;
  durationSeconds?: number;
}

export interface BossConfig {
  name: string;
  phases: BossPhase[];
  position?: Partial<Vector2>;
  hitboxRadius?: number;
  /** Bullet creation hook — lets the game route boss bullets through its object pool. */
  bulletFactory?: BulletFactory;
}

export class Boss extends Entity {
  public name: string;
  public phases: BossPhase[];
  public currentPhaseIndex = 0;
  public currentHp = 0;
  public isDefeated = false;
  public timer = 0;

  constructor(config: BossConfig) {
    super(
      config.position ?? { x: 224, y: 120 },
      {},
      { radius: config.hitboxRadius ?? 24 },
      'boss'
    );
    this.name = config.name;
    this.phases = config.phases;
    if (config.bulletFactory) {
      this.withBulletFactory(config.bulletFactory);
    }
    this.initPhase(0);
  }

  /** Route bullet patterns through a shared object-pool factory. */
  withBulletFactory(factory: BulletFactory): this {
    for (const phase of this.phases) {
      phase.spellCard?.pattern?.withFactory(factory);
      phase.pattern?.withFactory(factory);
    }
    return this;
  }

  get currentPhase(): BossPhase | undefined {
    return this.phases[this.currentPhaseIndex];
  }

  get isSpellCardActive(): boolean {
    return this.currentPhase?.isSpellCard ?? false;
  }

  get currentSpellCard(): SpellCard | undefined {
    return this.currentPhase?.spellCard;
  }

  private initPhase(index: number): void {
    if (index >= this.phases.length) {
      this.isDefeated = true;
      this.destroy();
      this.emit('defeat', this);
      return;
    }

    this.currentPhaseIndex = index;
    const phase = this.phases[index];
    this.currentHp = phase.maxHp;
    this.timer = 0;

    if (phase.isSpellCard && phase.spellCard) {
      phase.spellCard.start();
      this.emit('spellcard-start', phase.spellCard);
    }
  }

  takeDamage(amount: number): void {
    if (!this.isAlive || this.isDefeated) return;

    this.currentHp -= amount;
    this.emit('damage', { currentHp: this.currentHp, maxHp: this.currentPhase?.maxHp });

    if (this.currentHp <= 0) {
      this.nextPhase();
    }
  }

  nextPhase(): void {
    this.emit('phase-clear', {
      phaseIndex: this.currentPhaseIndex,
      spellCard: this.currentSpellCard,
    });
    this.initPhase(this.currentPhaseIndex + 1);
  }

  updateAI(_dtFrames: number, _player?: Entity): Bullet[] {
    return [];
  }

  override update(dtFrames: number): void {
    super.update(dtFrames);
    this.timer += dtFrames;

    if (this.currentSpellCard && this.currentSpellCard.isActive) {
      this.currentSpellCard.update(dtFrames);
      if (this.currentSpellCard.timeRemaining <= 0) {
        // Time out
        this.nextPhase();
      }
    }
  }
}
