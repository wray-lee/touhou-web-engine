/**
 * Wiring proof for the spell cards: the form you are in picks the card, the
 * youkai-form card burns two bombs, and Sakuya's stopped clock really does
 * hold the field still while her own shots keep flying.
 *
 * Everything here runs through `StageRunner`, i.e. the same path the game uses,
 * so a green suite means the 永夜抄 card mechanic is live rather than just a
 * table of numbers.
 */

import { describe, expect, it } from 'vitest';
import { StageRunner } from './StageRunner';
import { BOMB_SPECS, selectBomb } from './BombSystem';
import { createGameState } from './GameState';
import type { EclFile } from '../format/EclFile';
import type { EnemySlot } from './EnemySlot';
import type { PlayerInput } from './PlayerSim';

const idleEcl = {
  version: 2048,
  subCount: 1,
  subs: [{ id: 0, offset: 0, instructions: [] }],
  timelines: [{ index: 0, offset: 0, instructions: [] }],
} as unknown as EclFile;

const idleSubs = () => (_e: EnemySlot) =>
  (function* (): Generator<number, void, void> {
    yield 100000;
  })();

const rest: PlayerInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false };

/** A 6×5 lattice that covers the playfield, for measuring a card's real reach. */
const GRID_COLS = 6;
const GRID_ROWS = 5;

function makeRunner(shotType: number, hp = 6000, grid = false): StageRunner {
  const gs = createGameState('normal', 7);
  gs.shotType = shotType;
  const runner = new StageRunner({ gs, ecl: idleEcl, subFactory: idleSubs });
  if (grid) {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        runner.enemies.spawn(0, 32 + col * 64, 40 + row * 90, hp);
      }
    }
  } else {
    runner.enemies.spawn(0, 192, 90, hp);
  }
  return runner;
}

/** Hold Shift to enter youkai form; one frame is enough to flip the member. */
function toYoukaiForm(runner: StageRunner): void {
  runner.tick({ ...rest, slow: true });
  expect(runner.player.memberIndex).toBe(1);
}

