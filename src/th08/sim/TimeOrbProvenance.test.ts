/**
 * Nothing in 永夜抄 mints a 时符 out of thin air.
 *
 * The HUD counter (`Gui.cpp:1462`) is the number the whole card economy hangs off
 * -- it feeds `pointItemValue` through `AddTimeOrbs` (`GameManager.cpp:198-211`),
 * it is what a Last Spell threshold is compared against, and a death taxes it. So
 * a run whose counter climbs without a visible reason is a run whose score is
 * lying, and the only honest way to say "ours does not" is to watch every frame of
 * a real stage and account for each unit.
 *
 * Retail has exactly three credits and three debits, and they are the only ones
 * this test tolerates:
 *
 *  credit  an orb picked off the field (`Item::CollectTimeOrb`, `ItemManager.cpp:602`);
 *  credit  a captured spell card, 100..1000 at once (`Spellcard.cpp:1073-1093`);
 *  debit   the death tax (`Player.cpp:1337-1339`) and Sakuya's orb drain.
 *
 * Orbs reach the field from four places, all of them item spawns: the graze drop
 * (`Player.cpp:510-521`), the human side's damage exchange (`:3406-3414`), the
 * familiar chain burst (`EnemyManager.cpp:294-360`), and a familiar that died on
 * its own (`:363-379`). The first two are gated hard enough that an ordinary
 * stage-clearing run sees neither, which is the second half of what this file
 * pins.
 */
import { describe, expect, it } from 'vitest';
import { loadEclStage } from '../../games/th08/EclStageLoader';
import { ItemPool } from './ItemPool';

/** Frames of one blind orbit around the middle of the field. Enough for a midboss. */
const FRAMES = 3500;

/** The largest single bank retail will pay for one captured card. */
const MAX_CARD_BANK = 1000;

describe('time orb provenance', () => {
  it('credits a stage run only through collections and captured cards', async () => {
    const spawned = { orbs: 0 };
    const spawn = ItemPool.prototype.spawn;
    ItemPool.prototype.spawn = function (kind, x, y, variant) {
      if (kind === 'timeOrb') spawned.orbs++;
      return spawn.call(this, kind, x, y, variant);
    };

    const runner = await loadEclStage({
      route: 'stage1',
      difficulty: 'normal',
      character: 'reimu-yukari',
      power: 128,
      stageNumber: 1,
    });
    expect(runner).not.toBeNull();
    if (!runner) return;

    let collected = 0;
    let banked = 0;
    let unexplained = 0;
    for (let f = 0; f < FRAMES; f++) {
      const before = runner.gs.timeOrbs;
      runner.tick({
        dx: Math.sin(f / 120) > 0 ? 1 : -1,
        dy: Math.cos(f / 90) > 0 ? -1 : 1,
        shoot: true,
        bomb: false,
        slow: false,
      });
      const delta = runner.gs.timeOrbs - before;
      if (delta > 0) {
        const picked = runner.lastCollected.reduce((n, c) => n + (c.timeOrb ? 1 : 0), 0);
        const cards = runner.lastSpellResults.filter((c) => c.captured).length;
        if (delta > picked + MAX_CARD_BANK * cards) unexplained += delta;
        banked += delta;
        collected += picked;
      }
    }
    ItemPool.prototype.spawn = spawn;

    // The run has to be a real one before the accounting means anything: shots hit,
    // enemies died, and the stage was actually being played.
    expect(runner.player.score).toBeGreaterThan(50000);
    expect(runner.player.graze).toBeGreaterThan(0);
    // Credits can only leave through the death tax (`Player.cpp:1337`), so the
    // counter at the end is at most everything it ever took on -- and the two differ
    // only by deaths, which the run above has had none of.
    expect(banked).toBeGreaterThanOrEqual(runner.gs.timeOrbs);
    expect(unexplained).toBe(0);
    expect(collected).toBeLessThanOrEqual(spawned.orbs);
  });

  it('pays no graze 时符 without a stage boss and an extreme-youkai meter', async () => {
    const spawned = { grazeOrbs: 0 };
    const spawn = ItemPool.prototype.spawn;
    ItemPool.prototype.spawn = function (kind, x, y, variant) {
      // Only `Player.cpp:512` asks for ITEM_TIME2, which is what `SpawnItem:65-68`
      // turns into the graze drop, so counting that variant counts grazes and
      // nothing else. Chain bursts and the human side's damage exchange stay out.
      if (kind === 'timeOrb' && variant === 'orbDouble') spawned.grazeOrbs++;
      return spawn.call(this, kind, x, y, variant);
    };
    const runner = await loadEclStage({
      route: 'stage1',
      difficulty: 'normal',
      character: 'reimu-yukari',
      power: 128,
      stageNumber: 1,
    });
    if (!runner) throw new Error('stage 1 failed to load');
    runner.player.gauge.set(0);
    for (let f = 0; f < FRAMES; f++) {
      runner.tick({ dx: 0, dy: 0, shoot: true, bomb: false, slow: false });
    }
    ItemPool.prototype.spawn = spawn;

    // `Player.cpp:510-513` asks for two things at once -- a registered boss enemy
    // (`g_EnemyManager.FUN_0042f1f0`) and `GaugeIsExtremelyYoukai` -- and this run
    // has neither, though it grazes the whole way through. A build that paid out on
    // grazes alone would print hundreds of orbs in these 3500 frames.
    expect(runner.player.graze).toBeGreaterThan(0);
    expect(runner.player.gauge.isExtremelyYoukai()).toBe(false);
    expect(spawned.grazeOrbs).toBe(0);
  });
});
