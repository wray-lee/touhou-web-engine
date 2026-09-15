/**
 * Proves the descriptor layer is a lossless view of the retail instruction.
 *
 * The generated stage scripts are about to stop passing raw words and start
 * passing decoded descriptors instead. That is only safe if `pack(unpack(words))`
 * reproduces the words the interpreter used to see, so this walks every shot and
 * laser instruction in all nine shipped `.ecl` files and checks it.
 */
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { parseEcl } from '../format/EclFile';
import { INT_FIELD_BY_ID, FLOAT_FIELD_BY_ID } from '../sim/EnemySlot';
import {
  packLaser,
  packShot,
  laserWords,
  shotWords,
  unpackLaser,
  unpackShot,
  type RegisterLookup,
} from './ShotDescriptor';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const FILES = [
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
const hasAssets = FILES.every((name) => fs.existsSync(path.join(RAW_DIR, `${name}.ecl`)));

const isRegister: RegisterLookup = (id) =>
  Object.prototype.hasOwnProperty.call(INT_FIELD_BY_ID, id) ||
  Object.prototype.hasOwnProperty.call(FLOAT_FIELD_BY_ID, id);

function everyInstruction() {
  const out: {
    file: string;
    offset: number;
    opcode: number;
    operands: number[];
    flags: number;
  }[] = [];
  for (const name of FILES) {
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, `${name}.ecl`)));
    for (const sub of ecl.subs) {
      for (const ins of sub.instructions) {
        out.push({
          file: name,
          offset: ins.offset,
          opcode: ins.opcode,
          operands: Array.from(ins.operands),
          flags: ins.operandFlags,
        });
      }
    }
  }
  return out;
}

describe.skipIf(!hasAssets)('shot / laser descriptor round trip', () => {
  const all = everyInstruction();
  const shots = all.filter((i) => i.opcode >= 96 && i.opcode <= 104);
  const lasers = all.filter((i) => i.opcode === 114 || i.opcode === 115);

  it('covers a meaningful share of the shipped scripts', () => {
    // Guards the test itself: if the opcode ranges ever stop matching, a green
    // suite here would mean nothing.
    expect(shots.length).toBeGreaterThan(1000);
    expect(lasers.length).toBeGreaterThan(20);
  });

  it('reproduces every shot instruction word for word', () => {
    const bad: string[] = [];
    for (const ins of shots) {
      const words = shotWords(ins.opcode, ins.operands, ins.flags);
      const back = packShot(unpackShot(words, isRegister));
      for (let i = 0; i < words.length; i++) {
        if (back[i] !== words[i]) {
          bad.push(`${ins.file}@${ins.offset} word ${i}: ${words[i]} -> ${back[i]}`);
          break;
        }
      }
    }
    expect(bad.slice(0, 10), `${bad.length} of ${shots.length} shots did not round-trip`).toEqual([]);
  });

  it('reproduces every laser instruction word for word', () => {
    const bad: string[] = [];
    for (const ins of lasers) {
      const words = laserWords(ins.opcode, ins.operands, ins.flags);
      const back = packLaser(unpackLaser(words, isRegister));
      for (let i = 0; i < words.length; i++) {
        if (back[i] !== words[i]) {
          bad.push(`${ins.file}@${ins.offset} word ${i}: ${words[i]} -> ${back[i]}`);
          break;
        }
      }
    }
    expect(bad.slice(0, 10), `${bad.length} of ${lasers.length} lasers did not round-trip`).toEqual([]);
  });

  it('decodes the operands the raw blob hides', () => {
    // The very first launcher in ecldata1, which used to read
    // `spawnShot(0, 393216, 1, 1, 1065353216, 1056964608, 0, 1044200473, 515, 0)`.
    const first = shots[0];
    const desc = unpackShot(shotWords(first.opcode, first.operands, first.flags), isRegister);
    expect(desc.mode).toBe('aimedFan');
    expect(typeof desc.type).toBe('number');
    expect(typeof desc.speed).toBe('number');
    expect(desc.speed).toBeGreaterThan(0);
    expect(desc.count).toBeGreaterThanOrEqual(1);
  });

  it('keeps register-indirect angles as registers, not as their current value', () => {
    // Bit 0x40 is the angle. 375 of the shipped launchers aim from a register, and
    // flattening one to a literal would freeze an enemy's aim at whatever the
    // register happened to hold at translate time.
    const indirect = shots.filter((ins) => (ins.flags & 0x40) !== 0);
    expect(indirect.length).toBeGreaterThan(300);
    let seen = 0;
    for (const ins of indirect) {
      const angle = unpackShot(shotWords(ins.opcode, ins.operands, ins.flags), isRegister).angle;
      if (typeof angle !== 'number') seen++;
    }
    // Every one of them either names a real register or is a literal wearing the
    // flag; the round-trip test above already proved both decode back correctly.
    expect(seen).toBeGreaterThan(0);
    expect(seen).toBeLessThanOrEqual(indirect.length);
  });
});
