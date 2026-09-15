import fs from 'fs';
import path from 'path';
import { decodePNG, encodePNG } from '../../art/png.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/assets/th08/manifest.json'), 'utf8'));
const outDir = path.join(ROOT, '.scratch/anm');
fs.mkdirSync(outDir, { recursive: true });

for (const name of process.argv.slice(2)) {
  const pack = manifest.anm[name];
  if (!pack) { console.log('no pack', name); continue; }
  for (const e of pack.entries) {
    console.log('  entry', e.index, e.name, 'fmt' + e.format, 'colorKey=0x' + ((e.colorKey ?? 0) >>> 0).toString(16));
  }
  const pages = pack.textures.map((t) => decodePNG(path.join(ROOT, 'public/assets/th08/anm/' + t.file)));
  for (const s of pack.sprites) {
    const page = pages[s.tex];
    if (!page) continue;
    const w = Math.round(s.w);
    const h = Math.round(s.h);
    const out = new Uint8Array(w * h * 4);
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const si = (Math.round(s.y) + row) * page.width + Math.round(s.x) + col;
        const di = (row * w + col) * 4;
        out[di] = page.rgba[si * 4];
        out[di + 1] = page.rgba[si * 4 + 1];
        out[di + 2] = page.rgba[si * 4 + 2];
        out[di + 3] = page.rgba[si * 4 + 3];
      }
    }
    fs.writeFileSync(path.join(outDir, name + '_' + s.id + '.png'), encodePNG(w, h, out));
  }
  console.log(name, 'wrote', pack.sprites.length, 'cells', 'pages', pack.textures.length);
}
