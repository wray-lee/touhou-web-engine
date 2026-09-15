/**
 * Register the original HUD art.
 *
 * Retail never draws its read-out with a system font: `Gui::DrawGameScene` blits the
 * `front.anm` label strips, pips and panel plate, and `AsciiManager.cpp:483` blits
 * `ascii.anm` glyphs for every digit. This module slices both sheets and lands them
 * under the `hud:*` slots the renderer probes, which is what retires the monospace
 * placeholder and the stroked cyan playfield border.
 */

import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import {
  HUD_TEXT_ADVANCE,
  hudBadgeKey,
  hudGaugeKey,
  hudGlyphKey,
  hudLabelKey,
  hudPipKey,
  hudPlateKey,
  hudPopupKey,
  TH08_HUD_GAUGE_ASCII_ID,
  TH08_HUD_LABEL_FRONT_ID,
  TH08_HUD_PIP_FRONT_ID,
  TH08_HUD_PLATE_FRONT_ID,
} from './th08-hud-layout';
import { sliceAtlas } from './th08-player-registration';
import {
  ASCII_FIRST_GLYPH,
  ASCII_GLYPH_COUNT,
  TH08_ASCII2_ATLAS,
  TH08_ASCII_ATLAS,
  TH08_ASCII_RECTS,
  TH08_BADGE_RECTS,
  TH08_FRONT_ATLAS,
  TH08_FRONT_RECTS,
  TH08_GAUGE_RECTS,
  TH08_POPUP_RECTS,
  asciiGlyphId,
} from './th08-hud-sprites';

/** The eight panel labels, in the order retail stacks them. */
export const HUD_LABELS = ['hiscore', 'score', 'player', 'spell', 'power', 'graze', 'point', 'time'] as const;

export type HudLabel = (typeof HUD_LABELS)[number];

/** @deprecated kept so older call sites resolve; use `TH08_HUD_LABEL_FRONT_ID`. */
export const HUD_LABEL_FRONT_ID = TH08_HUD_LABEL_FRONT_ID;

/** The 16x16 stars the panel uses for 残机 and 灵击. */
export const HUD_PIP_FRONT_IDS = TH08_HUD_PIP_FRONT_ID;

/**
 * The rest of `front.anm` entry 0: the 永夜抄 logo plate, the 32x32 backdrop tile,
 * and the 128x16 border strip (`Gui.cpp:1354-1376`).
 */
export const HUD_FRONT_PLATES = TH08_HUD_PLATE_FRONT_ID;

/** `ascii.anm` ids for the 妖率計: track, 人 limit, 妖 limit, cursor. */
export const HUD_GAUGE_ASCII_IDS = TH08_HUD_GAUGE_ASCII_ID;

export { hudGlyphKey, hudLabelKey, hudPipKey, hudPlateKey, hudGaugeKey, hudBadgeKey, hudPopupKey };

/**
 * `ascii.anm` entry 2 furniture, keyed by the name the renderer asks for. 283-287 are
 * the difficulty badges (`Gui.cpp:2245` = `difficulty + 283`); 282 is the 符卡 frame
 * `Gui.cpp:1415-1419` drops over the 残机/灵击 rows while a player card is live.
 */
export const HUD_BADGE_ASCII_IDS: Record<string, number> = {
  easy: 283,
  normal: 284,
  hard: 285,
  lunatic: 286,
  extra: 287,
  spell: 282,
};

/** Every `front.anm` slot the panel needs, mapped to the key it registers under. */
const frontKeyFor = (id: number): string | null => {
  const label = HUD_LABELS.find((name) => TH08_HUD_LABEL_FRONT_ID[name] === id);
  if (label) return hudLabelKey(label);
  const pip = (Object.keys(TH08_HUD_PIP_FRONT_ID) as (keyof typeof TH08_HUD_PIP_FRONT_ID)[]).find(
    (name) => TH08_HUD_PIP_FRONT_ID[name] === id,
  );
  if (pip) return hudPipKey(pip);
  const plate = (Object.keys(TH08_HUD_PLATE_FRONT_ID) as (keyof typeof TH08_HUD_PLATE_FRONT_ID)[]).find(
    (name) => TH08_HUD_PLATE_FRONT_ID[name] === id,
  );
  return plate ? hudPlateKey(plate) : null;
};

/**
 * Slice both sheets and register them. Returns the number of textures landed, so a
 * caller can tell a missing asset pack apart from a failed canvas read.
 */
