/**
 * Register the original TH08 stage backgrounds as renderer parallax layers.
 *
 * The engine asks for `bg:<theme>:sky|mid|near`. The retail game ships those
 * layers as cells of `stg<N>bg.anm`: one or more painted sheets (which scroll)
 * plus small bush decals that do not belong on a tiling layer. Layers the pack
 * cannot fill get their placeholder unregistered, so nothing hand-painted by us
 * is left on screen.
 */

import type { Texture } from 'pixi.js';
import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import { PLAYFIELD_W } from '../../../engine/core/PlayfieldLayout';
import { sliceAtlas } from './th08-player-registration';
import { TH08_STAGE_BACKGROUNDS } from './th08-backgrounds';

/** Stage number -> playfield theme name used by the renderer. */
const THEME_BY_STAGE: Record<number, string> = {
  1: 'forestNight',
  2: 'lake',
  3: 'nightSky',
  4: 'bambooMoon',
  5: 'village',
  6: 'moonCity',
};

const LAYERS = ['sky', 'mid', 'near'] as const;

/** A sheet has to cover most of the playfield to be worth tiling. */
const MIN_SHEET_W = 200;
const MIN_SHEET_H = 190;

/**
 * Pick the painted sheets of one stage, far layer first.
 *
 * A cell that is already playfield wide is the authored backdrop, so it leads;
 * the rest go by area, which keeps the narrow strips and bush decals out.
 */
function pickSheets(sprites: { id: number; w: number; h: number }[]): number[] {
  const sheets = sprites.filter((s) => s.w >= MIN_SHEET_W && s.h >= MIN_SHEET_H);
  const full = sheets.find((s) => s.w >= PLAYFIELD_W);
  const rest = sheets.filter((s) => s !== full).sort((a, b) => b.w * b.h - a.w * a.h);
  return [...(full ? [full] : []), ...rest].slice(0, LAYERS.length).map((s) => s.id);
}

/**
 * Slice every stage atlas and publish the parallax layers per theme.
 * Returns the number of layer textures registered.
 */
export async function registerTH08Backgrounds(renderer: PixiRenderer): Promise<number> {
  let total = 0;

  for (const [stageKey, theme] of Object.entries(THEME_BY_STAGE)) {
    const data = TH08_STAGE_BACKGROUNDS[Number(stageKey)];
    if (!data) continue;

    // Layer name -> texture, resolved before anything is published so the
    // placeholder sweep below cannot wipe out a fresh original.
    const found = new Map<string, Texture>();
    const wanted = new Map<number, string>();
    pickSheets(data.sprites).forEach((id, i) => wanted.set(id, 'bg:' + theme + ':' + LAYERS[i]));

    // Standalone canvas textures, not atlas sub-frames: a parallax sheet repeats
    // vertically, and a frame inside the shared page lets every wrap edge sample
    // the atlas padding next to it, which draws a horizontal line across the stage.
    for (const [texIndex, page] of data.textures.entries()) {
      const cells = data.sprites
        .filter((sprite) => sprite.tex === texIndex && wanted.has(sprite.id))
        .map((sprite) => ({ id: sprite.id, x: sprite.x, y: sprite.y, w: sprite.w, h: sprite.h }));
      if (cells.length === 0) continue;
      for (const [id, texture] of await sliceAtlas(page.file, cells)) {
        texture.source.style.scaleMode = 'linear';
        const name = wanted.get(id);
        if (name && !found.has(name)) found.set(name, texture);
      }
    }

    for (const layer of LAYERS) renderer.assets.unregister('bg:' + theme + ':' + layer);
    for (const [name, texture] of found) {
      renderer.assets.register(name, texture);
      total++;
    }
  }

  return total;
}
