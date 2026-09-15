/**
 * The right-panel HUD geometry, taken from the retail draw calls.
 *
 * `Gui::DrawGameScene` (`Gui.cpp:1296-1476`) works in full-canvas space: the panel
 * backdrop tiles from x=416, the row labels all land at x=432, and every value
 * starts at x=488. The 16x16 `ascii.anm` font advances by `spaceWidth` = 13
 * (`AsciiManager.cpp:278,476`), not by the 16 of the cell, which is what makes the
 * retail read-out look tight.
 *
 * These numbers are engine-level because the panel is the same shape in every
 * Windows-era Touhou game; the sprite ids that fill them are per-game.
 */

import { CANVAS_H, CANVAS_W, PLAYFIELD_X, PLAYFIELD_W } from './PlayfieldLayout';

/** The panel backdrop tiles from here to the right edge. */
export const HUD_PANEL_TILE_X = PLAYFIELD_X + PLAYFIELD_W;
export const HUD_TILE = 32;
export const HUD_BORDER_STRIP = { w: 128, h: 16 };

/** Left edge of a row label, and of the value that follows it. */
export const HUD_LABEL_X = 432;
export const HUD_VALUE_X = 488;

/** `AsciiManager::SetSpaceWidth(13)` — the 16x16 font's advance. */
export const HUD_TEXT_ADVANCE = 13;
/** Life and bomb stars sit one cell apart. */
export const HUD_PIP_STEP = 16;

/** Top edge of each panel row. The gaps are retail's, not a rounding artefact. */
export const HUD_ROWS = {
  hiscore: 40,
  score: 56,
  player: 88,
  spell: 104,
  power: 136,
  graze: 152,
  point: 168,
  time: 184,
} as const;

export type HudRow = keyof typeof HUD_ROWS;

/** The 永夜抄 plate that fills the lower panel. */
export const HUD_LOGO = { x: 480, y: 208 } as const;

/**
 * The difficulty badge, parked under the value rows. `ascii.anm` script 25 sets
 * `AnchorTopLeft` and `Pos(552, 200)`; `Gui.cpp:2245` picks the sprite as
 * `difficulty + 283`.
 */
export const HUD_DIFFICULTY_BADGE = { x: 552, y: 200 } as const;

/** Retail's difficulty order, i.e. the index the badge sprite id is built from. */
export const HUD_DIFFICULTY_ORDER = ['easy', 'normal', 'hard', 'lunatic', 'extra'] as const;

/**
 * The 夜時計, in the lower right panel.
 *
 * What is known comes from the decompile: `g_GameManager->clockTime` is an i8
 * read by `GetClockTime()` (`GameManager.cpp:231`), 12 ends the night
 * (`:221-228` aborts the stage advance at `clockTime >= 12`, and
 * `Gui.cpp:311-317` routes 6B to the dawn ending the same way), and the
 * night-remaining bonus is `2000000 * (12 - clockTime)` (`Gui.cpp:1210`). So
 * the dial is a 12-step scale from midnight to dawn -- the hand lands on 12 at
 * daybreak, which is why the bonus is linear in the same 12.
 *
 * What is *not* in the decompile is the draw call: no function in the
 * reference turns `clockTime` into pixels, so the centre, the radius and the
 * half-hour ticks are a layout estimate, not a transcription.
 */
export const HUD_NIGHT_CLOCK = { x: 528, y: 320, r: 40 } as const;
/** Hours the whole dial spans: 0:00 to 6:00, in the units `GetClockTime` counts. */
export const NIGHT_CLOCK_SPAN = 12;

/**
 * Hand angle for one clock reading, in radians, measured the way the sprite
 * rotation is: `0` points up, positive is clockwise. Midnight has the hand
 * pointing down at the bottom of the dial and dawn brings it back up, so the
 * night is one full turn and `clockTime = 12` closes it.
 */
export const nightClockAngle = (clock: number): number => {
  const step = Math.min(NIGHT_CLOCK_SPAN, Math.max(0, clock)) / NIGHT_CLOCK_SPAN;
  return Math.PI * 2 * step + Math.PI;
};

/** The same reading as `H:MM`, e.g. 3 -> `1:30`. */
export const nightClockLabel = (clock: number): string => {
  const step = Math.min(NIGHT_CLOCK_SPAN, Math.max(0, Math.trunc(clock)));
  const hour = Math.floor(step / 2);
  return hour + ':' + (step % 2 ? '30' : '00');
};

/** The power bar: one pixel of width per point of power, 16 tall. */
export const HUD_POWER_BAR = { x: HUD_VALUE_X, y: HUD_ROWS.power, h: 16 } as const;

/**
 * Score popups. `AsciiManager::DrawPopups` walks the 8x8 digit cells with a fixed
 * 8-pixel advance and centres the run by pulling back `4 * characterCount`;
 * `AsciiManager.cpp:173-177` rises them half a pixel a frame for 60 frames.
 */
export const HUD_POPUP_ADVANCE = 8;
export const HUD_POPUP_LIFETIME = 60;
export const HUD_POPUP_RISE = 0.5;
/** Cell 10 of the first bank is the 48x8 star that marks a shot-level-up pickup. */
export const HUD_POPUP_STAR_CELL = 10;
/** `AsciiManager.cpp:1617-1629`: popups dim to 80/255 near the ship, 208/255 far off. */
export const HUD_POPUP_ALPHA_NEAR = 80;
export const HUD_POPUP_ALPHA_FAR = 208;

/** The 妖率計: the whole ornate track, plus the cursor that rides it. */
export const HUD_GAUGE = {
  x: PLAYFIELD_X,
  y: 449,
  w: 128,
  h: 16,
  /** Half-travel of the cursor and the two limit icons, in pixels. */
  span: 56,
  cursorY: 453,
  cursorW: 8,
  cursorH: 12,
  iconSize: 16,
} as const;

/**
 * Texture slots the game layer fills. The renderer only ever asks for these keys,
 * so an absent pack simply leaves the text read-out in charge.
 */
export const hudGlyphKey = (code: number): string => 'hud:glyph:' + code;
export const hudGlyphKeyFor = (char: string): string => hudGlyphKey(char.charCodeAt(0));
export const hudLabelKey = (label: string): string => 'hud:label:' + label;
export const hudPipKey = (pip: string): string => 'hud:pip:' + pip;
export const hudPlateKey = (plate: string): string => 'hud:plate:' + plate;
export const hudGaugeKey = (piece: string): string => 'hud:gauge:' + piece;
/** Difficulty / 符卡 badges, one key per `ascii.anm` entry-2 sprite. */
export const hudBadgeKey = (badge: string): string => 'hud:badge:' + badge;
/** Score-popup digit cells, by `ascii.anm` sprite id (0-30, three banks of 11). */
export const hudPopupKey = (id: number): string => 'hud:popup:' + id;

/** The digit '0' is the probe: if it landed, the whole font landed. */
export const HUD_ART_PROBE = hudGlyphKey(0x30);

/** Canvas size, re-exported so panel code does not need two imports. */
export const HUD_CANVAS = { w: CANVAS_W, h: CANVAS_H } as const;