export async function registerTH08HudArt(renderer: PixiRenderer): Promise<number> {
  let count = 0;

  const frontIds = [
    ...Object.values(TH08_HUD_LABEL_FRONT_ID),
    ...Object.values(TH08_HUD_PIP_FRONT_ID),
    ...Object.values(TH08_HUD_PLATE_FRONT_ID),
  ];
  try {
    const frames = frontIds
      .filter((id) => TH08_FRONT_RECTS[id])
      .map((id) => ({ id, ...TH08_FRONT_RECTS[id] }));
    const textures = await sliceAtlas(TH08_FRONT_ATLAS, frames);
    for (const id of frontIds) {
      const key = frontKeyFor(id);
      const texture = textures.get(id);
      if (key && texture) {
        renderer.assets.register(key, texture);
        count++;
      }
    }
  } catch {
    return 0;
  }

  try {
    const codes: number[] = [];
    for (let i = 0; i < ASCII_GLYPH_COUNT; i++) {
      const code = ASCII_FIRST_GLYPH + i;
      if (TH08_ASCII_RECTS[asciiGlyphId(code)]) codes.push(code);
    }
    const frames = codes.map((code) => ({
      id: code,
      ...TH08_ASCII_RECTS[asciiGlyphId(code)],
    }));
    const textures = await sliceAtlas(TH08_ASCII_ATLAS, frames);
    for (const code of codes) {
      const texture = textures.get(code);
      if (texture) {
        renderer.assets.register(hudGlyphKey(code), texture);
        count++;
      }
    }

    const gaugePieces = Object.keys(TH08_HUD_GAUGE_ASCII_ID) as (keyof typeof TH08_HUD_GAUGE_ASCII_ID)[];
    const gaugeFrames = gaugePieces
      .map((name) => TH08_HUD_GAUGE_ASCII_ID[name])
      .filter((id) => TH08_GAUGE_RECTS[id])
      .map((id) => ({ id, ...TH08_GAUGE_RECTS[id] }));
    const gaugeTextures = await sliceAtlas(TH08_ASCII_ATLAS, gaugeFrames);
    for (const name of gaugePieces) {
      const texture = gaugeTextures.get(TH08_HUD_GAUGE_ASCII_ID[name]);
      if (texture) {
        renderer.assets.register(hudGaugeKey(name), texture);
        count++;
      }
    }

    const badgeNames = Object.keys(HUD_BADGE_ASCII_IDS).filter(
      (name) => TH08_BADGE_RECTS[HUD_BADGE_ASCII_IDS[name]],
    );
    const badgeFrames = badgeNames.map((name) => ({
      id: HUD_BADGE_ASCII_IDS[name],
      ...TH08_BADGE_RECTS[HUD_BADGE_ASCII_IDS[name]],
    }));
    const badgeTextures = await sliceAtlas(TH08_ASCII2_ATLAS, badgeFrames);
    for (const name of badgeNames) {
      const texture = badgeTextures.get(HUD_BADGE_ASCII_IDS[name]);
      if (texture) {
        renderer.assets.register(hudBadgeKey(name), texture);
        count++;
      }
    }

    // The score-popup font is a second, tighter 8x8 face that shares the ascii sheet:
    // three banks of eleven cells for the flicker at the end of a number's life, plus
    // the 48x8 star `CreateScorePopup(-1)` prints on a shot-level-up.
    const popupIds = Object.keys(TH08_POPUP_RECTS)
      .map(Number)
      .filter((id) => Number.isFinite(id));
    const popupFrames = popupIds.map((id) => ({ id, ...TH08_POPUP_RECTS[id] }));
    const popupTextures = await sliceAtlas(TH08_ASCII_ATLAS, popupFrames);
    for (const id of popupIds) {
      const texture = popupTextures.get(id);
      if (texture) {
        renderer.assets.register(hudPopupKey(id), texture);
        count++;
      }
    }
  } catch {
    // The label strip above already carries most of the look.
  }

  return count;
}

/**
 * Lay a string out in the original font.
 *
 * The sheet covers U+0020..U+007F; anything outside advances three quarters of a cell
 * rather than collapsing to zero, so a caller can still write a CJK label and keep
 * the row readable. Returns the total advance in pixels.
 */
export function measureHudText(text: string, advance = HUD_TEXT_ADVANCE, scale = 1): number {
  let width = 0;
  for (const char of text) {
    width += (hasHudGlyph(char) ? advance : advance * 0.75) * scale;
  }
  return width;
}

/** True when `char` is inside the sheet's contiguous U+0020..U+007F run. */
export const hasHudGlyph = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= ASCII_FIRST_GLYPH && code < ASCII_FIRST_GLYPH + ASCII_GLYPH_COUNT;
};
