/**
 * Grounds the player tables in the shipped `ply0?a{,s}.sht` files.
 *
 * `CharacterProfile.ts` carries per-team speeds and hit boxes as literals, and
 * every one of them used to be a guess — the comment above `TEAM_SPEEDS` records
 * that a single shared constant was 20-56 % off for three of the four teams,
 * which is precisely how all four ZUN demos ended up dying every few hundred
 * frames. This file is what turns those literals from a guess into a reading:
 * parse the retail bytes and require the table to agree.
 *
 * The retail loader is `Player::AddedCallback` (`Player.cpp:1619-1633`), which
 * copies +0x0C, +0x10 and +0x18 into the ship's three boxes *halved*, and
 * `Player::FUN_0044aec0` (`:795-820`), which takes the fast speeds off the
 * primary table and the focused speeds off the secondary one.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { parseSht } from './ShtFile';
import { CHARACTER_PROFILES, type CharacterId } from '../../touhou-common/player/CharacterProfile';

const RAW_DIR = join(process.cwd(), 'public', 'assets', 'th08', 'raw');

/** shotType index → the `plyNN` pair, and the team that index selects. */
const TEAMS: { id: CharacterId; ply: string }[] = [
  { id: 'reimu-yukari', ply: 'ply00' },
  { id: 'marisa-alice', ply: 'ply01' },
  { id: 'sakuya-remilia', ply: 'ply02' },
  { id: 'youmu-yuyuko', ply: 'ply03' },
];

const hasAssets = TEAMS.every(({ ply }) =>
  [`${ply}a.sht`, `${ply}as.sht`].every((f) => existsSync(join(RAW_DIR, f))),
);

const sht = (file: string) => parseSht(new Uint8Array(readFileSync(join(RAW_DIR, file))));

/**
 * The .sht values are stored as IEEE-754 single precision, so `2 * Math.SQRT2`
 * in a double is not bit-identical to the `2.8284271` on disk. Compare through
 * `fround` rather than pretending the table is exact.
 */
const f32 = (n: number) => Math.fround(n);

describe.skipIf(!hasAssets)('retail .sht files', () => {
  it('parses all eight shipped tables', () => {
    for (const { ply } of TEAMS) {
      for (const suffix of ['a', 'as']) {
        const parsed = sht(`${ply}${suffix}.sht`);
        // Every field is a real number out of a real file, and the speeds are in
        // the order of magnitude the playfield needs.
        for (const value of Object.values(parsed)) {
          expect(Number.isFinite(value), `${ply}${suffix} produced ${value}`).toBe(true);
        }
        expect(parsed.fastSpeed).toBeGreaterThan(1);
        expect(parsed.slowSpeed).toBeGreaterThan(0.5);
        expect(parsed.slowSpeed).toBeLessThan(parsed.fastSpeed);
      }
    }
  });

  it('agrees with the per-team speeds in CHARACTER_PROFILES', () => {
    for (const { id, ply } of TEAMS) {
      const primary = sht(`${ply}a.sht`);
      const secondary = sht(`${ply}as.sht`);
      const profile = CHARACTER_PROFILES[id];

      // `Player.cpp:810-817`: unfocused speed comes from the primary table.
      expect(f32(profile.fastSpeed), `${id} fastSpeed`).toBe(f32(primary.fastSpeed));
      expect(f32(profile.fastDiagonalSpeed), `${id} fastDiagonalSpeed`).toBe(f32(primary.fastDiagonalSpeed));
      // `Player.cpp:795-802`: focused speed comes from the secondary table.
      expect(f32(profile.slowSpeed), `${id} slowSpeed`).toBe(f32(secondary.slowSpeed));
      expect(f32(profile.slowDiagonalSpeed), `${id} slowDiagonalSpeed`).toBe(
        f32(secondary.slowDiagonalSpeed),
      );
    }
  });

  it('agrees with the three hit boxes, halved the way the loader halves them', () => {
    for (const { id, ply } of TEAMS) {
      const primary = sht(`${ply}a.sht`);
      const profile = CHARACTER_PROFILES[id];

      expect(f32(profile.hitboxHalfExtent), `${id} hit box`).toBe(f32(primary.hitboxHalfExtent));
      expect(f32(profile.grazeHalfExtent), `${id} graze box`).toBe(f32(primary.grazeHalfExtent));
      expect(f32(profile.itemPickupHalfExtent), `${id} item box`).toBe(f32(primary.itemPickupHalfExtent));
      expect(f32(profile.itemGrabSpeed), `${id} item grab`).toBe(f32(primary.itemGrabSpeed));
      expect(f32(profile.pointItemValueLine), `${id} collect line`).toBe(f32(primary.pointItemValueLine));
    }
  });

  it('grounds the item fall clock, which retail swaps with the focus flag', () => {
    for (const { id, ply } of TEAMS) {
      // `ItemManager.cpp:207-209`: unfocused uses the primary table's +0x34 and
      // focused uses the secondary's, the same split as the move speeds.
      const primary = sht(`${ply}a.sht`);
      const secondary = sht(`${ply}as.sht`);
      const profile = CHARACTER_PROFILES[id];

      expect(f32(profile.itemTimeScale), `${id} unfocused item clock`).toBe(f32(primary.itemTimeScale));
      expect(f32(profile.itemTimeScaleFocused), `${id} focused item clock`).toBe(
        f32(secondary.itemTimeScale),
      );
    }

    // Sakuya's is the one team the two halves disagree on, and it is the only
    // +0x34 in the pack that is not 0.9.
    expect(sht('ply02a.sht').itemTimeScale).toBeCloseTo(0.65, 5);
    expect(CHARACTER_PROFILES['sakuya-remilia'].itemTimeScale).toBeLessThan(
      CHARACTER_PROFILES['sakuya-remilia'].itemTimeScaleFocused,
    );
  });

  it('shows the differences the shared constants used to hide', () => {
    const speeds = TEAMS.map(({ ply }) => sht(`${ply}a.sht`).fastSpeed);
    const grazes = TEAMS.map(({ ply }) => sht(`${ply}a.sht`).grazeHalfExtent);
    const lines = TEAMS.map(({ ply }) => sht(`${ply}a.sht`).pointItemValueLine);

    // Reimu and Sakuya creep, Marisa and Youmu are quicker; nobody shares Reimu's
    // graze box, which is why 妖梦's hit box reads so much wider on screen.
    expect(new Set(speeds).size).toBeGreaterThan(1);
    expect(new Set(grazes).size).toBeGreaterThan(1);
    expect(new Set(lines).size).toBeGreaterThan(1);

    expect(speeds.map(f32)).toEqual([4, 5, 4, 5].map(f32));
    expect(grazes.map(f32)).toEqual([1.4, 1.4, 3, 1.5].map(f32));
    expect(lines.map(f32)).toEqual([128, 160, 128, 128].map(f32));
  });

  it('gives every team three bombs and a full power bar', () => {
    for (const { id, ply } of TEAMS) {
      const primary = sht(`${ply}a.sht`);
      expect(primary.bombCount, `${id} starting bombs`).toBe(3);
      expect(CHARACTER_PROFILES[id].maxPower, `${id} max power`).toBe(128);
    }
  });
});

describe('retail .sht availability', () => {
  it('says so when the retail pack is not installed', () => {
    if (!hasAssets) {
      // Not a failure — the pack is gitignored. This just records that the
      // grounding suite above was skipped rather than silently green.
      expect(existsSync(RAW_DIR)).toBe(false);
    } else {
      expect(true).toBe(true);
    }
  });
});
