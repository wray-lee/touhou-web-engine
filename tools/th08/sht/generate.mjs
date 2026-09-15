/**
 * Embed the eight shipped `plyNN*.sht` files so the player-shot layer can read
 * its own firing tables.
 *
 * The bytes are carried verbatim (base64) rather than transcribed into objects:
 * `parseShtTables` in `src/th08/format/ShtFile.ts` is the one reading of the
 * format, tested against `Player::LoadShtFile`'s own walk, and a second
 * implementation here would be a second chance to be wrong.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const RAW = path.join(ROOT, 'public/assets/th08/raw');
// The firing tables are simulation input - the shot layer reads them every frame -
// so they live with the sim's own data rather than with the renderer's.
const OUT = path.join(ROOT, 'src/th08/data/th08-player-sht.ts');

/** `g_Player1ShtFiles` / `g_Player2ShtFile` (`Player.cpp:49-61`). */
const PRIMARY = [
  'ply00a', 'ply01a', 'ply02a', 'ply03a',
  'ply00a', 'ply00as', 'ply01a', 'ply01as',
  'ply02a', 'ply02as', 'ply03a', 'ply03as',
];
const SECONDARY = [
  'ply00as', 'ply01as', 'ply02as', 'ply03as',
  'ply00a', 'ply00as', 'ply01a', 'ply01as',
  'ply02a', 'ply02as', 'ply03a', 'ply03as',
];

const files = [...new Set([...PRIMARY, ...SECONDARY])].sort();
const blobs = files.map((f) => ({
  name: f,
  b64: fs.readFileSync(path.join(RAW, `${f}.sht`)).toString('base64'),
}));

const lines = [];
const push = (s = '') => lines.push(s);
push('/**');
push(' * Generated from public/assets/th08/raw/plyNN*.sht by tools/th08/sht/generate.mjs.');
push(' * Do not edit by hand.');
push(' *');
push(' * The eight shipped firing tables, verbatim, plus the two twelve-entry file');
push(' * maps retail uses to choose them: `Player.primaryShtFile` takes');
push(' * `g_Player1ShtFiles[shotType]` and `secondaryShtFile` takes');
push(' * `g_Player2ShtFile[shotType]`, and `FUN_00450f60:3097-3101` reads the');
push(' * secondary set only while `Player+3` says the ship is settled into focus.');
push(' */');
push('');
push('/** The raw bytes of one `.sht`, base64, keyed by its retail filename. */');
push('export const TH08_SHT_FILES: Readonly<Record<string, string>> = {');
for (const b of blobs) push(`  ${b.name}: '${b.b64}',`);
push('};');
push('');
push('/** `g_Player1ShtFiles` (`Player.cpp:49-52`), by shot type 0-11. */');
push(`export const TH08_PRIMARY_SHT: readonly string[] = [${PRIMARY.map((f) => `'${f}'`).join(', ')}];`);
push('');
push('/** `g_Player2ShtFile` (`Player.cpp:54-57`), by shot type 0-11. */');
push(`export const TH08_SECONDARY_SHT: readonly string[] = [${SECONDARY.map((f) => `'${f}'`).join(', ')}];`);
push('');
push('/** `g_PlayerAnmFilenames` (`Player.cpp:44-47`): the pack that animates each type. */');
push(`export const TH08_PLAYER_ANM_BY_SHOT_TYPE: readonly number[] = [0, 1, 2, 3, 0, 0, 1, 1, 2, 2, 3, 3];`);
push('');
fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log('wrote', path.relative(ROOT, OUT), `files=${blobs.length}`);
