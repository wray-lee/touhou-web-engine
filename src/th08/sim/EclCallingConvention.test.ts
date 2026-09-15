import { describe, expect, it } from 'vitest';
import { loadEclStage } from '../../games/th08/EclStageLoader';
import { createGameState } from './GameState';
import { EnemySlot } from './EnemySlot';

/**
 * The ECL calling convention and the linked familiars it exists for.
 *
 * `param0..3`/`fparam0..3` and `cxi0..3`/`cxf0..3` are one 0x20-byte block, seen
 * from either side of a `callSub`: `CallSubOnEnemy` stores `EclCallParameterCopy`
 * at `context + 0x70` (`EclDependencies.cpp:499-502`, `C_ASSERT(sizeof(...) ==
 * 0x20)` at `:476`), and `ResolveInt` names those same dwords `cxi0..3` at
 * `+0x70` and `cxf0..3` at `+0x80` (`EclOperandsInt.cpp:63-66`, `:99-102`) while
 * naming them `param0..3`/`fparam0..3` one entry further on (`:103-110`).
 * `EclDependencies.cpp:534` pins the context at `enemy + 0x7f8`, so both spellings
 * land on identical memory.
 *
 * Stage 1 depends on that. Rumia's 蛍符 familiars are summoned by `ecldata1`
 * sub 38, which writes `param0 = 120`, `fparam0 = -pi/2`, `fparam1 = -pi`,
 * `fparam2 = <phase>` and `param1 = <hp>` and then calls sub 39 — a body that
 * divides two angles by `cxi0` and passes `cxi1` to `linkChildAttached`. Keeping
 * the two names apart made `cxi0` zero, so the division yielded `NaN`, the
 * familiar's inherited `moveArc` drove its position to `NaN`, and `NaN | 0` turned
 * the HP into `0`. Those slots stayed `active` but could never be drawn or killed,
 * which is what looked like sprites that refused to clear.
 */

/** A frame-less input snapshot: no movement, no shot, no bomb. */
const HANDS_OFF = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;
/** The same, with the shot held down so the campaign actually advances. */
const AUTOFIRE = { dx: 0, dy: 0, shoot: true, bomb: false, slow: false } as never;

/** A slot plus the game state it was built against, for tests that reset it. */
function freshSlot(): { enemy: EnemySlot; gs: ReturnType<typeof createGameState> } {
  const gs = createGameState('normal', 0);
  const enemy = new EnemySlot(gs);
  enemy.reset(0, 0, 0, gs);
  return { enemy, gs };
}

/** Render every slot whose position escaped the real numbers. */
function brokenSlots(runner: Awaited<ReturnType<typeof loadEclStage>>): string[] {
  if (!runner) return ['stage did not load'];
  const bad: string[] = [];
  for (const s of runner.enemies.slots) {
    if (!s.active) continue;
    if (Number.isFinite(s.posX) && Number.isFinite(s.posY) && Number.isFinite(s.hp)) continue;
    bad.push(
      'slot ' +
        s.slotIndex +
        ' sub ' +
        s.subId +
        ' at (' +
        s.posX +
        ', ' +
        s.posY +
        ') hp ' +
        s.hp +
        (s.linkedChild ? ' linked child of ' + s.parentSlotIndex : ''),
    );
  }
  return bad;
}

