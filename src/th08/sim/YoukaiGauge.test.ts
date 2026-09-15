import { describe, expect, it } from 'vitest';
import {
  YoukaiGauge,
  gaugeBoundsFor,
  isExtremelyHuman,
  isExtremelyYoukai,
  isModeratelyHuman,
  isModeratelyYoukai,
  PAIRED_BOUNDS,
} from './YoukaiGauge';

/** Run `frames` frames of a fixed input, the way the stage clock would. */
const hold = (g: YoukaiGauge, frames: number, shooting: boolean, isYoukai: boolean): void => {
  for (let i = 0; i < frames; i++) g.tick({ shooting, isYoukai });
};

describe('youkai gauge bounds', () => {
  it('uses the paired-team table for the four duos', () => {
    for (const shotType of [0, 1, 2]) {
      expect(gaugeBoundsFor(shotType)).toEqual(PAIRED_BOUNDS);
    }
  });

  it('compresses the human side for Youmu and for her solo bank', () => {
    const youmu = gaugeBoundsFor(3);
    expect(youmu.humanLimit).toBe(-5000);
    expect(youmu.extremeHuman).toBe(-3000);
    // The youkai half of her team keeps the full retail range.
    expect(youmu.youkaiLimit).toBe(10000);
    const solo = gaugeBoundsFor(10);
    expect(solo.youkaiLimit).toBe(5000);
    expect(solo.extremeYoukai).toBe(3000);
  });

  it('locks a solo human out of the youkai extreme and vice versa', () => {
    const soloHuman = gaugeBoundsFor(4);
    expect(soloHuman.youkaiLimit).toBe(2000);
    expect(isExtremelyYoukai(soloHuman.youkaiLimit, soloHuman)).toBe(false);
    expect(isModeratelyYoukai(soloHuman.youkaiLimit, soloHuman)).toBe(false);

    const soloYoukai = gaugeBoundsFor(5);
    expect(soloYoukai.humanLimit).toBe(-2000);
    expect(isExtremelyHuman(soloYoukai.humanLimit, soloYoukai)).toBe(false);
    expect(isModeratelyHuman(soloYoukai.humanLimit, soloYoukai)).toBe(false);
  });
});

describe('youkai gauge dynamics', () => {
  it('pushes toward whichever form is holding the trigger', () => {
    const youkai = new YoukaiGauge();
    hold(youkai, 60, true, true);
    expect(youkai.value).toBeGreaterThan(0);

    const human = new YoukaiGauge();
    hold(human, 60, true, false);
    expect(human.value).toBeLessThan(0);

    // Mirror images of each other: the meter has no preference for either side.
    expect(youkai.value).toBe(-human.value);
  });

  it('ramps the push the longer the trigger is held, then caps it', () => {
    const g = new YoukaiGauge();
    // The first frames of a hold barely move the meter at all.
    hold(g, 20, true, true);
    const early = g.value;
    hold(g, 20, true, true);
    const midStep = g.value - early;
    hold(g, 320, true, true);
    const late = g.value;
    hold(g, 20, true, true);
    const lateStep = g.value - late;

    expect(midStep).toBeGreaterThan(early);
    expect(lateStep).toBeGreaterThan(midStep);
    // Player.cpp:934 caps the per-frame push at 21 once the charge passes 300.
    expect(lateStep).toBeLessThanOrEqual(21 * 20 + 21);
  });

  it('clamps to the team bounds instead of running away', () => {
    const g = new YoukaiGauge();
    hold(g, 3000, true, true);
    expect(g.value).toBe(PAIRED_BOUNDS.youkaiLimit);
    expect(g.normalized()).toBe(1);
    g.set(-999999);
    expect(g.value).toBe(PAIRED_BOUNDS.humanLimit);
    expect(g.normalized()).toBe(0);
  });

  it('relaxes back to neutral once the trigger is released', () => {
    const g = new YoukaiGauge();
    // Long enough for the charge to saturate and drive the meter to its bound.
    hold(g, 900, true, true);
    expect(g.value).toBeGreaterThan(8000);
    const peak = g.value;
    // Retail holds off for 30 idle frames before the meter starts relaxing
    // (Player.cpp:945-965), so a short silence changes nothing at all.
    hold(g, 25, false, true);
    expect(g.value).toBe(peak);
    hold(g, 60, false, true);
    expect(g.value).toBeLessThan(peak);
    expect(g.value).toBeGreaterThan(0);
  });

  it('snaps to exact zero when it gets close', () => {
    const g = new YoukaiGauge();
    g.set(5);
    hold(g, 400, false, false);
    expect(g.value).toBe(0);
    expect(g.normalized()).toBe(0.5);
  });

  it('drags the meter toward neutral and forces relaxation on a boss death', () => {
    const g = new YoukaiGauge();
    hold(g, 200, true, true);
    const before = g.value;
    g.onEnemyDeath();
    expect(g.value).toBeCloseTo(before - before / 12, 4);
    expect(g.charge).toBe(0);
    // The hold-off it sets means the very next idle frame already relaxes.
    const after = g.value;
    hold(g, 2, false, true);
    expect(g.value).toBeLessThan(after);
  });
});

describe('youkai gauge rewards', () => {
  it('pays grazes for more on the human side and more score on the youkai side', () => {
    const deep = new YoukaiGauge();
    deep.set(-9000);
    expect(deep.onGraze()).toEqual({ grazeGain: 3, score: 2000, gaugeGain: 100 });

    const mild = new YoukaiGauge();
    mild.set(-3000);
    expect(mild.onGraze().grazeGain).toBe(2);

    const neutral = new YoukaiGauge();
    expect(neutral.onGraze().grazeGain).toBe(1);
    expect(neutral.onGraze().score).toBe(2000);

    const youkai = new YoukaiGauge();
    youkai.set(3000);
    expect(isModeratelyYoukai(youkai.value, youkai.bounds)).toBe(true);
    expect(youkai.onGraze().score).toBe(4000);
    expect(youkai.onGraze().grazeGain).toBe(1);
  });

  it('feeds a 时符 to the flying form, but only past the kill hold-off', () => {
    const g = new YoukaiGauge();
    g.set(1000);
    g.onTimeOrb(true, 12);
    expect(g.value).toBe(1000);
    g.onTimeOrb(true, 0);
    expect(g.value).toBe(1111);
    g.onTimeOrb(false, 0);
    expect(g.value).toBe(1000);
  });

  it('reports the extremes that light up the aura', () => {
    const g = new YoukaiGauge();
    expect(g.isExtreme()).toBe(false);
    g.set(8000);
    expect(g.isExtreme()).toBe(true);
    g.set(-8000);
    expect(g.isExtreme()).toBe(true);
    g.set(0);
    expect(g.isExtreme()).toBe(false);
  });
});
