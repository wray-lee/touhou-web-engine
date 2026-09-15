/**
 * The P2 fidelity gate: play ZUN's own title demos through the sim.
 *
 * This is the objective half of "90% of the original" in
 * `.scratch/PLAN-v3-th08-90.md` 4-P2. The four `demorpy*.rpy` files shipped inside
 * `th08.dat` are retail's own frame-by-frame record of four Lunatic stage runs.
 * Feeding their recorded input words into our translated scripts means the dodge
 * line is no longer a guess: the ship moves exactly where ZUN moved it, so a pattern
 * our scripts get wrong is a pattern ZUN's scripts did not have.
 *
 * **What the recordings can and cannot prove**, measured rather than assumed:
 *
 *  - `StageReplayData.graze`, `.pointItemsCollected` and `.clockTime` are all zero
 *    in all four files. The plan asked for those three to be reconciled against the
 *    header; the header does not carry them, so that half of the acceptance is not a
 *    target but a typo in the plan. `score` is the only populated field, and
 *    `SaveReplay:730` writes it at the *end* of a stage while `AddedCallbackDemo`
 *    seeds the *start* of a stage from the previous block -- which a single-stage
 *    recording does not have. So score is a floor to climb toward, never an equality.
 *  - The stream outlives the playing. `demorpy3` holds Ctrl (`TH_BUTTON_SKIP`) from
 *    f=6969 for 72 frames and stops firing at f=6955, because the recording keeps
 *    going through the result screen. `playableFrames` is where the performance
 *    actually ends, and every "did the stage clear" question has to be asked inside
 *    it.
 *  - Our bullet field is not bit-identical to retail's. The first landed test on
 *    `demorpy3` is at f=695 with the shot's centre 3.1 px off the ship's -- a small
 *    drift, but ZUN's line threads gaps, so a drifted pattern closes them. Until the
 *    float and RNG streams match to the bit, `deaths === 0` is not reachable and
 *    asserting it would only mean asserting nothing.
 *
 * So the gate is a ratchet with a named target. Every number below is measured, and
 * each may only move toward `deaths -> 0`, `scoreRatio -> 1`:
 *
 *  1. the file decodes against its own checksum, holds exactly one stage block,
 *     every input word is a legal button set, and the pacing law
 *     `pacing.length === floor(frames / 30) + 2` holds;
 *  2. the route derived from `shotType` alone agrees with the stage retail recorded;
 *  3. the sim runs ZUN's *whole* stream -- with lives on the line declined, so the
 *     tail is reachable -- without throwing, without a non-finite slot, without one
 *     refused ECL operand, and having actually fought a boss;
 *  4. the mortal run stays inside the measured death ceiling and above the measured
 *     score floor, which is the distance left to travel in one line each.
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { isKnownInput, parseReplay } from '../../th08/format/ReplayFile';
import { playReplay, recordedStage, teamForShotType, type ReplayOutcome } from './RetailReplay';
import { ROUTE_ORDER, stage4RouteForShotType } from './StageRoute';

const RAW_DIR = join(process.cwd(), 'public', 'assets', 'th08', 'raw');

/** The four recordings ZUN shipped as the title-screen demos. */
const DEMO_NAMES = ['demorpy0', 'demorpy1', 'demorpy2', 'demorpy3'] as const;

const hasAssets = DEMO_NAMES.every((name) => existsSync(join(RAW_DIR, `${name}.rpy`)));

/** Read once per file and reuse across every case in this suite. */
const rawCache = new Map<string, Uint8Array>();

function raw(name: string): Uint8Array {
  let hit = rawCache.get(name);
  if (!hit) {
    hit = new Uint8Array(readFileSync(join(RAW_DIR, `${name}.rpy`)));
    rawCache.set(name, hit);
  }
  return hit;
}

describe('retail demo decode', () => {
  it.skipIf(!hasAssets)('decodes its own checksum into exactly one stage block', () => {
    for (const name of DEMO_NAMES) {
      const file = parseReplay(raw(name));
      const blocks = file.stages.filter((s) => s !== null);
      expect(blocks.length, `${name} recorded ${blocks.length} stages, expected 1`).toBe(1);
      expect(file.difficulty, `${name} is not the Lunatic demo`).toBe(3);
      expect(file.isPractice, `${name} is not a single-stage recording`).toBe(true);
      expect(file.demoVariant, `${name} uses the 6-byte input reader`).toBe(0);
    }
  });

  it.skipIf(!hasAssets)('holds only legal button words and obeys the pacing law', () => {
    for (const name of DEMO_NAMES) {
      const decoded = recordedStage(raw(name));
      expect(decoded, `${name} recorded no stage`).not.toBeNull();
      const stage = decoded!.stage;
      expect(stage.inputs.length, `${name} stream shorter than its frame count`).toBe(stage.frames);
      const bad = stage.inputs.findIndex((bits) => !isKnownInput(bits));
      expect(bad, `${name} word ${bad} is not a legal button set`).toBe(-1);
      // `OnUpdateLowPrio:269-276` writes one pacing entry per 30 frames and the
      // recorder closes the block two entries early. Verified on all four files.
      expect(stage.pacing.length, `${name} pacing ${stage.pacing.length} vs frames ${stage.frames}`).toBe(
        Math.floor(stage.frames / 30) + 2,
      );
    }
  });
});

