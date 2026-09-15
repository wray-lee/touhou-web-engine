/**
 * Turn the four `playerNN.anm` packs into TS data for the game.
 *
 * `Player::FUN_0044fb70` (`Player.cpp:2676`) hands every player shot the script
 * `entry+0x24 + 10` of the pack named by `g_PlayerAnmFilenames` (`:44-47`), and the
 * option routes hand every 僚机 script 18/19 - so the art for 式神, blades, dolls
 * and familiars is already in the retail data, and the port has simply never read
 * it. This lifts those scripts (raw VM bytecode, plus the atlas cells they select)
 * so the shot layer can run them the way `PlayerShot::vm` does.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const MANIFEST = path.join(ROOT, 'public/assets/th08/manifest.json');
// The shot layer runs these scripts on the sim side (`PlayerShot::vm`), so the
// data belongs with the sim's own retail tables, not with the renderer's.
const OUT = path.join(ROOT, 'src/th08/data/th08-player-anm.ts');

/** The pack order is `g_PlayerAnmFilenames`' own: one pack per team, 0-3. */
const PACKS = ['player00', 'player01', 'player02', 'player03'];

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

const packs = PACKS.map((name) => {
  const anm = manifest.anm?.[name];
  if (!anm) throw new Error(`manifest has no anm pack ${name}`);
  const maxSprite = anm.sprites.length ? Math.max(...anm.sprites.map((s) => s.id)) : -1;
  const rects = new Array(maxSprite + 1).fill(null);
  for (const s of anm.sprites) {
    rects[s.id] = { x: Math.round(s.x), y: Math.round(s.y), w: Math.round(s.w), h: Math.round(s.h), tex: s.tex ?? 0 };
  }
  const maxScript = anm.scripts.length ? Math.max(...anm.scripts.map((s) => s.id)) : -1;
  const byId = new Map(anm.scripts.map((s) => [s.id, s]));
  const bytes = [];
  for (let id = 0; id <= maxScript; id++) bytes.push(byId.get(id)?.base64 ?? null);
  return { name, rects, bytes, pages: anm.textures.map((t) => t.file) };
});

const lines = [];
const push = (s = '') => lines.push(s);
push('/**');
push(' * Generated from public/assets/th08/manifest.json (player00..player03.anm) by');
push(' * tools/th08/anm/generate-player.mjs. Do not edit by hand.');
push(' *');
push(' * Script numbers here are retail\'s own, so `PlayerShots` can attach the VM');
push(' * directly with the `entry+0x24 + 10` index `FUN_0044fb70` computes.');
push(' */');
push('');
push('/** One cell of a player atlas, with the page it lives on. */');
push('export interface PlayerAnmRect {');
push('  readonly x: number;');
push('  readonly y: number;');
push('  readonly w: number;');
push('  readonly h: number;');
push('  /** Index into the pack\'s texture pages. */');
push('  readonly tex: number;');
push('}');
push('');
push('/** Everything one `playerNN.anm` exposes, indexed by retail\'s own numbers. */');
push('export interface PlayerAnmPackData {');
push('  readonly name: string;');
push('  /** Page filenames, as served under `/assets/th08/anm/`. */');
push('  readonly pages: readonly string[];');
push('  readonly rects: readonly (PlayerAnmRect | null)[];');
push('  readonly bytes: readonly (string | null)[];');
push('}');
push('');
push('export const TH08_PLAYER_ANM_PACKS: readonly PlayerAnmPackData[] = [');
for (const p of packs) {
  push(`  {`);
  push(`    name: '${p.name}',`);
  push(`    pages: [${p.pages.map((f) => `'${f}'`).join(', ')}],`);
  push(`    rects: [`);
  p.rects.forEach((r, i) =>
    push(r ? `      { x: ${r.x}, y: ${r.y}, w: ${r.w}, h: ${r.h}, tex: ${r.tex} }, // ${i}` : `      null, // ${i}`),
  );
  push(`    ],`);
  push(`    bytes: [`);
  p.bytes.forEach((b, i) => push(b ? `      '${b}', // ${i}` : `      null, // ${i}`));
  push(`    ],`);
  push(`  },`);
}
push('];');
push('');
push('/** Pack index by team number, i.e. `shotType >> 2` for the pairs. */');
push('export const th08PlayerAnmPack = (index: number): PlayerAnmPackData | null =>');
push('  TH08_PLAYER_ANM_PACKS[index] ?? null;');
push('');
push('/**');
push(' * Atlas cell key the renderer registers player art under, matching');
push(' * `registerTH08PlayerSprites`\'s naming so shots and ships share pages.');
push(' */');
push('export const th08PlayerCellKey = (pack: number, sprite: number): string | null => {');
push('  const p = TH08_PLAYER_ANM_PACKS[pack];');
push('  const r = p?.rects[sprite] ?? null;');
push('  return r ? `th08:player:${p!.name}_t${r.tex}:${sprite}` : null;');
push('};');
push('');
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');

for (const p of packs) {
  console.log(
    `wrote ${path.relative(ROOT, OUT)}`,
    `${p.name}: rects=${p.rects.filter(Boolean).length} scripts=${p.bytes.filter(Boolean).length} pages=${p.pages.length}`,
  );
}
