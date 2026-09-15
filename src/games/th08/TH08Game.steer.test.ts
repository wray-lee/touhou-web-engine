/**
 * The opt-in cursor steering (docs/REQUIREMENTS.md R-1).
 *
 * Two code paths move the ship from a pointer: the hand-written player before the
 * translated script lands, and `PlayerSim` afterwards. They used to disagree by the
 * playfield offset, which is invisible on a full-window game and obvious here -- the
 * field is 384x448 inside a 640x480 canvas, so a cursor in the middle of the screen
 * asks for world (288, 224), not (320, 240). Both paths are pinned to the same point
 * below, on the way to and after the hand-over, because the option has to survive the
 * hand-over to be worth shipping.
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PLAYFIELD_X, PLAYFIELD_Y } from '../../engine/core/PlayfieldLayout';
import { TH08Game } from './TH08Game';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));

/** Pump the event loop until the dynamically imported stage data has landed. */
async function awaitRunner(game: TH08Game): Promise<void> {
  for (let i = 0; i < 50 && !game.eclRunner; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

/** Rest the cursor over a canvas point, the way hovering does -- no button held. */
function hover(game: TH08Game, canvasX: number, canvasY: number): void {
  game.input.mouseControl = true;
  game.input.pointerInside = true;
  game.input.pointerMove(canvasX, canvasY);
}

/**
 * How many shots the ship has in the air.
 *
 * Once the translated script owns the field the weapon lives in retail's own
 * `Player.shots[128]`, fired out of the `.sht` chains, and the presentation pool is
 * empty by design. Both branches answer the same question - did the ship shoot - so
 * the steering tests do not care which layer is holding the answer.
 */
function playerShots(game: TH08Game): number {
  const runner = game.eclRunner;
  if (runner) return runner.shots.shots.filter((shot) => shot.state !== 0).length;
  return game.bulletSystem
    .getBullets()
    .filter((b) => b.isAlive && b.tag === 'player-bullet').length;
}

/** Canvas space -> the world point the field is asked to put the ship at. */
function worldOf(canvasX: number, canvasY: number): { x: number; y: number } {
  return { x: canvasX - PLAYFIELD_X, y: canvasY - PLAYFIELD_Y };
}

describe('cursor steering (opt-in)', () => {
  it('leaves a keyboard run alone while the option is off', () => {
    const game = new TH08Game({ headless: true });
    game.stepFrame(1);
    const start = { x: game.player.position.x, y: game.player.position.y };

    // Cursor parked over the field, nothing held: with the option off this must be
    // as if the mouse were unplugged.
    game.input.pointerInside = true;
    game.input.pointerMove(320, 240);
    for (let i = 0; i < 60; i++) game.stepFrame(1);

    expect(game.input.mouseControl).toBe(false);
    expect(game.input.isSteering).toBe(false);
    expect({ x: game.player.position.x, y: game.player.position.y }).toEqual(start);
    expect(playerShots(game)).toBe(0);
  });

  it('moves on the arrow keys while the option is off', () => {
    const game = new TH08Game({ headless: true });
    game.stepFrame(1);
    game.input.pointerInside = true;
    game.input.pointerMove(320, 240);
    game.input.simulateKeyDown('ArrowLeft');
    for (let i = 0; i < 20; i++) game.stepFrame(1);
    expect(game.player.position.x).toBeLessThan(192);
  });

  it('flies to the cursor and auto-fires once the option is on, before the script lands', () => {
    const game = new TH08Game({ headless: true });
    game.debugNoFail = true;
    game.stepFrame(1);
    hover(game, 320, 240);
    const want = worldOf(320, 240);

    for (let i = 0; i < 150; i++) game.stepFrame(1);

    expect(game.input.isSteering).toBe(true);
    expect(game.player.position.x).toBeCloseTo(want.x, 0);
    expect(game.player.position.y).toBeCloseTo(want.y, 0);
    // Nothing ever held the fire key; steering is what pulls the trigger.
    expect(playerShots(game)).toBeGreaterThan(0);
  });

  it('takes the same landing point after the translated script owns the field', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    game.debugNoFail = true;
    await awaitRunner(game);
    if (!game.eclRunner) return; // asset-free checkout: covered by the case above
    hover(game, 320, 240);
    const want = worldOf(320, 240);

    for (let i = 0; i < 200; i++) game.stepFrame(1);

    expect(game.player.position.x).toBeCloseTo(want.x, 0);
    expect(game.player.position.y).toBeCloseTo(want.y, 0);
    expect(playerShots(game)).toBeGreaterThan(0);
  });

  it('follows a cursor that moves, and does not overshoot the field edge', () => {
    const game = new TH08Game({ headless: true });
    game.debugNoFail = true;
    game.stepFrame(1);
    hover(game, 600, 40); // far corner of the canvas, outside the field
    for (let i = 0; i < 300; i++) game.stepFrame(1);
    expect(game.player.position.x).toBeLessThanOrEqual(384);
    expect(game.player.position.y).toBeGreaterThanOrEqual(0);

    game.input.pointerMove(120, 300);
    const want = worldOf(120, 300);
    for (let i = 0; i < 300; i++) game.stepFrame(1);
    expect(game.player.position.x).toBeCloseTo(want.x, 0);
    expect(game.player.position.y).toBeCloseTo(want.y, 0);
  });

  it('gives the ship back to the keyboard when the cursor leaves the window', () => {
    const game = new TH08Game({ headless: true });
    game.debugNoFail = true;
    game.stepFrame(1);
    hover(game, 320, 240);
    for (let i = 0; i < 60; i++) game.stepFrame(1);
    const parked = { x: game.player.position.x, y: game.player.position.y };

    // Walking the cursor off the canvas ends the steering even though the option
    // stays on; otherwise a mouse that slips off the window freezes the ship.
    game.input.pointerInside = false;
    game.input.simulateKeyDown('ArrowUp');
    for (let i = 0; i < 20; i++) game.stepFrame(1);
    expect(game.player.position.y).toBeLessThan(parked.y);
  });

  it('stops firing when the cursor leaves, with the option still on', () => {
    const game = new TH08Game({ headless: true });
    game.debugNoFail = true;
    game.stepFrame(1);
    hover(game, 320, 240);
    for (let i = 0; i < 20; i++) game.stepFrame(1);
    expect(playerShots(game)).toBeGreaterThan(0);

    game.input.pointerInside = false;
    game.bulletSystem.clearAll('player-bullet');
    for (let i = 0; i < 40; i++) game.stepFrame(1);
    expect(playerShots(game)).toBe(0);
  });

  it('lets the cursor overrule held direction keys, not the other way round', () => {
    const game = new TH08Game({ headless: true });
    game.debugNoFail = true;
    game.stepFrame(1);
    hover(game, 320, 240);
    const want = worldOf(320, 240);
    // Held right while the cursor sits to the left of the ship: the cursor wins.
    game.input.simulateKeyDown('ArrowRight');
    for (let i = 0; i < 200; i++) game.stepFrame(1);
    expect(game.player.position.x).toBeCloseTo(want.x, 0);
  });

  it('turning the option off mid-hover hands control back on the very next frame', () => {
    const game = new TH08Game({ headless: true });
    game.debugNoFail = true;
    game.stepFrame(1);
    hover(game, 320, 240);
    for (let i = 0; i < 40; i++) game.stepFrame(1);
    const parked = { x: game.player.position.x, y: game.player.position.y };

    // This is what the options screen does live: flip the bit, keep playing.
    game.input.setMouseControl(false);
    expect(game.input.isSteering).toBe(false);
    game.input.simulateKeyDown('ArrowDown');
    for (let i = 0; i < 20; i++) game.stepFrame(1);
    expect(game.player.position.y).toBeGreaterThan(parked.y);
  });

  if (hasAssets) {
    it('survives the hand-over without a jump', async () => {
      const game = new TH08Game({ headless: true, campaign: true });
      game.debugNoFail = true;
      hover(game, 300, 300);
      const want = worldOf(300, 300);
      let biggest = 0;
      for (let i = 0; i < 400; i++) {
        const before = { x: game.player.position.x, y: game.player.position.y };
        game.stepFrame(1);
        biggest = Math.max(
          biggest,
          Math.hypot(game.player.position.x - before.x, game.player.position.y - before.y),
        );
      }
      expect(game.player.position.x).toBeCloseTo(want.x, 0);
      expect(game.player.position.y).toBeCloseTo(want.y, 0);
      // One frame of travel is the cap: the ship never teleports across the field
      // when the sim takes the wheel.
      expect(biggest).toBeLessThanOrEqual(game.player.fastSpeed + 1e-6);
    });
  }
});
