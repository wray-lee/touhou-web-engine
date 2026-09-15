import { describe, expect, it } from 'vitest';
import { ItemPool, powerLevel, POWER_THRESHOLDS, type CollectResult, type Item } from './ItemPool';
import {
  addTimeOrbs,
  createGameState,
  POINT_EXTEND_THRESHOLDS,
  updatePointItemExtendThreshold,
  type GameState,
} from './GameState';
import type { ItemKind } from './ItemPool';

/**
 * Drop one item on the ship and collect it on the spot.
 *
 * `tick` moves the item before the pickup test, so a spawn at `y` is scored at
 * `y - 2.17` -- retail's `RISE_OFF` plus one gravity step -- and the assertions
 * below use that settled value. A 时符 is the exception: `SpawnItem:61-64` forces it
 * into the hovering state, which the item box cannot reach, so a test that wants one
 * banked has to shut the fire window first.
 */
function grab(
  gs: GameState,
  kind: ItemKind,
  y: number,
  extremeHuman = false,
  shotWindowOpen = true,
): CollectResult[] {
  const pool = new ItemPool(gs);
  pool.spawn(kind, 0, y);
  return pool.tick(0, y, 400, 128, false, extremeHuman, true, 8, 1, 1, shotWindowOpen);
}

describe('ItemPool point items', () => {
  it('pays pointItemValue above the line and half of it minus base/1000 per pixel below', () => {
    const gs = createGameState('normal');
    expect(gs.pointItemValue).toBe(100000);
    expect(grab(gs, 'point', 60)[0].popup).toBe(100000);
    expect(grab(gs, 'point', 330)[0].popup).toBe(30100);
  });

  it('seeds the base per difficulty the way GameManager.cpp:857-874 does', () => {
    expect(createGameState('easy').pointItemValue).toBe(60000);
    expect(createGameState('hard').pointItemValue).toBe(200000);
    expect(createGameState('lunatic').pointItemValue).toBe(300000);
    expect(createGameState('extra').pointItemValue).toBe(300000);
  });

  it('doubles the payout while the meter is pinned to the human side', () => {
    const gs = createGameState('normal');
    expect(grab(gs, 'point', 330, true)[0].popup).toBe(60200);
  });

  it('values a small point item at a tenth of a big one', () => {
    const gs = createGameState('normal');
    expect(grab(gs, 'pointSmall', 60)[0].popup).toBe(10000);
  });

  it('counts each point item and rolls the extend threshold forward at 100', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    for (let i = 0; i < 99; i++) {
      pool.spawn('point', 0, 60);
      expect(pool.tick(0, 60, 400, 128, false, false)[0].extend).toBeUndefined();
    }
    expect(gs.pointItemsCollected).toBe(99);
    pool.spawn('point', 0, 60);
    expect(pool.tick(0, 60, 400, 128, false, false)[0].extend).toBe(true);
    expect(gs.pointItemExtendsSoFar).toBe(1);
    expect(gs.nextPointItemExtendThreshold).toBe(POINT_EXTEND_THRESHOLDS[1]);
  });

  it('keeps the extra table flat once it runs out, and steps by 500 past the main one', () => {
    const gs = createGameState('extra');
    gs.pointItemExtendsSoFar = 3;
    updatePointItemExtendThreshold(gs);
    expect(gs.nextPointItemExtendThreshold).toBe(99999);
    gs.difficultyId = 1;
    gs.pointItemExtendsSoFar = 6;
    updatePointItemExtendThreshold(gs);
    expect(gs.nextPointItemExtendThreshold).toBe(10499);
  });

  it('raises the point value on alternate time orbs and never lets the bank go negative', () => {
    const gs = createGameState('normal');
    addTimeOrbs(gs, 1);
    addTimeOrbs(gs, 1);
    expect(gs.pointItemValue).toBe(100010);
    addTimeOrbs(gs, -500);
    expect(gs.timeOrbs).toBe(0);
  });

  it('prices a time orb off the point items collected so far', () => {
    const gs = createGameState('normal');
    gs.pointItemsCollected = 40;
    expect(grab(gs, 'timeOrb', 60, false, false)[0].popup).toBe(200);
    gs.pointItemsCollectedInStage = 2000;
    expect(grab(gs, 'timeOrb', 60, false, false)[0].popup).toBe(10000);
  });
});

