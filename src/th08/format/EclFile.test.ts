import { describe, expect, it } from 'vitest';
import { parseEcl } from './EclFile';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

describe.skipIf(!hasAssets)('EclFile parser (real th08.dat)', () => {
  const EXPECTED: Record<string, { subs: number; timelines: number }> = {
    ecldata1: { subs: 53, timelines: 2 },
    ecldata2: { subs: 65, timelines: 2 },
    ecldata3: { subs: 78, timelines: 4 },
    ecldata4a: { subs: 61, timelines: 2 },
    ecldata4b: { subs: 78, timelines: 2 },
    ecldata5: { subs: 90, timelines: 1 },
    ecldata6: { subs: 88, timelines: 1 },
    ecldata7: { subs: 89, timelines: 1 },
    ecldata8: { subs: 156, timelines: 2 },
  };

  for (const [name, exp] of Object.entries(EXPECTED)) {
    it(name + ' has ' + exp.subs + ' subs and ' + exp.timelines + ' timelines', () => {
      const buf = fs.readFileSync(path.join(RAW_DIR, name + '.ecl'));
      const ecl = parseEcl(buf);
      expect(ecl.subCount).toBe(exp.subs);
      expect(ecl.subs).toHaveLength(exp.subs);
      expect(ecl.timelines).toHaveLength(exp.timelines);
      for (const sub of ecl.subs) {
        // ecldata6 has one empty sub (forward declaration); most subs have at least one instruction.
        for (const ins of sub.instructions) {
          expect(ins.opcode).toBeGreaterThanOrEqual(0);
          expect(ins.opcode).toBeLessThanOrEqual(184);
          expect(ins.nextOffset).toBeGreaterThan(0);
        }
      }
      for (const tl of ecl.timelines) {
        expect(tl.instructions.length).toBeGreaterThan(0);
      }
    });
  }

  it('ecldata1 sub 0 starts at time 0 with a recognized opcode', () => {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));
    const first = ecl.subs[0].instructions[0];
    expect(first.time).toBe(0);
    expect(first.opcode).toBeGreaterThanOrEqual(1);
  });

  it('ecldata1 timeline 0 spawns enemies (opcode 0 or 1)', () => {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));
    const spawns = ecl.timelines[0].instructions.filter((i) => i.opcode <= 1);
    expect(spawns.length).toBeGreaterThan(0);
  });

  it('all 9 ecl files produce a valid opcode histogram', () => {
    const hist = new Map<number, number>();
    for (const name of Object.keys(EXPECTED)) {
      const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, name + '.ecl')));
      for (const sub of ecl.subs) {
        for (const ins of sub.instructions) {
          hist.set(ins.opcode, (hist.get(ins.opcode) ?? 0) + 1);
        }
      }
    }
    const ops = [...hist.keys()].sort((a, b) => a - b);
    expect(ops.length).toBeGreaterThan(80);
    expect(ops[0]).toBeGreaterThanOrEqual(0);
    expect(ops[ops.length - 1]).toBeLessThanOrEqual(184);
  });
});
