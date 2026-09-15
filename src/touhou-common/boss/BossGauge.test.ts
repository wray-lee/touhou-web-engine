import { describe, expect, it } from 'vitest';
import {
  BOSS_GAUGE,
  BOSS_GAUGE_PIP_DARK,
  BOSS_GAUGE_SLICES,
  BOSS_GAUGE_TIMER_COLORS,
  BOSS_GAUGE_TRACK_DARK,
  MAX_BOSS_LIFEBAR_SEGMENTS,
  gaugePips,
  gaugeShade,
  gaugeSlices,
  gaugeTimerColor,
  gaugeTimerText,
  gaugeTrack,
} from './BossGauge';

describe('TH08 boss gauge geometry', () => {
  it('uses the retail bar rectangle and pip row', () => {
    expect(BOSS_GAUGE.left).toBe(64);
    expect(BOSS_GAUGE.top).toBe(19);
    expect(BOSS_GAUGE.width).toBe(320);
    expect(BOSS_GAUGE.height).toBe(4);
    expect(BOSS_GAUGE.pipLeft).toBe(35);
    expect(BOSS_GAUGE.pipWidth).toBe(26);
    expect(BOSS_GAUGE.timerX).toBe(384);
  });

  it('clips the white track to the eased display ratio', () => {
    expect(gaugeTrack(1).width).toBe(320);
    expect(gaugeTrack(0.25).width).toBeCloseTo(80);
    expect(gaugeTrack(0).width).toBe(0);
    expect(gaugeTrack(1).shade).toBe(BOSS_GAUGE_TRACK_DARK);
  });

  it('paints one coloured slice per life bar', () => {
    const slices = gaugeSlices(4, 1, false);
    expect(slices).toHaveLength(4);
    expect(slices[0].x).toBe(64);
    expect(slices[1].x).toBeCloseTo(64 + 80);
    expect(slices.every((s) => s.width > 0)).toBe(true);
    // Alternating palette so adjacent lives are visually separable.
    expect(slices[0].color).toBe(BOSS_GAUGE_SLICES.normal[0]);
    expect(slices[1].color).toBe(BOSS_GAUGE_SLICES.normal[1]);
  });

  it('uses the warm spell-card palette', () => {
    expect(gaugeSlices(2, 1, true)[0].color).toBe(BOSS_GAUGE_SLICES.spell[0]);
  });

  it('drops slices the bar has drained past and clips the head slice', () => {
    // Half of four lives gone: two full slices, nothing beyond the head.
    const slices = gaugeSlices(4, 0.5, false);
    expect(slices).toHaveLength(2);
    // Three quarters gone: the third slice is clipped to the eased head.
    const head = gaugeSlices(4, 0.7, false);
    expect(head).toHaveLength(3);
    expect(head[2].width).toBeCloseTo(0.2 * 320);
  });

  it('never draws more than the eight gauge slots', () => {
    expect(gaugeSlices(99, 1, false)).toHaveLength(MAX_BOSS_LIFEBAR_SEGMENTS);
    expect(gaugePips(99)).toHaveLength(MAX_BOSS_LIFEBAR_SEGMENTS);
  });

  it('draws one pip per remaining life across the 26px row', () => {
    const pips = gaugePips(4);
    expect(pips).toHaveLength(4);
    expect(pips[0].x).toBe(35);
    expect(pips[3].x + pips[3].width).toBeCloseTo(35 + 26 - 2);
    // The retail gradient walks white -> grey along the row.
    expect(pips[0].color).toBe(0xffffff);
    expect(pips[3].color).toBeLessThan(pips[0].color);
    expect(pips[0].shade).toBe(BOSS_GAUGE_PIP_DARK);
  });

  it('halves the pip gap once a card carries more than five lives', () => {
    const wide = gaugePips(8);
    const narrow = gaugePips(5);
    expect(wide[1].x - (wide[0].x + wide[0].width)).toBeCloseTo(1);
    expect(narrow[1].x - (narrow[0].x + narrow[0].width)).toBeCloseTo(2);
  });

  it('darkens slice colours with the retail color >> 2 bottom edge', () => {
    expect(gaugeShade(0xffffff)).toBe(0x3f3f3f);
    expect(gaugeShade(0x5ce8ff)).toBe(0x173a3f);
  });

  it('walks the timer through the four retail colour bands', () => {
    expect(gaugeTimerColor(30)).toBe(BOSS_GAUGE_TIMER_COLORS[0]);
    expect(gaugeTimerColor(20)).toBe(BOSS_GAUGE_TIMER_COLORS[0]);
    expect(gaugeTimerColor(15)).toBe(BOSS_GAUGE_TIMER_COLORS[1]);
    expect(gaugeTimerColor(7)).toBe(BOSS_GAUGE_TIMER_COLORS[2]);
    expect(gaugeTimerColor(4)).toBe(BOSS_GAUGE_TIMER_COLORS[3]);
  });

  it('formats the countdown as two digits clamped to 99', () => {
    expect(gaugeTimerText(42).text).toBe('42');
    expect(gaugeTimerText(7).text).toBe('07');
    expect(gaugeTimerText(120).text).toBe('99');
    expect(gaugeTimerText(0).text).toBe('00');
    expect(gaugeTimerText(42).x).toBe(384);
  });
});
