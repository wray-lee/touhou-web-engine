/**
 * Lift every `stgNNenm.anm` pack into TS data, the same way generate.mjs does
 * for `enemy.anm`.
 *
 * ECL ops 58..61 address the *stage* enemy pack (`EnemyManager+0x9dcef0`,
 * `EclRunLow.inl:723-746`), not `enemy.anm`. Before this file existed those
 * script ids were resolved against the common fairy atlas, which is why bosses
 * came out showing a mostly-empty cell.
 */
import fs from 'fs';
import path from 'path';
import { decodeSpriteCycle, scriptBuffer } from './decode.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const MANIFEST = path.join(ROOT, 'public/assets/th08/manifest.json');
const OUT = path.join(ROOT, 'src/games/th08/data/th08-stgenm-anm.ts');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const names = Object.keys(manifest.anm)
  .filter((n) => /^stg\d+[ab]?enm$/.test(n))
  .sort();

/** Lift one pack into { pageOf, scripts, bytes }. */
function lift(name) {
  const anm = manifest.anm[name];
  const maxId = Math.max(...anm.sprites.map((s) => s.id));
  const pageOf = new Array(maxId + 1).fill(null);
  for (const s of anm.sprites) {
    const tex = anm.textures[s.tex] ?? anm.textures[0];
    pageOf[s.id] = `${name}_t${s.tex}`;
  }
  const byId = new Map(anm.scripts.map((s) => [s.id, s]));
  const maxScriptId = Math.max(...anm.scripts.map((s) => s.id));
  const scripts = [];
  const bytes = [];
  for (let id = 0; id <= maxScriptId; id++) {
    const script = byId.get(id);
    if (!script) {
      scripts.push({ frames: [], total: 0 });
      bytes.push(null);
      continue;
    }
    scripts.push(toScript(script.base64, anm.sprites.length));
    bytes.push(script.base64);
  }
  return { pageOf, scripts, bytes };
}

/** Convert a lifted sprite cycle into a frame table with per-frame durations. */
function toScript(b64, spriteCount) {
  const { frames, starts } = decodeSpriteCycle(scriptBuffer(b64), spriteCount);
  if (frames.length === 0) return { frames: [], total: 0 };
  const steps = [];
  for (let i = 0; i + 1 < starts.length; i++) steps.push(Math.max(1, starts[i + 1] - starts[i]));
  const tail = steps.length > 0 ? steps[steps.length - 1] : 4;
  steps.push(tail);
  const out = frames.map((sprite, i) => ({ sprite, duration: steps[i] }));
  const held = [];
  for (const frame of out) {
    const last = held[held.length - 1];
    if (last && last.sprite === frame.sprite) last.duration += frame.duration;
    else held.push({ ...frame });
  }
  return { frames: held, total: held.reduce((sum, f) => sum + f.duration, 0) };
}

const packs = names.map((name) => ({ name, ...lift(name) }));

