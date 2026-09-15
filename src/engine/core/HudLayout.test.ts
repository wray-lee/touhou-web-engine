/* eslint-disable no-restricted-syntax -- the panel geometry is the subject. */
import { describe, expect, it } from 'vitest';
import { HUD_NIGHT_CLOCK, NIGHT_CLOCK_SPAN, nightClockAngle, nightClockLabel } from './HudLayout';

/**
 * The night clock is the one panel read-out whose *numbers* come from the
 * decompile and whose *look* does not, so the arithmetic is what gets tested.
 * `GetClockTime()` returns an i8 (`GameManager.cpp:231`), 12 is dawn
 * (`:221-228`, `Gui.cpp:311-317`), and the night bonus is linear in the same 12
 * (`Gui.cpp:1210`), which pins the dial to one turn over twelve steps.
 */
describe('night clock', () => {
  it('points down at midnight and comes back up at dawn', () => {
    // Straight down is +pi measured the way sprite rotation is.
    expect(nightClockAngle(0)).toBeCloseTo(Math.PI, 6);
    // One full turn for the whole night, so 12 lands on the same bearing as 0.
    expect(nightClockAngle(NIGHT_CLOCK_SPAN)).toBeCloseTo(Math.PI * 3, 6);
    expect(nightClockAngle(3)).toBeCloseTo(Math.PI * 1.5, 6);
  });

  it('advances by a half-hour per step', () => {
    const perStep = (Math.PI * 2) / NIGHT_CLOCK_SPAN;
    for (let clock = 0; clock < NIGHT_CLOCK_SPAN; clock++) {
      expect(nightClockAngle(clock + 1) - nightClockAngle(clock)).toBeCloseTo(perStep, 6);
    }
  });

  it('reads the clock face as hours, two steps to the hour', () => {
    expect(nightClockLabel(0)).toBe('0:00');
    expect(nightClockLabel(1)).toBe('0:30');
    expect(nightClockLabel(2)).toBe('1:00');
    expect(nightClockLabel(11)).toBe('5:30');
    expect(nightClockLabel(12)).toBe('6:00');
  });

  it('clamps a clock that overshoots dawn instead of spinning the hand back', () => {
    // `clockControl` stops at 12, but the value is read straight out of the
    // sim, and a replay that kept ringing the bell must not unwind the dial.
    expect(nightClockAngle(19)).toBeCloseTo(nightClockAngle(12), 6);
    expect(nightClockAngle(-4)).toBeCloseTo(nightClockAngle(0), 6);
    expect(nightClockLabel(19)).toBe('6:00');
  });

  it('stays inside the right panel', () => {
    // The panel starts where the playfield ends and the canvas is 640 wide.
    const { x, y, r } = HUD_NIGHT_CLOCK;
    expect(x + r).toBeLessThan(600);
    expect(y + r).toBeLessThan(448);
    expect(x - r).toBeGreaterThan(416);
  });
});
