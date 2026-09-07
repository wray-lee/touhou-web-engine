import { Boss, BossPhase } from '../../../touhou-common/boss/Boss';
import { SpellCard } from '../../../touhou-common/boss/SpellCard';
import { Entity } from '../../../engine/core/Entity';
import { Bullet } from '../../../engine/core/Bullet';
import { BulletPattern, BulletFactory } from '../../../touhou-common/bullet-patterns/BulletPattern';
import { CircularPattern } from '../../../touhou-common/bullet-patterns/CircularPattern';
import { AimingPattern } from '../../../touhou-common/bullet-patterns/AimingPattern';
import { CompositePattern } from '../../../touhou-common/bullet-patterns/CompositePattern';

export class Rumia extends Boss {
  /** 入场滑入帧数：前 60 帧 y 从 -50 移到 100，期间不攻击（票据 11）。 */
  static readonly ENTRANCE_FRAMES = 60;
  /** 死亡淡出帧数：isAlive=false 后 alpha 1→0（票据 11，渲染由任务 D 消费）。 */
  static readonly FADE_FRAMES = 30;

  /** 渲染透明度：入场/战斗期为 1，死亡后 30 帧线性淡出到 0。 */
  public alpha = 1;

  private aiFrame = 0;
  /** 入场进度计数器：独立于 timer（timer 会随阶段切换归零）。 */
  private entranceFrame = 0;
  private moveAngle = 0;
  private targetX = 224;
  private targetY = 120;

  /** 运行时弹幕工厂（对象池）；由 withBulletFactory 注入。 */
  private runtimeFactory: BulletFactory = (config) => new Bullet(config);

  override withBulletFactory(factory: BulletFactory): this {
    super.withBulletFactory(factory);
    this.runtimeFactory = factory;
    return this;
  }

  /** 运行时生成的 pattern 路由到对象池工厂。 */
  private pooled<P extends BulletPattern>(pattern: P): P {
    return pattern.withFactory(this.runtimeFactory);
  }

  constructor() {
    const nightBirdSpell = new SpellCard({
      name: '夜符「Night Bird」',
      durationSeconds: 40,
      bonusScore: 1000000,
      maxHp: 250,
      pattern: new CircularPattern({ count: 20, speed: 2.8, color: 0xff3355 }),
    });

    const demarcationSpell = new SpellCard({
      name: '闇符「Demarcation」',
      durationSeconds: 45,
      bonusScore: 1500000,
      maxHp: 320,
      pattern: new CircularPattern({ count: 24, speed: 2.2, color: 0x8833ff }),
    });

    const phases: BossPhase[] = [
      {
        maxHp: 150,
        isSpellCard: false,
        durationSeconds: 30,
      },
      {
        maxHp: 250,
        isSpellCard: true,
        spellCard: nightBirdSpell,
        durationSeconds: 40,
      },
      {
        maxHp: 320,
        isSpellCard: true,
        spellCard: demarcationSpell,
        durationSeconds: 45,
      },
    ];

    super({
      name: 'Rumia',
      phases,
      position: { x: 224, y: -50 }, // 入场起点：屏幕顶外，update() 滑入到 y=100
      hitboxRadius: 20,
    });
  }

  override update(dtFrames: number): void {
    // 死亡淡出：alpha 1→0 约 30 帧（数据字段，渲染消费由任务 D 负责）
    if (this.isDefeated || !this.isAlive) {
      if (this.alpha > 0) {
        this.alpha = Math.max(0, this.alpha - dtFrames / Rumia.FADE_FRAMES);
      }
      return;
    }

    super.update(dtFrames);

    // 入场：前 ENTRANCE_FRAMES 帧从 y=-50 线性滑入到 y=100
    if (this.entranceFrame < Rumia.ENTRANCE_FRAMES) {
      this.entranceFrame = Math.min(this.entranceFrame + dtFrames, Rumia.ENTRANCE_FRAMES);
      this.position.y = -50 + 150 * (this.entranceFrame / Rumia.ENTRANCE_FRAMES);
    }
  }

  override updateAI(dtFrames: number, player?: Entity): Bullet[] {
    if (!this.isAlive || this.isDefeated) return [];

    this.aiFrame += dtFrames;
    // 入场期间不攻击
    if (this.aiFrame <= Rumia.ENTRANCE_FRAMES) return [];

    const bullets: Bullet[] = [];

    // Boss smooth floating movement
    this.moveAngle += 0.02 * dtFrames;
    this.targetX = 224 + Math.sin(this.moveAngle) * 70;
    this.targetY = 120 + Math.cos(this.moveAngle * 0.7) * 25;

    this.position.x += (this.targetX - this.position.x) * 0.05 * dtFrames;
    this.position.y += (this.targetY - this.position.y) * 0.05 * dtFrames;

    const currentPhase = this.currentPhaseIndex;

    // Phase 0: Non-spell
    if (currentPhase === 0) {
      if (this.aiFrame % 50 === 0) {
        // 16-way circular pattern with rotating offset
        const circ = this.pooled(
          new CircularPattern({
            count: 16,
            speed: 2.5,
            angleOffset: (this.aiFrame * 0.05) % (Math.PI * 2),
            color: 0x33bbff,
            radius: 4,
          }),
        );
        bullets.push(...circ.spawn(this, this.aiFrame, player));
      }
    }
    // Phase 1: Night Sign "Night Bird"
    else if (currentPhase === 1) {
      if (this.aiFrame % 40 === 0) {
        // Red circular expanding wave
        const circ = this.pooled(
          new CircularPattern({
            count: 20,
            speed: 2.2,
            angleOffset: (this.aiFrame * 0.08) % (Math.PI * 2),
            color: 0xff3355,
            radius: 5,
          }),
        );
        bullets.push(...circ.spawn(this, this.aiFrame, player));
      }

      if (this.aiFrame % 60 === 20 && player) {
        // Sharp aimed needle shot at player
        const aim = this.pooled(
          new AimingPattern({
            count: 3,
            speed: 4.2,
            spreadAngle: 0.15,
            color: 0xdd22ff,
            radius: 3,
          }),
        );
        bullets.push(...aim.spawn(this, this.aiFrame, player));
      }
    }
    // Phase 2: Darkness Sign "Demarcation"
    else if (currentPhase === 2) {
      if (this.aiFrame % 60 === 0) {
        // Darkness boundary pattern — counter-rotating dual rings as one composite salvo
        const dualRing = this.pooled(
          new CompositePattern([
            new CircularPattern({
              count: 18,
              speed: 2.4,
              angleOffset: this.aiFrame * 0.03,
              angularVelocity: 0.015,
              color: 0x9922ff,
              radius: 5,
              sprite: 'bullet_ring',
            }),
            new CircularPattern({
              count: 18,
              speed: 2.4,
              angleOffset: -this.aiFrame * 0.03,
              angularVelocity: -0.015,
              color: 0x3344cc,
              radius: 5,
              sprite: 'bullet_ring',
            }),
          ]),
        );
        bullets.push(...dualRing.spawn(this, this.aiFrame, player));
      }

      if (this.aiFrame % 80 === 30 && player) {
        // 5-way spread aimed at player
        const aim = this.pooled(
          new AimingPattern({
            count: 5,
            speed: 3.5,
            spreadAngle: 0.25,
            color: 0xff22aa,
            radius: 4,
          }),
        );
        bullets.push(...aim.spawn(this, this.aiFrame, player));
      }
    }

    return bullets;
  }
}
