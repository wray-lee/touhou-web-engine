/**
 * Shared helper for cutting cells out of the extracted `.anm` texture pages.
 *
 * Every TH08 art pack ships one or more pages plus a table of sprite rects. Pixi
 * can address a rect inside a page directly, so one page costs a single GPU
 * upload no matter how many cells the game reads from it.
 */

import { Assets, Rectangle, Texture } from 'pixi.js';
import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';

/** One atlas cell: a rect on a page, addressed by its ANM sprite id. */
export interface AtlasCell {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Load a page as a texture, pixel-crisp.
 * The retail art is authored at 1x, so any filtering turns it to mush.
 */
export async function loadAnmPage(url: string): Promise<Texture | null> {
  try {
    const texture = (await Assets.load(url)) as Texture;
    texture.source.style.scaleMode = 'nearest';
    return texture;
  } catch {
    return null;
  }
}

/** Cut every cell out of one page, keyed by sprite id. */
export async function sliceAnmPage(url: string, cells: AtlasCell[]): Promise<Map<number, Texture>> {
  const out = new Map<number, Texture>();
  const page = await loadAnmPage(url);
  if (!page) return out;
  for (const cell of cells) {
    if (cell.w <= 0 || cell.h <= 0) continue;
    out.set(
      cell.id,
      new Texture({ source: page.source, frame: new Rectangle(cell.x, cell.y, cell.w, cell.h) }),
    );
  }
  return out;
}

/** Publish a texture under `name`, reporting whether anything was registered. */
export function publish(renderer: PixiRenderer, name: string, texture: Texture | undefined): boolean {
  if (!texture) return false;
  renderer.assets.register(name, texture);
  return true;
}
