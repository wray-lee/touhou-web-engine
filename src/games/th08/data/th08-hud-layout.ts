/**
 * TH08's HUD sprite tables.
 *
 * The panel geometry lives in `engine/core/HudLayout.ts` because the right panel is
 * the same shape in every Windows-era Touhou game; what is per-game is which sprite
 * on which sheet fills each row. Those ids come from two places in the
 * decompilation:
 *
 * - `Gui.cpp:2296` runs `front.anm` scripts 0..15 on `Gui::Impl::vm0000[0..15]`, so
 *   the script order names each VM (labels, pips, plate, tile, border);
 * - `AsciiManager.cpp:280-289` runs `ascii.anm` scripts 5..8 on the 妖率計 pieces.
 *
 * The engine constants are re-exported so the game layer has one import site.
 */

export * from '../../../engine/core/HudLayout';

/** `front.anm` sprite ids for the eight panel labels. */
export const TH08_HUD_LABEL_FRONT_ID = {
  hiscore: 2,
  score: 3,
  player: 4,
  spell: 5,
  power: 6,
  graze: 7,
  point: 8,
  time: 9,
} as const;

/** 残机 is a red star, 灵击 a blue one (`Gui.cpp:1399-1412`). */
export const TH08_HUD_PIP_FRONT_ID = { life: 11, bomb: 12 } as const;

/** The rest of `front.anm` entry 0 the panel needs. */
export const TH08_HUD_PLATE_FRONT_ID = { panel: 0, tile: 13, border: 14 } as const;

/** `ascii.anm` ids for the 妖率計: track, 人 limit, 妖 limit, cursor. */
export const TH08_HUD_GAUGE_ASCII_ID = { track: 155, human: 153, youkai: 154, cursor: 152 } as const;