describe('retail demo routing', () => {
  it.skipIf(!hasAssets)('names a route we actually have for every demo', () => {
    for (const name of DEMO_NAMES) {
      const { stage } = recordedStage(raw(name))!;
      expect(ROUTE_ORDER[stage.stageIndex], `${name} has no route at index ${stage.stageIndex}`).toBeTruthy();
      expect(['easy', 'normal', 'hard', 'lunatic', 'extra']).toContain(recordedStage(raw(name))!.difficulty);
    }
  });

  it.skipIf(!hasAssets)('is Marisa on 4A, which is what the stage-4 branch predicts', () => {
    const { stage, shotType, difficulty } = recordedStage(raw('demorpy1'))!;
    expect(stage.stageIndex).toBe(3);
    expect(ROUTE_ORDER[stage.stageIndex]).toBe('stage4a');
    // The 4A/4B branch is decided by the team alone (`GameManager.cpp:1563-1610`),
    // so the recording is an oracle for our routing that it was never written for.
    expect(stage4RouteForShotType(shotType)).toBe('stage4a');
    expect(teamForShotType(shotType)).toBe('marisa-alice');
    expect(difficulty).toBe('lunatic');
  });

  it.skipIf(!hasAssets)('keeps the four demos on four distinct teams and routes', () => {
    const routes = new Set<string>();
    const teams = new Set<string>();
    for (const name of DEMO_NAMES) {
      const { stage, shotType } = recordedStage(raw(name))!;
      routes.add(String(ROUTE_ORDER[stage.stageIndex]));
      teams.add(teamForShotType(shotType));
    }
    expect(routes.size).toBe(DEMO_NAMES.length);
    expect(teams.size).toBe(DEMO_NAMES.length);
  });
});

