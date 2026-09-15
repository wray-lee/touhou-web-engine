/**
 * ZUN's 16-bit pseudo-random generator, ported from `Rng::GetRandomU16` in
 * th08web-ref/src/Global.cpp.
 *
 * Every random value in Touhou 8 comes through this, so matching it exactly is
 * what lets the port replay a retail `.rpy` and land on the same bullets. The
 * arithmetic is deliberately 16-bit wrapping and the float helpers round through
 * f32, because the original divides by `UINT_MAX` / `INT_MAX` in single
 * precision and that rounding is observable.
 */
export class Rng {
  private seed: number;
  private seedBackup: number;
  private generationCount = 0;

  constructor(seed = 0) {
    this.seed = seed & 0xffff;
    this.seedBackup = this.seed;
  }

  /** Next 16-bit value: `(seed ^ 0x9630) - 0x6553`, folded back into 16 bits. */
  randomU16(): number {
    const temp = ((this.seed ^ 0x9630) - 0x6553) & 0xffff;
    this.seed = ((((temp & 0xc000) >> 14) + temp * 4) & 0xffff) >>> 0;
    this.generationCount++;
    return this.seed;
  }

  /** Two 16-bit draws glued together, high word first. */
  randomU32(): number {
    return ((this.randomU16() << 16) | this.randomU16()) >>> 0;
  }

  /** [0, 1) in f32, including the original's divide-by-UINT_MAX rounding. */
  randomF32(): number {
    return Math.fround(this.randomU32() / 4294967295);
  }

  /** [-1, 1) in f32, the signed variant used for mirrored spreads. */
  randomF32Signed(): number {
    return Math.fround(this.randomU32() / 2147483647 - 1);
  }

  randomU16InRange(range: number): number {
    return range !== 0 ? this.randomU16() % range : 0;
  }

  randomU32InRange(range: number): number {
    return range !== 0 ? this.randomU32() % range : 0;
  }

  randomF32InRange(range: number): number {
    return Math.fround(this.randomF32() * range);
  }

  randomF32SignedInRange(range: number): number {
    return Math.fround(this.randomF32Signed() * range);
  }

  setSeed(seed: number): void {
    this.seed = seed & 0xffff;
  }

  getSeed(): number {
    return this.seed;
  }

  /** Replays seed the retail engine restores from a replay sync point. */
  restoreBackup(): void {
    this.seed = this.seedBackup;
  }

  resetGenerationCount(): void {
    this.generationCount = 0;
  }

  getGenerationCount(): number {
    return this.generationCount;
  }
}

/** Global generator; the reference keeps exactly one (`g_Rng`). */
export const gRng = new Rng(0);