describe('ECL call-parameter aliasing', () => {
  it('routes param0..3 into cxi0..3', () => {
    const { enemy: e } = freshSlot();
    e.param0 = 120;
    e.param1 = 60;
    e.param2 = -1;
    e.param3 = 7;
    expect([e.cxi0, e.cxi1, e.cxi2, e.cxi3]).toEqual([120, 60, -1, 7]);
  });

  it('routes fparam0..3 into cxf0..3', () => {
    const { enemy: e } = freshSlot();
    e.fparam0 = -1.570796;
    e.fparam1 = -3.141593;
    e.fparam2 = 0.5;
    e.fparam3 = 0.25;
    expect([e.cxf0, e.cxf1, e.cxf2, e.cxf3]).toEqual([-1.570796, -3.141593, 0.5, 0.25]);
  });

  it('reads back a callee-side write from the caller side', () => {
    const { enemy: e } = freshSlot();
    // `ecldata1` sub 39 overwrites cxf1/cxf2 with the per-frame angle rate and
    // leaves param1 alone; the alias has to hold in both directions.
    e.param0 = 180;
    e.cxf1 = 192 / 180;
    expect(e.fparam1).toBeCloseTo(192 / 180, 6);
    e.cxi0 = 0;
    expect(e.param0).toBe(0);
  });

  it('resets the shared block to zero between enemies', () => {
    const { enemy: e, gs } = freshSlot();
    e.param0 = 120;
    e.fparam1 = -3.141593;
    e.reset(10, 20, 50, gs);
    expect([e.cxi0, e.cxi1, e.cxf0, e.cxf1]).toEqual([0, 0, 0, 0]);
    expect([e.param0, e.param1, e.fparam0, e.fparam1]).toEqual([0, 0, 0, 0]);
  });
});

describe('stage 1 蛍符 familiars', () => {
  it('spawn with a finite position and a real hit point total', async () => {
    const runner = await loadEclStage({
      route: 'stage1',
      difficulty: 'normal',
      character: 'reimu-yukari',
      seed: 7,
      power: 128,
    });
    expect(runner).not.toBeNull();
    let kids: EnemySlot[] = [];
    for (let f = 0; f < 7700 && !kids.length; f++) {
      runner!.tick(HANDS_OFF);
      kids = runner!.enemies.getActive().filter((s) => s.subId === 43);
    }
    // Rows rather than booleans, so a failure names the familiar that went wrong.
    const rows = kids.map((s) => 'slot ' + s.slotIndex + ' at (' + s.posX + ', ' + s.posY + ') hp ' + s.hp);
    expect(kids.length).toBeGreaterThan(0);
    expect(
      kids.every((s) => s.hp > 0),
      rows.join(' / '),
    ).toBe(true);
    // Op 92 composites the child onto its parent and every retail summoner sends
    // it out on an inherited arc, so a familiar still sitting on the boss after
    // a second of flight never got its launch angle.
    const parents = new Map(kids.map((s) => [s.slotIndex, runner!.enemies.slotAt(s.parentSlotIndex)]));
    for (let f = 0; f < 90; f++) runner!.tick(HANDS_OFF);
    const stillOnParent = kids.filter((s) => {
      const parent = parents.get(s.slotIndex);
      return !!parent && Math.hypot(s.posX - parent.posX, s.posY - parent.posY) <= 4;
    });
    expect(stillOnParent.length, rows.join(' / ')).toBe(0);
    expect(brokenSlots(runner)).toEqual([]);
  }, 30000);

  it('leaves no slot with a non-finite position across a hands-off run', async () => {
    const runner = await loadEclStage({
      route: 'stage1',
      difficulty: 'normal',
      character: 'reimu-yukari',
      seed: 7,
      power: 128,
    });
    const bad: string[] = [];
    for (let f = 0; f < 9000; f++) {
      runner!.tick(HANDS_OFF);
      const broken = brokenSlots(runner);
      if (broken.length) {
        bad.push('frame ' + f + ': ' + broken.join(' | '));
        break;
      }
    }
    expect(bad).toEqual([]);
  }, 30000);

  it('stays finite while an armed player shoots through the whole stage', async () => {
    const runner = await loadEclStage({
      route: 'stage1',
      difficulty: 'normal',
      character: 'reimu-yukari',
      seed: 7,
      power: 128,
    });
    const bad: string[] = [];
    for (let f = 0; f < 9000; f++) {
      runner!.tick(AUTOFIRE);
      const broken = brokenSlots(runner);
      if (broken.length) {
        bad.push('frame ' + f + ': ' + broken.join(' | '));
        break;
      }
    }
    expect(bad).toEqual([]);
  }, 30000);
});
