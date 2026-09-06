import { describe, it, expect } from 'vitest';
import { Boss } from './Boss';
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

    // Deal 100 damage
    boss.takeDamage(100);
    expect(boss.currentHp).toBe(50);
    expect(boss.currentPhaseIndex).toBe(0);

    // Deal remaining 60 damage -> phase 1
    boss.takeDamage(60);
    expect(boss.currentPhaseIndex).toBe(1);
    expect(boss.currentHp).toBe(200);
    expect(boss.isSpellCardActive).toBe(true);
    expect(boss.currentSpellCard?.name).toBe('夜符「Night Bird」');

    // Defeat phase 1
    boss.takeDamage(200);
    expect(boss.isDefeated).toBe(true);
    expect(boss.isAlive).toBe(false);
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
