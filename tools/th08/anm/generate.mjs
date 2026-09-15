/**
 * Turn the extracted `enemy.anm` pack into TS data for the game.
 *
 * The manifest (tools/th08/extract.mjs) already carries the real sprite rects and
 * the raw script bytecode; this lifts the bytecode into declarative sprite cycles
 * so the runtime never has to interpret ANM.
 */
import fs from 'fs';
import path from 'path';
import { decodeSpriteCycle, scriptBuffer } from './decode.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const MANIFEST = path.join(ROOT, 'public/assets/th08/manifest.json');
const OUT = path.join(ROOT, 'src/games/th08/data/th08-enemy-anm.ts');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const anm = manifest.anm.enemy;
const spriteCount = anm.sprites.length;

/** Highest sprite id, used to size the lookup tables. */
const maxId = Math.max(...anm.sprites.map((s) => s.id));
const rects = new Array(maxId + 1).fill(null);
for (const s of anm.sprites) {
  rects[s.id] = {
    x: Math.round(s.x),
    y: Math.round(s.y),
    w: Math.round(s.w),
    h: Math.round(s.h),
  };
}

/**
 * Convert the flat (sprite, startTick) cycle the decoder lifted into a
 * frame table with explicit per-frame durations plus the loop length.
 */
function toScript(bytes) {
  const { frames, starts } = decodeSpriteCycle(scriptBuffer(bytes), spriteCount);
  if (frames.length === 0) return { frames: [], total: 0 };
  const steps = [];
  for (let i = 0; i + 1 < starts.length; i++) steps.push(Math.max(1, starts[i + 1] - starts[i]));
  // The tail keeps the last observed cadence, which is what the original loop does.
  const tail = steps.length > 0 ? steps[steps.length - 1] : 4;
  steps.push(tail);
  const out = frames.map((sprite, i) => ({ sprite, duration: steps[i] }));
  // Collapse consecutive duplicates produced by hold instructions.
  const held = [];
  for (const frame of out) {
    const last = held[held.length - 1];
    if (last && last.sprite === frame.sprite) last.duration += frame.duration;
    else held.push({ ...frame });
  }
  return { frames: held, total: held.reduce((sum, f) => sum + f.duration, 0) };
}

const byId = new Map(anm.scripts.map((s) => [s.id, s]));
const maxScriptId = Math.max(...anm.scripts.map((s) => s.id));
const scripts = [];
/** Raw VM bytecode per script id, so the runtime `AnmVm` can run it unchanged. */
const rawScripts = [];
for (let id = 0; id <= maxScriptId; id++) {
  const script = byId.get(id);
  scripts.push(script ? toScript(script.base64) : { frames: [], total: 0 });
  rawScripts.push(script ? script.base64 : '');
}

const page = anm.textures[0].file;
const lines = [];
lines.push('/**');
lines.push(' * Generated from public/assets/th08/manifest.json (enemy.anm) by');
lines.push(' * tools/th08/anm/generate.mjs. Do not edit by hand.');
lines.push(' */');
lines.push('');
lines.push('/** Texture page the enemy art lives on. */');
lines.push(`export const TH08_ENEMY_ANM_PAGE = '/assets/th08/anm/${page}';`);
lines.push('');
lines.push('/** One cell of the enemy atlas, in page pixels. */');
lines.push('export interface EnemyAnimRect {');
lines.push('  readonly x: number;');
lines.push('  readonly y: number;');
lines.push('  readonly w: number;');
lines.push('  readonly h: number;');
lines.push('}');
lines.push('');
lines.push('/** One frame of an enemy animation. */');
lines.push('export interface EnemyAnimationFrame {');
lines.push('  /** Sprite id within the atlas. */');
lines.push('  readonly sprite: number;');
lines.push('  /** Frames this cell stays on screen. */');
lines.push('  readonly duration: number;');
lines.push('}');
lines.push('');
lines.push('/** A lifted ANM script: the sprite cycle plus its loop length. */');
lines.push('export interface EnemyAnimation {');
lines.push('  readonly frames: readonly EnemyAnimationFrame[];');
lines.push('  /** Total frames of one loop; 0 when the script draws nothing. */');
lines.push('  readonly total: number;');
lines.push('}');
lines.push('');
lines.push(`/** Atlas cells indexed by ANM sprite id (0..${maxId}); null when the id is unused. */`);
lines.push('export const TH08_ENEMY_ANM_RECTS: readonly (EnemyAnimRect | null)[] = [');
rects.forEach((r, i) => {
  lines.push(r ? `  { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h} }, // ${i}` : '  null, // ' + i);
});
lines.push('];');
lines.push('');
lines.push('/** Animations indexed by the ECL ANM script number. */');
lines.push('export const TH08_ENEMY_ANM_SCRIPTS: readonly EnemyAnimation[] = [');
for (const script of scripts) {
  if (script.frames.length === 0) {
    lines.push('  { frames: [], total: 0 },');
    continue;
  }
  const body = script.frames.map((f) => `{sprite: ${f.sprite}, duration: ${f.duration}}`).join(', ');
  lines.push(`  { frames: [${body}], total: ${script.total} },`);
}
lines.push('];');
lines.push('');
lines.push('/**');
lines.push(' * The untouched VM bytecode of each script, base64-encoded and indexed by script');
lines.push(' * number. `AnmVm` runs these directly, which is what gives enemies their real');
lines.push(' * movement: the sprite cycle above only says which cell to show.');
lines.push(' */');
lines.push('export const TH08_ENEMY_ANM_BYTES: readonly (string | null)[] = [');
rawScripts.forEach((b64, i) => {
  lines.push(b64 ? `  '${b64}', // ${i}` : '  null, // ' + i);
});
lines.push('];');
lines.push('');
lines.push('/** The untouched bytecode of one script, or null when the id is unused. */');
lines.push('export const enemyAnmBytes = (script: number): string | null =>');
lines.push('  TH08_ENEMY_ANM_BYTES[script] ?? null;');
lines.push('');
lines.push('/**');
lines.push(' * The atlas cell an ECL ANM script shows `age` frames after the enemy spawned.');
lines.push(' * Returns null when the script is unknown or draws nothing.');
lines.push(' */');
lines.push('export function enemyAnimCell(script: number, age: number): number | null {');
lines.push('  const anim = TH08_ENEMY_ANM_SCRIPTS[script];');
lines.push('  if (!anim || anim.total === 0) return null;');
lines.push('  let tick = age % anim.total;');
lines.push('  for (const frame of anim.frames) {');
lines.push('    if (tick < frame.duration) return TH08_ENEMY_ANM_RECTS[frame.sprite] ? frame.sprite : null;');
lines.push('    tick -= frame.duration;');
lines.push('  }');
lines.push('  return null;');
lines.push('}');
lines.push('');
lines.push('/** Page rect for an atlas cell. */');
lines.push('export function enemyAnimRect(sprite: number): EnemyAnimRect | null {');
lines.push('  return TH08_ENEMY_ANM_RECTS[sprite] ?? null;');
lines.push('}');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
const drawn = scripts.filter((s) => s.total > 0).length;
console.log(
  'wrote',
  path.relative(ROOT, OUT),
 `rects=${rects.filter(Boolean).length} scripts=${scripts.length} animated=${drawn}`,
);
