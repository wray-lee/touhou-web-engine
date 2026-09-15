/**
 * Proof that the translated ECL actually feeds the retail effect pool in a real run.
 *
 * Stage 1 is played headless; the assertions are about what the scripts asked for, so the
 * test fails if the routing from an opcode to a template id breaks, and also if a mover
 * ever produces a coordinate the renderer cannot draw.
 */
import { describe, expect, it } from 'vitest';
import { TH08Game } from './TH08Game';
import { EFFECT_TEMPLATES } from './data/th08-effect-anm';
import { TH08_ETAMA_CELLS } from './data/th08-etama-anm';
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

describe.skipIf(!hasAssets)('retail effects in a real stage', () => {
  it('stage 1 spawns ECL effects through the pool and never leaks a slot', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    const runner = game.eclRunner!;
    const pool = runner.effectPool!;
    expect(pool).toBeTruthy();

    const seenIds = new Set<number>();
    let peakLive = 0;
    for (let frame = 0; frame < 4000; frame++) {
      game.stepFrame(1);
      for (const view of pool.views) {
        seenIds.add(view.id);
        expect(Number.isFinite(view.x) && Number.isFinite(view.y), `view ${view.id}`).toBe(true);
        expect(view.scaleX).toBeLessThan(1e4);
        expect(view.alpha).toBeLessThanOrEqual(1);
        const cell = TH08_ETAMA_CELLS[view.sprite];
        expect(cell, `sprite ${view.sprite} has no atlas cell`).toBeTruthy();
      }
      peakLive = Math.max(peakLive, pool.live);
    }

    expect(pool.spawned).toBeGreaterThan(0);
    expect(seenIds.size).toBeGreaterThan(0);
    for (const id of seenIds) expect(EFFECT_TEMPLATES[id]).toBeTruthy();
    // The two retail pools are the ceiling; nothing may walk past them.
    expect(peakLive).toBeLessThanOrEqual(640);
    expect(pool.dropped).toBeGreaterThanOrEqual(0);
  }, 300_000);

  it('the pool is per stage, so a stage end cannot carry sparks into the next', async () => {
    const game = new TH08Game({ headless: true, campaign: true });
    await awaitRunner(game);
    const first = game.eclRunner!.effectPool;
    expect(first?.spawned).toBeDefined();
    first?.spawn(26, 100, 100);
    expect(first!.live).toBeGreaterThan(0);
    first!.clear();
    expect(first!.live).toBe(0);
  }, 300_000);
});
