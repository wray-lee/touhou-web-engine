import fs from 'fs';
import path from 'path';
import { decodePNG } from '../../art/png.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/assets/th08/manifest.json'), 'utf8'));
for (const name of process.argv.slice(2)) {
  const pack = manifest.anm[name];
  const fmt = pack.entries[0].format;
  const file = path.join(ROOT, 'public/assets/th08/anm/' + pack.textures[0].file);
  const png = decodePNG(file);
  // Sample the top-left cell of the atlas through the current decoder by reading
  // the PNG pixels back: the yellow cast means the stored bytes are not ARGB.
  const at = (x, y) => { const i = (y * png.width + x) * 4; return [png.rgba[i], png.rgba[i+1], png.rgba[i+2], png.rgba[i+3]]; };
  console.log(name, 'fmt', fmt, 'size', png.width + 'x' + png.height);
  for (const [x, y] of [[10, 10], [60, 60], [120, 200], [200, 60]]) {
    console.log('  px', x + ',' + y, 'RGBA=', at(x, y).join(','));
  }
}
