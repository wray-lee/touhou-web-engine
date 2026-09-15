import { resolve } from 'node:path';
import { previewCharacters } from './art/preview.mjs';

const out = resolve(process.argv[2] ?? 'docs/screenshots/_art-preview.png');
console.log(previewCharacters(out));
