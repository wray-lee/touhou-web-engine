/** ECL_MAX_BOSS_LIFEBAR_SEGMENTS in the retail GUI. */
export const MAX_BOSS_LIFEBAR_SEGMENTS = 8;

/**
 * Authentic TH08 boss gauge.
 *
 * Every number here is lifted from the retail GUI:
 * - `Gui::DrawBossGauge` (src/Gui.cpp ~L1568-1655) for the geometry,
 *   the shaded white -> 0x00202060 track, the per-life colour slices and the
 *   0xffffff - i*0xff/9 pip gradient.
 * - `Gui::FUN_00435900` (src/Gui.cpp ~L1090-1108) for the 0.01 / 0.02 easing
 *   that produces the trailing damage ghost bar.
 * - `g_GuiBossTimerColors` (src/Gui.cpp L65) for the timer thresholds.
 *
 * The retail screen is 640x480 with the playfield at x=96; this engine uses the
 * same 640x480 surface with the playfield at x=0, so the original bar rectangle
 * (64,19)-(384,23) drops in unchanged.
 */

/** Bar rectangle in screen pixels, exactly as the retail GUI computes it. */
export const BOSS_GAUGE = {
  left: 64,
  top: 19,
  width: 320,
  height: 4,
  /** Life-pip row sits to the left of the bar: x 35..61, same 4px band. */
  pipLeft: 35,
  pipWidth: 26,
  /** Timer text origin, just past the right end of the bar. */
  timerX: 384,
  timerY: 16,
  /** bossUIOpacity ramps 4/255 per frame in both directions. */
  opacityStep: 4 / 255,
  /** bossLifeBarMaxSize easing rates from Gui::FUN_00435900. */
  riseStep: 0.01,
  fallStep: 0.02,
} as const;

/** Track shading: bright top edge -> 0x00202060 bottom edge. */
export const BOSS_GAUGE_TRACK_DARK = 0x202060;
/** Pip bottom edge is a flat 0x00202020 in the retail draw. */
export const BOSS_GAUGE_PIP_DARK = 0x202020;

/** Alternating per-life slice colours (retail ECL supplies these per spellcard). */
export const BOSS_GAUGE_SLICES = {
  normal: [0x5ce8ff, 0x2f8fd0],
  spell: [0xffe06a, 0xff7a3c],
} as const;

/** g_GuiBossTimerColors = {0x00a0d0ff, 0x00a080ff, 0x00e080c0, 0x00ff4040}. */
export const BOSS_GAUGE_TIMER_COLORS = [0xa0d0ff, 0xa080ff, 0xe080c0, 0xff4040] as const;

/** A filled rectangle plus its bottom-edge shade, mirroring DrawSquareShaded. */
export interface GaugeRect {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  /** Darkened bottom colour; the retail code uses color >> 2 masked to 0x3f3f3f. */
  shade: number;
}

/**
 * Everything the gauge renderer reads. A `Boss` satisfies it directly, and an
 * ECL script that declared its own life bar (ops 127 / 131 / 148 / 158) is
 * mapped onto the same shape, so both bosses share one retail-accurate bar.
 */
export interface BossGaugeState {
  /** Whole-gauge fade in/out, retail `bossUIOpacity / 255`. */
  gaugeOpacity: number;
  /** Eased bar fill, which trails the real HP ratio on damage. */
  gaugeDisplayRatio: number;
  lifeBars: number;
  remainingBars: number;
  isSpellCardActive: boolean;
  spellcardSecondsRemaining: number;
}

/** A text run on the gauge (the spellcard countdown). */
export interface GaugeText {
  x: number;
  y: number;
  text: string;
  color: number;
}

/** Retail `color >> 2 & 0x3f3f3f` bottom-edge shade. */
export function gaugeShade(color: number): number {
  return ((color >> 2) & 0x3f3f3f) | 0;
}

function rect(x: number, width: number, color: number, shade: number): GaugeRect {
  return { x, y: BOSS_GAUGE.top, width, height: BOSS_GAUGE.height, color, shade };
}

/**
 * The un-filled track: white at the top edge fading to dark blue at the bottom,
 * clipped to the eased display ratio exactly like the retail first DrawSquareShaded.
 */
export function gaugeTrack(displayRatio: number): GaugeRect {
  const ratio = clamp01(displayRatio);
  return rect(BOSS_GAUGE.left, BOSS_GAUGE.width * ratio, 0xffffff, BOSS_GAUGE_TRACK_DARK);
}

/**
 * Per-life colour slices. A slice is skipped once the eased bar has drained
 * past it, and the slice under the bar head is clipped to the head, which is how
 * the retail code keeps the trailing ghost visible.
 */
export function gaugeSlices(bars: number, displayRatio: number, spell: boolean): GaugeRect[] {
  const ratio = clamp01(displayRatio);
  if (ratio <= 0) return [];
  const count = clampBars(bars);
  const palette = spell ? BOSS_GAUGE_SLICES.spell : BOSS_GAUGE_SLICES.normal;
  const out: GaugeRect[] = [];
  for (let i = 0; i < count; i++) {
    const start = i / count;
    if (start >= ratio) break;
    const stop = Math.min((i + 1) / count, ratio);
    const color = palette[i % palette.length];
    out.push(
      rect(
        BOSS_GAUGE.left + start * BOSS_GAUGE.width,
        (stop - start) * BOSS_GAUGE.width,
        color,
        gaugeShade(color),
      ),
    );
  }
  return out;
}

/**
 * The life-pip row left of the bar. One pip per remaining life; the retail
 * gradient 0xffffff - i*0xff/9 walks white -> grey along the row, and the gap
 * between pips halves once a spellcard carries more than five lives.
 */
export function gaugePips(remainingBars: number): GaugeRect[] {
  const total = clampBars(remainingBars);
  if (total <= 0) return [];
  const gap = total <= 5 ? 2 : 1;
  const out: GaugeRect[] = [];
  for (let i = 0; i < total; i++) {
    const left = BOSS_GAUGE.pipLeft + (i * BOSS_GAUGE.pipWidth) / total;
    const right = BOSS_GAUGE.pipLeft + ((i + 1) * BOSS_GAUGE.pipWidth) / total - gap;
    const color = 0xffffff - Math.floor((i * 0xff) / 9);
    out.push(rect(left, Math.max(1, right - left), color, BOSS_GAUGE_PIP_DARK));
  }
  return out;
}

/** Timer colour band from spellcardSecondsRemaining (>=20 / >=10 / >=5 / <5). */
export function gaugeTimerColor(secondsRemaining: number): number {
  if (secondsRemaining >= 20) return BOSS_GAUGE_TIMER_COLORS[0];
  if (secondsRemaining >= 10) return BOSS_GAUGE_TIMER_COLORS[1];
  if (secondsRemaining >= 5) return BOSS_GAUGE_TIMER_COLORS[2];
  return BOSS_GAUGE_TIMER_COLORS[3];
}

/** The retail gauge text run: "%.2d" of the clamped countdown at (384,16). */
export function gaugeTimerText(secondsRemaining: number): GaugeText {
  const seconds = Math.max(0, Math.min(99, Math.floor(secondsRemaining)));
  return {
    x: BOSS_GAUGE.timerX,
    y: BOSS_GAUGE.timerY,
    text: seconds.toString().padStart(2, '0'),
    color: gaugeTimerColor(secondsRemaining),
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampBars(bars: number): number {
  return Math.max(0, Math.min(MAX_BOSS_LIFEBAR_SEGMENTS, Math.floor(bars) || 0));
}
