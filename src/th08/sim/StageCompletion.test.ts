/**
 * The two structural rules that decide whether a stage actually finishes.
 *
 * Both were broken for a long time and neither shows up until a boss owns a
 * familiar pattern:
 *
 *  - ECL ops 90/91/92 are the linked-child cluster (`EclRunLow.inl:1014-1203`),
 *    not three flavours of "kill self". Translating them as kills deleted every
 *    boss that summons, which is 589 call sites across the nine stage scripts.
 *  - Running out of timeline instructions is not a stage clear. Retail's last
 *    instruction is a boss wait, so the clear cannot start while a slot still
 *    holds the marker.
 *
 * The integration cases then pin the shape of a real fight: stage 1 on Hard runs
 * its three cards in order and pays the capture, and stage 1 on Normal advances
 * through its cards on the spell clock alone, with no damage dealt at all. That
 * second one is the retail "full-dodge the stage" property: the script, not the
 * player's DPS, drives the phase changes.
 */

import { describe, expect, it } from 'vitest';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import type { EnemySlot } from './EnemySlot';
import { loadEclStage } from '../../games/th08/EclStageLoader';

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

/** A runner with an empty timeline and hand-written subs, so each case owns its script. */
function harness(subs: Record<number, SubFn>): StageRunner {
  const gs = createGameState('hard', 7);
  return new StageRunner({
    gs,
    ecl: {
      version: 2048,
      subCount: Object.keys(subs).length,
      subs: [],
      timelines: [{ index: 0, offset: 0, instructions: [] }],
    } as never,
    subFactory: (id: number) => subs[id] ?? null,
  });
}

const idle: SubFn = () =>
  (function* () {
    yield 6000;
  })();

