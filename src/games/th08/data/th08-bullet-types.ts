/**
 * ECL bullet type + colour -> the etama cell to draw, addressed the way retail
 * addresses it: the type selects a template ANM script whose first sprite is the
 * base cell, and the colour index is added to it
 * (`BulletManager::FUN_0042f5f0`). `tools/th08/anm/generate-etama.mjs` lifted
 * both halves of that from `etama.anm`, so nothing here is guessed.
 */
import {
  TH08_BULLET_TYPES,
  TH08_ETAMA_CELLS,
  TH08_ETAMA_SPRITE_COUNT,
  TH08_LASER_TYPES,
  type BulletTypeDef,
} from './th08-etama-anm';

/** Template entry for one ECL bullet type, or the pellet when out of range. */
export function bulletTypeOf(type: number): BulletTypeDef {
  return TH08_BULLET_TYPES[type] ?? TH08_BULLET_TYPES[0];
}

/** Etama sprite id for a bullet, clamped to the atlas. */
export function getEtamaSpriteId(type: number, color: number): number {
  const id = bulletTypeOf(type).baseSprite + Math.max(0, color | 0);
  return Math.min(TH08_ETAMA_SPRITE_COUNT - 1, id);
}

/** Half the drawn sprite, in playfield pixels: 8x8 pellet -> 4, 32 rice -> 16. */
export function getBulletDrawRadius(type: number, color: number): number {
  const cell = TH08_ETAMA_CELLS[getEtamaSpriteId(type, color)];
  return cell ? Math.max(cell.w, cell.h) / 2 : bulletTypeOf(type).drawOffset;
}

/**
 * Collision radius for a bullet type.
 *
 * Retail chains bullets into per-size buckets (`bullet+0xd42`) and keeps the
 * circle it tests somewhere inside the drawn sprite, which the decompile does
 * not name. EoSD's feel is a small core, so the radius tracks the drawn size at
 * a little under half and never exceeds 6px, which is what makes hugging the
 * 48px eyeballs possible.
 */
export function getBulletHitRadius(type: number): number {
  const { drawOffset } = bulletTypeOf(type);
  return Math.max(2, Math.min(6, Math.round(drawOffset * 0.45)));
}

/**
 * Asset key for the sliced cell, matching the names
 * `th08-bullet-registration.ts` publishes.
 */
export function getBulletTextureKey(type: number, color: number): string {
  const id = getEtamaSpriteId(type, color);
  const page = TH08_ETAMA_CELLS[id]?.page ?? 0;
  return 'th08:bullet:etama_t' + page + ':' + id;
}

/**
 * Etama sprite id for a laser body. `SpawnLaserPattern` skips the bullet type
 * table and runs ANM script `bulletType + 10` instead, then adds the colour index
 * to whatever sprite that script selected (`BulletManager.cpp:726-727`).
 */
export function getLaserSpriteId(type: number, color: number): number {
  const def = TH08_LASER_TYPES[type] ?? TH08_LASER_TYPES[0];
  return Math.min(TH08_ETAMA_SPRITE_COUNT - 1, def.baseSprite + Math.max(0, color | 0));
}

/** Asset key for a laser's body cell, in the same naming as ordinary bullets. */
export function getLaserTextureKey(type: number, color: number): string {
  const id = getLaserSpriteId(type, color);
  const page = TH08_ETAMA_CELLS[id]?.page ?? 0;
  return 'th08:bullet:etama_t' + page + ':' + id;
}