describe('the retail item clock (sht +0x34)', () => {
  /**
   * Frames an item needs to cross from the top of the field to `targetY`, alone
   * on the field so nothing homes it in. The ship sits below and to the right,
   * out of both the collection line and the proximity magnet.
   */
  function framesTo(gs: GameState, timeScale: number, targetY: number): number {
    const pool = new ItemPool(gs);
    pool.spawn('powerSmall', 100, 40);
    const item = pool.items.find((i) => i.active) as Item;
    // `SpawnItem` throws items sideways with the stage RNG; zero that so the
    // measurement is about the vertical clock alone and cannot be cut short by
    // an off-field cull.
    item.vx = 0;
    for (let f = 1; f <= 2000; f++) {
      pool.tick(600, 430, 12, 128, false, false, true, 10, timeScale);
      if (item.y >= targetY) return f;
    }
    return 2000;
  }

  it('delays the whole trajectory by the team clock', () => {
    const gs = createGameState('normal');
    const at = (timeScale: number) => framesTo(gs, timeScale, 380);

    // 0.65 is not a cosmetic dial: Sakuya's unfocused items take about 40 % more
    // frames to reach the same line than Remilia's focused ones, which is exactly
    // the `ply02a` reading against the other seven tables.
    expect(at(1.0)).toBeLessThan(at(0.9));
    expect(at(0.9)).toBeLessThan(at(0.65));
    expect(at(0.65) / at(0.9)).toBeGreaterThan(1.3);
  });

  it('still tops out at the retail 3.0 terminal speed', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    pool.spawn('powerSmall', 100, 40);
    const item = pool.items.find((i) => i.active) as Item;
    for (let f = 0; f < 900; f++) pool.tick(600, 430, 12, 128, false, false, true, 10, 0.65);
    // Culled long before this loop ends, so the last written speed is the clamp.
    expect(item.vy).toBeLessThanOrEqual(3.0);
    expect(item.active).toBe(false);
  });
});

/** Advance one item to frame `n`, with the ship parked out of reach of everything. */
function runTo(pool: ItemPool, item: Item, frames: number, shotWindowOpen = true): void {
  for (let f = 0; f < frames; f++) {
    if (!item.active) return;
    pool.tick(600, 430, 12, 128, false, false, true, 8, 1, 1, shotWindowOpen);
  }
}

