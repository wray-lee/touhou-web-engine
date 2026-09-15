/**
 * Locks the score-popup rules read out of `AsciiManager`: the three-cell bank
 * flicker, the distance-driven fade, the least-significant-first digit order, and
 * the 60-frame life a number gets before it retires.
 */
import { describe, expect, it } from 'vitest';
import { MAX_SCORE_POPUPS, POPUP_COLOR_MAX, ScorePopupSystem, popupCell } from './ScorePopupSystem';
import {
  HUD_POPUP_ALPHA_FAR,
  HUD_POPUP_ALPHA_NEAR,
  HUD_POPUP_LIFETIME,
  HUD_POPUP_STAR_CELL,
} from './HudLayout';

describe('ScorePopupSystem', () => {
  it('splits a value least-significant-first, the order CreateScorePopup fills', () => {
    const system = new ScorePopupSystem();
    system.spawn(10, 20, 1234);
    const [popup] = system.view(500, 500, 0, 0);
    expect(popup.digits).toEqual([4, 3, 2, 1]);
  });

  it('prints a lone star for a negative value', () => {
    const system = new ScorePopupSystem();
    system.spawn(0, 0, -1, POPUP_COLOR_MAX);
    const [popup] = system.view(0, 0, 0, 0);
    expect(popup.digits).toEqual([HUD_POPUP_STAR_CELL]);
    expect(popup.color).toBe(POPUP_COLOR_MAX);
  });

  it('renders zero as a single digit rather than an empty run', () => {
    const system = new ScorePopupSystem();
    system.spawn(0, 0, 0);
    expect(system.view(0, 0, 0, 0)[0].digits).toEqual([0]);
  });

  it('walks the three banks at frames 52 and 56', () => {
    expect(ScorePopupSystem.bankFor(0)).toBe(0);
    expect(ScorePopupSystem.bankFor(51)).toBe(0);
    expect(ScorePopupSystem.bankFor(52)).toBe(1);
    expect(ScorePopupSystem.bankFor(55)).toBe(1);
    expect(ScorePopupSystem.bankFor(56)).toBe(2);
    expect(ScorePopupSystem.bankFor(60)).toBe(2);
  });

  it('maps a digit onto its bank, keeping the star in bank A only', () => {
    expect(popupCell(0, 0)).toBe(0);
    expect(popupCell(0, 1)).toBe(11);
    expect(popupCell(0, 2)).toBe(21);
    expect(popupCell(9, 2)).toBe(30);
    expect(popupCell(HUD_POPUP_STAR_CELL, 2)).toBe(HUD_POPUP_STAR_CELL);
  });

  it('fades by distance to the ship, not by age', () => {
    // On top of the player: the deliberate 80/255 so a pile never hides the hitbox.
    expect(ScorePopupSystem.alphaFor(100, 100, 100, 100)).toBe(HUD_POPUP_ALPHA_NEAR);
    expect(ScorePopupSystem.alphaFor(100, 100, 120, 120)).toBe(HUD_POPUP_ALPHA_NEAR);
    // Past 64px it is pinned at 208/255.
    expect(ScorePopupSystem.alphaFor(100, 100, 100, 200)).toBe(HUD_POPUP_ALPHA_FAR);
    // In between it ramps linearly in squared distance.
    const mid = ScorePopupSystem.alphaFor(100, 100, 100, 100 + 45);
    expect(mid).toBeGreaterThan(HUD_POPUP_ALPHA_NEAR);
    expect(mid).toBeLessThan(HUD_POPUP_ALPHA_FAR);
  });

  it('rises half a pixel a frame and retires after 60', () => {
    const system = new ScorePopupSystem();
    system.spawn(10, 100, 500);
    for (let i = 0; i < HUD_POPUP_LIFETIME; i++) system.update();
    expect(system.activeCount).toBe(1);
    expect(system.view(0, 0, 0, 0)[0].y).toBeCloseTo(70, 5);
    system.update();
    expect(system.activeCount).toBe(0);
  });

  it('offsets views into canvas space', () => {
    const system = new ScorePopupSystem();
    system.spawn(10, 20, 1);
    const [popup] = system.view(0, 0, 32, 16);
    expect([popup.x, popup.y]).toEqual([42, 36]);
  });

  it('recycles the oldest slot once the pool is full', () => {
    const system = new ScorePopupSystem();
    for (let i = 0; i < MAX_SCORE_POPUPS + 5; i++) system.spawn(i, 0, i);
    expect(system.activeCount).toBe(MAX_SCORE_POPUPS);
    system.reset();
    expect(system.activeCount).toBe(0);
  });
});
