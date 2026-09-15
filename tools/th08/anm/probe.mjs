import fs from 'fs';
import path from 'path';
import { decodeSpriteCycle, scriptBuffer } from './decode.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/assets/th08/manifest.json'), 'utf8'));
const want = [0, 6, 12, 18, 24, 30, 42, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 61, 63, 64, 77, 83, 89, 94, 95, 100];

for (const name of ['enemy']) {
  const a = manifest.anm[name];
  console.log('==', name, 'sprites', a.sprites.length, 'scripts', a.scripts.length);
  for (const s of a.scripts) {
    if (!want.includes(s.id)) continue;
    const r = decodeSpriteCycle(scriptBuffer(s.base64), a.sprites.length);
    console.log('  s' + s.id, 'frames', r.frames.join(','), '| dur', r.durations.join(','));
  }
}
