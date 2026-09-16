/**
 * The `data-dbg` effect readout, and what it proves about the focus edge.
 *
 * A flash that lives 20 frames cannot be settled by a screenshot, and the pool had no
 * readout at all, so every report about it ("the ring is missing", "the sprite stuck")
 * used to start from a guess. `TH08Game.effectDebug` is the list the renderer is handed,
 * so this is the browser check expressed as a test: drive a real headless stage, toggle
 * focus the way the Shift key does, and read the templates back out of the running host.
 *
 * `debugSlowMode` is the same flag `?slow` sets (`main.ts:139`), which is what makes the
 * two paths agree.
 */
import { describe, expect, it } from 'vitest';
import { TH08Game } from './TH08Game';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

async function awaitRunner(game: TH08Game): Promise<void> {
  for (let i = 0; i < 50 && !game.eclRunner; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/** Read the host's own effect list until `template` shows up, for at most `limit` frames. */
function framesUntilTemplate(game: TH08Game, template: number, limit = 8): string | null {
  for (let frame = 1; frame <= limit; frame++) {
    game.stepFrame(1);
    const hit = game.effectDebug.find((entry) => entry.startsWith(`${template}:`));
    if (hit) return hit;
  }
  return null;
}

/** The two ring scripts both end in `DELETE` after their two ten-frame ramps. */
function holdsAfter(game: TH08Game, template: number, frames: number): boolean {
  for (let i = 0; i < frames; i++) game.stepFrame(1);
  return game.effectDebug.some((entry) => entry.startsWith(`${template}:`));
}

describe.skipIf(!hasAssets)('the effect readout (data-dbg `fx`)', () => {
  it('catches the ring that collapses in when the pair changes weapon', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    for (let i = 0; i < 10; i++) game.stepFrame(1);
    expect(game.effectDebug.some((entry) => entry.startsWith('29:'))).toBe(false);

    game.debugSlowMode = true;
    const press = framesUntilTemplate(game, 29);
    // Template 29 is `etama.anm` script 58, whose only cell is 193 (`Player.cpp:701-702`).
    expect(press).toMatch(/^29:193 a\d+ x[45]/);

    // The flash is over within the script's two ten-frame ramps.
    expect(holdsAfter(game, 29, 30)).toBe(false);
  });

  it('catches the ring that bursts out when the weapon changes back', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    game.debugSlowMode = true;
    for (let i = 0; i < 30; i++) game.stepFrame(1);

    game.debugSlowMode = false;
    const release = framesUntilTemplate(game, 28);
    // Template 28 is script 57: the same cell, running the other way (`:765-766`).
    expect(release).toMatch(/^28:193 a\d+ x[0-5]/);
    expect(holdsAfter(game, 28, 30)).toBe(false);
  });

  it('still reports the 判定点光环 the ship holds while focus is down', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    game.debugSlowMode = true;
    expect(framesUntilTemplate(game, 22)).toMatch(/^22:218 /);
  });
});
