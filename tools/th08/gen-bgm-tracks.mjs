/**
 * Rebuild `src/games/th08/data/bgm-tracks.ts` from the extraction manifest.
 *
 * `tools/th08/extract.mjs:117-165` reads every record of `thbgm.fmt` and writes
 * one manifest entry per track: the byte offset, intro length and loop length are
 * fields of that record, so the manifest is the only place the loop points exist
 * after extraction. This script turns them back into a typed table.
 *
 * The tail of the file is the stage -> song fallback. It is deliberately not
 * derived from anything at runtime: a stage's songs normally come out of its own
 * `.std` (see `StageSongs.ts`), and this table only covers a route that has no
 * generated backdrop entry at all.
 *
 *     node tools/th08/gen-bgm-tracks.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = path.join(ROOT, 'public', 'assets', 'th08', 'manifest.json');
const OUT = path.join(ROOT, 'src', 'games', 'th08', 'data', 'bgm-tracks.ts');

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

/** Keys arrive in `thbgm.fmt` order, which is the order retail preloads them. */
const tracks = Object.entries(manifest.bgm ?? {}).map(([name, entry]) => ({
  name,
  file: '/assets/th08/' + entry.file,
  introSeconds: entry.introSeconds,
  loopSeconds: entry.loopSeconds,
  totalSeconds: entry.introSeconds + entry.loopSeconds,
}));

if (!tracks.some((t) => t.name === 'th08_00')) {
  console.warn('warning: manifest has no th08_00, which is the stage 1 song');
}

const out = [];
out.push('/**');
out.push(' * The recordings `thbgm.dat` holds, with the intro and loop points of each.');
out.push(' *');
out.push(' * Generated from `public/assets/th08/manifest.json` by');
out.push(' * `tools/th08/gen-bgm-tracks.mjs`. Do not edit by hand: the loop points are');
out.push(' * `thbgm.fmt` records, so the only way to change them is to re-extract. They');
out.push(' * are the Web Audio `loopStart` (`introSeconds`) and `loopEnd`');
out.push(' * (`loopSeconds`) of the sliced file, both measured from its start, which is');
out.push(' * why `extract.mjs:163` adds the intro to the loop length.');
out.push(' */');
out.push('');
out.push('export interface BgmTrack {');
out.push('  name: string;');
out.push('  file: string;');
out.push('  introSeconds: number;');
out.push('  loopSeconds: number;');
out.push('  totalSeconds: number;');
out.push('}');
out.push('');
out.push('export const TH08_BGM_TRACKS: BgmTrack[] = [');
for (const track of tracks) {
  out.push('  {');
  out.push(`    name: '${track.name}',`);
  out.push(`    file: '${track.file}',`);
  out.push(`    introSeconds: ${track.introSeconds},`);
  out.push(`    loopSeconds: ${track.loopSeconds},`);
  out.push(`    totalSeconds: ${track.totalSeconds},`);
  out.push('  },');
}
out.push('];');

const SONGS = [
  [1, 'th08_00', 'th08_03'],
  [2, 'th08_04', 'th08_05'],
  [3, 'th08_06', 'th08_07'],
  [4, 'th08_08', 'th08_09'],
  [5, 'th08_11', 'th08_12'],
  [6, 'th08_13', 'th08_14'],
  [7, 'th08_13', 'th08_15'],
  [8, 'th08_18', 'th08_19'],
];

out.push('/**');
out.push(' * Fallback songs per stage number, for a route whose `.std` is not in the');
out.push(' * generated backdrop table. The values are those stages own `songPaths[0]`');
out.push(' * and `songPaths[1]`, copied from the raw archives under');
out.push(' * `public/assets/th08/raw/stage*.std` rather than guessed:');
out.push(' *');
out.push(' *     stage1 th08_00/th08_03    stage2 th08_04/th08_05');
out.push(' *     stage3 th08_06/th08_07    stage4a th08_08/th08_09');
out.push(' *     stage4b th08_08/th08_10   stage5 th08_11/th08_12');
out.push(' *     stage6 th08_13/th08_14    stage7 th08_13/th08_15');
out.push(' *     stage8 th08_18/th08_19');
out.push(' *');
out.push(' * 4A/4B share a stage number, and so do 6A/6B, so only one of each pair can be');
out.push(' * held here; during a run the stage is keyed by route, so it reads the std and');
out.push(' * never needs this. A slot 2 exists too - `th08_13b` on 6A and 6B - but only an');
out.push(' * op 7 in that stages conversation can ask for it.');
out.push(' */');
out.push('export const STAGE_BGM: Record<number, { stage: string; boss: string }> = {');
for (const [stage, stageSong, bossSong] of SONGS) {
  out.push(`  ${stage}: { stage: '${stageSong}', boss: '${bossSong}' },`);
}
out.push('};');
out.push('');
out.push('/**');
out.push(' * The title screen song. Retail registers it into music slot 8 by name:');
out.push(' * `g_Supervisor.LoadMusic(8, "bgm/th08_01.mid")` then');
out.push(' * `g_Supervisor.PlayMusic(8, 0)` (`TitleScreen.cpp:877-878`, also at `:302`,');
out.push(' * `:1044` and `:3868`). It is not the stage 1 song, even though the two are');
out.push(' * neighbours in `thbgm.fmt`: `stage1.std` gives `th08_00`.');
out.push(' */');
out.push("export const TITLE_BGM = 'th08_01';");
out.push('');
out.push('export function getBgmTrack(name: string): BgmTrack | undefined {');
out.push('  return TH08_BGM_TRACKS.find((t) => t.name === name);');
out.push('}');
out.push('');

fs.writeFileSync(OUT, out.join('\n'));
console.log(`wrote ${path.relative(ROOT, OUT)} with ${tracks.length} tracks`);