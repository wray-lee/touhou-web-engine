/**
 * End-to-end proof that the translated ECL actually drives the game: the stage
 * runs from real `ecldata1` output, ends in a stage clear that hands over to
 * stage 2 without refilling the run, and reports GAME OVER when out of lives.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { TH08Game } from './TH08Game';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

/** Pump the event loop until the dynamically imported stage data has landed. */
async function awaitRunner(game: TH08Game): Promise<void> {
  for (let i = 0; i < 50 && !game.eclRunner; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

describe.skipIf(!hasAssets)('TH08Game on translated ECL', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs the scripted waves and bullets through the sim', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    expect(game.eclRunner).toBeTruthy();
    const runner = game.eclRunner!;

    let sawEnemy = false;
    let sawBullet = false;
    for (let i = 0; i < 900; i++) {
      game.stepFrame(1);
      if (runner.enemies.activeCount > 0) sawEnemy = true;
      if (runner.bullets.activeCount > 0) sawBullet = true;
    }

    expect(runner.gs.frame).toBeGreaterThan(800);
    expect(sawEnemy).toBe(true);
    expect(sawBullet).toBe(true);
  });

  /*
   * The F12 overlay used to report `Entities: 1 / bullets:0 enemies:0` over a
   * full screen of ECL fire, because it read the engine's own systems and an ECL
   * stage leaves them empty. Nothing but a live frame catches that, so this is
   * the regression guard: the numbers have to come from the runner.
   */
  it('feeds the debug overlay from the field the scripts built', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    game.debugAutoShoot = true;
    await awaitRunner(game);
    const runner = game.eclRunner!;

    let bestEntities = 0;
    let bestChecks = 0;
    for (let i = 0; i < 1200; i++) {
      game.stepFrame(1);
      bestEntities = Math.max(bestEntities, game.monitor.entityCount);
      bestChecks = Math.max(bestChecks, game.monitor.collisionChecks);
      if (runner.bullets.activeCount > 20 && game.bulletSystem.getCount() > 0) break;
    }

    expect(runner.bullets.activeCount).toBeGreaterThan(20);
    expect(game.bulletSystem.getCount()).toBeGreaterThan(0);
    expect(bestEntities).toBeGreaterThan(20);
    // Ship vs bullets, ship vs beams and shots vs enemies all add to this, so a
    // busy frame is worth well more than one test per object.
    expect(bestChecks).toBeGreaterThan(20);
    expect(game.monitor.isVisible).toBe(false);
  });

  it('advances the campaign on a scripted stage end and keeps the run', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    const runner = game.eclRunner!;

    // A run that is part-way through: the next stage must inherit it verbatim.
    runner.player.lives = 2;
    runner.player.bombs = 1;
    runner.player.power = 40;
    runner.player.syncToGameState();

    runner.timeline.finished = true;
    for (const slot of runner.enemies.slots) slot.active = false;

    for (let i = 0; i < 40; i++) game.stepFrame(1);
    expect(game.hud.centerMessage).toContain('CLEAR');

    for (let i = 0; i < 200; i++) game.stepFrame(1);
    await awaitRunner(game);

    expect(game.stageNumber).toBe(2);
    const next = game.eclRunner!;
    expect(next).not.toBe(runner);
    expect(next.player.lives).toBe(2);
    expect(next.player.bombs).toBe(1);
    expect(next.player.power).toBe(40);
  });

  it('freezes the field on game over and hands off to the results screen', async () => {
    const onStageClear = vi.fn();
    const game = new TH08Game({ headless: true, campaign: true, onStageClear });
    await awaitRunner(game);
    const runner = game.eclRunner!;

    vi.useFakeTimers();
    runner.player.lives = 0;
    runner.player.hit();
    runner.gs.showRetryMenu = true;
    game.stepFrame(1);

    expect(game.hud.centerMessage).toBe('GAME OVER');
    const frame = runner.gs.frame;
    game.stepFrame(1);
    expect(runner.gs.frame).toBe(frame);

    vi.advanceTimersByTime(3100);
    expect(onStageClear).toHaveBeenCalledTimes(1);
    expect(onStageClear.mock.calls[0][0].campaignFinished).toBe(false);
  });
});
