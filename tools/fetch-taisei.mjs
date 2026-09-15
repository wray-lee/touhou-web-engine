import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const RAW = 'https://raw.githubusercontent.com/taisei-project/taisei/master/';
const OUT = resolve('public/assets/taisei');
const pad = (n) => String(n).padStart(4, '0');

/** Sprite groups we vendor: [gfx-relative name, atlas directory]. */
const ANIMATED = [
  ['player/reimu', 'common/player', 'png'],
  ['player/marisa', 'common/player', 'png'],
  ['player/youmu', 'common/player', 'png'],
  ['enemy/fairy_blue', 'common/enemy', 'webp'],
  ['enemy/fairy_red', 'common/enemy', 'webp'],
  ['enemy/bigfairy', 'common/enemy', 'webp'],
  ['enemy/hugefairy', 'common/enemy', 'webp'],
  ['enemy/superfairy', 'common/enemy', 'webp'],
  ['boss/cirno', 'common/boss', 'png'],
  ['boss/elly', 'common/boss', 'png'],
  ['boss/hina', 'common/boss', 'png'],
  ['boss/iku', 'common/boss', 'png'],
  ['boss/iku_mid', 'common/boss', 'png'],
  ['boss/kurumi', 'common/boss', 'png'],
  ['boss/scuttle', 'common/boss', 'png'],
  ['boss/wriggle', 'common/boss', 'png'],
  ['boss/wriggleex', 'common/boss', 'png'],
];

const STATIC = [
  'common/enemy/swirl.png', 'common/focus.png', 'common/hakkero.png',
  'common/masterspark_ring.png', 'common/yinyang.png',
  'common/fairy_circle.webp', 'common/fairy_circle_big.webp', 'common/fairy_circle_red.webp',
  'huge/boss_circle.png', 'huge/boss_spellcircle0.png',
  'common_ui/boss_indicator.png', 'common_ui/star.png', 'common_ui/spell.webp',
  'common_ui/difficulty/easy.webp', 'common_ui/difficulty/normal.webp',
  'common_ui/difficulty/hard.webp', 'common_ui/difficulty/lunatic.webp',
  'common_ui/hud/heart.webp', 'common_ui/menu/arrow.png',
  'common/proj/apple.png', 'common/proj/glowball.png', 'common/proj/hakurei_seal.png',
  'common/proj/marisa.png', 'common/proj/maristar.png', 'common/proj/needle.png',
  'common/proj/needle2.png', 'common/proj/ofuda.png', 'common/proj/youhoming.png',
  'common/proj/youmu.png', 'common/proj/diamond.webp', 'common/proj/rice.webp',
  'common/proj/thickrice.webp', 'common/proj/droplet.webp', 'common/proj/crystal.webp',
  'common/proj/flea.webp', 'common/proj/pointer.webp', 'common/proj/card.webp',
  'common/proj/ball.webp', 'common/proj/bigball.webp', 'common/proj/plainball.webp',
  'common/proj/wave.webp', 'common/proj/pill.webp', 'common/proj/hghost.webp',
  'common/proj/bullet.webp',
  'common/item/bomb.png', 'common/item/bombfrag.png', 'common/item/life.webp',
  'common/item/lifefrag.webp', 'common/item/minipower.webp', 'common/item/point.png',
  'common/item/power.png', 'common/item/surge.webp', 'common/item/voltage.webp',
  'common/item/bullet_point.png',
  'common/part/arc.png', 'common/part/blast.png', 'common/part/boss_shadow.png',
  'common/part/fantasyseal_impact.png',
];

const PORTRAITS = [
  'cirno', 'elly', 'hina', 'iku', 'kurumi', 'marisa', 'reimu', 'scuttle',
  'wriggle', 'youmu', 'yumemi',
];

function localPath(rel) {
  return resolve(OUT, rel.replace(/^common_ui\//, 'ui/').replace(/^common\//, ''));
}

async function grab(url, file) {
  const res = await fetch(url);
  if (!res.ok) return [url, 0, res.status];
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buf);
  return [url, buf.length, 200];
}

const results = [];
async function worker() {
  while (queue.length) {
    const [url, file] = queue.shift();
    if (existsSync(file) && process.argv.includes('--skip-existing')) { results.push([url, 1, 'cached']); continue; }
    try { results.push(await grab(url, file)); }
    catch (e) { results.push([url, 0, String(e.message).slice(0, 30)]); }
  }
}

/** Parse a Taisei .ani file: groups of frame indices, `m` = mirror, `dN` = delay. */
export function parseAni(text) {
  let count = 0;
  const groups = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const cm = line.match(/^@sprite_count\s*=\s*(\d+)/);
    if (cm) { count = Number(cm[1]); continue; }
    const kv = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (!kv) continue;
    const steps = [];
    let delay = 6;
    let mirror = false;
    for (const tok of kv[2].trim().split(/\s+/)) {
      if (tok === 'm') { mirror = !mirror; continue; }
      const dm = tok.match(/^d(\d+)$/);
      if (dm) { delay = Number(dm[1]); continue; }
      const fm = tok.match(/^(\d+)$/);
      if (fm) steps.push(Number(fm[1]));
    }
    groups[kv[1]] = { frames: steps, delay, mirror };
  }
  return { count, groups };
}

const queue = [];
for (const [name] of ANIMATED) {
  queue.push([RAW + 'resources/00-taisei.pkgdir/gfx/' + name + '.ani', resolve(OUT, 'ani/' + name + '.ani')]);
}
for (const rel of STATIC) queue.push([RAW + 'atlas/' + rel, localPath(rel)]);
for (const c of PORTRAITS) {
  queue.push([RAW + 'atlas/portraits/dialog/' + c + '.webp', resolve(OUT, 'portraits/dialog/' + c + '.webp')]);
}

await Promise.all(Array.from({ length: 8 }, worker));

// Second pass: every frame referenced by the downloaded .ani files.
const counts = {};
for (const [name] of ANIMATED) {
  const file = resolve(OUT, 'ani/' + name + '.ani');
  if (!existsSync(file)) continue;
  const ani = parseAni(readFileSync(file, 'utf8'));
  counts[name] = ani.count;
  const dir = ANIMATED.find((a) => a[0] === name)[1];
  const ext = ANIMATED.find((a) => a[0] === name)[2];
  for (let i = 0; i < ani.count; i++) {
    queue.push([RAW + 'atlas/' + dir + '/' + name.split('/')[1] + '.frame' + pad(i) + '.' + ext,
      resolve(OUT, dir.replace(/^common\//, ''), name.split('/')[1] + '.frame' + pad(i) + '.' + ext)]);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

const ok = results.filter((r) => r[1] > 0);
const bad = results.filter((r) => r[1] === 0);
console.log('fetched', ok.length, 'files;', bad.length, 'failed');
console.log('sprite counts:', JSON.stringify(counts));
if (bad.length) console.log('missing:', bad.slice(0, 12).map((b) => b[0].split('/').slice(-1)[0] + '(' + b[2] + ')').join(' '));