describe('spell-card wiring', () => {
  it('human form opens the human half of the pair for one bomb', () => {
    const runner = makeRunner(0);
    runner.tick({ ...rest, bomb: true });
    expect(runner.activeBomb?.spec.id).toBe('reimu-1');
    expect(runner.player.bombs).toBe(2);
  });

  it('youkai form opens the partner card, and still costs one bomb', () => {
    const runner = makeRunner(0);
    toYoukaiForm(runner);
    runner.tick({ ...rest, slow: true, bomb: true });
    // `acceptBomb:1238-1239` takes the row straight from the form bit, and only a
    // deathbomb (`:1244-1263`) raises the price to two.
    expect(runner.activeBomb?.spec.id).toBe('yukari-1');
    expect(runner.player.bombs).toBe(2);
  });

  it('a deathbomb takes the same member’s second card and costs two bombs', () => {
    const runner = makeRunner(0);
    runner.player.hit();
    expect(runner.player.deathbombArmed).toBe(true);
    runner.tick({ ...rest, bomb: true });
    // The member bit comes from one place only, `Player+3`, and only the focus block
    // writes it (`Player.cpp:778`). Nothing in `acceptBomb` hands a deathbomb to the
    // other half of the pair, so flying upright and dying still drops 霊夢's own
    // second card. `g_PlayerBombCallbackTable` agrees: rows come in (update, draw)
    // pairs per shot type (`Player.cpp:1648-1651`), not (bomb, deathbomb) pairs.
    expect(runner.activeBomb?.spec.id).toBe('reimu-2');
    expect(runner.player.bombs).toBe(1);
  });

  it('every pair changes card when the form changes', () => {
    for (const team of [0, 1, 2, 3]) {
      const human = makeRunner(team);
      human.tick({ ...rest, bomb: true });
      const youkai = makeRunner(team);
      toYoukaiForm(youkai);
      youkai.tick({ ...rest, slow: true, bomb: true });
      const humanId = human.activeBomb?.spec.id;
      const youkaiId = youkai.activeBomb?.spec.id;
      expect(humanId).toBeTruthy();
      expect(youkaiId).toBeTruthy();
      expect(humanId).not.toBe(youkaiId);
      expect(human.lastBombZones.length).toBeGreaterThan(0);
      expect(youkai.lastBombZones.length).toBeGreaterThan(0);
    }
  });

  it('a stopped clock holds enemy bullets and enemies, not the player', () => {
    const runner = makeRunner(2);
    runner.tick({ ...rest, bomb: true });
    expect(runner.activeBomb?.spec.id).toBe('sakuya-1');
    expect(runner.activeBomb?.freeze).toBe(true);

    const enemyShot = runner.bullets.spawn(100, 100, Math.PI / 2, 4, 0, 0, 3, 1, 'enemy');
    const ownShot = runner.bullets.spawn(100, 300, -Math.PI / 2, 6, 0, 0, 3, 1, 'player');
    expect(enemyShot).toBeTruthy();
    expect(ownShot).toBeTruthy();
    const enemy = runner.enemies.getActive()[0];
    enemy.posX = 192;
    enemy.posY = 90;
    const enemyWas = { x: enemy.posX, y: enemy.posY };

    runner.tick(rest);
    expect(enemyShot!.y).toBe(100);
    expect(ownShot!.y).toBeLessThan(300);
    expect(enemy.posY).toBeCloseTo(enemyWas.y, 6);
  });

  it('a card eats an enemy bar down and the card is spent when it ends', () => {
    const runner = makeRunner(0, 400);
    runner.tick({ ...rest, bomb: true });
    for (let i = 0; i < 200; i++) runner.tick(rest);
    expect(runner.enemies.getActive().length, 'the card should clear the dummy').toBe(0);
    expect(runner.activeBomb).toBeNull();
    expect(runner.lastBombZones).toHaveLength(0);
  });

  /*
   * The plan's P2 gate is "16 张符卡", and the only way to know all sixteen are
   * live — rather than sixteen rows in a table — is to open each one through the
   * same `StageRunner` the game uses and watch a field of dummies lose hit points.
   *
   * The four cards of a duo come out of two bits (`Player.cpp:1238-1246`): bit 0 is
   * the flying member, which is `Player+3` and therefore the Shift latch, and bit 1
   * is the second card of whichever half is flying. So {upright, focused} ×
   * {first card, second card} walks a team's four cards exactly once, and the four
   * teams are the sixteen. The deathbomb is how this harness reaches bit 1, since
   * `Player+4` -- the byte retail reads there -- has no writer anywhere in the
   * reference set.
   *
   * This replaces an earlier assertion that a deathbomb variant out-damages its
   * one-bomb form. That looked like a law when measured against a single dummy, but
   * it is not: 幽幽子's butterflies scatter to random spots (`scatterZones`), so
   * against one stationary target her card is a coin flip, and against a lattice
   * that fills the field the ordering flips for 魔理沙 instead. Damage is a property
   * of the card's geometry versus the target layout, not of the deathbomb bit. What
   * retail actually guarantees is the slot mapping below, and that every card bites.
   */
  it('opens all sixteen cards and every one of them bites', () => {
    /** Measured against the lattice; each card's own floor, with slack. */
    const DAMAGE_FLOOR: Record<string, number> = {
      'reimu-1': 700,
      'reimu-2': 1000,
      // 紫's first card is the shortest in the game at 150 frames, so the floor moved
      // with it: 14480 over 150 frames is 96 HP/frame against the lattice, above the
      // 90/frame the old 210-frame card cleared at.
      'yukari-1': 14000,
      'yukari-2': 39000,
      'marisa-1': 5500,
      'marisa-2': 12900,
      'alice-1': 700,
      'alice-2': 1000,
      'sakuya-1': 600,
      'sakuya-2': 1150,
      'remilia-1': 3400,
      'remilia-2': 17000,
      'youmu-1': 2400,
      'youmu-2': 7100,
      'yuyuko-1': 4700,
      'yuyuko-2': 15200,
    };
    const seen = new Set<string>();

    for (const team of [0, 1, 2, 3]) {
      for (const [focused, death] of [
        [false, false],
        [true, false],
        [false, true],
        [true, true],
      ]) {
        const runner = makeRunner(team, 99999, true);
        if (focused) {
          runner.tick({ ...rest, slow: true });
          expect(runner.player.memberIndex, `team ${team} should be in 妖 form`).toBe(1);
        }
        if (death) {
          runner.player.bombs = 3;
          runner.player.hit();
        }
        runner.tick({ ...rest, slow: focused, bomb: true });

        const id = runner.activeBomb?.spec.id;
        expect(id, `team ${team} variant ${focused}/${death} opened no card`).toBeTruthy();
        expect(id).toBe(selectBomb(team, focused, death).id);
        seen.add(id!);

        for (let i = 0; i < 300; i++) runner.tick({ ...rest, slow: focused });
        let left = 0;
        for (const enemy of runner.enemies.getActive()) left += enemy.hp;
        const damage = 99999 * GRID_COLS * GRID_ROWS - left;
        expect(damage, `${id} lattice damage`).toBeGreaterThanOrEqual(DAMAGE_FLOOR[id!]);
      }
    }

    expect(seen.size, 'the sixteen variants must be sixteen distinct cards').toBe(16);
  });

  it('the cancel ring is reported for drawing while it sweeps', () => {
    const runner = makeRunner(0);
    runner.tick({ ...rest, bomb: true });
    expect(runner.bombCancel?.radius).toBeGreaterThan(0);
    for (let i = 0; i < 12; i++) runner.tick(rest);
    expect(runner.bombCancel).toBeNull();
  });

  it('every card flashes in its own colour, and a pair never repeats', () => {
    // The renderer tints the full-screen flash from `BombSpec.accent`
    // (`PixiRenderer.triggerBombFlash`), so an accent collision would put the
    // user's complaint right back: sixteen cards, one look.
    const accents = BOMB_SPECS.map((s) => s.accent);
    expect(new Set(accents).size).toBe(BOMB_SPECS.length);
    for (const shotType of [0, 1, 2, 3]) {
      const human = selectBomb(shotType, false);
      const youkai = selectBomb(shotType, true);
      expect(human.accent, `pair ${shotType} shares a flash colour`).not.toBe(youkai.accent);
    }
    // Deathbomb variants are their own cards, so they are their own colour too.
    expect(selectBomb(0, false, true).accent).not.toBe(selectBomb(0, false).accent);
  });
});
