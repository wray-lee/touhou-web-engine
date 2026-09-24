/**
 * The transcription of the shipped sound bank.
 *
 * `g_SFXList` and `g_SoundBufferIdxVol` (`SoundPlayer.cpp:20-37`) are the only
 * evidence for what each sound index *is*, so the copies in `RetailSound.ts` are
 * checked against the decompilation's own text rather than against memory. The
 * index names that gameplay uses are pinned too, because picking the wrong one is
 * how the port ended up playing the pause-menu tick for the player's shot.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { RETAIL_SE_FILES, RETAIL_SE_VOL, SE_BY_NAME, SE_IDX, panFromPlayfieldX } from './RetailSound';

const REF = 'D:/Projects/th08web-ref/src/SoundPlayer.cpp';
const ref = fs.existsSync(REF) ? fs.readFileSync(REF, 'utf8') : null;

/** Every recording the table names has to be where the extraction put it. */
const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasRawAudio =
  fs.existsSync(RAW_DIR) &&
  RETAIL_SE_FILES.every((file) => fs.existsSync(path.join(RAW_DIR, file.split('/').pop()!)));

describe('retail sound bank', () => {
  it('has one row per SoundIdx and one path per buffer', () => {
    // `enum SoundIdx` runs 0..45 once NO_SOUND (-1) is excluded, and the port adds
    // two named recordings of its own above that range (see `RETAIL_SE_FILES`).
    expect(RETAIL_SE_VOL).toHaveLength(48);
    expect(RETAIL_SE_FILES.length).toBeGreaterThanOrEqual(36);
    for (const entry of RETAIL_SE_VOL) {
      expect(entry.buffer).toBeGreaterThanOrEqual(0);
      expect(entry.buffer).toBeLessThan(RETAIL_SE_FILES.length);
      // DirectSound takes tenths of a decibel; nothing in the bank is boosted.
      expect(entry.mb).toBeLessThanOrEqual(0);
      expect(entry.mb).toBeGreaterThan(-10000);
    }
  });

  describe.skipIf(!ref)('decompilation comparison', () => {
    it('matches the two arrays in the decompilation line for line', () => {
      const files = [...ref!.matchAll(/"(se_[^"]+\.wav)"/g)].map((m) => m[1]);
      expect(files).toHaveLength(36);
      expect(RETAIL_SE_FILES.slice(0, 36).map((p) => p.split('/').pop())).toEqual(files);
      const rows = [...ref!.matchAll(/\{(\d+),\s*(-?\d+),\s*(-?\d+)\}/g)].map((m) => ({
        buffer: Number(m[1]),
        mb: Number(m[2]),
      }));
      expect(rows).toHaveLength(46);
      expect(RETAIL_SE_VOL.slice(0, 46)).toEqual(rows);
    });
  });

  describe.skipIf(!hasRawAudio)('extracted recordings', () => {
    it('points at recordings the extraction actually produced', () => {
      for (const file of RETAIL_SE_FILES) {
        const name = file.split('/').pop()!;
        expect(fs.existsSync(path.join(RAW_DIR, name)), name).toBe(true);
      }
    });
  });

  it('names the indices the gameplay call sites prove', () => {
    // The firing sound is not inferred from a call site at all: every shooting entry
    // in all eight shipped `.sht` files carries id 0, and `FUN_0044fb70:2666` plays
    // whatever is there. Its recording is se_plst00 - player, shoot.
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.shot].buffer]).toMatch(/se_plst00/);
    expect(SE_IDX.shot).toBe(0);
    // Index 15 is the card's own tail (`FUN_0044cbf0`), which the port used to
    // believe was the shot because it is `se_tan00` and is panned by the ship.
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.cardEnd].buffer]).toMatch(/se_tan00/);
    // Every team's bomb opens with `SOUND_D` -> se_gun00 (`PlayerBomb.cpp:215`).
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.bomb].buffer]).toMatch(/se_gun00/);
    // Confirm, back and cursor move are the three the port used to guess.
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.menuConfirm].buffer]).toMatch(/se_ok00/);
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.menuBack].buffer]).toMatch(/se_cancel00/);
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.menuMove].buffer]).toMatch(/se_select00/);
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.playerDeath].buffer]).toMatch(/se_pldead00/);
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.spellCapture].buffer]).toMatch(/se_cardget/);
    expect(RETAIL_SE_FILES[RETAIL_SE_VOL[SE_IDX.graze].buffer]).toMatch(/se_graze/);
  });

  it('answers every legacy engine name with a real index', () => {
    for (const [name, idx] of Object.entries(SE_BY_NAME)) {
      expect(RETAIL_SE_VOL[idx], name).toBeTruthy();
    }
    expect(SE_BY_NAME.shoot).toBe(SE_IDX.shot);
    expect(SE_BY_NAME.bomb).toBe(SE_IDX.bomb);
  });

  it('pans across the playfield the way DirectSound was fed', () => {
    expect(panFromPlayfieldX(192)).toBe(0);
    expect(panFromPlayfieldX(0)).toBe(-1);
    expect(panFromPlayfieldX(384)).toBe(1);
    expect(panFromPlayfieldX(288)).toBeCloseTo(0.5, 6);
    // A request with no position (op 124) stays centred rather than going off-axis.
    expect(panFromPlayfieldX(Number.NaN)).toBe(0);
  });
});
