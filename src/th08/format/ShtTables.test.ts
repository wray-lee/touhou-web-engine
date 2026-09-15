/**
 * Fingerprint of the shipped firing chains.
 *
 * `ShtFile.ts` used to read twelve scalars out of a `.sht` and stop, which left
 * the whole player-side shot layer hand-written in `CharacterProfile.ts` with
 * made-up constants. This file is the other half of the format: it parses every
 * entry of every power tier of all eight shipped tables and requires the reading
 * to match what the bytes actually say.
 *
 * The numbers below were measured off the files, not asserted from hope. They are
 * what proves the port is missing something real: **98 of 227 entries - 43 % -
 * fire from an option slot rather than from the ship**, and the `ply00` pair is
 * the clearest case, because 霊夢's own table has none at all while 紫's has ten.
 * That is the 式神 tracking attack, and until this file there was nothing on our
 * side to show for it.
 *
 * Field layout: `Player::FUN_0044fb70` (`Player.cpp:2633-2680`) and the walker
 * `Player::FUN_00450f60` (`:3090-3160`).
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { parseShtTables, shtTableForPower, type ShtPowerTable, type ShtShotEntry } from './ShtFile';

const RAW_DIR = join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const FILES = [
  'ply00a.sht',
  'ply00as.sht',
  'ply01a.sht',
  'ply01as.sht',
  'ply02a.sht',
  'ply02as.sht',
  'ply03a.sht',
  'ply03as.sht',
] as const;

const hasAssets = FILES.every((f) => existsSync(join(RAW_DIR, f)));

const tables = (file: string): ShtPowerTable[] =>
  parseShtTables(new Uint8Array(readFileSync(join(RAW_DIR, file))));

const flat = (t: ShtPowerTable[]) => t.flatMap((x) => x.entries);

/** Count how many entries carry each value of a field. */
function histogram(entries: ShtShotEntry[], pick: (e: ShtShotEntry) => number): Record<number, number> {
  const out: Record<number, number> = {};
  for (const e of entries) out[pick(e)] = (out[pick(e)] || 0) + 1;
  return out;
}

describe.skipIf(!hasAssets)('the shipped firing chains', () => {
  it('carries the entry counts and power gates the retail loader walks', () => {
    const expectEach: Record<string, { tables: number; entries: number }> = {
      'ply00a.sht': { tables: 6, entries: 24 },
      'ply00as.sht': { tables: 6, entries: 23 },
      'ply01a.sht': { tables: 6, entries: 22 },
      'ply01as.sht': { tables: 6, entries: 12 },
      'ply02a.sht': { tables: 6, entries: 26 },
      'ply02as.sht': { tables: 8, entries: 61 },
      'ply03a.sht': { tables: 6, entries: 21 },
      'ply03as.sht': { tables: 6, entries: 38 },
    };
    for (const file of FILES) {
      const t = tables(file);
      expect(t.length, `${file} tables`).toBe(expectEach[file].tables);
      expect(flat(t).length, `${file} entries`).toBe(expectEach[file].entries);
      expect(t.map((x) => x.powerGate)).toEqual(
        [8, 24, 48, 80, 128, 999].concat(
          // Only the 妖々&蕾米莉亚 youkai table carries the two extra tiers that
          // `FUN_00450f60:3110-3114` reaches for during its own spell card.
          expectEach[file].tables === 8 ? [999, 999] : [],
        ),
      );
    }
  });

  it('has 紫 fire from an option that 霊夢 never uses', () => {
    const reimu = tables('ply00a.sht');
    const yukari = tables('ply00as.sht');
    expect(flat(reimu).filter((e) => e.option !== 0)).toHaveLength(0);
    const options = flat(yukari).filter((e) => e.option === 1);
    expect(options).toHaveLength(10);
    // Every one of them is a real update callback, not the plain interval fire.
    expect(histogram(options, (e) => e.updateCb)).toEqual({ 1: 10 });
    // And on the top tier the 式神 shoots a three-shot fan of its own.
    const top = shtTableForPower(yukari, 128);
    const fan = top.entries.filter((e) => e.option === 1);
    expect(fan.map((e) => Number(e.angle.toFixed(4)))).toEqual([-1.501, -1.5708, -1.6406]);
    expect(fan.every((e) => e.speed === 10 && e.interval === 5)).toBe(true);
    // The ship's own four shots on that tier stay fixed to it.
    expect(top.entries.filter((e) => e.option === 0).map((e) => e.dx)).toEqual([-24, -8, 8, 24]);
  });

  it('spreads options across every pair but 霊夢, and never past slot four', () => {
    const byFile: Record<string, Record<number, number>> = {};
    for (const file of FILES) byFile[file] = histogram(flat(tables(file)), (e) => e.option);
    expect(byFile['ply02as.sht']).toEqual({ 0: 9, 1: 12, 2: 14, 3: 14, 4: 12 });
    expect(byFile['ply03as.sht']).toEqual({ 0: 18, 1: 10, 2: 10 });
    expect(byFile['ply03a.sht']).toEqual({ 0: 11, 3: 10 });
    const all = FILES.flatMap((f) => flat(tables(f)));
    expect(all.filter((e) => e.option > 0)).toHaveLength(98);
    expect(all).toHaveLength(227);
    expect(Math.max(...all.map((e) => e.option))).toBe(4);
  });

  it('indexes every entry into a player ANM script above the reserved ten', () => {
    // `SetAndExecuteScriptIdx(slot, entry+0x24 + 10)` (`Player.cpp:2670`).
    for (const file of FILES) {
      for (const e of flat(tables(file))) {
        expect(e.anmScript + 10, `${file} anm`).toBeGreaterThanOrEqual(10);
        expect(e.anmScript + 10, `${file} anm`).toBeLessThan(48);
      }
    }
  });

  it('selects the power tier the way FUN_00450f60 walks it', () => {
    const t = tables('ply00a.sht');
    expect(shtTableForPower(t, 0).entries).toHaveLength(t[0].entries.length);
    expect(shtTableForPower(t, 7)).toBe(t[0]);
    expect(shtTableForPower(t, 8)).toBe(t[1]);
    expect(shtTableForPower(t, 47)).toBe(t[2]);
    expect(shtTableForPower(t, 128)).toBe(t[5]);
    // A bar can never reach the last gate, so the top tier is what max power reads.
    expect(shtTableForPower(t, 999)).toBe(t[5]);
  });
});
