/**
 * Publish the original face art to the renderer so the spell-card cut-in can
 * draw it.
 *
 * Only page 0 of each ANM is loaded: that is the full-body art, which is the
 * one 永夜抄 slides in when a card is declared. The dialogue busts stay on the
 * DOM side of the fence, where `th08-face-art.ts` hands the browser a plain URL.
 */

import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import type { MemberId } from '../../../touhou-common/player/CharacterProfile';
import type { StageRoute } from '../StageRoute';
import { loadAnmPage } from './anm-atlas';
import { FACE_ASSET_DIR, MEMBER_FACE_ANM, ROUTE_BOSS_FACE, ROUTE_MIDBOSS_FACE } from './th08-face-art';

/** Renderer key for page 0 of a face ANM. */
export function faceKey(anm: string, page = 0): string {
  return 'th08:face:' + anm + ':' + page;
}

/** Cut-in art key for the member currently flying, or undefined without art. */
export function memberFaceKey(member: MemberId): string | undefined {
  const anm = MEMBER_FACE_ANM[member];
  return anm ? faceKey(anm) : undefined;
}

/** Cut-in art key for a route's boss (or its mid-boss), if that ANM was loaded. */
export function bossFaceKey(route: StageRoute, mid = false): string | undefined {
  const anm = mid ? ROUTE_MIDBOSS_FACE[route] : ROUTE_BOSS_FACE[route];
  return anm ? faceKey(anm) : undefined;
}

/** Every face ANM whose page 0 the cut-in can ask for. */
function faceAnms(): string[] {
  const anms = new Set<string>(Object.values(MEMBER_FACE_ANM));
  for (const anm of Object.values(ROUTE_BOSS_FACE)) anms.add(anm);
  for (const anm of Object.values(ROUTE_MIDBOSS_FACE)) anms.add(anm);
  return [...anms];
}

/**
 * Load and register the face pages. Missing files are skipped, so a checkout
 * without the extracted originals just loses the cut-in instead of failing.
 */
export async function registerTH08Faces(renderer: PixiRenderer): Promise<number> {
  const pages = await Promise.all(
    faceAnms().map(async (anm) => {
      const texture = await loadAnmPage(FACE_ASSET_DIR + '/' + anm + '_t0.png');
      return texture ? ([anm, texture] as const) : null;
    }),
  );
  let total = 0;
  for (const page of pages) {
    if (!page) continue;
    renderer.assets.register(faceKey(page[0]), page[1]);
    total++;
  }
  return total;
}
