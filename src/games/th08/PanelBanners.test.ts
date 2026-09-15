/**
 * The panel text slots are the loudest feedback 永夜抄 has, and every part of the
 * chain can break quietly: the sim has to notice the event, the host has to hold it
 * for retail's lifetime, and the renderer has to be handed the lines. This covers the
 * first two links end to end, in a real headless stage.
 *
 * The 130-frame wait is `Spellcard::Update` letting `rewardEffect` finish before
 * `gui_fun_00437edc` gets the award (`Spellcard.cpp:1423-1428`), and the notice is
 * `Gui::FUN_00437e5d` (`:2075-2122`).
 */
import { describe, expect, it } from 'vitest';
import { TH08Game } from './TH08Game';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

/** Private entry points the frame loop uses, reached the way `StageCarryover` does. */
interface BannerHost {
  queueSpellBonus(bonus: number): void;
  flushSpellBonus(): void;
  tickHudBanners(): void;
}

function host(game: TH08Game): BannerHost {
  return game as unknown as BannerHost;
}

async function awaitRunner(game: TH08Game): Promise<void> {
  for (let i = 0; i < 50 && !game.eclRunner; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/** Frames until the reward line appears, or -1 within `limit`. */
function framesUntilBonusLine(game: TH08Game, limit = 200): number {
  for (let frame = 1; frame <= limit; frame++) {
    host(game).tickHudBanners();
    if (game.bannerDebug.includes('Spell Card Bonus!')) return frame;
  }
  return -1;
}

/**
 * Drop a full-power item on the ship and run until the sim reports the sweep.
 *
 * `powerFull` is the one kind that comes back with `fillsPower`, so this exercises
 * the real chain -- item, collect, `StageRunner.raiseFullPower`, host, `Gui` --
 * rather than calling the banner by hand.
 */
function pumpToFullPower(game: TH08Game): number {
  const runner = game.eclRunner!;
  runner.player.power = 40;
  /*
   * Two P items parked outside the 24 px magnet and the pickup box, so they are
   * still on the field when the sweep runs -- which is the whole point of the retail
   * conversion, and the only way to tell it apart from "nothing was there".
   */
  runner.items.spawn('powerSmall', runner.player.x - 100, runner.player.y);
  runner.items.spawn('powerBig', runner.player.x + 100, runner.player.y);
  runner.items.spawn('powerFull', runner.player.x, runner.player.y);
  for (let frame = 1; frame <= 30; frame++) {
    game.stepFrame(1);
    if (runner.fullPowerTriggered) return frame;
  }
  throw new Error('the pickup never landed');
}

describe.skipIf(!hasAssets)('panel banners', () => {
  it('fires Full Power Mode the frame a maxing pickup lands', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    expect(game.bannerDebug).toEqual([]);

    pumpToFullPower(game);

    expect(game.bannerDebug).toContain('Full Power Mode!');
    // `ItemManager.cpp:673` sparks once per P item converted, through the retail pool.
    expect(game.eclRunner!.effectPool?.spawned ?? 0).toBeGreaterThan(0);
    // ...and the P items left on the field came out as point items.
    const kinds = game.eclRunner!.items.items.filter((item) => item.active).map((item) => item.kind);
    expect(kinds).toContain('pointSmall');
  });

  it('keeps the notice for exactly 180 frames, then stops asking for it', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    pumpToFullPower(game);
    expect(game.bannerDebug).toContain('Full Power Mode!');

    /*
     * The frame that raised it already spent one tick, so `timer` is 1 here. Count
     * ticks rather than frames: `Gui.cpp:1180` drops the notice at 180, which is
     * 179 more steps, and the 180th frame of life is the last one drawn.
     */
    let timer = 1;
    while (game.bannerDebug.includes('Full Power Mode!') && timer < 400) {
      game.stepFrame(1);
      timer++;
    }
    expect(timer).toBe(180);
    expect(game.bannerDebug).not.toContain('Full Power Mode!');
  });

  it('waits out the reward animation before showing the bonus line', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);

    host(game).queueSpellBonus(1_230_000);
    expect(game.bannerDebug).toEqual([]);
    expect(framesUntilBonusLine(game)).toBe(130);
    expect(game.bannerDebug).toEqual(['Spell Card Bonus!', '+1230000']);
  });

  it('pays an owed line early when the next card begins', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);

    host(game).queueSpellBonus(500_000);
    host(game).flushSpellBonus();
    expect(game.bannerDebug).toEqual(['Spell Card Bonus!', '+500000']);
    // Nothing is owed any more, so a second flush cannot double-print it.
    host(game).flushSpellBonus();
    expect(game.bannerDebug).toEqual(['Spell Card Bonus!', '+500000']);
  });

  it('drops both slots when a stage restarts', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    host(game).queueSpellBonus(2_000_000);
    host(game).flushSpellBonus();
    expect(game.bannerDebug).toHaveLength(2);

    game.restartStage();
    expect(game.bannerDebug).toEqual([]);
    // The owed bonus is gone too, not merely hidden.
    for (let frame = 0; frame < 200; frame++) host(game).tickHudBanners();
    expect(game.bannerDebug).toEqual([]);
  });
});
