/**
 * Lift every `stgNNtxt.anm` pack into TS data.
 *
 * These are the retail stage-title cards: `Gui.cpp:2307` runs scripts 0..3 on
 * `Gui::Impl::vm2a44[0..3]` the moment a stage loads, and `Gui.cpp:766-770`
 * re-runs script 3 with sprite `arg+3` whenever a msg op 7 changes the stage
 * music. The four sprites are the stage number, the stage name, the poem, and
 * the boss line that slides in from the right; the motion is real ANM
 * bytecode, so the card fades and moves exactly where ZUN put it.
 */
import fs from 'fs';
import path from 'path';
import { scriptBuffer } from './decode.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const MANIFEST = path.join(ROOT, 'public/assets/th08/manifest.json');
const OUT = path.join(ROOT, 'src/games/th08/data/th08-stgtxt-anm.ts');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const names = Object.keys(manifest.anm)
  .filter((n) => /^stg\d+[ab]?txt$/.test(n))
  .sort();

/** The last instruction time in a script, which is how long the card lives. */
function scriptLength(b64) {
  const buf = scriptBuffer(b64);
  let cursor = 0;
  let last = 0;
  let guard = 0;
  while (cursor + 8 <= buf.length && guard++ < 512) {
    const size = buf.readUInt16LE(cursor + 2);
    const time = buf.readInt16LE(cursor + 4);
    if (!size || cursor + size > buf.length) break;
    last = Math.max(last, time);
    cursor += size;
  }
  return last;
}

const packs = names.map((name) => {
  const anm = manifest.anm[name];
  const texCount = anm.textures.length;
  // Every shipped title pack has exactly one page; the cells carry their own page
  // index, so the URL is read out of the manifest rather than guessed from the name.
  const page = '/assets/th08/anm/' + (anm.textures[0]?.file ?? name + '_t0.png');
  const cells = anm.sprites.map((s) => ({
    id: s.id,
    tex: s.tex ?? 0,
    x: s.x,
    y: s.y,
    w: s.w,
    h: s.h,
  }));
  const byId = new Map(anm.scripts.map((s) => [s.id, s]));
  const maxScriptId = Math.max(...anm.scripts.map((s) => s.id));
  const scripts = [];
  for (let id = 0; id <= maxScriptId; id++) {
    const script = byId.get(id);
    scripts.push(script ? { id, b64: script.base64, length: scriptLength(script.base64) } : null);
  }
  return { name, texCount, page, cells, scripts };
});

const lines = [];
lines.push('/**');
lines.push(' * Generated from public/assets/th08/manifest.json (stgNNtxt.anm) by');
lines.push(' * tools/th08/anm/generate-stgtxt.mjs. Do not edit by hand.');
lines.push(' *');
lines.push(' * The retail stage-title card. `Gui.cpp:2307` runs scripts 0..3 of this pack');
lines.push(' * on `Gui::Impl::vm2a44[0..3]` as a stage loads, and `Gui.cpp:766-770` re-runs');
lines.push(' * script 3 with sprite `arg+3` on every msg op 7. The bytecode is kept as-is');
lines.push(' * so `AnmVm` can play it; `length` is the last instruction time, which is how');
lines.push(' * long the card holds before its own `Delete` retires it.');
lines.push(' */');
lines.push('');
lines.push('/** One atlas cell of a stage-text pack, addressed by its ANM sprite id. */');
lines.push('export interface StgtxtCell {');
lines.push('  readonly id: number;');
lines.push('  /** Which page of the pack the rect lives on. */');
lines.push('  readonly tex: number;');
lines.push('  readonly x: number;');
lines.push('  readonly y: number;');
lines.push('  readonly w: number;');
lines.push('  readonly h: number;');
lines.push('}');
lines.push('');
lines.push('/** One script of a stage-text pack: raw VM words plus its own lifetime. */');
lines.push('export interface StgtxtScript {');
lines.push('  readonly id: number;');
lines.push('  readonly base64: string;');
lines.push('  /** Last instruction time in ANM ticks, which is when the script deletes itself. */');
lines.push('  readonly length: number;');
lines.push('}');
lines.push('');
lines.push('/** One lifted `stgNNtxt.anm` pack. */');
lines.push('export interface StgtxtPack {');
lines.push('  /** URL of page 0, the only page any shipped title pack uses. */');
lines.push('  readonly page: string;');
lines.push('  readonly cells: readonly StgtxtCell[];');
lines.push('  readonly scripts: readonly (StgtxtScript | null)[];');
lines.push('}');
lines.push('');
lines.push('export const TH08_STGTXT: Readonly<Record<string, StgtxtPack>> = {');
for (const pack of packs) {
  lines.push(`  ${pack.name}: {`);
  lines.push(`    page: '${pack.page}',`);
  lines.push('    cells: [');
  for (const cell of pack.cells) {
    lines.push(
      `      { id: ${cell.id}, tex: ${cell.tex}, x: ${cell.x}, y: ${cell.y}, w: ${cell.w}, h: ${cell.h} },`,
    );
  }
  lines.push('    ],');
  lines.push('    scripts: [');
  for (const script of pack.scripts) {
    lines.push(
      script
        ? `      { id: ${script.id}, base64: '${script.b64}', length: ${script.length} }, // ${script.id}`
        : `      null, // ${String(script?.id)}`,
    );
  }
  lines.push('    ],');
  lines.push('  },');
}
lines.push('};');
lines.push('');
lines.push('/**');
lines.push(' * Which `stgNNtxt.anm` a campaign route shows. Same ecldata pairing as');
lines.push(' * `STGENM_BY_ROUTE`: 6A is `stg6txt` and the true finale 6B is `stg7txt`.');
lines.push(' */');
lines.push('export const STGTXT_BY_ROUTE: Readonly<Record<string, string>> = {');
lines.push("  stage1: 'stg1txt',");
lines.push("  stage2: 'stg2txt',");
lines.push("  stage3: 'stg3txt',");
lines.push("  stage4a: 'stg4atxt',");
lines.push("  stage4b: 'stg4btxt',");
lines.push("  stage5: 'stg5txt',");
lines.push("  stage6a: 'stg6txt',");
lines.push("  stage6b: 'stg7txt',");
lines.push('};');
lines.push('');
lines.push('/** The raw VM words of one stage-text script, or null when the id is unused. */');
lines.push('export function stgtxtBytes(name: string, script: number): string | null {');
lines.push('  return TH08_STGTXT[name]?.scripts[script]?.base64 ?? null;');
lines.push('}');
lines.push('');
lines.push('/** How long one stage-text script holds before deleting itself, in ANM ticks. */');
lines.push('export function stgtxtLength(name: string, script: number): number {');
lines.push('  return TH08_STGTXT[name]?.scripts[script]?.length ?? 0;');
lines.push('}');
lines.push('');
lines.push('/** The atlas cell one stage-text sprite id draws. */');
lines.push('export function stgtxtCell(name: string, sprite: number): StgtxtCell | null {');
lines.push('  return TH08_STGTXT[name]?.cells.find((c) => c.id === sprite) ?? null;');
lines.push('}');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(
  'wrote',
  path.relative(ROOT, OUT),
  packs.map((p) => `${p.name}(${p.scripts.filter(Boolean).length}s/${p.cells.length}c)`).join(' '),
);
