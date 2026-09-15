import { describe, expect, it } from 'vitest';
import { CHARACTER_PROFILES, DIFFICULTY_MODIFIERS, getCharacterProfile, isStageNumber } from './types';

describe('TH08 campaign configuration', () => {
  it('defines four distinct playable character teams', () => {
    const profiles = Object.values(CHARACTER_PROFILES);
    expect(profiles).toHaveLength(4);
    // Four teams, eight members, and every member carries its own weapon.
    const members = profiles.flatMap((profile) => [...profile.members]);
    expect(members).toHaveLength(8);
    expect(new Set(members.map((member) => member.id)).size).toBe(8);
    expect(new Set(members.map((member) => member.shotSprite)).size).toBe(8);
    // Speeds come from `plyNNa.sht + 0x24` / `plyNNas.sht + 0x28` and are NOT a
    // fixed ratio, so pin the measured values (`Player.cpp:791-820`).
    const measured: Record<string, [number, number]> = {
      'reimu-yukari': [4.0, 2.0],
      'marisa-alice': [5.0, 2.2],
      'sakuya-remilia': [4.0, 2.3],
      'youmu-yuyuko': [5.0, 1.9],
    };
    for (const profile of profiles) {
      const [fast, slow] = measured[profile.id];
      expect(profile.fastSpeed, profile.id).toBeCloseTo(fast, 6);
      expect(profile.slowSpeed, profile.id).toBeCloseTo(slow, 6);
      // Diagonals are stored pre-divided by sqrt(2), so no diagonal penalty.
      expect(profile.fastDiagonalSpeed * Math.SQRT2, profile.id).toBeCloseTo(fast, 6);
      expect(profile.slowDiagonalSpeed * Math.SQRT2, profile.id).toBeCloseTo(slow, 6);
    }
    expect(getCharacterProfile('marisa-alice')).not.toBe(CHARACTER_PROFILES['marisa-alice']);
  });

  it('keeps difficulty modifiers ordered by pressure', () => {
    expect(DIFFICULTY_MODIFIERS.easy.bulletSpeed).toBeLessThan(DIFFICULTY_MODIFIERS.normal.bulletSpeed);
    expect(DIFFICULTY_MODIFIERS.normal.bulletSpeed).toBeLessThan(DIFFICULTY_MODIFIERS.lunatic.bulletSpeed);
    expect(isStageNumber(1)).toBe(true);
    expect(isStageNumber(6)).toBe(true);
    expect(isStageNumber(7)).toBe(false);
  });
});
