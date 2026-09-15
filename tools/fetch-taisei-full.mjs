import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const TAISEI = 'https://raw.githubusercontent.com/taisei-project/taisei/master/';
const API_TAISEI = 'https://api.github.com/repos/taisei-project/taisei/';
const RAW = 'https://raw.githubusercontent.com/taisei-project/taisei-rawmedia/master/';
const OUT = resolve('public/assets/taisei');
const RAW_OUT = resolve('public/assets/taisei-raw');

/** Whole atlas directories we mirror verbatim. */
const TREE_PREFIXES = ['atlas/common/', 'atlas/common_ui/', 'atlas/huge/', 'atlas/portraits/'];
/** Raw-media art that is not part of the runtime atlas (backgrounds, bomb FX). */
const RAWMEDIA = [
  'gfx/basis-misc/menu/mainmenubg.webp',
  'gfx/basis-misc/reimubg.webp',
  'gfx/basis-misc/marisa_bombbg.webp',
  'gfx/basis-misc/youmu_bombbg1.webp',
  'gfx/basis-misc/titletransition.webp',
  'gfx/basis-misc/static.webp',
  'gfx/basis-misc/runes.webp',
  'gfx/basis-misc/gaplight.png',
  'gfx/basis-misc/stage1/cirnobg.webp',
  'gfx/basis-misc/stage1/horizon.webp',
  'gfx/basis-misc/stage1/snowlayer.webp',
  'gfx/basis-misc/stage1/waterplants.webp',
  'gfx/basis-misc/stage1/fog.webp',
  'gfx/basis-misc/stage2/spellbg1.webp',
  'gfx/basis-misc/stage2/spellbg2.webp',
  'gfx/basis-misc/stage3/spellbg1.webp',
  'gfx/basis-misc/stage3/spellbg2.webp',
  'gfx/basis-misc/stage3/wspellbg.webp',
  'gfx/basis-misc/stage3/wspellclouds.webp',
  'gfx/basis-misc/stage4/kurumibg1.webp',
  'gfx/basis-misc/stage4/kurumibg2.webp',
  'gfx/basis-misc/stage5/spell_bg.webp',
  'gfx/basis-misc/stage5/spell_clouds.webp',
  'gfx/basis-misc/stage5/spell_lightning.webp',
  'gfx/basis-misc/stage5/tower.webp',
  'gfx/basis-misc/stage6/spellbg_chalk.webp',
  'gfx/basis-misc/stage6/spellbg_classic.webp',
  'gfx/basis-misc/stage6/spellbg_modern.webp',
  'gfx/basis-misc/stage6/towertop.webp',
  'gfx/basis-misc/stage6/towerwall.webp',
];

async function listTree(ref, url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'codex', Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error('tree ' + res.status);
  const json = await res.json();
  return json.tree.filter((t) => t.type === 'blob' && TREE_PREFIXES.some((p) => t.path.startsWith(p)));
}

const localFor = (p) =>
  resolve(OUT, p.replace(/^atlas\/common_ui\//, 'ui/').replace(/^atlas\/common\//, '').replace(/^atlas\//, ''));

async function grab(url, file) {
  if (existsSync(file) && statSync(file).size > 0) return 'cached';
  const res = await fetch(url, { headers: { 'User-Agent': 'codex', Accept: 'application/vnd.github+json' } });
  if (!res.ok) return 'http' + res.status;
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buf);
  return 'new';
}

const blobs = await listTree('master', API_TAISEI + 'git/trees/master?recursive=1');
let newCount = 0;
const failures = [];
const jobs = blobs.map((b) => [TAISEI + b.path, localFor(b.path)]);
for (const r of RAWMEDIA) jobs.push([RAW + r, resolve(RAW_OUT, r.replace(/^gfx\/basis-misc\//, ''))]);

let i = 0;
async function worker() {
  while (jobs.length) {
    const [url, file] = jobs.shift();
    try {
      const r = await grab(url, file);
      if (r === 'new') newCount++;
      else if (r !== 'cached') failures.push(url.split('/').slice(-2).join('/') + '(' + r + ')');
    } catch (e) { failures.push(url.split('/').slice(-1)[0] + '(' + e.message.slice(0, 20) + ')'); }
    i++;
  }
}
await Promise.all(Array.from({ length: 10 }, worker));
console.log('atlas blobs:', blobs.length, '| newly written:', newCount, '| failed:', failures.length);
if (failures.length) console.log(failures.slice(0, 25).join('\n'));
