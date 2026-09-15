import { describe, expect, it } from 'vitest';
import { EnemyManager } from './EnemyManager';
import { EnemySlot, type SpellResult } from './EnemySlot';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

/** Script table for the drivers: `subs[id]` is the coroutine the ECL hands to. */
function managerFor(subs: Record<number, SubFn>) {
  const gs = createGameState('normal', 7);
  const mgr = new EnemyManager(gs, (id) => (id in subs ? subs[id] : null));
  return { gs, mgr };
}

/** Minimal timeline that puts sub 0 at (100, 60) on frame 5. */
function oneSpawnEcl() {
  const bits = (v: number) => new Int32Array(new Float32Array([v]).buffer)[0];
  return {
    version: 2048,
    subCount: 1,
    subs: [{ id: 0, offset: 0, instructions: [] }],
    timelines: [
      {
        index: 0,
        offset: 0,
        instructions: [
          {
            offset: 0,
            time: 5,
            opcode: 0,
            size: 24,
            difficultyMask: 0xff,
            args: new Int32Array([0, bits(100), bits(60), 0, 0, 0]),
          },
        ],
      },
    ],
  } as never;
}

function runnerFor(sub: SubFn): StageRunner {
  const idle: SubFn = () =>
    (function* () {
      yield 9999;
    })();
  return new StageRunner({
    gs: createGameState('normal', 7),
    ecl: oneSpawnEcl(),
    subFactory: (id: number) => (id === 0 ? sub : idle),
  });
}

const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false };

/** Tick `frames` times, focusing one max-damage shot on the scripted boss. */
/**
 * Let the timeline spawn its boss on frame 5, then hold one max-damage shot on
 * it for rames frames, collecting the card results as they are published.
 */
function shoot(runner: StageRunner, frames: number): SpellResult[] {
  const cards: SpellResult[] = [];
  for (let i = 0; i < 8; i++) runner.tick(noInput);
  for (let i = 0; i < frames; i++) {
    runner.tick(noInput);
    cards.push(...runner.lastSpellResults);
    runner.damageEnemiesAt([{ x: 100, y: 60, damage: 500, active: true }]);
  }
  return cards;
}

describe('ECL life-bar driver (op 133)', () => {
  it('clamps HP to the threshold and re-enters the script in the same frame', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(1000);
          e.setPhase(0, 400, 1);
          yield 9999;
        })(),
      1: (e) =>
        (function* () {
          e.setPos(222, 60);
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 1000)!;
    expect(boss.phaseThresholds[0]).toBe(400);

    // 601 damage leaves 399, which is already under the armed threshold.
    boss.applyDamage(601);
    expect(boss.hp).toBe(399);
    mgr.tick();

    // The overkill is discarded, the sub ran on this very frame, and the
    // threshold is spent so it cannot fire twice.
    expect(boss.hp).toBe(400);
    expect(boss.posX).toBe(222);
    expect(boss.phaseThresholds[0]).toBe(-1);
    expect(boss.bossPhase).toBe(1);
  });

  it('pays the capture and hands the card result to the host', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(1000);
          e.setSpellTimer(600, 1);
          e.startSpell('テスト符', 'ボス', 0, 0, 500000);
          e.setPhase(0, 500, 2);
          yield 9999;
        })(),
      1: () =>
        (function* () {
          yield 9999;
        })(),
      2: () =>
        (function* () {
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 1000)!;
    expect(mgr.frameSpellResults).toHaveLength(0);
    boss.applyDamage(600);
    mgr.tick();

    expect(mgr.frameSpellResults).toHaveLength(1);
    const card = mgr.frameSpellResults[0];
    expect(card.name).toBe('テスト符');
    expect(card.captured).toBe(true);
    expect(card.bonus).toBeGreaterThan(0);
    expect(card.timerFrames).toBe(600);
    expect(card.remainingFrames).toBeGreaterThan(500);
    // Id 0 is not in `g_LastSpellNumbers`, so the host would print nothing here;
    // the wording only changes when a card that is on the list runs out.
    expect(card.isLastSpell).toBe(false);
  });

  it('marks a result whose id is one of the shipped final spells', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(1000);
          e.setSpellTimer(600, 1);
          // 12 = `SPELLCARD_ST1_BOSS_LSL`, stage 1's 隠蟲「永夜蟄居」.
          e.startSpell('隠蟲「永夜蟄居」', 'リグル・ナイトバグ', 12, 0, 2000000);
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 1000)!;
    // Let the clock run out instead of breaking the bar: that is the miss retail
    // words as "Last Spell Failed" (`Spellcard.cpp:1209`).
    boss.endSpell();
    mgr.tick();
    const card = mgr.frameSpellResults[0];
    expect(card?.captured).toBe(false);
    expect(card?.isLastSpell).toBe(true);
  });
});