describe('the retail item states', () => {
  it('drops a plain item straight up with no sideways lean', () => {
    const pool = new ItemPool(createGameState('normal'));
    const item = pool.spawn('powerSmall', 100, 40) as Item;
    // `SpawnItem:101-105`: the base velocity is `(0, -2.2, 0)`. Only the 时符 states
    // put a ship in front of that, so an enemy drop falls in a column.
    expect(item.vx).toBe(0);
    expect(item.vy).toBeCloseTo(-2.2, 5);
    expect(item.rise).toBe('none');
  });

  it('refuses a spawn outside the arcaded band', () => {
    const pool = new ItemPool(createGameState('normal'));
    expect(pool.spawn('point', -65, 60)).toBeNull();
    expect(pool.spawn('point', 449, 60)).toBeNull();
    expect(pool.spawn('point', 448, 60)).not.toBeNull();
  });

  it('makes every 时符 a rising one the box cannot touch', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    pool.spawn('timeOrb', 100, 200);
    const item = pool.items.find((i) => i.active) as Item;
    // `SpawnItem:61-64` overwrites whatever state the caller asked for, and the rise
    // is `-2 - rand(0.2)` with `±rand(0.6)` of lean (`:118-120`).
    expect(item.rise).toBe('hover');
    expect(item.vy).toBeLessThanOrEqual(-2.0);
    expect(Math.abs(item.vx)).toBeLessThanOrEqual(0.6);

    // `:315`: the item box passes straight through it, however generous the box is.
    const collected = pool.tick(100, 200, 400, 128, false, false, true, 8, 1, 1, true);
    expect(collected).toHaveLength(0);
    expect(item.active).toBe(true);
  });

  it('hands a hovering 时符 to the magnet once its rise burns out', () => {
    const pool = new ItemPool(createGameState('normal'));
    pool.spawn('timeOrb', 100, 200);
    const item = pool.items.find((i) => i.active) as Item;
    // The hover eats 0.05 a frame and `moveItem` another 0.03, so a rise of ~2.1
    // turns over inside 30 frames (`:233` and `:313-316`).
    runTo(pool, item, 10);
    expect(item.rise).toBe('hover');
    expect(item.magnetized).toBe(false);
    runTo(pool, item, 25);
    expect(item.magnetized).toBe(true);
  });

  it('releases every hovering 时符 the frame the fire window shuts', () => {
    const pool = new ItemPool(createGameState('normal'));
    pool.spawn('timeOrb', 100, 200);
    const item = pool.items.find((i) => i.active) as Item;
    pool.tick(600, 430, 12, 128, false, false, true, 8, 1, 1, false);
    // `:235-238` ORs the shut window into the turnover test, so the whole screen
    // comes in as soon as the player lets go of fire.
    expect(item.magnetized).toBe(true);
    expect(item.rise).toBe('none');
  });

  it('ignores the collection line while an orb is still hovering', () => {
    const pool = new ItemPool(createGameState('normal'));
    pool.spawn('timeOrb', 100, 200);
    const item = pool.items.find((i) => i.active) as Item;
    // The sweep lives in retail's `else` branch (`:272-289`), which a UNK3 item never
    // reaches: flying above the line does not vacuum up orbs that have not turned
    // over yet.
    pool.tick(100, 20, 12, 128, false, false, true, 8, 1, 1, true);
    expect(item.magnetized).toBe(false);
  });

  it('rises a graze orb on the hover deceleration alone, without gravity', () => {
    function rise(variant: 'normal' | 'orbDouble'): number {
      const pool = new ItemPool(createGameState('normal'));
      pool.spawn('timeOrb', 100, 200, variant);
      const item = pool.items.find((i) => i.active) as Item;
      const start = item.y;
      runTo(pool, item, 10);
      return start - item.y;
    }
    const hovered = rise('normal');
    const doubled = rise('orbDouble');
    // `:249-265` integrates its own step and then jumps to `executeOnly`, so while it
    // is still going up the ITEM_TIME2 drop never sees `moveItem` at all: the rise
    // burns off at 0.05 a frame instead of 0.08, and it covers more ground.
    expect(doubled).toBeGreaterThan(hovered);
  });

  it('turns the ordinary orb over long before the graze one', () => {
    function turnsAt(variant: 'normal' | 'orbDouble'): number {
      const pool = new ItemPool(createGameState('normal'));
      pool.spawn('timeOrb', 100, 200, variant);
      const item = pool.items.find((i) => i.active) as Item;
      for (let f = 1; f <= 120; f++) {
        runTo(pool, item, 1);
        if (item.magnetized) return f;
      }
      return 120;
    }
    // A rise of ~2.1 eats 0.08 a frame in the hover and 0.05 in the double one, so
    // the graze drop is on screen for roughly a second and a half before it comes in.
    expect(turnsAt('normal')).toBeLessThan(turnsAt('orbDouble'));
    expect(turnsAt('orbDouble')).toBeGreaterThan(35);
  });

  it('puts a 时符 dropped during a death on the ordinary footing instead', () => {
    const pool = new ItemPool(createGameState('normal'));
    pool.shipDying = true;
    const item = pool.spawn('timeOrb', 100, 200) as Item;
    // `:122-127`: no hover, no lean, and the `-0.9` drift a cancelled item uses.
    expect(item.rise).toBe('none');
    expect(item.vx).toBe(0);
    expect(item.vy).toBeCloseTo(-0.9, 5);
  });

  it('rides a death pile out to a random point up-field before it hangs', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    pool.spawnDeathDrops(192, 400, 0, true, false);
    const dropped = pool.items.filter((i) => i.active);
    expect(dropped.length).toBeGreaterThanOrEqual(6);
    for (const item of dropped) expect(item.rise).toBe('scatter');

    runTo(pool, dropped[0], 59);
    // Still gliding: `:216-224` interpolates from the wreck toward the target and
    // jumps straight to the pickup test, so the pile is grabbable in mid-air long
    // before any of it starts to fall.
    expect(dropped[0].rise).toBe('scatter');
    expect(dropped[0].y).toBeLessThan(400);
    expect(dropped[0].y).toBeGreaterThanOrEqual(dropped[0].ty);
    const targets = dropped.map((i) => `${Math.round(i.tx / 8)},${Math.round(i.ty / 8)}`);
    expect(new Set(targets).size).toBeGreaterThan(1);
    for (const item of dropped) {
      expect(item.tx).toBeGreaterThanOrEqual(48);
      expect(item.tx).toBeLessThan(336);
      expect(item.ty).toBeGreaterThanOrEqual(-64);
      expect(item.ty).toBeLessThan(128);
    }
    runTo(pool, dropped[0], 2);
    // `:226-228`: frame 60 zeroes the velocity and hands it back to the default state.
    expect(dropped[0].rise).toBe('none');
    expect(Math.abs(dropped[0].vy)).toBeLessThan(0.2);
  });

  it('lets a bomb grab an item out of either hover', () => {
    const pool = new ItemPool(createGameState('normal'));
    pool.spawn('timeOrb', 100, 200);
    pool.spawn('timeOrb', 120, 200, 'orbDouble');
    pool.spawn('powerBig', 140, 200, 'scatter');
    pool.autoCollectAll();
    for (const item of pool.items) {
      if (!item.active) continue;
      expect(item.magnetized).toBe(true);
      expect(item.rise).toBe('none');
    }
  });
});

