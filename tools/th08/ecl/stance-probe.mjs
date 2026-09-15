/**
 * Do any shipped enemy instructions actually use retail's stance bits?
 *
 * `EclRun.cpp:80-87` ORs `enemy + 0x3330` into the difficulty mask before the
 * eligibility test, and `Enemy::FUN_0042c420` (`EnemyManager.cpp:973`) writes 64
 * while the youkai half of the team flies and 32 while the human half does -- but
 * only for familiars. An instruction that is meant to run on one side alone
 * therefore has to ship with that side's bit clear. This script counts how many
 * such instructions exist, which is the measurement that says whether the
 * translator's decision to hoist only `0x01..0x10` into `e.isDiff(...)` throws
 * anything away.
 *
 * Run: node --import ./tools/th08/ecl/register.mjs tools/th08/ecl/stance-probe.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseEcl } from '../../../src/th08/format/EclFile.ts';

const RAW = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const NAMES = [
  'ecldata1',
  'ecldata2',
  'ecldata3',
  'ecldata4a',
  'ecldata4b',
  'ecldata5',
  'ecldata6',
  'ecldata7',
  'ecldata8',
];

let grand = 0;
let instrs = 0;
for (const name of NAMES) {
  const file = path.join(RAW, name + '.ecl');
  if (!fs.existsSync(file)) continue;
  const ecl = parseEcl(new Uint8Array(fs.readFileSync(file)));
  const hist = new Map();
  for (const sub of ecl.subs) {
    for (const ins of sub.instructions) {
      instrs++;
      const m = (ins.difficultyMask ?? 0xff) & 0xff;
      if ((m & 0x60) === 0x60 || (m & 0x60) === 0) continue;
      hist.set(m, (hist.get(m) ?? 0) + 1);
    }
  }
  const n = [...hist.values()].reduce((a, b) => a + b, 0);
  grand += n;
  console.log(
    name.padEnd(10) +
      ' subs=' +
      String(ecl.subs.length).padStart(4) +
      ' stance-filtered=' +
      String(n).padStart(5) +
      (n ? '  masks: ' + [...hist.entries()].map((e) => '0x' + e[0].toString(16) + '×' + e[1]).join(' ') : ''),
  );
}
console.log('scanned ' + instrs + ' enemy instructions; stance-filtered total: ' + grand);