const lines = [];
lines.push('/**');
lines.push(' * Generated from public/assets/th08/manifest.json (stgNNenm.anm) by');
lines.push(' * tools/th08/anm/generate-stgenm.mjs. Do not edit by hand.');
lines.push(' *');
lines.push(' * Per-stage enemy/boss animation: the ANM script ids ECL ops 58..61 name');
lines.push(' * live here, not in `enemy.anm`. `pageOf[sprite]` is the atlas page key the');
lines.push(' * renderer already registers as `enemy:stage-<page>:<sprite>`.');
lines.push(' */');
lines.push('');
lines.push("import type { EnemyAnimation } from './th08-enemy-anm';");
lines.push('');
lines.push('/** One lifted `stgNNenm.anm` pack. */');
lines.push('export interface StgenmPack {');
lines.push('  /** Atlas page key per sprite id (`stg5enm_t1`), null when the id is unused. */');
lines.push('  readonly pageOf: readonly (string | null)[];');
lines.push('  /** Lifted sprite cycle per ANM script id. */');
lines.push('  readonly scripts: readonly EnemyAnimation[];');
lines.push('  /** Raw VM bytecode per ANM script id, null when the id is unused. */');
lines.push('  readonly bytes: readonly (string | null)[];');
lines.push('}');
lines.push('');
lines.push('export const TH08_STGENM: Readonly<Record<string, StgenmPack>> = {');
for (const pack of packs) {
  lines.push(`  ${pack.name}: {`);
  lines.push('    pageOf: [');
  lines.push('      ' + pack.pageOf.map((p) => (p ? `'${p}'` : 'null')).join(', '));
  lines.push('    ],');
  lines.push('    scripts: [');
  for (const script of pack.scripts) {
    if (script.frames.length === 0) {
      lines.push('      { frames: [], total: 0 },');
      continue;
    }
    const body = script.frames.map((f) => `{sprite: ${f.sprite}, duration: ${f.duration}}`).join(', ');
    lines.push(`      { frames: [${body}], total: ${script.total} },`);
  }
  lines.push('    ],');
  lines.push('    bytes: [');
  pack.bytes.forEach((b64, i) => {
    lines.push(b64 ? `      '${b64}', // ${i}` : `      null, // ${i}`);
  });
  lines.push('    ],');
  lines.push('  },');
}
lines.push('};');
lines.push('');
lines.push('/**');
lines.push(' * Which `stgNNenm.anm` a campaign route draws from. The pack follows the');
lines.push(' * ECL index, so 6A is `stg6enm` and the true finale 6B is `stg7enm`');
lines.push(' * (same pairing as `STD_KEY_BY_ROUTE`).');
lines.push(' */');
lines.push('export const STGENM_BY_ROUTE: Readonly<Record<string, string>> = {');
lines.push("  stage1: 'stg1enm',");
lines.push("  stage2: 'stg2enm',");
lines.push("  stage3: 'stg3enm',");
lines.push("  stage4a: 'stg4aenm',");
lines.push("  stage4b: 'stg4benm',");
lines.push("  stage5: 'stg5enm',");
lines.push("  stage6a: 'stg6enm',");
lines.push("  stage6b: 'stg7enm',");
lines.push('};');
lines.push('');
lines.push('');
lines.push('/**');
lines.push(' * The atlas cell one stage-pack script shows `age` frames after the spawn.');
lines.push(' * Only used when a slot has no VM to run (a stage pack that failed to load).');
lines.push(' */');
lines.push('export function stgenmAnimCell(');
lines.push('  name: string,');
lines.push('  script: number,');
lines.push('  age: number,');
lines.push('): number | null {');
lines.push('  const pack = TH08_STGENM[name];');
lines.push('  const anim = pack?.scripts[script];');
lines.push('  if (!anim || anim.total === 0) return null;');
lines.push('  let tick = age % anim.total;');
lines.push('  for (const frame of anim.frames) {');
lines.push('    if (tick < frame.duration) return pack.pageOf[frame.sprite] ? frame.sprite : null;');
lines.push('    tick -= frame.duration;');
lines.push('  }');
lines.push('  return null;');
lines.push('}');
lines.push('');
lines.push('/** The raw VM bytecode of one stage-pack script, or null when the id is unused. */');
lines.push('export const stgenmBytes = (name: string, script: number): string | null =>\n');
lines.push('  TH08_STGENM[name]?.bytes[script] ?? null;\n');
lines.push('');
lines.push('/** The atlas page a stage-pack sprite id lives on, or null when the id is unused. */');
lines.push('export const stgenmPageOf = (name: string, sprite: number): string | null =>');
lines.push('  TH08_STGENM[name]?.pageOf[sprite] ?? null;');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(
  'wrote',
  path.relative(ROOT, OUT),
  packs.map((p) => `${p.name}(${p.scripts.length}s/${p.pageOf.filter(Boolean).length}c)`).join(' '),
);
