import { describe, expect, it } from 'vitest';
import {
  MAX_FRAME_DAMAGE,
  addSecondaryHitbox,
  advanceHitAccumulator,
  applyYoukaiDamageBonus,
  damageOrbThreshold,
  isSoloHumanShotType,
  resolveShotDamage,
  secondaryHitboxDivisor,
  shotContribution,
  type ShotDamageContext,
  type ShotDamageTarget,
} from './ShotDamage';

const PLAIN: ShotDamageContext = {
  frameStop: false,
  extremelyYoukai: false,
  spellActive: false,
  shotType: 0,
};
const TARGET: ShotDamageTarget = { boss: false, damageable: true, freezeFrames: 0 };

describe('shot contribution under a stopped clock', () => {
  it('takes a fifth, but never rounds a hit away', () => {
    expect(shotContribution(15, false)).toBe(15);
    expect(shotContribution(15, true)).toBe(3);
    expect(shotContribution(4, true)).toBe(1);
  });
});

describe('youkai damage bonus', () => {
  it('lifts a real hit by six percent and leaves zero alone', () => {
    expect(applyYoukaiDamageBonus(100, true)).toBe(106);
    expect(applyYoukaiDamageBonus(100, false)).toBe(100);
    expect(applyYoukaiDamageBonus(0, true)).toBe(0);
  });
});

describe('the per-frame cap and the card divisor', () => {
  it('caps the frame at 70 before anything else reads it', () => {
    expect(resolveShotDamage(500, TARGET, PLAIN).damage).toBe(MAX_FRAME_DAMAGE);
    // ...and the card divisor then works off the cap, not off the raw volley.
    const card = { ...PLAIN, spellActive: true };
    expect(resolveShotDamage(500, TARGET, card).damage).toBe(10);
  });

  it('pays the damage score off the capped pre-card value', () => {
    // `EnemyManagerUpdate.cpp:684-686` runs before the card branch, so a melted
    // frame is worth 10 * (70 / 5) even though the bar only lost ten of it.
    expect(resolveShotDamage(500, TARGET, PLAIN).score).toBe(140);
    expect(resolveShotDamage(23, TARGET, PLAIN).score).toBe(40);
  });

  it('divides by seven while a card is live, and never below one', () => {
    const card = { ...PLAIN, spellActive: true };
    expect(resolveShotDamage(70, TARGET, card).damage).toBe(10);
    expect(resolveShotDamage(21, TARGET, card).damage).toBe(3);
    expect(resolveShotDamage(7, TARGET, card).damage).toBe(1);
    expect(resolveShotDamage(1, TARGET, card).damage).toBe(1);
  });

  it('leaves plain damage alone when no card is up', () => {
    expect(resolveShotDamage(21, TARGET, PLAIN).damage).toBe(21);
  });

  it('pays score but no HP to a slot that cannot be damaged', () => {
    const indestructible = { ...TARGET, damageable: false };
    const out = resolveShotDamage(50, indestructible, PLAIN);
    expect(out.damage).toBe(0);
    expect(out.score).toBe(100);
  });

  it('gives a stopped-clock region hit nothing against a live card', () => {
    // `FUN_0042DFF0` reads bit 7 of `g_Spellcard.flags`, which `StartSpell` clears
    // and nothing in the decompile ever sets, so the `/2.5` arm is unreachable.
    const card = { ...PLAIN, spellActive: true };
    expect(resolveShotDamage(70, TARGET, card, true).damage).toBe(0);
  });
});

describe('the op-160 freeze window', () => {
  it('takes a boss down to a ninth and a plain enemy to nothing', () => {
    const frozen = { ...TARGET, freezeFrames: 8 };
    expect(resolveShotDamage(45, frozen, PLAIN).damage).toBe(0);
    expect(resolveShotDamage(45, { ...frozen, boss: true }, PLAIN).damage).toBe(5);
  });

  it('stops biting the moment the timer runs out', () => {
    expect(resolveShotDamage(45, { ...TARGET, freezeFrames: 0 }, PLAIN).damage).toBe(45);
  });
});

describe('the secondary hitbox', () => {
  it('damps the extra pass by 1.7, and by 6.5 for the Youmu team', () => {
    expect(secondaryHitboxDivisor(0)).toBeCloseTo(1.7);
    expect(secondaryHitboxDivisor(3)).toBeCloseTo(6.5);
    expect(secondaryHitboxDivisor(11)).toBeCloseTo(6.5);
    expect(addSecondaryHitbox(30, 17, 0)).toBe(40);
    expect(addSecondaryHitbox(30, 17, 3)).toBe(32);
  });
});

describe('the damage-to-时符 exchange', () => {
  it('uses 27 for a solo human ship and 40 for everyone else', () => {
    expect(isSoloHumanShotType(4)).toBe(true);
    expect(isSoloHumanShotType(5)).toBe(false);
    expect(isSoloHumanShotType(0)).toBe(false);
    expect(damageOrbThreshold(4)).toBe(27);
    expect(damageOrbThreshold(10)).toBe(27);
    expect(damageOrbThreshold(0)).toBe(40);
    expect(damageOrbThreshold(1)).toBe(40);
  });

  it('only pays orbs on the extreme human side', () => {
    const youkaiSide = advanceHitAccumulator(0, 50, 40, false);
    expect(youkaiSide).toEqual({ accumulator: 10, timeOrbs: 0 });
    const humanSide = advanceHitAccumulator(0, 50, 27, true);
    expect(humanSide.accumulator).toBe(50 - 27);
    expect(humanSide.timeOrbs).toBe(3);
  });

  it('caps what it banks at 50, the same clamp retail uses', () => {
    const capped = advanceHitAccumulator(0, 500, 40, false);
    expect(capped.accumulator).toBe(10);
  });

  it('carries the remainder into the next frame', () => {
    const first = advanceHitAccumulator(0, 20, 27, true);
    expect(first.timeOrbs).toBe(0);
    const second = advanceHitAccumulator(first.accumulator, 10, 27, true);
    expect(second.timeOrbs).toBe(3);
    expect(second.accumulator).toBe(3);
  });
});
