/**
 * Lift the extracted `etama.anm` pack into the bullet tables the game needs.
 *
 * Retail keeps one template ANM VM per bullet type (`g_BulletSpriteScripts`,
 * BulletManager.cpp:314-322) and derives the sprite plus a size class from the
 * sprite that script selects (BulletManager.cpp:1633-1714, byte 0xd42, which the
 * update loop uses to chain bullets into per-size collision buckets). Doing the
 * same offline means the browser only has to index a table.
 */
import fs from 'fs';
import path from 'path';
import { decodeSpriteCycle, scriptBuffer } from './decode.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/assets/th08/manifest.json'), 'utf8'));
const etama = manifest.anm.etama;
const OUT = path.join(ROOT, 'src/games/th08/data/th08-etama-anm.ts');

/**
 * `g_BulletSpriteScripts[21]`: the five ANM script indices each bullet type
 * hands to its template VMs — main sprite, late-turn, laser, and two tails.
 */
const BULLET_SCRIPTS = [
  [0, 18, 19, 20, 15], [1, 21, 22, 23, 16], [2, 21, 22, 23, 16],
  [3, 21, 22, 23, 16], [4, 21, 22, 23, 16], [5, 21, 22, 23, 16],
  [6, 21, 22, 23, 16], [7, 24, 24, 24, 17], [8, 24, 24, 24, 17],
  [9, 24, 24, 24, 17], [25, 27, 27, 27, 26], [106, 21, 22, 23, 16],
  [107, 21, 22, 23, 16], [108, 21, 22, 23, 16], [109, 24, 24, 24, 17],
  [110, 24, 24, 24, 17], [111, 21, 22, 23, 16], [112, 21, 22, 23, 16],
  [113, 24, 24, 24, 17], [114, 24, 24, 24, 17], [115, 24, 24, 24, 17],
];

/** Sprite id -> atlas cell, keyed by the global id the extractor assigned. */
const cells = new Array(Math.max(...etama.sprites.map((s) => s.id)) + 1).fill(null);
for (const s of etama.sprites) {
  cells[s.id] = { page: s.tex, x: Math.round(s.x), y: Math.round(s.y), w: Math.round(s.w), h: Math.round(s.h) };
}

/** First sprite the script selects, which is the template VM base sprite. */
function baseSprite(scriptIndex) {
  const script = etama.scripts[scriptIndex];
  if (!script) return null;
  const { frames } = decodeSpriteCycle(scriptBuffer(script.base64), cells.length);
  return frames.length > 0 ? frames[0] : null;
}

/**
 * `BulletManager_Init` picks the sprite half-extent and the collision bucket from
 * the template sprite height; the small and mid branches also key off the index.
 */
function sizesFor(height, scriptIndex) {
  if (height <= 8) return { drawOffset: 4, bucket: 5 };
  if (height <= 16) {
    if ([2, 111, 112, 4, 6, 106, 107, 108].includes(scriptIndex)) return { drawOffset: 4, bucket: 4 };
    if (scriptIndex === 5) return { drawOffset: 4, bucket: 4 };
    return { drawOffset: 6, bucket: 3 };
  }
  if (height <= 32) {
    if ([8, 113, 114, 115].includes(scriptIndex)) return { drawOffset: 5, bucket: 2 };
    return { drawOffset: scriptIndex === 9 || [109, 110].includes(scriptIndex) ? 8 : 10, bucket: 1 };
  }
  return { drawOffset: 24, bucket: 0 };
}

const types = BULLET_SCRIPTS.map((scripts) => {
  const scriptIndex = scripts[0];
  const base = baseSprite(scriptIndex);
  const cell = base === null ? null : cells[base];
  const { drawOffset, bucket } = sizesFor(cell ? cell.h : 16, scriptIndex);
  return { baseSprite: base === null ? 0 : base, scriptIndex, drawOffset, bucket };
});

/**
 * Lasers skip the type table entirely: `SpawnLaserPattern` hands
 * `descriptor->bulletType + 10` straight to `SetAndExecuteScriptIdx`
 * (`BulletManager.cpp:726`), so the laser body is the first sprite of ANM script
 * `type + 10`, plus the colour index. EoSD's stage scripts only ever use types
 * 0..4, which land on scripts 10..14.
 */
