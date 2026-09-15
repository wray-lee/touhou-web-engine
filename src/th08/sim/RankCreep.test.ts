import { describe, expect, it } from 'vitest';
import {
  RANK_PARAMS_BY_DIFFICULTY,
  SUBRANK_PER_RANK,
  createGameState,
  decreaseSubrank,
  increaseSubrank,
} from './GameState';
import { DEATH_FRAMES, HITBOX_DELAY_FRAMES, PlayerSim } from './PlayerSim';
import { ItemPool } from './ItemPool';

/**
 * The rank creep (`GameManager::IncreaseSubrank` / `DecreaseSubrank`,
 * `GameManager.cpp:1375-1401`) is the reason a 永夜抄 stage gets visibly busier the
 * better you play it: every graze, full-value 点 and boss-breath interval pushes the
 * ladder up, and a death takes sixteen steps off it. Rank is not decoration -- the
 * ECL operands at `EnemySlot.ts:1817` read it through `ScaleIntBasedOnRank`, so a
 * stage that never creeps is a stage that never gets harder.
 */
const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false };

/** Tick a dying ship through its grace window and its dissolve (`Player.cpp:1340-1412`). */
function runOutDeath(p: PlayerSim): void {
  const budget = p.graceTimer + DEATH_FRAMES + 8;
  for (let i = 0; i < budget && p.state === 'dying'; i++) p.tick(noInput);
}

describe('the rank ladder', () => {
  it('is seeded from g_RankParams per difficulty', () => {
    expect(createGameState('easy').rank).toBe(10);
    expect(createGameState('normal').rank).toBe(10);
    expect(createGameState('hard').rank).toBe(8);
    expect(createGameState('lunatic').rank).toBe(8);
    expect(createGameState('extra').rank).toBe(16);
    expect(createGameState('hard').maxRank).toBe(12);
    expect(createGameState('extra').minRank).toBe(15);
    expect(RANK_PARAMS_BY_DIFFICULTY).toHaveLength(5);
  });

  it('walks one step per hundred subrank and keeps the carry', () => {
    const gs = createGameState('normal');
    const start = gs.rank;
    increaseSubrank(gs, 99);
    expect(gs.rank).toBe(start);
    expect(gs.subRank).toBe(99);
    increaseSubrank(gs, 2);
    expect(gs.rank).toBe(start + 1);
    expect(gs.subRank).toBe(1);
  });

  it('is clamped at the ceiling and the floor', () => {
    const gs = createGameState('hard');
    increaseSubrank(gs, 10_000);
    expect(gs.rank).toBe(12);
    expect(gs.subRank).toBeLessThan(SUBRANK_PER_RANK);
    decreaseSubrank(gs, 10_000);
    expect(gs.rank).toBe(gs.minRank);
  });

  it('prices a death at sixteen steps, paid when the power bill lands', () => {
    const gs = createGameState('easy');
    increaseSubrank(gs, 1_600);
    expect(gs.rank).toBe(gs.maxRank);
    const p = new PlayerSim(gs);
    p.bombs = 0;
    p.hit();
    expect(gs.rank).toBe(gs.maxRank);
    runOutDeath(p);
    expect(gs.rank).toBe(gs.minRank);
  });
});

