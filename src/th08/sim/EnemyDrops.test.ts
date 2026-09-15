/**
 * What falls out of a dead enemy, and what falls out of a captured card.
 *
 * `Enemy::FUN_0042bea0` (`EnemyManager.cpp:809-868`) decides the drop from
 * `enemy+0x3304`: a non-negative value names exactly one item, -1 walks the global
 * 32-entry `g_EnemyDropSchedule` and pays one entry every third such death, and -2
 * pays nothing. `EnemyOverlay::FUN_0042adb0` (`:262-382`) then decides what a
 * familiar chain is worth when its summoner loses a life bar.
 */
import { describe, expect, it } from 'vitest';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import { EnemyManager } from './EnemyManager';
import { ENEMY_DROP_SCHEDULE } from './ItemPool';
import { ItemPool } from './ItemPool';
import type { EnemySlot } from './EnemySlot';

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;

/** A manager with an item pool attached, which is all the drop path reads. */
function manager(): { mgr: EnemyManager; items: ItemPool } {
  const gs = createGameState('hard', 5);
  const mgr = new EnemyManager(gs, () => null);
  const items = new ItemPool(gs);
  mgr.itemPool = items;
  return { mgr, items };
}

const active = (items: ItemPool) => items.items.filter((item) => item.active);

const bits = (v: number): number => new Int32Array(new Float32Array([v]).buffer)[0];

/**
 * A runner whose only timeline instruction parks sub 0 — the summoner — at the
 * middle of the playfield, plus whatever subs the test registers for it to call.
 */
function harness(subs: Record<number, SubFn>): StageRunner {
  const gs = createGameState('hard', 7);
  return new StageRunner({
    gs,
    ecl: {
      version: 2048,
      subCount: Object.keys(subs).length,
      subs: [],
      timelines: [
        {
          index: 0,
          offset: 0,
          instructions: [
            {
              offset: 0,
              time: 1,
              opcode: 0,
              size: 32,
              difficultyMask: 0xff,
              args: new Int32Array([0, bits(100), bits(100), 1000, -2, 0]),
            },
          ],
        },
      ],
    } as never,
    subFactory: (id: number) => subs[id] ?? null,
  });
}

/** Settle the summoner and the familiars it launches on its first frame. */
function launch(runner: StageRunner): void {
  for (let f = 0; f < 4; f++) runner.tick(noInput);
}

describe('death drops (Enemy::FUN_0042bea0)', () => {
  it('hands out exactly the one item the spawn asked for', () => {
    for (const [dropType, kind] of [
      [0, 'powerSmall'],
      [1, 'point'],
      [2, 'powerBig'],
      [3, 'bomb'],
    ] as const) {
      const { mgr, items } = manager();
      const slot = mgr.spawnFromTimeline(0, 100, 100, 20, { dropType, score: 1000 })!;
      mgr.dropOnDeath(slot);
      const drops = active(items);
      // The old behaviour gave every kill a point *and* a power item, which is how a
      // fresh run reached full power inside the first wave.
      expect(drops).toHaveLength(1);
      expect(drops[0].kind).toBe(kind);
    }
  });

  it('drops nothing for a familiar', () => {
    const { mgr, items } = manager();
    const slot = mgr.spawnFromTimeline(0, 100, 100, 20, { dropType: -2 })!;
    mgr.dropOnDeath(slot);
    expect(active(items)).toHaveLength(0);
  });

  it('walks the shared schedule once every third death for drop type -1', () => {
    const { mgr, items } = manager();
    const kinds: string[] = [];
    for (let kill = 0; kill < 7; kill++) {
      const before = active(items).length;
      mgr.dropOnDeath(mgr.spawnFromTimeline(0, 100, 100, 20, { dropType: -1 })!);
      const added = active(items).length - before;
      expect(added).toBeLessThanOrEqual(1);
      if (added) kinds.push(active(items)[active(items).length - 1].kind);
    }
    // Deaths 1, 4 and 7 are the ones where `g_EnemyDropCounter % 3` is 0, and the
    // schedule advances one entry each time (`EnemyManager.cpp:824-836`).
    expect(kinds).toHaveLength(3);
    expect(kinds).toEqual([
      ENEMY_DROP_SCHEDULE[0] === 0 ? 'powerSmall' : 'point',
      ENEMY_DROP_SCHEDULE[1] === 0 ? 'powerSmall' : 'point',
      ENEMY_DROP_SCHEDULE[2] === 0 ? 'powerSmall' : 'point',
    ]);
  });

  it('scatters the queued point and power grants around the body', () => {
    const { mgr, items } = manager();
    const slot = mgr.spawnFromTimeline(0, 100, 100, 20, {
      dropType: -2,
      pointDrops: 2,
      powerDrops: 3,
    })!;
    mgr.dropOnDeath(slot);
    const drops = active(items);
    expect(drops).toHaveLength(5);
    expect(drops.filter((d) => d.kind === 'point')).toHaveLength(2);
    expect(drops.filter((d) => d.kind === 'powerSmall')).toHaveLength(3);
    // `EnemyManager.cpp:843-849`: each grant is thrown 64px either way off the body.
    for (const drop of drops) {
      expect(Math.abs(drop.x - 100)).toBeLessThanOrEqual(64);
      expect(Math.abs(drop.y - 100)).toBeLessThanOrEqual(64);
    }
    expect(slot.pointDrops).toBe(0);
    expect(slot.powerDrops).toBe(0);
  });

  it('turns a queued power grant into a point item on a capped ship', () => {
    const gs = createGameState('hard', 5);
    gs.power = 128;
    const mgr = new EnemyManager(gs, () => null);
    const items = new ItemPool(gs);
    mgr.itemPool = items;
    const slot = mgr.spawnFromTimeline(0, 100, 100, 20, { dropType: 0 })!;
    mgr.dropOnDeath(slot);
    expect(active(items)[0].kind).toBe('pointSmall');
  });
});

