import { describe, expect, it } from 'vitest';
import { Rng } from './Rng';

/**
 * The sequence below is the reference algorithm evaluated by hand from
 * Rng::GetRandomU16, so a regression here would silently desynchronise every
 * randomised bullet pattern.
 */
function reference(seed: number, count: number): number[] {
  let s = seed & 0xffff;
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const temp = ((s ^ 0x9630) - 0x6553) & 0xffff;
    s = (((temp & 0xc000) >> 14) + temp * 4) & 0xffff;
    out.push(s);
  }
  return out;
}

describe('Rng', () => {
  it('matches the 16-bit recurrence from several seeds', () => {
    for (const seed of [0, 1, 0x1234, 0xffff]) {
      const rng = new Rng(seed);
      const draws = Array.from({ length: 12 }, () => rng.randomU16());
      expect(draws).toEqual(reference(seed, 12));
    }
  });

  it('composes the 32-bit draw from two 16-bit draws, high word first', () => {
    const a = new Rng(0x1234);
    const b = new Rng(0x1234);
    expect(a.randomU32()).toBe(((b.randomU16() << 16) | b.randomU16()) >>> 0);
  });

  it('keeps float draws inside their documented ranges', () => {
    const rng = new Rng(0xabcd);
    for (let i = 0; i < 500; i++) {
      const f = rng.randomF32();
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
      const s = rng.randomF32Signed();
      expect(s).toBeGreaterThanOrEqual(-1);
      expect(s).toBeLessThan(1.0001);
    }
  });

  it('returns zero for a zero range instead of dividing by it', () => {
    const rng = new Rng(7);
    expect(rng.randomU16InRange(0)).toBe(0);
    expect(rng.randomU32InRange(0)).toBe(0);
  });

  it('counts generations and can restore the backup seed', () => {
    const rng = new Rng(42);
    rng.randomU16();
    rng.randomU16();
    expect(rng.getGenerationCount()).toBe(2);
    rng.resetGenerationCount();
    expect(rng.getGenerationCount()).toBe(0);
    rng.setSeed(0x99);
    rng.restoreBackup();
    expect(rng.getSeed()).toBe(42);
  });
});
