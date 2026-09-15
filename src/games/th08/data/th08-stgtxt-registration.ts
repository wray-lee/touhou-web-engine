/**
 * Publish the original 阶段标题卡 art to the renderer.
 *
 * `Gui.cpp:2281` preloads `stgNNtxt.anm` for the stage that is loading, and
 * `:2307` runs its scripts 0..3 the moment the stage takes the screen. The art is
 * one 512x256 page holding the stage number, the stage name, the poem, and the two
 * boss lines; the motion is the ANM bytecode lifted into `th08-stgtxt-anm.ts`.
 *
 * The page itself is extracted original art and stays out of the repository, so a
 * checkout without it loses the banner rather than failing to boot.
 */

import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import { anmScriptFromBase64 } from '../../../engine/anm/AnmVm';
import { sliceAnmPage } from './anm-atlas';
import { STGTXT_BY_ROUTE, TH08_STGTXT, stgtxtBytes } from './th08-stgtxt-anm';

/** Renderer key for one title-card cell. */
export function stageTitleKey(pack: string, sprite: number): string {
  return 'stage-text:' + pack + ':' + sprite;
}

/** The `stgNNtxt` pack a campaign route draws its card from. */
export function stageTitlePackFor(route: string): string | null {
  const pack = STGTXT_BY_ROUTE[route];
  return pack && TH08_STGTXT[pack] ? pack : null;
}

/**
 * Decoded VM words per `pack:script`, built on first ask.
 *
 * The bytecode is thirty-odd short blobs and a card re-runs the same four scripts
 * every stage, so decoding once per id keeps `scriptFor` allocation-free on the
 * frame path.
 */
const wordCache = new Map<string, Int32Array | null>();

/** The ANM words for one title-card script, or null when the id is unused. */
export function stageTitleScript(pack: string, script: number): Int32Array | null {
  const cacheKey = pack + ':' + script;
  if (wordCache.has(cacheKey)) return wordCache.get(cacheKey) ?? null;
  const b64 = stgtxtBytes(pack, script);
  let words: Int32Array | null = null;
  if (b64) {
    try {
      words = anmScriptFromBase64(b64);
    } catch {
      words = null;
    }
  }
  wordCache.set(cacheKey, words);
  return words;
}

/**
 * Load and register every title-card cell.
 *
 * Returns the number of textures published, which is zero when the extracted art
 * is absent; the overlay treats a missing cell as "draw nothing", exactly as the
 * face cut-in does.
 */
export async function registerTH08StageTitles(renderer: PixiRenderer): Promise<number> {
  let total = 0;
  for (const [pack, data] of Object.entries(TH08_STGTXT)) {
    // Every shipped `stgNNtxt` is one 512x256 page, which the lift records on the
    // pack; cells that name another page are skipped rather than guessed at.
    const cells = data.cells
      .filter((cell) => cell.tex === 0)
      .map((cell) => ({ id: cell.id, x: cell.x, y: cell.y, w: cell.w, h: cell.h }));
    const sliced = await sliceAnmPage(data.page, cells);
    for (const [id, texture] of sliced) {
      renderer.assets.register(stageTitleKey(pack, id), texture);
      total++;
    }
  }
  return total;
}
