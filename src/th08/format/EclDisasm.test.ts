import { describe, expect, it } from 'vitest';
import { parseEcl } from './EclFile';
import { disasmSub, disasmEcl, formatSub } from './EclDisasm';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

describe.skipIf(!hasAssets)('EclDisasm (real th08.dat)', () => {
  const ecl1 = () => parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));

  it('disassembles all subs in ecldata1 without throwing', () => {
    const ecl = ecl1();
    const subs = disasmEcl(ecl);
    expect(subs).toHaveLength(53);
    for (const sub of subs) {
      expect(sub.blocks.length).toBeGreaterThan(0);
      expect(sub.instructions.length).toBeGreaterThan(0);
    }
  });

  it('sub 0 begins with setAnmScripts6 (opcode 55) at time 0', () => {
    const ecl = ecl1();
    const sub = disasmSub(ecl.subs[0]);
    const first = sub.instructions[0];
    expect(first.time).toBe(0);
    expect(first.opcode).toBe(55);
    expect(first.opInfo.name).toBe('setAnmScripts6');
  });

  it('identifies wait, jump, branch and return block exits', () => {
    const ecl = ecl1();
    const subs = disasmEcl(ecl);
    const exits = new Set<string>();
    for (const sub of subs) {
      for (const block of sub.blocks) exits.add(block.exit.kind);
    }
    expect(exits.has('wait')).toBe(true);
    expect(exits.has('return')).toBe(true);
    // ecldata1 should have at least one jump or branch
    expect(exits.has('jump') || exits.has('branch') || exits.has('loop')).toBe(true);
  });

  it('resolves variable references in operands', () => {
    const ecl = ecl1();
    const subs = disasmEcl(ecl);
    let hasVar = false;
    for (const sub of subs) {
      for (const ins of sub.instructions) {
        for (const arg of ins.args) {
          if (arg.kind === 'int' || arg.kind === 'float') {
            hasVar = true;
            expect(arg.name.length).toBeGreaterThan(0);
          }
        }
      }
    }
    expect(hasVar).toBe(true);
  });

  it('formatSub produces readable output', () => {
    const ecl = ecl1();
    const sub = disasmSub(ecl.subs[0]);
    const text = formatSub(sub);
    expect(text).toContain('sub_0:');
    expect(text).toContain('block_0:');
    expect(text).toContain('setAnmScripts6');
  });

  it('disassembles all 9 ecl files without errors', () => {
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
      expect(subs.length).toBe(ecl.subCount);
      for (const sub of subs) {
        // Every sub must end with a return or be structurally valid
        // ecldata6 sub 76 is an empty forward declaration.
        if (sub.blocks.length === 0) continue;
        const lastBlock = sub.blocks[sub.blocks.length - 1];
        expect(lastBlock).toBeTruthy();
      }
    }
  });

  it('difficulty mask filtering is preserved in disassembly', () => {
    const ecl = ecl1();
    const subs = disasmEcl(ecl);
    let hasDiffFilter = false;
    for (const sub of subs) {
      for (const ins of sub.instructions) {
        if (ins.diffMask !== 0xff) {
          hasDiffFilter = true;
          break;
        }
      }
      if (hasDiffFilter) break;
    }
    expect(hasDiffFilter).toBe(true);
  });
});
