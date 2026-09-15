import { describe, it, expect } from 'vitest';
import { Boss, MAX_BOSS_HIT_DAMAGE } from './Boss';
import { SpellCard } from './SpellCard';
import { CircularPattern } from '../bullet-patterns/CircularPattern';

describe('Boss & SpellCard System', () => {
  it('handles damage and phases transition', () => {
    const spell = new SpellCard({
      name: '夜符「Night Bird」',
      durationSeconds: 30,
      bonusScore: 1000000,
      maxHp: 200,
      pattern: new CircularPattern({ count: 12, speed: 3 }),
    });

    const boss = new Boss({
      name: 'Rumia',
      phases: [
        { maxHp: 150, isSpellCard: false },
        { maxHp: 200, isSpellCard: true, spellCard: spell },
      ],
    });

    expect(boss.currentPhaseIndex).toBe(0);
    expect(boss.currentHp).toBe(150);
    expect(boss.isSpellCardActive).toBe(false);

    // Retail clamps each hit at 70, so 100 damage arrives as two shots.
    boss.takeDamage(60);
    expect(boss.currentHp).toBe(90);
    boss.takeDamage(40);
    expect(boss.currentHp).toBe(50);
    expect(boss.currentPhaseIndex).toBe(0);

    // Deal remaining 60 damage -> phase 1
    boss.takeDamage(60);
    expect(boss.currentPhaseIndex).toBe(1);
    expect(boss.currentHp).toBe(200);
    expect(boss.isSpellCardActive).toBe(true);
    expect(boss.currentSpellCard?.name).toBe('夜符「Night Bird」');

    // Defeat phase 1
    boss.applyBurst(200);
    expect(boss.isDefeated).toBe(true);
    expect(boss.isAlive).toBe(false);
  });

  it('caps a single hit at the retail 70-damage ceiling', () => {
    const boss = new Boss({ name: 'Test', phases: [{ maxHp: 1000, isSpellCard: false }] });
    boss.takeDamage(5000);
    expect(boss.currentHp).toBe(1000 - MAX_BOSS_HIT_DAMAGE);
  });

  it('spends a lump-sum source as a run of capped hits', () => {
    const boss = new Boss({ name: 'Test', phases: [{ maxHp: 200, isSpellCard: false }] });
    boss.applyBurst(150);
    expect(boss.currentHp).toBe(50);
    boss.applyBurst(999);
    expect(boss.isDefeated).toBe(true);
  });

  it('splits the gauge into one life bar per SETLIVES entry', () => {
    const boss = new Boss({
      name: 'Test',
      phases: [{ maxHp: 4000, isSpellCard: false, lifeBars: 4 }],
    });

    expect(boss.lifeBars).toBe(4);
    expect(boss.remainingBars).toBe(4);
    expect(boss.currentBarRatio).toBe(1);
    expect(boss.gaugeRatio).toBe(1);

    boss.applyBurst(1000); // exactly one bar gone
    expect(boss.remainingBars).toBe(3);
    expect(boss.currentBarRatio).toBe(1);
    expect(boss.gaugeRatio).toBeCloseTo(0.75);

    boss.applyBurst(500); // halfway through the next bar
    expect(boss.remainingBars).toBe(3);
    expect(boss.currentBarRatio).toBeCloseTo(0.5);
  });

  it('clamps life bars to the eight gauge slots the retail GUI owns', () => {
    const boss = new Boss({
      name: 'Test',
      phases: [{ maxHp: 100, isSpellCard: false, lifeBars: 99 }],
    });
    expect(boss.lifeBars).toBe(8);
    expect(boss.remainingBars).toBe(8);
  });

  it('eases the displayed gauge toward the true value, trailing a ghost bar', () => {
    const boss = new Boss({
      name: 'Test',
      phases: [{ maxHp: 1000, isSpellCard: false, lifeBars: 2 }],
    });
    boss.update(1); // fade the gauge in
    expect(boss.gaugeOpacity).toBeGreaterThan(0);

    boss.applyBurst(500);
    expect(boss.gaugeRatio).toBeCloseTo(0.5);
    expect(boss.gaugeDisplayRatio).toBeCloseTo(1);

    // Falling bars ease at 0.02/frame, so the ghost lags well behind the head.
    for (let i = 0; i < 10; i++) boss.update(1);
    expect(boss.gaugeDisplayRatio).toBeGreaterThan(0.5);
    for (let i = 0; i < 30; i++) boss.update(1);
    expect(boss.gaugeDisplayRatio).toBeCloseTo(0.5);
  });

  it('updates spellcard timer and calculates bonus', () => {
    const spell = new SpellCard({
      name: 'Test Spell',
      durationSeconds: 10,
      bonusScore: 100000,
      maxHp: 100,
    });

    spell.start();
    expect(spell.timeRemaining).toBe(10);
    expect(spell.currentBonus).toBe(100000);

    // After 5 seconds (300 frames)
    spell.update(300);
    expect(spell.timeRemaining).toBeCloseTo(5);
    expect(spell.currentBonus).toBeCloseTo(50000);
  });
});
