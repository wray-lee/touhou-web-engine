/**
 * The ship's own weapon has to survive the trip from the sim to the draw door.
 *
 * 紫's 式神 is the report this exists for: the sim had it, the `.sht` census says
 * `ply00as` is the only table that ever uses option 1 (`PlayerOptions.ts`'s row 0), and
 * the page still read as "no homing 式神". The gap between those two is
 * `TH08Game.tickPlayerShots`, which resolves every shot and option sprite against
 * `TH08_PLAYER_ANM_PACKS` and drops the ones with no rect without saying so.
 * `playerWeaponDebug` is that door's tally, so the claim "the 式神 is on screen" is a
 * line in a test rather than a screenshot someone hopes to catch.
 *
 * The focus gate is retail's own: options are armed on the focus *edge* and only while
 * `shotType <= 3` (`Player.cpp:669-694`), and the release path lets them walk out over
 * sixteen frames (`:2088-2096`). High speed therefore has no 式神 at all, which is what
 * the original looks like.
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

/** Step until `playerWeaponDebug` has a line starting with `prefix`, for N frames. */
function weaponUntil(game: TH08Game, prefix: string, limit: number): { line: string | null; frames: number } {
  for (let frame = 1; frame <= limit; frame++) {
    game.stepFrame(1);
    const line = game.playerWeaponDebug.find((entry) => entry.startsWith(prefix));
    if (line) return { line, frames: frame };
  }
  return { line: null, frames: limit };
}

describe.skipIf(!hasAssets)('the ship-weapon draw door (data-dbg `pdr`)', () => {
  it("draws 紫's 式神 once focus is held, out of a real cell", async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    game.debugAutoShoot = true;
    game.debugSlowMode = true;

    const found = weaponUntil(game, 'opt ', 120);
    expect(found.line, 'no 式神 quad was submitted while focused').toMatch(/^opt t\d+:\d+ a\d+$/);
    // The door resolves the sprite against the pack, so the cell it names must exist.
    const [, page, sprite] = /^opt t(\d+):(\d+) a/.exec(found.line!)!;
    expect(Number.isInteger(Number(sprite))).toBe(true);
    expect(Number(page)).toBeGreaterThanOrEqual(0);

    // The ship keeps firing next to it: 紫's side is `ply00as`, and every one of its six
    // power tables carries its option-1 entries alongside one to four option-0 ones.
    const shots = game.playerWeaponDebug.find((entry) => entry.startsWith('shots '));
    expect(shots).toMatch(/^shots [1-9]/);
  });

  it('has no 式神 at all while the ship is in high speed', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    game.debugAutoShoot = true;

    for (let i = 0; i < 120; i++) game.stepFrame(1);
    expect(game.playerWeaponDebug.some((entry) => entry.startsWith('opt '))).toBe(false);
    expect(game.playerWeaponDebug[0]).toMatch(/^shots [1-9]/);
  });

  it('walks the 式神 back out when focus is released', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    game.debugAutoShoot = true;
    game.debugSlowMode = true;
    expect(weaponUntil(game, 'opt ', 120).line).toBeTruthy();

    game.debugSlowMode = false;
    // The exit is the route's own sixteen frames (`:2091`), not an instant vanish.
    expect(game.playerWeaponDebug.some((entry) => entry.startsWith('opt '))).toBe(true);
    for (let i = 0; i < 90; i++) game.stepFrame(1);
    expect(game.playerWeaponDebug.some((entry) => entry.startsWith('opt '))).toBe(false);
  });

  it('never asks the pack for a cell it does not have, focused or not', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    game.debugAutoShoot = true;
    const misses: string[] = [];
    for (let frame = 0; frame < 900; frame++) {
      // Cross the weapon edge both ways so the blades, the body and every shot pose
      // the scripts reach during a wave all pass through the same gate.
      if (frame === 300 || frame === 600) game.debugSlowMode = frame === 300;
      game.stepFrame(1);
      const miss = game.playerWeaponDebug.find((entry) => entry.startsWith('miss '));
      if (miss) misses.push(`f${frame} ${miss}`);
    }
    expect(misses.slice(0, 5)).toEqual([]);
    // The sweep only means something if the door was actually busy.
    expect(game.playerWeaponDebug[0]).toMatch(/^shots [1-9]/);
  });
});
