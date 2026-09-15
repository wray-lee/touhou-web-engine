/**
 * Nothing armed may survive a stage boundary.
 *
 * The clear handler sweeps the drops, then the enemy bullets, then lets the 180-frame
 * banner play out -- but the beams were not part of that sweep. Since the outcome is
 * latched the moment the stage is decided, `tickEclRunner` stops driving collisions, and
 * what that leaves on screen is a beam frozen at whatever geometry it had on the clear
 * frame: it no longer sweeps, no longer shrinks out, and does not go away until the next
 * script replaces the field. On the laser-heavy endings -- stage 3 closes with two
 * hundred of them on screen at once -- that is the last thing the player looks at.
 *
 * The first case here is the precondition that makes the second one worth anything: the
 * same spawn call, against a stage that has *not* been cleared, really does reach the
 * ship. So when the cleared run comes through untouched, that is the sweep, not a beam
 * that could have hurt nobody anyway.
 *
 * Note what is deliberately *not* asserted: dying to a laser mid-stage. Retail leaves the
 * beam standing when the ship is destroyed, which is exactly why the same sweep kills
 * twice in a row, and only the stage boundary clears it.
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { TH08Game } from './TH08Game';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

/** Frames the closing banner holds before the transition releases the run. */
const BANNER_FRAMES = 180;

async function withRunner(): Promise<TH08Game> {
  const game = new TH08Game({ headless: true, campaign: true, difficulty: 'normal' });
  game.stepFrame(1);
  for (let i = 0; i < 400 && !game.eclRunner; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    game.stepFrame(1);
  }
  if (!game.eclRunner) throw new Error('the translated script never landed');
  return game;
}

/**
 * A beam laid across the ship, pointing down the field, long enough to cover it.
 *
 * `speed: 0` and `startTime: 0` hold it at full width from the first frame, so the shape
 * the test measures is the shape it was spawned in.
 */
function beamAcrossShip(game: TH08Game): void {
  const runner = game.eclRunner;
  if (!runner) throw new Error('no runner');
  const p = runner.player;
  const laser = runner.lasers.spawn({
    x: p.x,
    y: p.y - 40,
    angle: Math.PI / 2,
    tail: 0,
    head: 200,
    startLength: 240,
    width: 24,
    speed: 0,
    startTime: 0,
    hitboxStartTime: 0,
    duration: 600,
    despawnDuration: 0,
    hitboxEndDelay: 0,
    flags: 0,
    color: 0xffffffff,
    bulletType: 0,
  });
  expect(laser, 'the pool refused a lone beam').not.toBeNull();
}

function clearStage(game: TH08Game): void {
  (game as unknown as { handleEclStageClear(): void }).handleEclStageClear();
}

describe.skipIf(!hasAssets)('stage-clear field sweep', () => {
  it('lays a beam that can actually reach the ship', async () => {
    const game = await withRunner();
    const runner = game.eclRunner!;

    // Out of the spawn shield first: collisions are skipped while the ship is exempt,
    // and a hit measured inside that window would prove nothing.
    for (let i = 0; i < 400 && runner.player.isInvulnerable; i++) game.stepFrame(1);
    expect(runner.player.isInvulnerable, 'the ship never came out of its spawn grace').toBe(false);

    beamAcrossShip(game);
    let hitFrames = 0;
    for (let f = 0; f < 60; f++) {
      game.stepFrame(1);
      if (runner.lastLaserHits.length > 0) hitFrames++;
    }
    expect(hitFrames, 'a beam through the ship registered no hit').toBeGreaterThan(0);
  });

  it('takes the beams down with the bullets', async () => {
    const game = await withRunner();
    const runner = game.eclRunner!;

    beamAcrossShip(game);
    clearStage(game);
    expect(runner.lasers.activeCount, 'a beam survived the clear').toBe(0);

    for (let f = 0; f < BANNER_FRAMES + 40; f++) game.stepFrame(1);

    expect(runner.player.state, 'the ship was not whole when the banner ended').toBe('alive');
    expect(runner.lasers.activeCount).toBe(0);
  });

  it('hands the next stage the run it was given', async () => {
    const game = await withRunner();
    const runner = game.eclRunner!;
    runner.player.lives = 0;
    const score = runner.player.score;

    beamAcrossShip(game);
    clearStage(game);
    for (let f = 0; f < BANNER_FRAMES + 60 && game.route === 'stage1'; f++) game.stepFrame(1);

    expect(game.route).toBe('stage2');
    expect(game.player.state).toBe('alive');
    const next = game.eclRunner;
    if (next) {
      // The boundary is not a debit: the stock the last stage ended on is the stock this
      // one opens with, and the score only ever climbs.
      expect(next.player.lives).toBe(0);
      expect(next.player.score).toBeGreaterThanOrEqual(score);
      expect(next.lasers.activeCount, 'a beam crossed the boundary').toBe(0);
    }
  });
});
