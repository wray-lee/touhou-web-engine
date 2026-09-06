import { Boss, BossPhase } from '../../../touhou-common/boss/Boss';
import { SpellCard } from '../../../touhou-common/boss/SpellCard';
import { Entity } from '../../../engine/core/Entity';
import { Bullet } from '../../../engine/core/Bullet';
import { CircularPattern } from '../../../touhou-common/bullet-patterns/CircularPattern';
import { AimingPattern } from '../../../touhou-common/bullet-patterns/AimingPattern';

export class Rumia extends Boss {
  private aiFrame = 0;
  private moveAngle = 0;
  private targetX = 224;
  private targetY = 120;

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
      position: { x: 224, y: 120 },
      hitboxRadius: 20,
    });
  }

  override updateAI(dtFrames: number, player?: Entity): Bullet[] {
    if (!this.isAlive || this.isDefeated) return [];

    this.aiFrame += dtFrames;
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
        const circ = new CircularPattern({
          count: 16,
          speed: 2.5,
          angleOffset: (this.aiFrame * 0.05) % (Math.PI * 2),
          color: 0x33bbff,
          radius: 4,
        });
        bullets.push(...circ.spawn(this, this.aiFrame, player));
      }
    }
    // Phase 1: Night Sign "Night Bird"
    else if (currentPhase === 1) {
      if (this.aiFrame % 40 === 0) {
        // Red circular expanding wave
        const circ = new CircularPattern({
          count: 20,
          speed: 2.2,
          angleOffset: (this.aiFrame * 0.08) % (Math.PI * 2),
          color: 0xff3355,
          radius: 5,
        });
        bullets.push(...circ.spawn(this, this.aiFrame, player));
      }

      if (this.aiFrame % 60 === 20 && player) {
        // Sharp aimed needle shot at player
        const aim = new AimingPattern({
          count: 3,
          speed: 4.2,
          spreadAngle: 0.15,
          color: 0xdd22ff,
          radius: 3,
        });
        bullets.push(...aim.spawn(this, this.aiFrame, player));
      }
    }
    // Phase 2: Darkness Sign "Demarcation"
    else if (currentPhase === 2) {
      if (this.aiFrame % 60 === 0) {
        // Darkness boundary pattern - spiraling dual rings with angular velocity
        const pattern1 = new CircularPattern({
          count: 18,
          speed: 2.4,
          angleOffset: this.aiFrame * 0.03,
          angularVelocity: 0.015,
          color: 0x9922ff,
          radius: 5,
        });
        const pattern2 = new CircularPattern({
          count: 18,
          speed: 2.4,
          angleOffset: -this.aiFrame * 0.03,
          angularVelocity: -0.015,
          color: 0x3344cc,
          radius: 5,
        });
        bullets.push(...pattern1.spawn(this, this.aiFrame, player));
        bullets.push(...pattern2.spawn(this, this.aiFrame, player));
      }

      if (this.aiFrame % 80 === 30 && player) {
        // 5-way spread aimed at player
        const aim = new AimingPattern({
          count: 5,
          speed: 3.5,
          spreadAngle: 0.25,
          color: 0xff22aa,
          radius: 4,
        });
        bullets.push(...aim.spawn(this, this.aiFrame, player));
      }
    }

    return bullets;
  }
}
