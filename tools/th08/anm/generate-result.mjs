/**
 * Lift the retail settlement pack (`result00.anm`) into TS data.
 *
 * `ResultScreen.cpp:2840` hands script `i` to VM `i` for i in 0..71 and then lets
 * the bytecode place every picture: the JPEG backdrop is blitted straight to the
 * backbuffer (`OnDraw:2461`), and the 25 page-0 cells are the 256x32 label strips
 * the retail screen spells out for us ("PLAYER'S RESULTS", "Stage Score", and the
 * rest). Only the numbers on the right of each label are ours to draw, which is
 * why the anchor of script 71 matters more than any other cell here.
 *
 * The bytecode stays verbatim so the same `AnmVm` that drives enemies and stage
 * backdrops plays this screen; nothing is reimplemented.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'node:child_process';
import { scriptBuffer } from './decode.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const MANIFEST = path.join(ROOT, 'public/assets/th08/manifest.json');
const OUT = path.join(ROOT, 'src/games/th08/data/th08-result-anm.ts');

/** Script index names, `ResultScreen.cpp:26-48`. */
const SCRIPT_CONSTANTS = [
  ['CATEGORY_HIGHSCORE', 0, 'First entry of the category menu.'],
  ['CATEGORY_BACK_TO_TITLE', 3, 'Last entry of the category menu.'],
  ['HIGHSCORE_DIFFICULTY_EASY', 4, 'Best-score difficulty row, Easy.'],
  ['HIGHSCORE_DIFFICULTY_EXTRA', 8, 'Best-score difficulty row, Extra.'],
  ['SPELLCARD_DIFFICULTY_EASY', 9, 'Card-list difficulty row, Easy.'],
  ['SPELLCARD_DIFFICULTY_ALL', 14, 'Card-list difficulty row, every rank.'],
  ['HIGHSCORE_CHARACTER_REIMU_YUKARI', 15, 'Best-score character row, first pair.'],
  ['HIGHSCORE_CHARACTER_YUYUKO', 26, 'Best-score character row, last pair.'],
  ['SPELLCARD_CHARACTER_REIMU_YUKARI', 27, 'Card-list character row, first pair.'],
  ['SPELLCARD_CHARACTER_ALL', 39, 'Card-list character row, every pair.'],
  ['LISTING', 40, 'The scrolling score table; `OnDraw` slides it in while pos.x < 640.'],
  ['REPLAY_SAVE_QUESTION', 49, 'The "Save this replay?" panel.'],
  ['YES', 50, 'Highlight for the yes button.'],
  ['REPLAY_LISTING_MAIN', 55, 'Replay browser, main page.'],
  ['REPLAY_LISTING_START', 56, 'Replay browser, start page.'],
  ['PLAYER_RESULTS', 71, 'Anchor of the stats column; text sits at +210/+32, 22 apart.'],
];