describe('the sites that pay the ladder', () => {
  it('buys rank with a graze even under a live card, but stops the tally', () => {
    const gs = createGameState('normal');
    const p = new PlayerSim(gs);
    p.tick(noInput);
    const rank = gs.rank;
    const sub = gs.subRank;
    expect(p.grazeReward().grazeGain).toBeGreaterThan(0);
    expect(gs.subRank).toBe(sub + 6);
    expect(gs.rank).toBe(rank);

    gs.bombRunning = true;
    const graze = p.graze;
    const paid = gs.subRank;
    const reward = p.grazeReward();
    expect(reward.grazeGain).toBe(0);
    expect(reward.score).toBeGreaterThan(0);
    expect(p.graze).toBe(graze);
    expect(gs.subRank).toBe(paid + 6);
  });

  it('spends two rank steps on a card and sixteen on a death', () => {
    const gs = createGameState('normal');
    const p = new PlayerSim(gs);
    p.tick(noInput);
    const before = gs.rank * SUBRANK_PER_RANK + gs.subRank;
    p.bombs = 3;
    p.tick({ ...noInput, bomb: true });
    expect(before - (gs.rank * SUBRANK_PER_RANK + gs.subRank)).toBe(200);

    // A death costs more ladder than Easy..Lunatic actually own (800 steps between
    // floor and ceiling), so open the clamps to watch the whole −1600 land, then check
    // the floor really does stop it.
    gs.maxRank = 40;
    gs.minRank = 0;
    gs.rank = 24;
    gs.subRank = 0;
    const mid = gs.rank * SUBRANK_PER_RANK + gs.subRank;
    p.hit();
    runOutDeath(p);
    expect(mid - (gs.rank * SUBRANK_PER_RANK + gs.subRank)).toBe(1600);
  });

  it('prices each kind of item the way retail does', () => {
    const banked = (kind: string, y: number): number => {
      const gs = createGameState('normal');
      const items = new ItemPool(gs);
      items.spawn(kind as never, 40, y);
      const before = gs.rank * SUBRANK_PER_RANK + gs.subRank;
      items.collectAll(600);
      return gs.rank * SUBRANK_PER_RANK + gs.subRank - before;
    };
    expect(banked('powerSmall', 100)).toBe(1);
    expect(banked('powerBig', 100)).toBe(0);
    expect(banked('bomb', 100)).toBe(5);
    expect(banked('point', 100)).toBe(10);
    expect(banked('point', 700)).toBe(3);
    expect(banked('pointSmall', 100)).toBe(0);
    expect(banked('timeOrb', 100)).toBe(0);
  });

  it('charges three for an item that walks off the bottom', () => {
    const gs = createGameState('normal');
    const items = new ItemPool(gs);
    const item = items.spawn('point', 40, 100);
    expect(item).toBeTruthy();
    const before = gs.rank * SUBRANK_PER_RANK + gs.subRank;
    item!.y = 5_000;
    // The ship sits below the value line so nothing is being swept; a swept item is
    // out of `ITEM_STATE_DEFAULT` and retail does not charge for it (`:301`).
    items.tick(40, 700, 12, 600, false);
    expect(gs.rank * SUBRANK_PER_RANK + gs.subRank - before).toBe(-3);

    const charged = gs.rank * SUBRANK_PER_RANK + gs.subRank;
    const swept = items.spawn('point', 40, 100);
    swept!.y = 5_000;
    items.tick(40, 100, 12, 600, false);
    expect(gs.rank * SUBRANK_PER_RANK + gs.subRank).toBe(charged);
  });

  it('holds the meter for half a second of stance and for a whole card', () => {
    const gs = createGameState('normal');
    const p = new PlayerSim(gs);
    gs.bombRunning = false;
    p.isSlow = true;
    p.stanceTimer = 0;
    for (let i = 0; i < 20; i++) p.tick({ ...noInput, shoot: true, slow: true });
    expect(p.gauge.value).toBe(0);
    for (let i = 0; i < 60; i++) p.tick({ ...noInput, shoot: true, slow: true });
    expect(p.gauge.value).toBeGreaterThan(0);

    gs.bombRunning = true;
    p.tick({ ...noInput, shoot: true, slow: true });
    expect(p.gauge.frameStop).toBe(true);
    const held = p.gauge.value;
    p.gauge.add(5_000);
    expect(p.gauge.value).toBe(held);
    p.gauge.add(5_000, true);
    expect(p.gauge.value).toBeGreaterThan(held);
  });

  it('takes the stance away from the Shift key while a card plays', () => {
    const gs = createGameState('normal');
    const p = new PlayerSim(gs);
    gs.bombRunning = true;
    gs.bombForcedFocus = true;
    for (let i = 0; i <= HITBOX_DELAY_FRAMES; i++) p.tick({ ...noInput, slow: false });
    expect(p.isSlow).toBe(true);
    expect(p.hitboxVisible).toBe(true);

    gs.bombForcedFocus = false;
    for (let i = 0; i <= HITBOX_DELAY_FRAMES; i++) p.tick({ ...noInput, slow: true });
    expect(p.isSlow).toBe(false);
    expect(p.memberIndex).toBe(0);
  });
});