/** A boss that claims the marker, arms a life bar and launches two familiars. */
const summoner: SubFn = (e) =>
  (function* () {
    e.setBossPresent(0);
    e.setLives(1000);
    e.setPhase(0, 500, 2);
    // Op 90 lands a familiar at an absolute playfield coordinate, so both have to sit
    // inside it or their orb spray gets culled by `ItemPool`'s bounds test.
    e.linkChildStandard(1, 140, 120, 120, -2, 100);
    e.linkChildStandard(1, 100, 148, 120, -2, 100);
    yield 6000;
  })();

const idle: SubFn = () =>
  (function* () {
    yield 6000;
  })();

describe('familiar chain payoff (EnemyOverlay::FUN_0042adb0)', () => {
  it('bursts the whole live chain into time orbs when a bar breaks', () => {
    const runner = harness({ 0: summoner, 1: idle, 2: idle });
    launch(runner);
    const boss = runner.enemies.getActive().find((s) => s.subId === 0)!;
    expect(runner.enemies.getActive().filter((s) => s.linkedChild)).toHaveLength(2);

    runner.lastPopups.length = 0;
    boss.applyDamage(501);
    runner.tick(noInput);

    // `EnemyManager.cpp:295-300`: a paired ship with a 2-chain gets 2*2+10 per
    // familiar, and the parent itself throws twice its cumulative spawn count.
    const orbs = runner.items.items.filter((i) => i.active && i.kind === 'timeOrb');
    expect(orbs.length).toBeGreaterThanOrEqual(2 * 14 + 2 * 2);
    // The popup per familiar carries the chain length, at the retail blue falloff.
    expect(runner.lastPopups).toHaveLength(3);
    expect(runner.lastPopups[0].value).toBe(2);
    expect(runner.lastPopups[0].color).toBe(-48);
    expect(runner.lastPopups[2].scale).toBe(2);
    expect(runner.lastPopups[2].color).toBe(0xfff0f00f | 0);
    // The chain is detached, so nothing else can pay it out a second time.
    expect(boss.childCount).toBe(0);
    for (const kid of runner.enemies.slots.filter((s) => s.deathEffectsSuppressed)) {
      expect(kid.linkedChild).toBe(false);
      // `EnemyManager.cpp:333-335`: the burst disarms the familiar's own drop, so the
      // field wipe that follows cannot pay it out again.
      expect(kid.dropType).toBe(-2);
    }
  });

  it('pays a lone familiar one orb and a twelfth of the meter', () => {
    const runner = harness({ 0: summoner, 1: idle, 2: idle });
    launch(runner);
    const kid = runner.enemies.getActive().find((s) => s.linkedChild)!;
    runner.player.gauge.set(1200);
    runner.lastPopups.length = 0;

    runner.enemies.familiarChainPayoff(kid, 1);

    expect(runner.player.gauge.value).toBe(1200 - Math.trunc(1200 / 12));
    expect(runner.lastPopups).toHaveLength(1);
    expect(runner.lastPopups[0].value).toBe(1);
    expect(runner.items.items.filter((i) => i.active && i.kind === 'timeOrb')).toHaveLength(1);
  });

  it('detaches the chain silently when a card runs out its clock', () => {
    const runner = harness({ 0: summoner, 1: idle, 2: idle, 3: idle });
    launch(runner);
    const boss = runner.enemies.getActive().find((s) => s.subId === 0)!;
    // Arm the countdown and let it expire without ever crossing a threshold.
    boss.setSpellTimer(1, 3);
    runner.lastPopups.length = 0;
    for (let f = 0; f < 4; f++) runner.tick(noInput);
    expect(runner.lastPopups).toHaveLength(0);
    expect(runner.items.items.filter((i) => i.active && i.kind === 'timeOrb')).toHaveLength(0);
    expect(runner.enemies.getActive().filter((s) => s.linkedChild)).toHaveLength(0);
  });
});
