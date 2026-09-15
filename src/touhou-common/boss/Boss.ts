import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';
import { SpellCard } from './SpellCard';
import { Bullet } from '../../engine/core/Bullet';
import { BulletPattern, BulletFactory } from '../bullet-patterns/BulletPattern';
import { BOSS_GAUGE, MAX_BOSS_LIFEBAR_SEGMENTS } from './BossGauge';

/**
 * TH08 caps the damage a single hit can take off a boss (Gui/EnemyManagerUpdate
 * `if (damage >= 70) damage = 70;`). Lump-sum sources such as spell cards are
 * therefore applied as a run of capped hits rather than one big number.
 */
export const MAX_BOSS_HIT_DAMAGE = 70;

export interface BossPhase {
  maxHp: number;
  isSpellCard: boolean;
  spellCard?: SpellCard;
  pattern?: BulletPattern;
  durationSeconds?: number;
  /**
   * TH08 `SETLIVES` for this phase: how many life bars the boss owns. Each bar
   * is one coloured slice of the boss gauge, so this is what makes a spell card
   * read as "many bars" instead of one long one. Clamped to 8 slots.
   */
  lifeBars?: number;
}

export interface BossConfig {
  name: string;
  phases: BossPhase[];
  position?: Partial<Vector2>;
  hitboxRadius?: number;
  /** Texture lookup name, e.g. "rumia" -> boss:rumia. */
  spriteKey?: string;
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
  public spriteKey?: string;
  public alpha = 1;

  /** Eased gauge fill — the retail `bossLifeBarMaxSize` trailing ghost bar. */
  public gaugeDisplayRatio = 0;
  /** Whole-gauge fade in/out, retail `bossUIOpacity / 255`. */
  public gaugeOpacity = 0;

  private hpPerBar = 0;

  constructor(config: BossConfig) {
    super(config.position ?? { x: 224, y: 120 }, {}, { radius: config.hitboxRadius ?? 24 }, 'boss');
    this.name = config.name;
    this.spriteKey = config.spriteKey;
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

  /** Life bars owned by the current phase (>= 1, <= 8 gauge slots). */
  get lifeBars(): number {
    const requested = this.currentPhase?.lifeBars ?? 1;
    return Math.max(1, Math.min(MAX_BOSS_LIFEBAR_SEGMENTS, Math.round(requested)));
  }

  /** How many whole life bars are still standing. */
  get remainingBars(): number {
    if (!this.isAlive || this.currentHp <= 0 || this.hpPerBar <= 0) return 0;
    return Math.max(1, Math.min(this.lifeBars, Math.ceil(this.currentHp / this.hpPerBar)));
  }

  /** Progress through the life bar currently being chewed through, 0..1. */
  get currentBarRatio(): number {
    if (this.hpPerBar <= 0) return 0;
    const inside = this.currentHp % this.hpPerBar;
    return Math.max(0, Math.min(1, inside === 0 ? 1 : inside / this.hpPerBar));
  }

  /** Gauge fill the retail game would hand to `Gui::FUN_004230c0`. */
  get gaugeRatio(): number {
    const maxHp = this.currentPhase?.maxHp ?? 0;
    if (maxHp <= 0) return 0;
    return Math.max(0, Math.min(1, this.currentHp / maxHp));
  }

  /** Seconds left on the active spell card, 0 outside spell cards. */
  get spellcardSecondsRemaining(): number {
    return this.currentSpellCard?.timeRemaining ?? 0;
  }

  private initPhase(index: number): void {
    if (index >= this.phases.length) {
      this.isDefeated = true;
      // 先通知再销毁：destroy() 会清空监听器，顺序颠倒会让 defeat 永远收不到
      this.emit('defeat', this);
      this.destroy();
      return;
    }

    this.currentPhaseIndex = index;
    const phase = this.phases[index];
    this.currentHp = phase.maxHp;
    this.hpPerBar = phase.maxHp / this.lifeBars;
    this.timer = 0;
    // A fresh phase always starts with a full bar, so the ghost never trails.
    this.gaugeDisplayRatio = 1;

    if (phase.isSpellCard && phase.spellCard) {
      phase.spellCard.start();
      this.emit('spellcard-start', phase.spellCard);
    }
  }

  takeDamage(amount: number): void {
    if (!this.isAlive || this.isDefeated) return;

    // Retail clamps every individual hit before it touches the life counter.
    this.currentHp -= Math.max(0, Math.min(MAX_BOSS_HIT_DAMAGE, amount));
    this.emit('damage', { currentHp: this.currentHp, maxHp: this.currentPhase?.maxHp });

    if (this.currentHp <= 0) {
      this.nextPhase();
    }
  }

  /**
   * Spend a lump-sum damage source (spell card bombs) as a run of retail-sized
   * hits, so the per-hit cap cannot be bypassed. Overkill is lost, exactly as
   * when a TH08 boss's last life bar breaks mid-volley.
   */
  applyBurst(amount: number): void {
    let remaining = Math.max(0, Math.round(amount));
    while (remaining > 0 && this.isAlive && !this.isDefeated) {
      const hit = Math.min(MAX_BOSS_HIT_DAMAGE, remaining);
      remaining -= hit;
      this.takeDamage(hit);
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

    this.updateGauge(dtFrames);
  }

  /**
   * Retail `Gui::FUN_00435900` gauge easing: the fill chases the true value at
   * 0.01/frame going up and 0.02/frame going down, which is what leaves the
   * pale damage ghost behind the bar.
   */
  private updateGauge(dtFrames: number): void {
    const target = this.isAlive && !this.isDefeated ? this.gaugeRatio : 0;
    const display = this.gaugeDisplayRatio;
    if (target > display) {
      // max += 0.01; if (size < max) max = size;
      this.gaugeDisplayRatio = Math.min(target, display + BOSS_GAUGE.riseStep * dtFrames);
    } else if (target < display) {
      // max -= 0.02; if (size > max) max = size;
      this.gaugeDisplayRatio = Math.max(target, display - BOSS_GAUGE.fallStep * dtFrames);
    }

    const wantOpacity = this.isAlive && !this.isDefeated ? 1 : 0;
    const delta = BOSS_GAUGE.opacityStep * dtFrames;
    if (this.gaugeOpacity < wantOpacity) {
      this.gaugeOpacity = Math.min(wantOpacity, this.gaugeOpacity + delta);
    } else if (this.gaugeOpacity > wantOpacity) {
      this.gaugeOpacity = Math.max(wantOpacity, this.gaugeOpacity - delta);
    }
  }
}
