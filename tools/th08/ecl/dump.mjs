/**
 * Raw instruction dump for one ECL sub, with every operand shown as both an
 * int32 and its float32 bit pattern. Used to sanity-check opcode names and
 * argument types before they are translated.
 *
 *   node --import ./tools/th08/ecl/register.mjs tools/th08/ecl/dump.mjs ecldata1 0
 */
import fs from 'node:fs';
import { parseEcl } from '../../../src/th08/format/EclFile.ts';
import { ECL_OPCODES } from '../../../src/th08/format/EclOpcodes.ts';

const file = process.argv[2] ?? 'ecldata1';
const want = new Set(process.argv.slice(3).map(Number));
const buf = fs.readFileSync(`public/assets/th08/raw/${file}.ecl`);
const ecl = parseEcl(buf);
const f32 = (i) => new Float32Array(new Int32Array([i]).buffer)[0];

const regName = (id) => (id >= 0x2710 && id <= 0x277f ? `r${id.toString(16)}` : null);

for (const sub of ecl.subs) {
  if (want.size && !want.has(sub.id)) continue;
  console.log(`\n===== ${file} sub ${sub.id} (${sub.instructions.length} ins) =====`);
  for (const ins of sub.instructions) {
    const meta = ECL_OPCODES[ins.opcode];
    const name = meta ? meta.name : `op${ins.opcode}`;
    const sig = meta ? meta.sig.join(',') : '?';
    const args = [...ins.operands].map((o, i) => {
      const t = meta ? meta.sig[i] : undefined;
      const fr = f32(o);
      const rn = o >= 0x2710 && o <= 0x277f ? regName(o) : null;
      return `${i}:${t ?? '-'}${o}${Math.abs(fr) > 1e-30 && Math.abs(fr) < 1e30 ? `|${fr.toFixed(4)}` : ''}${rn ? `{${rn}}` : ''}`;
    });
    console.log(`  t=${String(ins.time).padStart(5)} @${String(ins.offset).padStart(5)} ${String(ins.opcode).padStart(3)} ${name.padEnd(20)} (${sig.padEnd(24)}) ${args.join(' ')}`);
  }
}
