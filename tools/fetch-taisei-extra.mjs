import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const BASE = 'https://raw.githubusercontent.com/taisei-project/taisei/master/atlas/';
const PBASE = 'https://raw.githubusercontent.com/taisei-project/taisei/master/resources/00-taisei.pkgdir/gfx/';
const OUT = resolve('public/assets/taisei');
const pad = (n) => String(n).padStart(4, '0');

const parts = ['arc', 'blast', 'blast_huge_halo', 'blast_huge_rays', 'boss_shadow', 'bullet_flare', 'fantasyseal_impact', 'flare', 'graze', 'lightning0', 'lightning1', 'lightningball', 'maristar_orbit', 'myon', 'ofuda_glow', 'petal', 'smoke', 'smoothdot', 'youmu_slice'];
const projs = ['apple', 'glowball', 'hakurei_seal', 'marisa', 'maristar', 'needle', 'needle2', 'ofuda', 'soul', 'youhoming', 'youmu'];
const items = ['bomb', 'bombfrag', 'bullet_point', 'life', 'lifefrag', 'minipower', 'point', 'power', 'surge', 'voltage'];
const wanted = [];
for (const p of parts) wanted.push(['common/part/' + p + '.png', 'part/' + p + '.png']);
for (const p of projs) wanted.push(['common/proj/' + p + '.png', 'proj/' + p + '.png']);
for (const p of items) wanted.push(['common/item/' + p + '.png', 'item/' + p + '.png']);
for (const p of ['life', 'power', 'point', 'bomb', 'surge', 'voltage']) wanted.push(['common/item/' + p + '_indicator.webp', 'item/' + p + '_indicator.webp']);
for (const p of ['fairy_circle', 'fairy_circle_big', 'fairy_circle_red', 'fairy_circle_big_and_mean']) wanted.push(['common/' + p + '.webp', p + '.webp']);
wanted.push(['common_ui/hud/heart.webp', 'ui/hud/heart.webp']);
wanted.push(['common_ui/hud/star.webp', 'ui/hud/star.webp']);
wanted.push(['common_ui/star.png', 'ui/star.png']);
wanted.push(['common_ui/boss_indicator.png', 'ui/boss_indicator.png']);
wanted.push(['common_ui/arrow.png', 'ui/menu/arrow.png']);
wanted.push(['common/enemy/swirl.png', 'enemy/swirl.png']);
wanted.push(['common/stage6/scythe.png', 'stage6/scythe.png']);
for (const c of ['cirno', 'elly', 'hina', 'iku', 'kurumi', 'marisa', 'reimu', 'scuttle', 'wriggle', 'youmu', 'yumemi']) {
  wanted.push(['portraits/dialog/' + c + '.webp', 'portraits/dialog/' + c + '.webp']);
  wanted.push(['portraits/dialog/' + c + '_face_normal.webp', 'portraits/dialog/' + c + '_face_normal.webp']);
}
for (const c of ['reimu', 'marisa', 'youmu']) {
  for (const e of ['happy', 'smug', 'surprised', 'puzzled', 'annoyed']) wanted.push(['portraits/dialog/' + c + '_face_' + e + '.webp', 'portraits/dialog/' + c + '_face_' + e + '.webp']);
}
for (const [atlasPath, local] of wanted) {
  try {
    const res = await fetch(BASE + atlasPath);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    const file = resolve(OUT, local);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buf);
  } catch { /* offline */ }
}
const groups = { 'player/reimu': 11, 'player/marisa': 11, 'player/youmu': 11 };
for (const [name, count] of Object.entries(groups)) {
  try {
    const res = await fetch(PBASE + name + '.ani');
    if (!res.ok) continue;
    const file = resolve(OUT, 'ani', name + '.ani');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, await res.text());
  } catch { /* offline */ }
}
console.log('extras done; files now', 0);
