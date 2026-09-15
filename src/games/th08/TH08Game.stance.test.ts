/**
 * 永夜抄's focus key is the character switch, and the hitbox only appears once the
 * new stance has settled. Both of those were reported broken, so they are pinned
 * here against the real translated stage rather than a hand-built sim.
 */

import { describe, expect, it } from 'vitest';
import { TH08Game } from './TH08Game';
import { HITBOX_DELAY_FRAMES } from '../../th08/sim/PlayerSim';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

/** Pump the event loop until the dynamically imported stage data has landed. */
async function boot(): Promise<TH08Game> {
  const game = new TH08Game({ headless: true, campaign: true });
  for (let i = 0; i < 50 && !game.eclRunner; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return game;
}

describe.skipIf(!hasAssets)('TH08 focus stance', () => {
  it('holds the idle ship upright with no lean', async () => {
    const game = await boot();
    for (let i = 0; i < 30; i++) game.stepFrame(1);
    expect(game.player.velocity.x).toBe(0);
    expect(game.player.member.id).toBe('reimu');
    expect(game.player.isSlowMode).toBe(false);
  });

  it('leans into a held direction and back off when released', async () => {
    const game = await boot();
    game.input.simulateKeyDown('ArrowLeft');
    for (let i = 0; i < 6; i++) game.stepFrame(1);
    expect(game.player.velocity.x).toBeLessThan(-1);
    game.input.simulateKeyUp('ArrowLeft');
    for (let i = 0; i < 6; i++) game.stepFrame(1);
    expect(game.player.velocity.x).toBe(0);
  });

  /*
   * `Player.cpp:823-871` chooses the ship's animation from the intended horizontal
   * speed, so a ship pinned against the wall stays leaned for as long as the stick
   * is held. Reading the position delta instead reports zero travel at the wall and
   * at every sub-pixel clamp, which retriggered the lean/unlean transition forever
   * -- the reported idle twitch.
   */
  it('keeps the lean intent alive when the wall stops the ship', async () => {
    const game = await boot();
    const runner = game.eclRunner!;
    runner.player.x = 8;
    game.input.simulateKeyDown('ArrowLeft');
    for (let i = 0; i < 4; i++) game.stepFrame(1);
    expect(runner.player.x).toBe(8);
    expect(game.player.leanX).toBeLessThan(0);

    game.input.simulateKeyUp('ArrowLeft');
    for (let i = 0; i < 2; i++) game.stepFrame(1);
    expect(game.player.leanX).toBe(0);
  });

  it('switches the flying member with Shift and switches back on release', async () => {
    const game = await boot();
    game.input.simulateKeyDown('ShiftLeft');
    for (let i = 0; i < 10; i++) game.stepFrame(1);
    expect(game.player.isSlowMode).toBe(true);
    expect(game.player.member.id).toBe('yukari');
    expect(game.player.partner?.id).toBe('reimu');

    game.input.simulateKeyUp('ShiftLeft');
    for (let i = 0; i < 10; i++) game.stepFrame(1);
    expect(game.player.member.id).toBe('reimu');
  });

  it('delays the hitbox until the stance has settled', async () => {
    const game = await boot();
    game.input.simulateKeyDown('ShiftLeft');
    for (let i = 0; i < HITBOX_DELAY_FRAMES - 1; i++) game.stepFrame(1);
    expect(game.player.hitboxVisible).toBe(false);
    for (let i = 0; i < 3; i++) game.stepFrame(1);
    expect(game.player.hitboxVisible).toBe(true);

    game.input.simulateKeyUp('ShiftLeft');
    for (let i = 0; i < HITBOX_DELAY_FRAMES + 3; i++) game.stepFrame(1);
    expect(game.player.hitboxVisible).toBe(false);
  });

  it('carries lives and bombs across a stage boundary', async () => {
    const game = await boot();
    const runner = game.eclRunner!;
    runner.player.lives = 2;
    runner.player.bombs = 1;
    // The hand-off reads the rendering-side Player, which `tickEclRunner` mirrors
    // the sim into once per frame, so spend a frame before changing stages.
    game.stepFrame(1);
    // The carry-over happens on the stage-clear hand-off, which is private; drive
    // it through the same entry point `stepFrame` uses once the banner expires.
    const advance = () => (game as unknown as { beginNextStage(): void }).beginNextStage();
    advance();
    for (let i = 0; i < 50 && !game.eclRunner; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    expect(game.stageNumber).toBe(2);
    expect(game.eclRunner!.player.lives).toBe(2);
    expect(game.eclRunner!.player.bombs).toBe(1);
    expect(game.eclRunner!.player.x).toBe(192);
    expect(game.eclRunner!.player.y).toBe(384);
  });
});