describe('power levels', () => {
  it('walks g_PowerUpThresholds, sentinel included', () => {
    expect(POWER_THRESHOLDS).toEqual([8, 24, 48, 80, 128, 999]);
    expect(powerLevel(0)).toBe(0);
    expect(powerLevel(8)).toBe(1);
    expect(powerLevel(127)).toBe(4);
    expect(powerLevel(128)).toBe(5);
  });
});

/*
 * `ItemManager::ConvertAllPowerItemsToTimeOrbs` (`:659-679`). The name survived the
 * decompile but the body does not match it: the loop writes `ITEM_POINT_SMALL` and
 * spawns effect 0 per item, which is the whole feel of hitting max power with a
 * field still raining P.
 */
describe('full-power conversion', () => {
  it('turns every P item on the field into a small point item', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    pool.spawn('powerSmall', 40, 120);
    pool.spawn('powerBig', 120, 200);
    pool.spawn('point', 200, 260);
    pool.spawn('bomb', 300, 300);
    const before = pool.items.filter((item) => item.active).length;
    expect(before).toBe(4);

    expect(pool.convertPowerItemsToPointSmall()).toBe(2);
    const kinds = pool.items
      .filter((item) => item.active)
      .map((item) => item.kind)
      .sort();
    expect(kinds).toEqual(['bomb', 'point', 'pointSmall', 'pointSmall']);
  });

  it('re-points the drift only on items that were not already rising', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    const falling = pool.spawn('powerSmall', 10, 100) as Item;
    const rising = pool.spawn('powerSmall', 20, 100) as Item;
    falling.vx = 1.5;
    falling.vy = 0.75;
    rising.vx = -2;
    rising.vy = -1.25;

    pool.convertPowerItemsToPointSmall();

    // `:667-671`: an item already faster than the 0.5 rise keeps its vector.
    expect([falling.vx, falling.vy]).toEqual([0, -0.5]);
    expect([rising.vx, rising.vy]).toEqual([-2, -1.25]);
  });

  it('sparks each converted item and skips the one just collected', () => {
    const gs = createGameState('normal');
    const pool = new ItemPool(gs);
    const skipped = pool.spawn('powerBig', 33, 77) as Item;
    const other = pool.spawn('powerSmall', 99, 140) as Item;
    const sparks: Array<[number, number]> = [];

    expect(pool.convertPowerItemsToPointSmall(skipped, (x, y) => sparks.push([x, y]))).toBe(1);
    expect(sparks).toEqual([[other.x, other.y]]);
    expect(skipped.kind).toBe('powerBig');
    expect(other.kind).toBe('pointSmall');
  });
});
