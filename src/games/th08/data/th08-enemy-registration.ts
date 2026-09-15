/**
 * Register the original TH08 enemy and boss art extracted from `enemy.anm`.
 *
 * The runtime never interprets ANM: tools/th08/anm/generate.mjs lifted every
 * script into a sprite cycle (src/games/th08/data/th08-enemy-anm.ts), so here we
 * only cut the atlas cells out of the texture page and publish them under the
 * names EclAdapter asks for.
 */

import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import { sliceAnmPage } from './anm-atlas';
import { TH08_ENEMY_ANM_PAGE, TH08_ENEMY_ANM_RECTS } from './th08-enemy-anm';
import { TH08_STAGE_ENEMY_SPRITES } from './th08-enemy-sprites';

/**
 * Sprite id -> the registered cell key, per stage pack.
 *
 * `TH08_STAGE_ENEMY_SPRITES` is keyed by pbg entry, so a one-texture pack is
 * plain `stg1enm` while a two-texture pack splits into `stg5enm_t0` and
 * `stg5enm_t1`. The ANM scripts only know sprite ids, so the split is resolved
 * here once at module load instead of guessed from the name.
 */
const STAGE_CELL_KEYS: ReadonlyMap<string, ReadonlyMap<number, string>> = (() => {
  const byPack = new Map<string, Map<number, string>>();
  for (const [key, data] of Object.entries(TH08_STAGE_ENEMY_SPRITES)) {
    const pack = key.replace(/_t\d+$/, '');
    let cells = byPack.get(pack);
    if (!cells) byPack.set(pack, (cells = new Map()));
    for (const frame of data.frames) cells.set(frame.id, key + ':' + frame.id);
  }
  return byPack;
})();

/**
 * The registered asset suffix for one cell of a stage pack, or null when the
 * pack or the id is unknown. Callers prefix it with `enemy:stage-`.
 */
export function stageEnemyCellKey(pack: string, sprite: number): string | null {
  return STAGE_CELL_KEYS.get(pack)?.get(sprite) ?? null;
}

/**
 * Register common enemy and boss cells plus the per-stage prop atlases.
 *
 * Enemy animation is driven from the sim: EclAdapter resolves
 * (anmScript, slot timer) to a cell id and asks for `enemy:<cell>`.
 * Returns the number of textures registered.
 */
export async function registerTH08EnemySprites(renderer: PixiRenderer): Promise<number> {
  const cells = TH08_ENEMY_ANM_RECTS.map((rect, id) => (rect ? { id, ...rect } : null)).filter(
    (cell): cell is { id: number; x: number; y: number; w: number; h: number } => cell !== null,
  );

  let total = 0;
  const enemy = await sliceAnmPage(TH08_ENEMY_ANM_PAGE, cells);
  for (const [id, texture] of enemy) {
    renderer.assets.register('enemy:' + id, texture);
    total++;
  }

  for (const [key, data] of Object.entries(TH08_STAGE_ENEMY_SPRITES)) {
    const stageCells = data.frames.map((frame) => ({
      id: frame.id,
      x: frame.x,
      y: frame.y,
      w: frame.w,
      h: frame.h,
    }));
    const sliced = await sliceAnmPage(data.atlas, stageCells);
    for (const [id, texture] of sliced) {
      renderer.assets.register('enemy:stage-' + key + ':' + id, texture);
      total++;
    }
  }

  return total;
}
