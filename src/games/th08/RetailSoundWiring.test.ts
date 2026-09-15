/**
 * Sound requests have to survive the trip from the scripts to the speakers.
 *
 * The sim already collected what ECL asked for - op 124, a bullet's spawn and
 * transform sounds - and the host dropped it on the floor. This pins the other half:
 * every request the frame produced reaches the bank, with the playfield x turned into
 * a pan and nothing invented along the way.
 */

import { describe, expect, it, vi } from 'vitest';
import { TH08Game } from './TH08Game';
import { panFromPlayfieldX, SE_IDX } from './data/RetailSound';
import type { SeTick } from '../../th08/sim/BulletTransform';

/** The few fields of a runner that the feedback pass reads. */
function fakeRunner(sfx: readonly SeTick[]): TH08Game['eclRunner'] {
  return {
    frameSfx: sfx,
    frameFx: [],
    effectPool: null,
    lastDeaths: [],
    lastSpellResults: [],
    lastPopups: [],
    lastGraze: 0,
    lastCollected: [],
    player: { x: 192, y: 400, power: 0 },
  } as unknown as TH08Game['eclRunner'];
}

function feedback(game: TH08Game): void {
  (game as unknown as { tickEclFeedback(): void }).tickEclFeedback();
}

describe('ECL sound requests reach the bank', () => {
  it('queues what the frame asked for, panned by position', () => {
    const game = new TH08Game({ headless: true });
    const queue = vi.spyOn(game.audio, 'queueSe');
    game.eclRunner = fakeRunner([
      { id: 15, x: 0 },
      { id: 25, x: 384 },
      { id: 0x2d, x: Number.NaN },
    ]);

    feedback(game);

    expect(queue.mock.calls).toEqual([
      [15, panFromPlayfieldX(0)],
      [25, panFromPlayfieldX(384)],
      [0x2d, 0],
    ]);
    // Left and right really do end up on opposite sides.
    expect(queue.mock.calls[0][1]).toBe(-1);
    expect(queue.mock.calls[1][1]).toBe(1);
  });

  it('clears with an empty frame', () => {
    const game = new TH08Game({ headless: true });
    const queue = vi.spyOn(game.audio, 'queueSe');
    game.eclRunner = fakeRunner([]);
    expect(() => feedback(game)).not.toThrow();
    expect(queue).not.toHaveBeenCalled();
  });

  it('gives the player shot the index the original fires, and the pan', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    game.debugAutoShoot = true;
    // The stage data arrives on a later event-loop turn than the constructor.
    for (let i = 0; i < 50 && !game.eclRunner; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const runner = game.eclRunner;
    expect(runner).toBeTruthy();
    runner!.player.x = 60;
    const queue = vi.spyOn(game.audio, 'queueSe');
    game.stepFrame(1);
    const shot = queue.mock.calls.find(([idx]) => idx === SE_IDX.playerShot);
    expect(shot?.[1]).toBeCloseTo(panFromPlayfieldX(60), 1);
  });
});