describe('linked children (ECL ops 90..92)', () => {
  it('launches a familiar and leaves the boss alive', () => {
    const runner = harness({
      0: (e) =>
        (function* () {
          e.linkChildStandard(1, 20, 8, 120, -2, 100);
          yield 6000;
        })(),
      1: idle,
    });
    const parent = runner.enemies.spawn(0, 100, 100, 5000);
    expect(parent).not.toBeNull();
    runner.tick({ dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never);

    expect(parent!.active).toBe(true);
    expect(parent!.hp).toBe(5000);
    const kids = runner.enemies.slots.filter((s) => s.active && s.linkedChild);
    expect(kids).toHaveLength(1);
    expect(kids[0].parentSlotIndex).toBe(parent!.slotIndex);
    expect(kids[0].subId).toBe(1);
    // Op 90 takes an absolute offset, so the familiar lands at (20, 8).
    expect(kids[0].posX).toBeCloseTo(20, 3);
    expect(kids[0].posY).toBeCloseTo(8, 3);
    expect(parent!.childCount).toBe(1);
  });

  it('op 91 measures the offset from the parent instead of the field', () => {
    const runner = harness({
      0: (e) =>
        (function* () {
          e.linkChildRelative(1, 20, 8, 120, -2, 100);
          yield 6000;
        })(),
      1: idle,
    });
    runner.enemies.spawn(0, 100, 100, 5000);
    runner.tick({ dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never);
    const kid = runner.enemies.slots.find((s) => s.active && s.linkedChild)!;
    expect(kid.posX).toBeCloseTo(120, 3);
    expect(kid.posY).toBeCloseTo(108, 3);
  });

  it('op 92 keeps the familiar riding on the parent', () => {
    const runner = harness({
      0: (e) =>
        (function* () {
          e.linkChildAttached(1, 20, 8, 120, -2, 100);
          yield 6000;
        })(),
      1: idle,
    });
    const parent = runner.enemies.spawn(0, 100, 100, 5000)!;
    const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;
    runner.tick(noInput);
    const kid = runner.enemies.slots.find((s) => s.active && s.linkedChild)!;
    expect(kid.followParentPosition).toBe(true);
    expect(kid.posX).toBeCloseTo(120, 3);
    expect(kid.posY).toBeCloseTo(108, 3);

    // Walk the parent along and the familiar has to come with it.
    for (let f = 0; f < 30; f++) {
      parent.posX += 2;
      runner.tick(noInput);
    }
    expect(kid.posX).toBeCloseTo(parent.posX + 20, 1);
    expect(kid.posY).toBeCloseTo(parent.posY + 8, 1);
  });

  it('routes half of a hit on the familiar into the parent, not the familiar', () => {
    const runner = harness({
      0: (e) =>
        (function* () {
          e.linkChildStandard(1, 20, 8, 120, -2, 100);
          yield 6000;
        })(),
      1: idle,
    });
    const parent = runner.enemies.spawn(0, 100, 100, 5000)!;
    runner.tick({ dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never);
    const kid = runner.enemies.slots.find((s) => s.active && s.linkedChild)!;

    runner.damageEnemiesAt([{ x: kid.posX, y: kid.posY, damage: 40, active: true }]);
    expect(kid.hp).toBe(120);
    expect(parent.hp).toBe(4980);
  });

  it('refuses the launch once the parent is out of HP', () => {
    const runner = harness({
      0: (e) =>
        (function* () {
          e.linkChildStandard(1, 20, 8, 120, -2, 100);
          yield 6000;
        })(),
      1: idle,
    });
    const parent = runner.enemies.spawn(0, 100, 100, 5000)!;
    parent.applyDamage(5000);
    const before = runner.enemies.activeCount;
    parent.linkChildStandard(1, 20, 8, 120, -2, 100);
    expect(runner.enemies.activeCount).toBe(before);
  });

  /**
   * `SpawnEnemy2` copies the summoner's `context + 0x18 .. + 0x90` over the
   * child's after `CallEclSub` and before the first `RunEcl`
   * (`EnemyTimeline.cpp:104-107`), which is the whole steering channel for a
   * familiar: retail's ops 90..92 pass `(0,0)` as the position in every stage and
   * put the launch angle in `f0` and the radius in `f1` instead. `ei*`/`ef*` live
   * in the Enemy struct outside that window, so they always start at zero.
   */
  it("hands the summoner's register block to the familiar before its first frame", () => {
    const runner = harness({
      0: (e) =>
        (function* () {
          e.f0 = 1.25;
          e.f1 = 64;
          e.i3 = 9;
          e.ci2 = 5;
          e.linkChildStandard(1, 0, 0, 120, -2, 100);
          yield 6000;
        })(),
      1: (e) =>
        (function* () {
          // Reads the inherited values on the very first step it is run.
          e.f7 = e.f0 + e.f1 + e.i3 + e.ci2;
          yield 6000;
        })(),
    });
    runner.enemies.spawn(0, 100, 100, 5000);
    runner.tick({ dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never);
    const kid = runner.enemies.slots.find((s) => s.active && s.linkedChild)!;
    expect(kid.f0).toBeCloseTo(1.25, 6);
    expect(kid.f1).toBe(64);
    expect(kid.i3).toBe(9);
    expect(kid.ci2).toBe(5);
    expect(kid.f7).toBeCloseTo(79.25, 4);
    // `ei`/`ef` are not in the copied window.
    expect(kid.ei0).toBe(0);
    expect(kid.ef0).toBe(0);
  });
});

describe('stage completion gate', () => {
  const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;

  it('will not call a clear while a boss still holds the marker', () => {
    const runner = harness({ 0: idle });
    runner.tick(noInput);
    expect(runner.timeline.finished).toBe(true);
    expect(runner.isFinished).toBe(true);

    const boss = runner.enemies.spawn(0, 100, 100, 5000)!;
    boss.setBossPresent(0);
    expect(runner.isFinished).toBe(false);

    // A boss that flees releases its own marker, and the stage is then allowed to
    // end even though the slot is still walking off screen.
    boss.setBossPresent(-1);
    expect(runner.isFinished).toBe(true);
  });
});

// A full stage 1 is ~14k simulated frames, which costs about a second. Cheap
// enough to keep in the default run, and it is the only case that exercises the
// whole timeline → boss → card → clear chain together.
describe('stage 1 end to end', () => {
  const focusFire = { dx: 0, dy: 0, shoot: true, bomb: false, slow: false } as never;
  const handsOff = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;

  async function run(difficulty: 'normal' | 'hard') {
    const runner = await loadEclStage({
      route: 'stage1',
      difficulty,
      character: 'reimu-yukari',
      seed: 7,
      power: 128,
    });
    if (!runner) throw new Error('stage 1 did not load');
    const cards: string[] = [];
    const results: string[] = [];
    let last: string | null = null;
    for (let f = 0; f < 20000 && !runner.isFinished; f++) {
      runner.tick(difficulty === 'hard' ? focusFire : handsOff);
      if (difficulty === 'hard') {
        const gauge = runner.bossGauge;
        if (gauge) runner.damageEnemiesAt([{ x: gauge.x, y: gauge.y, damage: 6, active: true }]);
      }
      if (runner.gs.spellName !== last) {
        cards.push(runner.gs.spellName ?? '-');
        last = runner.gs.spellName;
      }
      for (const card of runner.lastSpellResults) {
        results.push(`${card.name}:${card.captured ? 'CAP' : 'MISS'}`);
      }
    }
    return { runner, cards, results };
  }

  it('Hard runs Riggle three cards in order, captures one and then clears', async () => {
    const { runner, cards, results } = await run('hard');
    expect(cards).toEqual(
      expect.arrayContaining([
        '蛍符「地上の流星」',
        '灯符「ファイヤフライフェノメノン」',
        '蠢符「ナイトバグストーム」',
      ]),
    );
    expect(results.some((r) => r.startsWith('蛍符'))).toBe(true);
    expect(results.find((r) => r.startsWith('蛍符'))).toContain('CAP');
    expect(runner.isFinished).toBe(true);
    expect(runner.gs.timeOrbs).toBeGreaterThan(0);
    // Killing things pays their score field now, so a cleared stage is never at zero.
    expect(runner.player.score).toBeGreaterThan(1_000_000);
  }, 120000);

  it('Normal advances the cards on the spell clock with no damage dealt', async () => {
    const { runner, cards } = await run('normal');
    // Nothing ever called applyDamage, so every phase change here came from the
    // countdown expiring. That is what makes a full-dodge run possible at all.
    expect(cards).toContain('灯符「ファイヤフライフェノメノン」');
    expect(cards).toContain('蠢符「リトルバグストーム」');
    expect(runner.enemies.slots.every((s) => s.hp > 0 || !s.active)).toBe(true);
  }, 120000);

  /**
   * The visible half of register inheritance. Riggle's 蛍符 launcher writes eight
   * different `f0` angles and then calls op 92 eight times in one frame, so the
   * familiars have to arrive as a ring. Before `SpawnEnemy2`'s context copy was
   * translated they all stepped `moveArc(100, 0, rate, 0)` at zero speed and
   * stacked on the boss as one bright blob.
   */
  it('spreads the 蛍符 familiars into a ring instead of stacking them on the boss', async () => {
    const runner = (await loadEclStage({
      route: 'stage1',
      difficulty: 'hard',
      character: 'reimu-yukari',
      seed: 7,
      power: 128,
    }))!;
    const handsOff = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;
    let ring: { x: number; y: number }[] = [];
    for (let f = 0; f < 3760; f++) {
      runner.tick(handsOff);
      if (runner.gs.frame >= 3660) {
        const kids = runner.enemies.slots.filter(
          (s) => s.active && s.linkedChild && (s.subId === 19 || s.subId === 20),
        );
        if (kids.length > ring.length) ring = kids.map((s) => ({ x: s.posX, y: s.posY }));
      }
    }
    expect(ring.length).toBeGreaterThanOrEqual(8);
    let widest = 0;
    for (let a = 0; a < ring.length; a++)
      for (let b = a + 1; b < ring.length; b++)
        widest = Math.max(widest, Math.hypot(ring[a].x - ring[b].x, ring[a].y - ring[b].y));
    // Four at radius ~48 and four at ~34 on opposite bearings, so the ring is
    // ~96px across. A stack would measure a couple of pixels.
    expect(widest).toBeGreaterThan(60);
  }, 120000);
});
