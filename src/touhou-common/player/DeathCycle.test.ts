import { describe, expect, it } from 'vitest';
import {
  DEATHBOMB_BUDGET_BY_TEAM,
  DEATH_FRAMES,
  GRACE_MAX,
  GRACE_WITHOUT_BOMBS,
  bombCost,
  deathScale,
  deathbombBudget,
  graceAfterBomb,
  graceWindowFrames,
  shipTransform,
  soloCharacterIndex,
  spawnScale,
  teamRowForShotType,
} from './DeathCycle';

/** The retail inputs, with the uncitable 时符 threshold parked out of the way. */
function windowFor(bombs: number, over: Partial<Parameters<typeof graceWindowFrames>[0]> = {}) {
  return graceWindowFrames({
    bombs,
    timeOrbs: 0,
    lastSpellTimeOrbThreshold: Number.POSITIVE_INFINITY,
    spellCardActive: false,
    shotType: 1,
    ...over,
  });
}

describe('death cycle', () => {
  it('buys six frames of window per bomb and clamps at fifteen', () => {
    // Player.cpp:551-558.
    expect(windowFor(1)).toBe(6);
    expect(windowFor(2)).toBe(12);
    expect(windowFor(3)).toBe(GRACE_MAX);
    expect(windowFor(9)).toBe(GRACE_MAX);
  });

  it('gives a ship with no bombs the two frames of a plain miss', () => {
    expect(windowFor(0)).toBe(GRACE_WITHOUT_BOMBS);
  });

  it('doubles the window while an enemy spell card is out, capped at thirty', () => {
    // Player.cpp:560-566.
    expect(windowFor(1, { spellCardActive: true })).toBe(12);
    expect(windowFor(3, { spellCardActive: true })).toBe(30);
  });

  it('pays the Reimu rows 9/5 for the same bombs', () => {
    // Player.cpp:568-573: shot types 0, 4 and 5.
    const common = windowFor(1, { shotType: 1 });
    expect(windowFor(1, { shotType: 0 })).toBe(Math.floor((common * 9) / 5));
    expect(windowFor(1, { shotType: 4 })).toBe(Math.floor((common * 9) / 5));
    expect(windowFor(1, { shotType: 5 })).toBe(Math.floor((common * 9) / 5));
    // And nobody else gets it.
    expect(windowFor(1, { shotType: 3 })).toBe(common);
  });

  it('spends one bomb on a card and two on a deathbomb', () => {
    // acceptBomb:1244-1271.
    expect(bombCost(false, 3)).toBe(1);
    expect(bombCost(true, 3)).toBe(2);
    // Fewer than two held and the deathbomb eats the lot rather than being refused.
    expect(bombCost(true, 1)).toBe(1);
    expect(bombCost(true, 0)).toBe(0);
  });

  it('hands six frames of window back after a card, up to the team budget', () => {
    // acceptBomb:1290-1296 clamps to plyNNa.sht + 0x8.
    expect(graceAfterBomb(0, 1)).toBe(6);
    expect(graceAfterBomb(14, 1)).toBe(deathbombBudget(1));
    expect(DEATHBOMB_BUDGET_BY_TEAM).toEqual([18, 10, 10, 12]);
  });

  it('folds the solo rows back onto the pair of the character flying alone', () => {
    expect(teamRowForShotType(0)).toBe(0);
    expect(teamRowForShotType(3)).toBe(3);
    expect(soloCharacterIndex(4)).toBe(0);
    expect(soloCharacterIndex(5)).toBe(0);
    expect(soloCharacterIndex(11)).toBe(3);
    expect(deathbombBudget(5)).toBe(deathbombBudget(0));
  });

  it('flattens the ship horizontally as it dies, additively, over thirty frames', () => {
    // Player.cpp:1374-1379: scaleX = 3v+1, scaleY = 1-v.
    expect(deathScale(0)).toMatchObject({ scaleX: 1, scaleY: 1, alpha: 1, additive: true });
    const half = deathScale(15);
    expect(half.scaleX).toBeCloseTo(2.5);
    expect(half.scaleY).toBeCloseTo(0.5);
    expect(half.alpha).toBeCloseTo(0.5);
    const last = deathScale(29);
    expect(last.scaleY).toBeGreaterThan(0);
    expect(last.alpha).toBeGreaterThan(0);
    expect(deathScale(30).additive).toBe(false);
  });

  it('unfolds the spawn-in from a three times wide streak', () => {
    // Player.cpp:1423-1430: value = 1 - timer/60, scaleX = 2*value+1, scaleY = 1-value.
    const start = spawnScale(0);
    expect(start.scaleX).toBeCloseTo(3);
    expect(start.scaleY).toBeCloseTo(0);
    expect(start.alpha).toBe(0);
    const end = spawnScale(29);
    expect(end.scaleY).toBeGreaterThan(0.4);
    expect(end.alpha).toBeGreaterThan(0.9);
  });

  it('holds the ship white and still while the window is open', () => {
    const held = shipTransform('dying', DEATH_FRAMES, 12);
    expect(held.whiteout).toBe(true);
    expect(held.scaleY).toBe(1);
    // ...and only then starts the dissolve.
    const dissolving = shipTransform('dying', DEATH_FRAMES - 10, 0);
    expect(dissolving.whiteout).toBe(false);
    // Ten frames into a thirty-frame dissolve: scaleY = 1 - v, scaleX = 3v + 1.
    expect(dissolving.scaleY).toBeCloseTo(1 - 10 / 30);
    expect(dissolving.scaleX).toBeCloseTo(1 + 3 * (10 / 30));
    expect(shipTransform('alive', 0, 0)).toMatchObject({
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      additive: false,
    });
  });
});