const LASER_SCRIPT_BASE = 10;
const LASER_TYPE_COUNT = 6;
const laserTypes = [];
for (let type = 0; type < LASER_TYPE_COUNT; type++) {
  const scriptIndex = LASER_SCRIPT_BASE + type;
  const base = baseSprite(scriptIndex);
  laserTypes.push({ type, scriptIndex, baseSprite: base === null ? 0 : base });
}

const pages = etama.textures.map((t) => '"/assets/th08/anm/' + t.file + '"');
const L = [];
L.push('/**');
L.push(' * Generated from public/assets/th08/manifest.json (etama.anm) by');
L.push(' * tools/th08/anm/generate-etama.mjs. Do not edit by hand.');
L.push(' *');
L.push(' * Bullet art in EoSD is addressed by `(bulletType, color)`: the type picks a');
L.push(' * template ANM script whose first sprite is the base, and the colour index is');
L.push(' * added to it (`BulletManager::FUN_0042f5f0`).');
L.push(' */');
L.push('');
L.push('/** Texture pages, indexed by the sprite cells below. */');
L.push('export const TH08_ETAMA_PAGES: readonly string[] = [');
L.push('  ' + pages.join(', ') + ',');
L.push('];');
L.push('');
L.push('/** One atlas cell: a rect on one of the pages. */');
L.push('export interface EtamaCell {');
L.push('  readonly page: number;');
L.push('  readonly x: number;');
L.push('  readonly y: number;');
L.push('  readonly w: number;');
L.push('  readonly h: number;');
L.push('}');
L.push('');
L.push('/** Sprite id -> cell, the same numbering the ANM scripts address. */');
L.push('export const TH08_ETAMA_CELLS: readonly (EtamaCell | null)[] = [');
for (let i = 0; i < cells.length; i++) {
  const c = cells[i];
  L.push('  ' + (c ? `{ p:${c.page}, x:${c.x}, y:${c.y}, w:${c.w}, h:${c.h} }`.replace('{ p:', '{ page:').replace(/\bpage:(\d+)/, 'page: $1') : 'null') + ',');
}
L.push('];');
L.push('');
L.push('/**');
L.push(' * One ECL bullet type: the template script, the sprite it selects, and the two');
L.push(' * size numbers retail derived from that sprite height.');
L.push(' */');
L.push('export interface BulletTypeDef {');
L.push('  readonly script: number;');
L.push('  readonly baseSprite: number;');
L.push('  /** Half of the drawn sprite in pixels: where retail anchors it. */');
L.push('  readonly drawOffset: number;');
L.push('  /** `bullet+0xd42` size class, 0 (largest) .. 5 (smallest). */');
L.push('  readonly bucket: number;');
L.push('}');
L.push('');
L.push('export const TH08_BULLET_TYPES: readonly BulletTypeDef[] = [');
for (const t of types) {
  L.push(
    `  { script: ${t.scriptIndex}, baseSprite: ${t.baseSprite}, drawOffset: ${t.drawOffset}, bucket: ${t.bucket} },`,
  );
}
L.push('];');
L.push('');
L.push('/** `g_BulletSpriteScripts`: five template VM scripts per bullet type. */');
L.push('export const TH08_BULLET_SCRIPTS: readonly (readonly number[])[] = [');
for (const row of BULLET_SCRIPTS) L.push('  [' + row.join(', ') + '],');
L.push('];');
L.push('');
L.push('/**');
L.push(' * One ECL laser type: the ANM script `SpawnLaserPattern` runs, and the sprite');
L.push(' * that script selects before the colour index is added.');
L.push(' */');
L.push('export interface LaserTypeDef {');
L.push('  readonly script: number;');
L.push('  readonly baseSprite: number;');
L.push('}');
L.push('');
L.push('export const TH08_LASER_TYPES: readonly LaserTypeDef[] = [');
for (const t of laserTypes) {
  L.push(`  { script: ${t.scriptIndex}, baseSprite: ${t.baseSprite} },`);
}
L.push('];');
L.push('');
L.push('/** Highest sprite id, so callers can clamp before indexing. */');
L.push('export const TH08_ETAMA_SPRITE_COUNT = ' + cells.length + ';');
L.push('');
fs.writeFileSync(OUT, L.join('\n'));
console.log('wrote', path.relative(ROOT, OUT), types.length, 'types,', cells.length, 'cells');
console.log(types.map((t, i) => i + ':' + t.baseSprite + '/d' + t.drawOffset + '/b' + t.bucket).join(' '));
console.log('lasers', laserTypes.map((t) => t.type + ':script' + t.scriptIndex + '/sprite' + t.baseSprite).join(' '));
