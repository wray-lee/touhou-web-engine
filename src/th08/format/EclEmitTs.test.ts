import { describe, expect, it } from 'vitest';
import { parseEcl } from './EclFile';
import { disasmEcl } from './EclDisasm';
import { emitEclFile } from './EclEmitTs';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

describe.skipIf(!hasAssets)('EclEmitTs (real th08.dat)', () => {
  it('emits valid TypeScript for ecldata1 containing all 53 subs', () => {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));
    const subs = disasmEcl(ecl);
    const ts = emitEclFile(subs, 'ecldata1.ecl');
    expect(ts).toContain('function* sub_0');
    expect(ts).toContain('function* sub_52');
    expect(ts).toContain('yield');
    expect(ts).toContain('EnemyCtx');
    const subCount = (ts.match(/function\* sub_/g) ?? []).length;
    expect(subCount).toBe(53);
  });

  it('emits all 9 ecl files without throwing', () => {
    const files = [
      'ecldata1',
      'ecldata2',
      'ecldata3',
      'ecldata4a',
      'ecldata4b',
      'ecldata5',
      'ecldata6',
      'ecldata7',
      'ecldata8',
    ];
    for (const name of files) {
      const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, name + '.ecl')));
      const subs = disasmEcl(ecl);
      const ts = emitEclFile(subs, name + '.ecl');
      expect(ts.length).toBeGreaterThan(100);
      expect(ts).toContain('function* sub_0');
    }
  });

  it('wraps difficulty-filtered instructions in if guards', () => {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));
    const subs = disasmEcl(ecl);
    const ts = emitEclFile(subs, 'ecldata1.ecl');
    expect(ts).toContain('e.isDiff(');
  });

  it('emits yield* for sub calls (opcode 52)', () => {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));
    const subs = disasmEcl(ecl);
    const ts = emitEclFile(subs, 'ecldata1.ecl');
    expect(ts).toContain('yield* sub_');
  });

  it('produces a stable output (deterministic)', () => {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));
    const a = emitEclFile(disasmEcl(ecl), 'ecldata1.ecl');
    const b = emitEclFile(disasmEcl(ecl), 'ecldata1.ecl');
    expect(a).toBe(b);
  });
});
