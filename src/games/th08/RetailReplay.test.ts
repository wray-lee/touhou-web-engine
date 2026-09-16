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
   * Measured from the mortal run. The intent is that each only ever moves toward the retail
   * value; the numbered notes below record every time a chaotic re-angle made one of these
   * eight tripwires have to follow the measurement down instead, and why.
   *
   * `DEATH_CEILING` counts deaths inside the recording's playable envelope and walks
   * down to 0; `TOTAL_DEATH_CEILING` counts them over the whole stream and is the
   * tripwire behind it; `SCORE_FLOOR` walks up to 1 on the envelope number. Raising a
   * floor or lowering a ceiling is progress; the opposite is a regression, and the
   * message names the demo so the diff says which stage moved.
   *
   * The floors are low because the runs are short: a mortal run stops when its last
   * life goes, which on `demorpy3` is frame 3759, and the run ends at 4041 of a stream
   * that carries on to frame 6956 with the fire button off. That is the distance.
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
    demorpy0: 10,
    demorpy1: 10,
    demorpy2: 10,
    demorpy3: 8,
  };
  /**
   * Deaths over the whole recording, tail included, measured alongside the envelope
   * ceilings above. This is the second net, not a replacement for the first: a run
   * that stops clearing stages would show up here even if its envelope stayed clean.
   */
  const TOTAL_DEATH_CEILING: Record<string, number> = {
    demorpy0: 10,
    demorpy1: 11,
    demorpy2: 10,
    demorpy3: 8,
  };
  const SCORE_FLOOR: Record<string, number> = {
    demorpy0: 0.243,
    demorpy1: 0.356,
    demorpy2: 0.126,
    demorpy3: 0.03,
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
  /*
   * Re-baselined a seventh time for the ship's own weapon: `Player.shots[128]`, the
   * `.sht` firing walk, and the option slots it fires from.
   *
   * Until this change the four demos were scored by a weapon the port had written for
   * itself - one invented rate, invented damage, one hitbox for every shot type, and
   * no partner at all. They are now scored by ZUN's numbers: `FUN_00450f60` picks the
   * power tier off `GetPower()` against the eight files' own gates, `FUN_0044fb70`
   * fills damage, cadence, speed, the 18x48 box 霊夢's third charm carries, and which
   * of the four option slots a shot starts from, and `FUN_00451670` retires a hit into
   * `state = 2` instead of deleting it. 98 of the 227 shipped entries fire from an
   * option, and every one of them had been coming out of the ship.
   *
   * Measured: 0.139 / 0.605 / 0.092 / 0.042 -> 0.155 / 0.588 / 0.116 / 0.096, total
   * 0.881 -> 0.955. Two of the four rows moved a long way, and the biggest is the one
   * that was furthest from the data: `demorpy3` is 咲夜&蕾米莉亚, whose focused table
   * `ply02as` spends 20 of its 61 entries on the four familiars that route `eb70`
   * arms, so a fifth of her weapon simply did not exist before.
   *
   * `demorpy1` is the row that went down, by 2.8%, and it went down for a reason that
   * counts as fidelity: every entry in `ply01a` carries fire callback 2 or 3, which is
   * `PlayerShotUpdateFdd0` - and that callback refuses to shoot while `Player+0xFDC`
   * says a card is playing (`:2696-2706`). 魔理沙's weapon is silent during her own
   * 恋符「ミサイルスパーク」 in the original, and now it is here too, so the run banks
   * less damage across the card it uses.
   *
   * `DEATH_CEILING.demorpy2` and `.demorpy3` each go up by one, which is the same
   * trade the sixth note describes and for the same reason: enemies now die on
   * different frames, and the ECL spawn chains key off those frames, so the recorded
   * dodge line meets patterns that had not been released yet. Both runs also score
   * 25% and 123% more, and the total is what ratchets: `TOTAL_SCORE_FLOOR` 0.88 -> 0.95.
   */
  /*
   * Re-baselined an eighth time for one row, one death: 灵梦的式神开始打了.
   *
   * `Player::OptionHomingToPlayer` (`Player.cpp:2123-2129`) sends `SetInterrupt(3)` the
   * moment it takes a chaser over, and `player00.anm` script 18 really does ship an
   * interrupt label for it; without that tag the 式神 flies onto its host and never
   * attacks. The port had three wrong turns there, all from the same decompile: the turn
   * tag was guessed from `scaleSign` instead of read off the six branches at `:2016-2069`,
   * the takeover never fired the attack tag, and the "is this an attached enemy" test
   * excluded the wrong half of the pair — `EclManager.cpp:129-132` reads `+0x2DA4`, which
   * `EclRunLow.inl:1069` writes on the *child*, so the guard is about sub-机 and the port
   * had it on the host. 追击目标 also used to go stale: retail holds a pointer and drops it
   * when the slot dies (`EnemyManagerUpdate.cpp:448-452`), so a re-pick now revalidates the
   * slot before trusting the cached position.
   *
   * Measured on `demorpy0`, the 霊夢 & 紫 row the fix actually touches: 8 deaths in
   * 5047 frames -> 9 deaths in 6063, score ratio 0.154 -> 0.193. The death *rate* goes down
   * (1.59 -> 1.48 per thousand frames) and the run reaches 1016 frames further; the ceiling
   * is a count, not a rate, so it moves with the extra life spent at the far end of a longer
   * run. Same trade as the sixth and seventh notes, and the floors go up with it:
   * `demorpy0` 0.154 -> 0.19, `TOTAL_SCORE_FLOOR` 0.95 -> 0.99.
   */
  /*
   * Re-baselined a ninth time, and this one moves the total *down* — 0.99 -> 0.94. It is
   * written down in full because it is the case this file's own note warns about: the score
   * of a chaotic run is not a monotone function of fidelity.
   *
   * The change is `tailPosition0`, the point 霊夢's charms bend toward. The port carried it
   * from frame to frame; retail does not — `Player::OnUpdate` calls `FUN_0044d420` on its
   * common path right after the firing chain (`Player.cpp:1100`, body at `:1493-1497`), and
   * that writes `-999` back over both aim vectors (`0xE2AA4`, `0xE2AB0`) and clears the valid
   * bit (`0xE2AC0`). With a per-frame wipe the rule reads "aim at the boss closest to the
   * muzzle if a boss is up, otherwise hunt the lowest enemy"; with the port's carry-forward
   * it read "the first boss-flagged thing to appear in this stage owns the aim forever
   * afterwards", so 霊夢 stopped tracking fairy waves after her first mid-boss and her
   * charms flew straight up. That is the difference the eighth note's number was buying back.
   *
   * Measured: only `demorpy0` moves — it is the only 霊夢 row — and the other three are
   * bit-identical (0.588 / 0.116 / 0.096, same 11 / 9 / 9 deaths). Her run is 5453 frames
   * with 9 deaths (6063 with 9 before), 109 point items instead of 173, ratio 0.193 -> 0.143.
   * The charm hunt trades column DPS for sweeping the lowest threat, which on a fixed
   * recorded dodge line buys fewer kills *here*; whether that is right is not something this
   * metric can decide, because the recording was made against ZUN's timings and every row
   * moves whenever an enemy's death frame moves. What decides it is the byte-level evidence
   * above, which is unambiguous, plus the qualitative check on a live page: hold fire with no
   * boss up and watch the charms go looking for something.
   *
   * `SCORE_FLOOR.demorpy0` therefore goes 0.19 -> 0.14 — still above the 0.139 and 0.154 that
   * the sixth and seventh notes measured — and `TOTAL_SCORE_FLOOR` 0.99 -> 0.94, both with
   * this note attached rather than a quiet edit.
   */
  /*
   * Re-baselined a tenth time. Three changes ride together, and the second one moves
   * every number in this file down, so the whole accounting is written out here.
   *
   * 1) 妖梦&妖妖's blades. `OPTION_ROUTES[3]` arms slot 1 and slot 2 with
   *    `FUN_0044f930`, and letting go of focus hands slot 2 to
   *    `g_PlayerRoute3ExitUpdateCallbacks[2]` = `FUN_0044f2d0` (`Player.cpp:749-752`).
   *    Neither body existed here: the two slots sat at their zeroed position while
   *    `ply03a`/`ply03as` fire nine entries out of them, so a third of the team's
   *    weapon left the muzzle at the origin of the field. With the swing, the
   *    sixteen-frame position history (`vectors2CC`, `:985-991`) and the eight-way
   *    facing table (`:2410-2456`) translated, `demorpy2` stopped collapsing at frame
   *    4210 and walked ZUN's whole performance: envelope deaths 9 -> 7, deaths over the
   *    recording 9 -> 11, ran 4210 -> 6604, point items 196 -> 618. `DEATH_CEILING`
   *    tightens with it, 9 / 11 / 9 / 9 -> 9 / 10 / 7 / 9, and a second table appears
   *    under it (`TOTAL_DEATH_CEILING`, 9 / 11 / 11 / 9) so a tail that cannot stop
   *    bleeding cannot rot unnoticed either.
   *
   * 2) `GameManager::AddScore` (`GameManager.cpp:191-194`) is `score += score / 10`,
   *    and it is the one door every point in the game walks through: the graze's
   *    2000/4000 (`Player.cpp:505-506`), an enemy's own 100
   *    (`EnemyManagerUpdate.cpp:837`, `:845`), the shot hit's `10 * (damage / 5)`
   *    (`:686`), a card's bonus (`Spellcard.cpp:806`, `:1428`). The port had been
   *    adding four of those five whole -- only the item path divided (`ItemPool.ts:519`)
   *    -- so the read-out paid ten times what retail pays for grazes, hits, kills and
   *    cards, and a captured 慧音 card moved it by 19,993,420. Items are the biggest
   *    contributor, which is why the correction is between 1.6x and 2.1x a row and not
   *    10x: measured 0.143 / 0.570 / 0.226 / 0.096 -> 0.068 / 0.362 / 0.126 / 0.046.
   *    `TOTAL_SCORE_FLOOR` goes 0.94 -> 0.60 with this note attached rather than a
   *    quiet edit, and that is the honest direction: the floor was standing on an
   *    inflated read-out. One row rose through the correction -- 妖梦's 0.116 -> 0.126,
   *    i.e. her blades bought more than the funnel took away.
   *
   * 3) The measurement window. Until a run could outlive the envelope, "score at the
   *    last frame run" and "score when ZUN stopped playing" were the same number. Now
   *    two runs overrun it, and past that frame the recorded ship holds still with the
   *    gun off: the stage cannot end, so every point beyond it is earned in a tail the
   *    recording never performed and cannot be set against `recordedScore`, which is a
   *    single end-of-stage figure. The ladder therefore reads `scoreAtEnvelope` and
   *    `envelopeDeaths`. `demorpy1` moved for this reason alone and for no other:
   *    0.588 -> 0.570 is 338 frames of tail taken out of the numerator, not a life.
   *
   * The bug that made the row look impossible, found while writing (1) and fixed in
   * the same pass: `Spellcard::flags` bit 2, the capture permission. `StartSpell`
   * raises it (`Spellcard.cpp:766`), `EndSpell` is its only reader (`:1070`) and wraps
   * both the bonus and the time-orb ladder inside it, and the ship takes it back down
   * twice -- `acceptBomb` calls `FUN_0044cba0` (`Player.cpp:1288`) and the frame a death
   * stops being cancellable calls `FUN_0044d150` (`:1334`). Both also zero
   * `bonusProgress`, which is why the plate falls to 0 on screen rather than keeping its
   * last value (`Spellcard.cpp:1597-1600` reads the same bit). This demo bombs three
   * times and dies eleven, so under retail's rule it captures nothing at all -- which is
   * also how the recording's stage total can sit below a single card's bonus. Measured
   * on the row, before the funnel: 21,765,248 -> 1,771,828.
   *
   * And one mechanism the funnel had to land before it was worth adding:
   * `Player.cpp:1101-1116` pays `AddScore(100)` every frame the 妖率計 sits pinned at
   * either extreme, with no dialogue on screen -- 600 points a second for staying
   * pinned, which is the price the game puts on living at the ends of the meter. The
   * score is in the sim now; the four result-screen frame counters beside it are not.
   */
  /*
   * Re-baselined an eleventh time, for one change with one cause, because it moves all
   * four rows and two of them the wrong way on paper.
   *
   * The 判定点光环 is now the retail effect, not a port invention. `Player.cpp:704-707`
   * calls `FUN_00425870(22, &position, 2, 1, -1)` on the focus press edge and
   * `:768-770` sends `SetInterrupt(1)` on the release; template 22 of `g_EffectTemplates`
   * (read out of the shipped `th08.exe` at 0x004c6d30, row 22: script 54, mover
   * `FUN_00426c40`, no init callback) runs `SPRITE 218; ALPHA 0; F_SET_RAND(v10004, 1.0);
   * F_SET(..., 0.5); I_SET(v10004, 0.03); ANGULAR_VELOCITY(0, 0, v10004);
   * ALPHA_TIME(20, 1, 255); STOP; INTERRUPT_LABEL 1; ALPHA_TIME(30, 1, 0); DELETE`.
   *
   * The draw is the point. `F_SET_RAND` reaches `AnmManager.cpp:637-640`, which pulls two
   * `u16`s out of the *global* `g_Rng` -- the same generator every ECL angle is drawn from.
   * So lighting the ring re-angles the rest of the stage, exactly as it does on a retail
   * machine, and this run is chaotic: two deterministic executions of the same build
   * printed the identical table (0.243 / 0.357 / 0.126 / 0.030), and an isolation run that
   * gave the loader its own `Rng` instead of `gs.rng` produced a third set of numbers
   * (0.068 / 0.347 / 0.098 / 0.014), which is what confirms where the perturbation comes
   * from. The private generator was then reverted: sharing `g_Rng` with the bullet scripts
   * *is* the retail semantics, and a glow that cannot disturb a bullet lake is a glow the
   * original does not have. `EclStageLoader.ts:188-189` has handed the pool `gs.rng` since
   * the pool landed (`ac85027`), so the coupling is not new here -- what is new is one more
   * producer on the stream, and one the original actually has.
   *
   * What it costs and what it buys, per row:
   *   `demorpy0`  deaths 9 -> 10, ratio 0.068 -> 0.243 (its run now survives stages it
   *              used to lose, which is neither credit nor blame: the recorded dodge line
   *              meets different bullets),
   *   `demorpy1`  deaths 10 -> 10, ratio 0.362 -> 0.35669 (measured to five places, so its
   *              tripwire sits at 0.356 and not at the rounded 0.357),
   *   `demorpy2`  deaths 7 -> 10, ratio 0.126 -> 0.126 (her weapon is untouched; her stage
   *              simply lost three lives to re-angled fire),
   *   `demorpy3`  deaths 9 -> 8, ratio 0.046 -> 0.030.
   * `DEATH_CEILING` goes 9 / 10 / 7 / 9 -> 10 / 10 / 10 / 8 and `TOTAL_DEATH_CEILING`
   * 9 / 11 / 11 / 9 -> 10 / 11 / 10 / 8: two rows loosen, `demorpy3` tightens, and every
   * one of the eight numbers is the measurement rather than a round figure. The ratchet is
   * `TOTAL_SCORE_FLOOR`, and the ratchet goes *up*: 0.60 -> 0.75. That is the whole
   * argument for taking the change -- the sim now consumes the rng the retail sim consumes,
   * and the four-demo score that a fidelity claim has to beat is 25% higher than before.
   */
  const TOTAL_SCORE_FLOOR = 0.75;

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
          'demo      route    team             playable   ran clear 1stDeath  bombs  blt   power   pic  envDeath deaths  envScore   score    retail   envRatio  ratio',
          ...rows.map(
            (r) =>
              r.demo.padEnd(10) +
              r.route.padEnd(9) +
              r.character.padEnd(17) +
              String(r.playableFrames).padStart(8) +
              String(r.ran).padStart(6) +
              String(r.clearFrame).padStart(6) +
              String(r.deathFrames[0] ?? '-').padStart(8) +
              String(r.bombsUsed).padStart(7) +
              String(r.peakBullets).padStart(5) +
              String(r.power).padStart(7) +
              String(r.pointItems).padStart(6) +
              String(r.envelopeDeaths).padStart(9) +
              String(r.deaths).padStart(7) +
              String(r.scoreAtEnvelope).padStart(11) +
              String(r.score).padStart(9) +
              String(r.recordedScore).padStart(10) +
              String(r.envelopeScoreRatio.toFixed(3)).padStart(9) +
              String(r.scoreRatio.toFixed(3)).padStart(8),
          ),
          // Which frames the run bled on matters more than the count: the count only
          // says the ladder moved, the frames say which pattern window moved it.
          ...rows.map((r) => `  ${r.demo} deaths @ ${r.deathFrames.join(' ') || '-'}`),
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
        // Two ceilings, because the two numbers answer different questions. The
        // envelope one is the fidelity claim: ZUN's dodge line only *is* a dodge line
        // while he was playing it. The total one is a tripwire over the tail, where a
        // run that cannot finish the stage stands still and bleeds.
        const ceiling = DEATH_CEILING[r.demo];
        expect(
          r.envelopeDeaths,
          `${r.demo}: ${r.envelopeDeaths} deaths inside its ${r.playableFrames}-frame envelope, ceiling ${ceiling}. ` +
            `Lower it by making the patterns agree with ZUN's.`,
        ).toBeLessThanOrEqual(ceiling);
        expect(
          r.deaths,
          `${r.demo}: ${r.deaths} deaths over the whole recording, ceiling ${TOTAL_DEATH_CEILING[r.demo]}`,
        ).toBeLessThanOrEqual(TOTAL_DEATH_CEILING[r.demo]);
        const floor = SCORE_FLOOR[r.demo];
        expect(
          r.envelopeScoreRatio,
          `${r.demo}: envelope ratio ${r.envelopeScoreRatio.toFixed(3)} fell below the measured floor ${floor}`,
        ).toBeGreaterThanOrEqual(floor);
      }

      const total = rows.reduce((sum, r) => sum + r.envelopeScoreRatio, 0);
      expect(
        total,
        `combined envelope ratio ${total.toFixed(3)} fell below the measured floor ${TOTAL_SCORE_FLOOR}`,
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
