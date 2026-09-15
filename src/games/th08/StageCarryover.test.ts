/**
 * A campaign stage hand-off must not touch the run.
 *
 * `resetForStage` is the only thing that runs at the boundary, and retail's version
 * of it moves the ship and re-arms the spawn shield — it never re-issues lives,
 * bombs, power or score. Those four are run state, and refilling them every stage is
 * what made a cleared stage look like a new game.
 *
 * The spell bonus *is* per stage, so it is the one counter the boundary is allowed
 * to zero.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { TH08Game } from './TH08Game';

/** Drive the same private entry point the stage-clear handler uses. */
function handOff(game: TH08Game): void {
  (game as unknown as { beginNextStage(): void }).beginNextStage();
}

describe('campaign hand-off', () => {
  it('carries lives, bombs, power, score and graze into the next stage', () => {
    const game = new TH08Game({
      headless: true,
      campaign: true,
      difficulty: 'normal',
      character: 'reimu-yukari',
    });
    game.player.lives = 1;
    game.player.bombs = 0;
    game.player.power = 40;
    game.player.score = 987_654;
    game.player.graze = 321;
    game.spellBonus = 1_000_000;

    handOff(game);

    expect(game.stageNumber).toBe(2);
    expect(game.player.lives).toBe(1);
    expect(game.player.bombs).toBe(0);
    expect(game.player.power).toBe(40);
    expect(game.player.score).toBe(987_654);
    expect(game.player.graze).toBe(321);
    // The card bonus restarts per stage, which is what the result page prints.
    expect(game.spellBonus).toBe(0);
  });

  it('lands the ship on the 384-wide respawn point, not the old 448 centre', () => {
    const game = new TH08Game({ headless: true, campaign: true });
    game.player.position.x = 300;
    game.player.position.y = 200;
    handOff(game);
    expect(game.player.position.x).toBe(192);
    expect(game.player.position.y).toBe(384);
  });

  it('does not refill a run that continues', () => {
    const game = new TH08Game({ headless: true, campaign: true });
    game.player.lives = 0;
    game.player.bombs = 0;
    game.player.power = 128;
    game.player.score = 5_000_000;

    game.continueGame();

    // Arcade continue: fresh default stock, power back to zero, and the score is
    // replaced by the continue count itself.
    expect(game.retries).toBe(1);
    expect(game.player.score).toBe(1);
    expect(game.player.lives).toBe(3);
    expect(game.player.bombs).toBe(3);
    expect(game.player.power).toBe(0);
    expect(game.player.position.x).toBe(192);
    expect(game.player.position.y).toBe(384);
  });

  /**
   * `THANKS FOR PLAYING` closes a practice drill and nothing else. It used to appear
   * at the end of a campaign stage too, which read like the whole game had stopped.
   */
  describe('end-of-run banner', () => {
    it('is THANKS FOR PLAYING for a practice drill', () => {
      expect(new TH08Game({ headless: true, campaign: false }).clearBanner).toBe('THANKS FOR PLAYING');
    });

    it('is ALL CLEAR for a campaign that finishes stage 6', () => {
      expect(new TH08Game({ headless: true, campaign: true }).clearBanner).toBe('ALL CLEAR!');
    });

    /**
     * The banner has to actually be on screen. The results page is DOM chrome that
     * replaces the canvas, so handing the report over in the same frame that queued
     * the message meant `THANKS FOR PLAYING` was never painted for a single frame --
     * which is exactly how it read in the browser. The report now waits out the
     * banner and the transition tick releases it.
     */
    it('holds the closing banner before handing the run to the results screen', () => {
      let delivered: unknown = null;
      const game = new TH08Game({
        headless: true,
        campaign: false,
        onStageClear: (report) => {
          delivered = report;
        },
      });

      clearStage(game);

      expect(delivered).toBeNull();
      expect(game.hud.centerMessage).toBe('THANKS FOR PLAYING');
      expect(game.hud.centerMessageTimer).toBeGreaterThan(0);

      game.stepFrame(BANNER_FRAMES);

      expect(delivered).not.toBeNull();
      expect((delivered as { practice?: boolean }).practice).toBe(true);
    });
  });
});

/** Frames the closing banner holds, mirrored from `TH08Game`'s private constant. */
const BANNER_FRAMES = 180;

/** Run the stage-clear handler the same way the sim does when a timeline finishes. */
function clearStage(game: TH08Game): void {
  (game as unknown as { handleStageClear(): void }).handleStageClear();
}

/*
 * The theme is run state too, and not in a good way: `start()` asked for slot 0 once
 * and nothing asked again, so a run that finished stage 1 on its boss theme carried
 * 蠢々秋月 straight into stage 2. Retail re-runs `LoadMusic` for every stage
 * (`GameManager.cpp:1087-1092`), which is what `RetailDialogue.bindStage()` models --
 * it drops the song key, and this is the request that has to follow.
 */
const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