/** Last instruction time in a script, which is how long the picture holds. */
function scriptLength(b64) {
  const buf = scriptBuffer(b64);
  let cursor = 0;
  let last = 0;
  let guard = 0;
  while (cursor + 8 <= buf.length && guard++ < 4096) {
    const size = buf.readUInt16LE(cursor + 2);
    const time = buf.readInt16LE(cursor + 4);
    if (!size || cursor + size > buf.length) break;
    last = Math.max(last, time);
    cursor += size;
  }
  return last;
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const pack = manifest.anm.result00;
if (!pack) throw new Error('manifest has no result00 -- run tools/th08/extract.mjs');

const pages = pack.textures.map((t) => '/assets/th08/anm/' + t.file);
const cells = pack.sprites.map((s) => ({
  id: s.id,
  tex: s.tex ?? 0,
  x: s.x,
  y: s.y,
  w: s.w,
  h: s.h,
}));

const byId = new Map(pack.scripts.map((s) => [s.id, s]));
const maxScriptId = Math.max(...pack.scripts.map((s) => s.id));
const scripts = [];
for (let id = 0; id <= maxScriptId; id++) {
  const script = byId.get(id);
  scripts.push(script ? { id, b64: script.base64, length: scriptLength(script.base64) } : null);
}

const lines = [];
lines.push('/**');
lines.push(' * Generated from public/assets/th08/manifest.json (result00.anm) by');
lines.push(' * tools/th08/anm/generate-result.mjs. Do not edit by hand.');
lines.push(' *');
lines.push(
  ` * The retail settlement screen: ${pages.length} texture pages, ${cells.length} sprite rects and`,
);
lines.push(
  ` * ${scripts.filter(Boolean).length} animation scripts. The bytecode is kept as-is so \`AnmVm\` can play`,
);
lines.push(' * it, exactly like the enemy and backdrop packs.');
lines.push(' */');
lines.push('');
lines.push('/** One atlas cell of the settlement pack, addressed by its ANM sprite id. */');
lines.push('export interface ResultCell {');
lines.push('  readonly id: number;');
lines.push('  /** Which page of the pack the rect lives on. */');
lines.push('  readonly tex: number;');
lines.push('  readonly x: number;');
lines.push('  readonly y: number;');
lines.push('  readonly w: number;');
lines.push('  readonly h: number;');
lines.push('}');
lines.push('');
lines.push('/** One script of the settlement pack: raw VM words plus its own lifetime. */');
lines.push('export interface ResultScript {');
lines.push('  readonly id: number;');
lines.push('  readonly base64: string;');
lines.push('  /** Last instruction time in ANM ticks. */');
lines.push('  readonly length: number;');
lines.push('}');
lines.push('');
lines.push('/**');
lines.push(' * The full-frame backdrop, blitted to the backbuffer before any VM draws');
lines.push(' * (`ResultScreen::OnDraw:2461`). It ships as a JPEG rather than an ANM page,');
lines.push(' * so `extract.mjs` copies it out verbatim.');
lines.push(' */');
lines.push("export const RESULT_BACKDROP = '/assets/th08/raw/result.jpg';");
lines.push('');
lines.push("/** The four atlas pages, indexed by a cell's `tex`. */");
lines.push('export const TH08_RESULT_PAGES: readonly string[] = [');
for (const page of pages) lines.push(`  '${page}',`);
lines.push('];');
lines.push('');
lines.push('/** Sprite rects as shipped, in id order. */');
lines.push('export const TH08_RESULT_CELLS: readonly ResultCell[] = [');
for (const cell of cells) {
  lines.push(
    `  { id: ${cell.id}, tex: ${cell.tex}, x: ${cell.x}, y: ${cell.y}, w: ${cell.w}, h: ${cell.h} }, // ${cell.w}x${cell.h}`,
  );
}
lines.push('];');
lines.push('');
lines.push('/**');
lines.push(' * Which script index draws which picture, straight out of');
lines.push(' * `ResultScreen.cpp`. `AddedCallback` pairs script `i` with VM `i`, so these');
lines.push(' * are the addresses the screen logic reads.');
lines.push(' */');
lines.push('export const RESULT_SCRIPT = {');
for (const [name, value, doc] of SCRIPT_CONSTANTS) {
  lines.push(`  /** ${doc} */`);
  lines.push(`  ${name}: ${value},`);
}
lines.push('} as const;');
lines.push('');
lines.push('/** Every settlement script, indexed by VM slot; null where the id is unused. */');
lines.push('export const TH08_RESULT_SCRIPTS: readonly (ResultScript | null)[] = [');
for (const script of scripts) {
  lines.push(
    script
      ? `  { id: ${script.id}, base64: '${script.b64}', length: ${script.length} },`
      : '  null, // unused',
  );
}
lines.push('];');
lines.push('');
lines.push('/** The raw VM words of one settlement script, or null when the id is unused. */');
lines.push('export function resultBytes(script: number): string | null {');
lines.push('  return TH08_RESULT_SCRIPTS[script]?.base64 ?? null;');
lines.push('}');
lines.push('');
lines.push('/** How long one settlement script holds, in ANM ticks. */');
lines.push('export function resultLength(script: number): number {');
lines.push('  return TH08_RESULT_SCRIPTS[script]?.length ?? 0;');
lines.push('}');
lines.push('');
lines.push('/** The atlas cell one settlement sprite id draws. */');
lines.push('export function resultCell(sprite: number): ResultCell | null {');
lines.push('  return TH08_RESULT_CELLS.find((c) => c.id === sprite) ?? null;');
lines.push('}');
lines.push('');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
// The script blobs make for long lines, and the repository is prettier-clean, so
// the lift formats itself rather than leaving the next `--check` run red.
spawnSync('npx', ['prettier', '--write', OUT], { cwd: ROOT, stdio: 'ignore', shell: true });
console.log(
  'wrote',
  path.relative(ROOT, OUT),
  `| pages ${pages.length} cells ${cells.length} scripts ${scripts.filter(Boolean).length}`,
);
