/**
 * Print one translated sub from a generated ECL module.
 *   node tools/th08/ecl/show.mjs <file> <subId...>
 */
import fs from 'node:fs';

const [file, ...ids] = process.argv.slice(2);
const src = fs.readFileSync(`.scratch/generated/${file}.ts`, 'utf8');
const lines = src.split('\n');
for (const id of ids) {
  const start = lines.findIndex((l) => l.startsWith(`export function* sub_${id}(`));
  if (start < 0) { console.log(`sub_${id}: not found`); continue; }
  let end = start;
  while (end < lines.length && !(end > start && lines[end].startsWith('export function*'))) end++;
  console.log(`\n======== ${file} sub_${id} (lines ${start + 1}-${end})`);
  console.log(lines.slice(start, end).join('\n'));
}