describe.skipIf(!hasAssets)('campaign hand-off re-issues the stage theme', () => {
  it('replaces the previous stage boss song with the new stage song', async () => {
    const game = new TH08Game({ headless: true, campaign: true, difficulty: 'normal' });
    game.start();
    await game.waitForScript();
    const play = (track: number) =>
      (game as unknown as { playStageSong(track: number): void }).playStageSong(track);

    expect(game.audio.bgmName).toBe('th08_00.ogg');
    // Stage 1's conversation ends on op 7 slot 1; that is the song to beat.
    play(1);
    expect(game.audio.bgmName).toBe('th08_03.ogg');

    handOff(game);
    await game.waitForScript();

    // Stage 2 opens on its own std slot 0, not on whatever stage 1 ended with.
    expect(game.stageNumber).toBe(2);
    expect(game.audio.bgmName).toBe('th08_04.ogg');
    game.stop();
  });

  it('restarts the stage song when the same stage is replayed', async () => {
    const game = new TH08Game({ headless: true, campaign: true, difficulty: 'normal' });
    game.start();
    await game.waitForScript();
    (game as unknown as { playStageSong(track: number): void }).playStageSong(1);
    expect(game.audio.bgmName).toBe('th08_03.ogg');

    (game as unknown as { restartStage(): void }).restartStage();
    await game.waitForScript();

    expect(game.audio.bgmName).toBe('th08_00.ogg');
    game.stop();
  });
});

/*
 * 妖怪名乗り gets one 灵击 back for every stage it closes. Retail arms the payout in
 * the stage-clear message script (`Gui.cpp:858-868`, message op 9), so it is a per-stage
 * reward rather than a refill: it only fires below three bombs, and never on the two
 * final stages. This is the counterpart to the death refill (`Player.cpp:1400-1409`),
 * which *is* a refill and is modelled in `PlayerSim`.
 */
describe('stage-clear bomb payout', () => {
  /** A runner clear enough for the stage-end handler to run against. */
  const stubRunner = (gs: { clockTime: number; timeOrbs: number; lastSpellTimeOrbThreshold: number }) =>
    ({
      gs,
      sweepItems: () => {},
      bullets: { clearByTag: () => {} },
      lasers: { clearAll: () => {} },
    }) as never;

  const payout = (game: TH08Game) =>
    (game as unknown as { applyStageClearBombPayout(): void }).applyStageClearBombPayout();

  const clear = (game: TH08Game) =>
    (game as unknown as { handleEclStageClear(): void }).handleEclStageClear();

  const youmu = (route: string) => {
    const game = new TH08Game({ headless: true, campaign: true, character: 'youmu-yuyuko' });
    game.route = route as never;
    return game;
  };

  it('gives a short Youmu/Yuyuko run its bomb back at the end of a stage', () => {
    const game = youmu('stage1');
    game.player.bombs = 2;
    payout(game);
    expect(game.player.bombs).toBe(3);
  });

  it('stops at three, which is a payout ceiling rather than a stock cap', () => {
    const game = youmu('stage1');
    game.player.bombs = 3;
    payout(game);
    expect(game.player.bombs).toBe(3);

    game.player.bombs = 8;
    payout(game);
    expect(game.player.bombs).toBe(8);
  });

  it('pays on every stage below the finals and not on the finals', () => {
    for (const route of ['stage1', 'stage2', 'stage3', 'stage4a', 'stage4b', 'stage5']) {
      const game = youmu(route);
      game.player.bombs = 1;
      payout(game);
      expect(game.player.bombs).toBe(2);
    }
    for (const route of ['stage6a', 'stage6b']) {
      const game = youmu(route);
      game.player.bombs = 1;
      payout(game);
      expect(game.player.bombs).toBe(1);
    }
  });

  it('is the youkai team only', () => {
    for (const character of ['reimu-yukari', 'marisa-alice', 'sakuya-remilia'] as const) {
      const game = new TH08Game({ headless: true, campaign: true, character });
      game.route = 'stage1';
      game.player.bombs = 1;
      payout(game);
      expect(game.player.bombs).toBe(1);
    }
  });

  it('runs as part of the stage clear, before the HUD syncs', () => {
    const game = youmu('stage1');
    const gs = { clockTime: 0, timeOrbs: 0, lastSpellTimeOrbThreshold: Number.POSITIVE_INFINITY };
    (game as unknown as { eclRunner: never }).eclRunner = stubRunner(gs);
    game.player.bombs = 2;
    clear(game);
    expect(game.player.bombs).toBe(3);
    // The same handler owns the night clock, so the hour it computed has to survive
    // into the run-level value the next stage seeds from.
    expect(gs.clockTime).toBe(2);
    expect(game.runClockTime).toBe(2);
  });

  it('costs the night two hours without a last spell and one with it', () => {
    const game = new TH08Game({ headless: true, campaign: true });
    const clock = (timeOrbs: number, threshold: number) => {
      const gs = { clockTime: 0, timeOrbs, lastSpellTimeOrbThreshold: threshold };
      (game as unknown as { applyStageClearClock(gs: never): void }).applyStageClearClock(gs as never);
      return gs.clockTime;
    };

    // The threshold is unreachable on this data (see R-15 §8), so the two-hour branch
    // is the one every stage takes today.
    expect(clock(900, Number.POSITIVE_INFINITY)).toBe(2);
    expect(clock(900, 800)).toBe(1);

    game.route = 'stage6b';
    const finals = { clockTime: 7, timeOrbs: 900, lastSpellTimeOrbThreshold: 800 };
    (game as unknown as { applyStageClearClock(gs: never): void }).applyStageClearClock(finals as never);
    expect(finals.clockTime).toBe(7);
  });
});