describe('retail demo replay gate', () => {
  const rows: ReplayOutcome[] = [];
  const surveys: ReplayOutcome[] = [];

  /**
   * Measured from the mortal run, and each may only move toward the retail value.
   *
   * `DEATH_CEILING` walks down to 0 and `SCORE_FLOOR` walks up to 1. Raising a floor
   * or lowering a ceiling is progress; the opposite is a regression, and the message
   * names the demo so the diff says which stage moved.
   *
   * The floors are low because the runs are short: a mortal run stops at its eighth
   * death, which on `demorpy3` is frame 2807 of 9260. That is the distance.
   *
   * Re-baselined when `RandomizeAntiTamper` landed. Retail spends eight
   * `GetRandomU32` on the frame before every `Player::Die` (`Player.cpp:337`,
   * `:364`, `:474`), and the stage scripts draw their angles out of the same
   * generator, so adding the missing draw re-angles every bullet after each death.
   * Two demos moved up and two moved down: the score of a chaotic run is not a
   * monotone function of fidelity, which is why `TOTAL_SCORE_FLOOR` is the number
   * that actually ratchets. The per-demo floors are tripwires against a local
   * break, not a ladder.
   *
   * Re-baselined a second time when the item clock landed at retail's `+0x34`
   * reading (0.9, and 0.65 for Sakuya's unfocused field). Items then reach the
   * ship on different frames, which moves every `ITEM_POWER_FULL` clear-bullets
   * side effect (`ItemManager.cpp:269-279`), which re-times the bullet stream the
   * recorded dodge line runs into. `demorpy1` gained a death and lost none of its
   * score: ratio 0.295 -> 0.339, and the four-demo total 0.513 -> 0.574. Deaths
    * are the noisier of the two metrics on a short run, so the total is the number
    * that decides whether the change was worth it.
    */
  const DEATH_CEILING: Record<string, number> = {
    demorpy0: 8,
    demorpy1: 11,
    demorpy2: 8,
    demorpy3: 8,
  };
  const SCORE_FLOOR: Record<string, number> = {
    demorpy0: 0.139,
    demorpy1: 0.6,
    demorpy2: 0.092,
    demorpy3: 0.042,
  };
  /**
   * Sum of the four ratios: 0.480 before the anti-tamper draw, 0.513 after it,
   * 0.574 since the item clock landed at retail's `+0x34` reading. That change is
   * also why `demorpy0`'s tripwire moved down: the 0.9 scale shifts every item by
   * a tenth of a pixel per frame, which is enough to flip a per-frame pickup box
   * test on a recorded dodge line. The other three floors rose, and the total is
   * what ratchets.
   *
   * Re-baselined a fourth time for the `Player+5` / `Player+0xFDC` batch. Four
   * things in it move the meter, and the meter moves score: the settled side stopped
   * being hard-wired false, so grazing in youkai form began feeding it
   * (`Player.cpp:507-508`) and 时符 began printing under it (`:510-521`); the 时符
   * push moved onto the byte retail actually tests (`ItemManager.cpp:642`, `Player+3`)
   * and now swings +111 on the frame Shift goes down rather than -111; the meter
   * stopped moving during the 30 frames retail freezes after a stance edge
   * (`Player.cpp:924`); and `Player+0xFDC` turned out to mean "any card, for its
   * whole length" instead of "Sakuya's clock", which put the fifth-damage shots
   * (`Player.cpp:3404`), the thirded kill bonus (`EnemyManager.cpp:302`) and the
   * op-173 script pause (`EnemyManagerUpdate.cpp:466-472`) under every bomb.
   *
   * The honest accounting, because two of the four moved the wrong way on paper:
   * `demorpy2` rose (0.081 -> 0.101) and `demorpy1` fell (0.324 -> 0.282) with the
   * new card scope, while `demorpy0`'s 0.104 -> 0.085 is *not* the meter -- disabling
   * each of the three meter edits in turn leaves it at 0.085, so what moved is the
   * collision cascade: its eighth death now lands on frame 5082 instead of 5036, and
   * a run that ends 46 frames later has simply visited other parts of the stage. This
   * batch is therefore bought with mechanism, not with the proxy; the total slid
   * 0.575 -> 0.517 and `TOTAL_SCORE_FLOOR` stays at 0.51, which is the number the next
   * fidelity claim has to push back up rather than these four tripwires.
   *
   * Re-baselined a fifth time when the three retail `ItemState`s landed
   * (`ItemManager.cpp:61-69`, `:109-137`, `:216-265`, `:315`). Two of them are worth a
   * sentence because they are the whole reason the numbers moved: a 时符 is forced
   * into a rising state that the item box cannot touch until it turns over, and the
   * collection line is blind to it while it rises; and a death pile now rides out to
   * a random point in the upper field over a second instead of falling in a row at
   * the wreck. Both are economy edits, not dodge edits -- 时符 feed `pointItemValue`
   * through `AddTimeOrbs` (`GameManager.cpp:206-210`), and 点 items are priced off
   * `pointItemValue` -- so every point-item pickup in all four recordings is worth a
   * different number afterwards. Measured: 0.140 / 0.340 / 0.093 / 0.043, total
   * 0.517 -> 0.616, with all four death counts still inside their ceilings. Two rows
   * rose a long way and two moved a little the other way, which is what a coupled
    * proxy does; the total is the number that ratchets, and it went up by a fifth, so
    * `TOTAL_SCORE_FLOOR` goes up with it rather than staying where it was.
    */
  /*
   * Re-baselined a sixth time for the bomb's own two halves -- the card's cancel
   * geometry, and the immunity that `FUN_0040be30` arms with it.
   *
   * `playerState = PLAYER_STATE_DEAD` is set in the same call that names the card
   * (`PlayerBomb.cpp:172`), and `Player::FUN_0044a230:335` answers an overlapping
   * bullet in that state by returning 1 without reaching `Die()`. That is the bomb's
   * real protection, and it runs for the card plus its red-flash tail -- 260..380
   * frames -- which is why `demorpy1` (one 魔理沙 card, its state timer 350) now walks
   * the whole recording instead of ending at frame 4128: 0.340 -> 0.605 on its own,
   * and it is the first time the four-demo total has cleared 0.8.
   *
   * The cancel side of the same batch took away an invented shield. Every card used to
   * erase a 96..128 px circle centred on the ship; retail has no such circle -- a card
   * erases exactly what its `playerSlotsC` entries cover, which is a 384-wide plate
   * above Marisa's ship, seven 96-wide strips for 未来永劫斬, a cross through
   * レミリア, one 1→551 px burst for アリス, and nothing at all beyond its own pieces
   * for 殺人ドール and 華胥の永眠. `demorpy1`'s 11th death is bought with that: the
   * ship no longer walks through a bullet lake untouched, so `DEATH_CEILING.demorpy1`
   * goes 10 -> 11 while its score floor goes 0.339 -> 0.6. Both numbers describe a
   * run that reaches further into the stage, which is the direction the ceilings were
   * written to be walked down from.
   */
  const TOTAL_SCORE_FLOOR = 0.88;

  it.skipIf(!hasAssets)(
    "runs ZUN's whole stream through the sim with nothing structural left to fix",
    async () => {
      // Lives are declined here so the tail is reachable: a mortal run stops at its
      // game over and then says nothing about frames 3000 onward.
      for (const name of DEMO_NAMES) {
        const out = await playReplay(name, raw(name), { immortal: true });
        surveys.push(out);

        expect(out.thrown, `${out.route} threw: ${out.thrown}`).toBe('');
        expect(out.badSlot, `${out.route} produced ${out.badSlot}`).toBe('');
        expect(out.refusals, `${out.route} refused operands: ${out.refusals.join('; ')}`).toEqual([]);
        expect(out.ran, `${out.route} stopped at ${out.ran} of ${out.frames} recorded frames`).toBe(
          out.frames,
        );
        // A demo that never reached a boss would satisfy all of the above for free.
        expect(out.bossFrames, `${out.route} never raised a boss life bar`).toBeGreaterThan(0);
        expect(out.score, `${out.route} earned no score at all`).toBeGreaterThan(0);
        // The recording is only a dodge line inside its playable envelope.
        expect(out.playableFrames, `${out.route} records no fire button`).toBeGreaterThan(0);
        expect(out.playableFrames, `${out.route} envelope past the stream`).toBeLessThanOrEqual(out.frames);
      }
    },
    600_000,
  );

  it.skipIf(!hasAssets)(
    'scores the mortal run against the measured fidelity ladder',
    async () => {
      for (const name of DEMO_NAMES) {
        rows.push(await playReplay(name, raw(name)));
      }

      console.log(
        [
          'demo      route    team             playable   ran clear deaths 1stDeath  bombs  blt   power   pic  score     retail    ratio',
          ...rows.map(
            (r) =>
              r.demo.padEnd(10) +
              r.route.padEnd(9) +
              r.character.padEnd(17) +
              String(r.playableFrames).padStart(8) +
              String(r.ran).padStart(6) +
              String(r.clearFrame).padStart(6) +
              String(r.deaths).padStart(7) +
              String(r.deathFrames[0] ?? '-').padStart(8) +
              String(r.bombsUsed).padStart(7) +
              String(r.peakBullets).padStart(5) +
              String(r.power).padStart(7) +
              String(r.pointItems).padStart(6) +
              String(r.score).padStart(10) +
              String(r.recordedScore).padStart(10) +
              String(r.scoreRatio.toFixed(3)).padStart(8),
          ),
        ].join('\n'),
      );

      for (const r of rows) {
        // A mortal run is allowed to end exactly one way: out of lives. Anything else
        // in `thrown` is an exception or a bad slot.
        if (r.thrown) {
          expect(r.thrown, `${r.demo} ended for a reason other than spending its lives`).toMatch(
            /game over \(lives spent\)$/,
          );
        }
        const ceiling = DEATH_CEILING[r.demo];
        expect(
          r.deaths,
          `${r.demo}: ${r.deaths} deaths, ceiling ${ceiling}. Lower it by making the patterns agree with ZUN's.`,
        ).toBeLessThanOrEqual(ceiling);
        const floor = SCORE_FLOOR[r.demo];
        expect(
          r.scoreRatio,
          `${r.demo}: ratio ${r.scoreRatio.toFixed(3)} fell below the measured floor ${floor}`,
        ).toBeGreaterThanOrEqual(floor);
      }

      const total = rows.reduce((sum, r) => sum + r.scoreRatio, 0);
      expect(
        total,
        `combined score ratio ${total.toFixed(3)} fell below the measured floor ${TOTAL_SCORE_FLOOR}`,
      ).toBeGreaterThanOrEqual(TOTAL_SCORE_FLOOR);
    },
    600_000,
  );

  it.skipIf(!hasAssets)('keeps the survey and the mortal run telling the same story', () => {
    expect(surveys.length).toBe(DEMO_NAMES.length);
    for (const s of surveys) {
      // The immortal survey is the same script and the same inputs, so the only
      // legitimate difference is how far each got.
      expect(s.deaths, `${s.demo} spent a life it was told not to`).toBe(0);
      expect(s.graze, `${s.demo} grazed nothing, so nothing was ever near`).toBeGreaterThan(0);
    }
  });

  it.skipIf(!hasAssets)(
    'reproduces itself to the frame',
    async () => {
      // Determinism is the precondition for any of the above meaning anything: the
      // sim must not depend on wall-clock, Map iteration order, or Math.random.
      const a = await playReplay('demorpy3', raw('demorpy3'));
      const b = await playReplay('demorpy3', raw('demorpy3'));
      expect(b.score).toBe(a.score);
      expect(b.power).toBe(a.power);
      expect(b.graze).toBe(a.graze);
      expect(b.pointItems).toBe(a.pointItems);
      expect(b.frames).toBe(a.frames);
      expect(b.ran).toBe(a.ran);
    },
    600_000,
  );
});