describe('ECL countdown driver (ops 132 / 134 / 153)', () => {
  it('runs the expiry sub and refills HP to the highest armed threshold', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(1000);
          e.setPhase(0, 900, 5);
          e.setSpellTimer(3, 7);
          yield 9999;
        })(),
      5: () =>
        (function* () {
          yield 9999;
        })(),
      7: (e) =>
        (function* () {
          e.setPos(277, 60);
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 1000)!;
    mgr.tick();
    mgr.tick();
    expect(boss.gaugeTimerFrames).toBe(2);
    expect(boss.posX).toBe(100);
    mgr.tick();

    expect(boss.posX).toBe(277);
    expect(boss.hp).toBe(900);
    expect(boss.phaseThresholds[0]).toBe(-1);
    expect(boss.spellTimerFrames).toBe(-1);
    expect(boss.gaugeTimerFrames).toBe(0);
  });

  it('op 153 points the expiry at the death sub and op 132 seeks the clock', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(100);
          e.setDeathCallbackSub(9);
          e.setSpellTimer(100, 3);
          e.resetSpellTimerSub();
          yield 9999;
        })(),
      3: (e) =>
        (function* () {
          e.setPos(133, 60);
          yield 9999;
        })(),
      9: (e) =>
        (function* () {
          e.setPos(190, 60);
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 100)!;
    expect(boss.spellTimerSub).toBe(9);
    boss.setSpellTimerElapsed(99);
    mgr.tick();
    expect(boss.posX).toBe(190);
  });

  it('op 155 keeps the bullets and pays a flat reward instead', () => {
    const { gs, mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(100);
          e.setMisc155(1);
          e.setSpellTimer(600, 1);
          e.startSpell('永遠符', 'ボス', 0, 0, 100);
          yield 9999;
        })(),
      1: (e) =>
        (function* () {
          e.setPos(111, 60);
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 100)!;
    expect(boss.noTimeoutPenalty).toBe(true);
    boss.setSpellTimerElapsed(600);
    mgr.tick();

    expect(boss.posX).toBe(111);
    // A penalty-free clock never publishes a card result at all.
    expect(mgr.frameSpellResults).toHaveLength(0);
    expect(gs.spellName).toBe('永遠符');
  });
});

describe('ECL death callback (op 130)', () => {
  it('hands the script over instead of dying, and only once per life', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(100);
          e.setDeathCallbackSub(9);
          yield 9999;
        })(),
      9: (e) =>
        (function* () {
          e.setPos(190, 60);
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 100)!;
    boss.applyDamage(500);

    expect(boss.active).toBe(true);
    expect(boss.deathPending).toBe(false);
    expect(boss.posX).toBe(190);
    expect(boss.deathCallbackSub).toBe(-1);

    // The latch holds until something puts HP back above zero.
    boss.applyDamage(500);
    expect(boss.active).toBe(true);
    mgr.tick();
    boss.applyDamage(500);
    expect(boss.active).toBe(true);

    boss.setLives(50);
    mgr.tick();
    boss.applyDamage(500);
    expect(boss.active).toBe(false);
    expect(boss.deathPending).toBe(true);
  });
});

describe('card capture payout (Spellcard::EndSpell)', () => {
  it('gives score and a full time-orb reward for a fast capture', () => {
    const runner = runnerFor((e) =>
      (function* () {
        e.setBossPresent(1);
        e.setLives(1000);
        e.setSpellTimer(1200, 2);
        e.startSpell('速符「テスト」', 'ボス', 0, 0, 500000);
        e.setPhase(0, 500, 1);
        yield 9999;
      })(),
    );

    // A live card divides the frame's damage by seven, so 1000 HP of bar is a
    // hundred frames of full-rate fire rather than twelve. That divisor is the
    // difference between 符卡 and 非符 and it has to show up here.
    const cards = shoot(runner, 100).filter((card) => card.captured);
    expect(cards).toHaveLength(1);
    expect(runner.gs.timeOrbs).toBe(1000);
    expect(runner.player.score).toBeGreaterThan(0);
    expect(runner.enemies.activeCount).toBe(1);
  });

  it('pays nothing when the clock runs out', () => {
    const runner = runnerFor((e) =>
      (function* () {
        e.setBossPresent(1);
        e.setLives(1000);
        e.setSpellTimer(120, 1);
        e.startSpell('時間符「テスト」', 'ボス', 0, 0, 500000);
        yield 9999;
      })(),
    );

    const cards: SpellResult[] = [];
    for (let i = 0; i < 140; i++) {
      runner.tick(noInput);
      cards.push(...runner.lastSpellResults);
    }
    expect(cards).toHaveLength(1);
    expect(cards[0].captured).toBe(false);
    expect(runner.gs.timeOrbs).toBe(0);
    expect(runner.player.score).toBe(0);
    expect(runner.gs.spellName).toBeNull();
  });

  it('clears the field of plain enemies when a card changes', () => {
    const { mgr } = managerFor({
      0: (e) =>
        (function* () {
          e.setLives(1000);
          e.setPhase(0, 500, 1);
          yield 9999;
        })(),
      1: () =>
        (function* () {
          yield 9999;
        })(),
      2: () =>
        (function* () {
          yield 9999;
        })(),
    });

    const boss = mgr.spawn(0, 100, 60, 1000)!;
    const fry = mgr.spawn(2, 120, 80, 30)!;
    boss.applyDamage(600);
    mgr.tick();

    expect(fry.active).toBe(false);
    expect(boss.active).toBe(true);
  });
});
