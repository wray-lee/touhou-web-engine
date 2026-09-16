import { describe, expect, it } from 'vitest';
import { HITBOX_GLOW_TEMPLATE, StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import { parseEcl } from '../format/EclFile';
import { collectEclSubs, createEclSubFactory } from './EclBridge';
import * as eclSubs from '../stages/stage1/scripts';
import type { EnemySlot } from './EnemySlot';
import { EffectPool, type EffectView } from './EffectPool';
import { EFFECT_TEMPLATES, TH08_EFFECT_SCRIPT_BYTES } from '../../games/th08/data/th08-effect-anm';
import type { AnmRng } from '../../engine/anm/AnmVm';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'ecldata1.ecl'));
const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false };

describe('StageRunner', () => {
  it('runs a simple stage for 100 frames without crashing', () => {
    const gs = createGameState('normal', 42);
    const ecl = {
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
              time: 10,
              opcode: 0,
              size: 32,
              difficultyMask: 0xff,
              args: new Int32Array([
                0,
                new Int32Array(new Float32Array([100]).buffer)[0],
                new Int32Array(new Float32Array([50]).buffer)[0],
                100,
                0,
                0,
              ]),
            },
          ],
        },
      ],
    };

    const runner = new StageRunner({
      gs,
      ecl,
      subFactory: () => (_e: EnemySlot) =>
        (function* () {
          yield 200;
        })(),
    });

    for (let i = 0; i < 100; i++) runner.tick(noInput);
    expect(runner.enemies.activeCount).toBe(1);
    expect(runner.player.state).toBe('alive');
  });

  it('pays ten points a frame only while the 妖率計 is pinned at an end', () => {
    // `Player.cpp:1101-1116`: with no dialogue on screen and the meter at either
    // extreme, the game calls `AddScore(100)` every frame. Through the funnel that is
    // ten points a frame, 600 a second -- the price the game puts on living at the
    // ends of the meter. The meter is held still so the drip, not the relaxation, is
    // what the assertion reads.
    const gs = createGameState('normal', 42);
    const runner = new StageRunner({
      gs,
      ecl: {
        version: 2048,
        subCount: 1,
        subs: [{ id: 0, offset: 0, instructions: [] }],
        timelines: [{ index: 0, offset: 0, instructions: [] }],
      },
      subFactory: () => (_e: EnemySlot) =>
        (function* () {
          yield 9999;
        })(),
    });
    runner.player.holdGauge = true;
    for (let i = 0; i < 40; i++) runner.tick(noInput);
    expect(runner.player.state).toBe('alive');

    const drip = (value: number, frames: number): number => {
      runner.player.gauge.set(value);
      const before = runner.player.score;
      for (let i = 0; i < frames; i++) runner.tick(noInput);
      return runner.player.score - before;
    };

    expect(drip(0, 10)).toBe(0);
    const bounds = runner.player.gauge.bounds;
    expect(drip(bounds.youkaiLimit, 10)).toBe(100);
    expect(drip(bounds.humanLimit, 10)).toBe(100);
    // Midway up the meter nothing is owed, which is what makes the two above a rule
    // about the extremes rather than about ticking.
    expect(drip(bounds.moderateYoukai, 10)).toBe(0);
  });
});

describe.skipIf(!hasAssets)('StageRunner integration (ecldata1)', () => {
  it('runs 600 frames of stage 1 with trivial subs', () => {
    const gs = createGameState('normal', 0x1234);
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));

    let spawnCount = 0;
    const runner = new StageRunner({
      gs,
      ecl,
      subFactory: () => {
        spawnCount++;
        return (_e: EnemySlot) =>
          (function* () {
            yield 500;
          })();
      },
    });

    for (let i = 0; i < 600; i++) runner.tick(noInput);

    expect(spawnCount).toBeGreaterThan(5);
    expect(runner.enemies.activeCount).toBeGreaterThan(0);
    // Stubbed subs never reach a shot opcode, so this run only proves the
    // timeline, the spawn pipeline and the player state machine stay coherent.
    expect(['alive', 'dying', 'respawning']).toContain(runner.player.state);
    expect(gs.frame).toBe(600);
  });

  it('fires the real stage 1 danmaku, including the boss cards', () => {
    const gs = createGameState('normal', 0x2468);
    gs.currentStage = 1;
    const runner = new StageRunner({
      gs,
      ecl: parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl'))),
      subFactory: createEclSubFactory(collectEclSubs(eclSubs as unknown as Record<string, unknown>)),
    });

    // Ops 96..104 carry every bullet in the stage, so a translated script that
    // never reaches the pool means the shot handler broke again.
    let bullets = 0;
    for (let i = 0; i < 3000; i++) {
      runner.tick(noInput);
      bullets = Math.max(bullets, runner.bullets.activeCount);
    }
    expect(bullets).toBeGreaterThan(20);
    expect(runner.enemies.activeCount).toBeGreaterThan(0);
  });
  it('player gets hit and goes through death/respawn cycle', () => {
    const gs = createGameState('normal', 0x5678);
    const ecl = parseEcl(fs.readFileSync(path.join(RAW_DIR, 'ecldata1.ecl')));

    const runner = new StageRunner({
      gs,
      ecl,
      subFactory: () => (_e: EnemySlot) =>
        (function* () {
          yield 9999;
        })(),
    });

    // Run some frames to get enemies on screen
    for (let i = 0; i < 100; i++) runner.tick(noInput);

    // Simulate a hit by directly calling hit()
    expect(runner.player.hit()).toBe(true);
    expect(runner.player.state).toBe('dying');

    // Run through the grace window, the dissolve and the spawn-in.
    const window = runner.player.graceTimer;
    for (let i = 0; i < window + 90; i++) runner.tick(noInput);
    expect(runner.player.state).toBe('alive');
    // There is no invulnerability at the end of a respawn in the reference; the
    // 60-frame bullet-cancel volume is the whole of the mercy.
    expect(runner.player.isInvulnerable).toBe(false);
    expect(runner.player.cancelTimer).toBe(0);
    expect(gs.lives).toBe(2);
    // `Player.cpp:1408` refills the bomb count from `plyNNa.sht + 4` on the way in.
    expect(runner.player.bombs).toBe(3);
  });
});

/** Encode a float the way the ECL data section stores it. */
function floatBits(v: number): number {
  return new Int32Array(new Float32Array([v]).buffer)[0];
}

/** Minimal stage script: one spawn at frame 5 that places sub 0 at (100, 60). */
function oneSpawnEcl() {
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
            args: new Int32Array([0, floatBits(100), floatBits(60), 0, 0, 0]),
          },
        ],
      },
    ],
  } as never;
}

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

/** Script for sub 0; helper subs idle so `spawnEnemy` cannot cascade. */
function scriptedRunner(sub: SubFn): StageRunner {
  const idle: SubFn = () =>
    (function* () {
      yield 9999;
    })();
  const gs = createGameState('normal', 7);
  const runner = new StageRunner({
    gs,
    ecl: oneSpawnEcl(),
    subFactory: (id: number) => (id === 0 ? sub : idle),
  });
  return runner;
}

/** Let the timeline (which spawns on frame 5) catch up. */
function warmUp(runner: StageRunner, frames = 8): void {
  for (let i = 0; i < frames; i++) runner.tick(noInput);
}

/** Focus a single 70-damage shot on the scripted boss for `frames` frames. */
function shootRunner(runner: StageRunner, frames: number): EnemySlot[] {
  warmUp(runner);
  const killed: EnemySlot[] = [];
  for (let i = 0; i < frames; i++) {
    runner.tick(noInput);
    runner.damageEnemiesAt([{ x: 100, y: 60, damage: 500, active: true }]);
    killed.push(...runner.lastDeaths);
  }
  return killed;
}

describe('StageRunner boss gauge (ECL ops 127 / 131 / 148 / 158 / 137)', () => {
  it('adopts the HP, pips, coloured slice and timer the script declares', () => {
    const runner = scriptedRunner((e) =>
      (function* () {
        e.setBossPresent(0);
        e.setLives(13000);
        e.eclSetLives(1);
        e.setLifeBarSlice(0, 0, 13000, 0xff74a0);
        e.setTimeout(600);
        yield 9999;
      })(),
    );

    for (let i = 0; i < 30; i++) runner.tick(noInput);

    const gauge = runner.bossGauge;
    expect(gauge).not.toBeNull();
    expect(gauge!.maxHp).toBe(13000);
    expect(gauge!.hp).toBe(13000);
    expect(gauge!.pips).toBe(1);
    expect(gauge!.slices[0]).toEqual({ start: 0, stop: 13000, color: 0xff74a0 });
    // op 137 armed the countdown and the sim is ticking it down.
    expect(gauge!.timerFrames).toBeGreaterThan(0);
    expect(gauge!.timerFrames).toBeLessThan(600);
  });

  it('breaks one life bar at a time and only dies on the last one', () => {
    const runner = scriptedRunner((e) =>
      (function* () {
        e.setBossPresent(0);
        e.setLives(700);
        e.eclSetLives(1);
        yield 9999;
      })(),
    );

    shootRunner(runner, 5);
    expect(runner.bossGauge!.hp).toBeLessThan(700);
    expect(runner.bossGauge!.hp).toBeGreaterThan(0);

    // 700 HP at 70 per frame: the first bar breaks, the pip pays for it.
    shootRunner(runner, 6);
    expect(runner.enemies.activeCount).toBe(1);
    expect(runner.bossGauge!.pips).toBe(0);

    // Nothing left in reserve, so the next empty bar is a death.
    shootRunner(runner, 12);
    expect(runner.enemies.activeCount).toBe(0);
    expect(runner.gs.isBossPresent).toBe(false);
    expect(runner.bossGauge).toBeNull();
  });

  it('queues a death burst and drops for the slot it just killed', () => {
    const runner = scriptedRunner((e) =>
      (function* () {
        e.setLives(70);
        yield 9999;
      })(),
    );

    // One 70-point frame empties the bar, and the burst lands in the same frame.
    warmUp(runner);
    runner.tick(noInput);
    runner.damageEnemiesAt([{ x: 100, y: 60, damage: 500, active: true }]);
    expect(runner.lastDeaths).toHaveLength(1);
    expect(runner.frameFx.some((fx) => fx.kind === 'burst')).toBe(true);
    expect(runner.items.activeCount).toBeGreaterThan(0);
  });

  it('lets the script hand a sub to another slot and spawn helpers', () => {
    const runner = scriptedRunner((e) =>
      (function* () {
        e.spawnEnemy(3, 12, 0, 0, 500, -2, 10);
        e.playSfx(5);
        yield 9999;
      })(),
    );

    const heard: number[] = [];
    for (let i = 0; i < 20; i++) {
      runner.tick(noInput);
      for (const sfx of runner.frameSfx) heard.push(sfx.id);
    }

    const slots = runner.enemies.getActive();
    expect(slots.length).toBe(2);
    const helper = slots.find((s) => s.hp === 500);
    expect(helper).toBeTruthy();
    expect(helper!.posX).toBeCloseTo(112, 3);
    expect(heard).toContain(5);
  });

  it('holds the boss flag on marker slot 0 and drops it when op 127 goes negative', () => {
    // `EclRunHigh.inl:635-665`: only slot 0 gates stage traffic, and a negative
    // argument releases whatever marker the slot holds. That release is what lets
    // a fleeing boss end its stage without being killed.
    const entered = scriptedRunner((e) =>
      (function* () {
        e.setBossPresent(0);
        yield 9999;
      })(),
    );
    for (let i = 0; i < 10; i++) entered.tick(noInput);
    expect(entered.gs.isBossPresent).toBe(true);

    const secondSeat = scriptedRunner((e) =>
      (function* () {
        e.setBossPresent(1);
        yield 9999;
      })(),
    );
    for (let i = 0; i < 10; i++) secondSeat.tick(noInput);
    expect(secondSeat.gs.isBossPresent).toBe(false);

    const leaving = scriptedRunner((e) =>
      (function* () {
        e.setBossPresent(0);
        yield 3;
        e.setBossPresent(-1);
        yield 9999;
      })(),
    );
    for (let i = 0; i < 10; i++) leaving.tick(noInput);
    expect(leaving.gs.isBossPresent).toBe(false);
  });
});

/**
 * The 判定点光环 the ship lights for itself on the focus edge.
 *
 * `Player.cpp:704-707` spawns effect id 22 when Shift goes down and only when its own
 * `Player+0xBE834` pointer is NULL; `:768-770` sends interrupt 1 on the release edge and
 * clears the pointer. Script 54 of `etama.anm` turns that into a 20-frame fade in, a
 * `STOP` that parks the ring while it spins, and a 30-frame fade out that only the
 * interrupt can start, so the whole life of the glow is governed by the two edges.
 *
 * The one thing these locks also pin down is the calc-chain order: the effect pool ticks
 * at `StageRunner.ts:965` and the ship's firing chain at `:1025`, which is how retail has
 * it too (the effect chain runs before the player chain). A glow lit on frame N therefore
 * first draws, and first moves, on frame N+1.
 */
describe('the focus hitbox glow (Player.cpp:704-707 / :768-770)', () => {
  const FOCUS = { ...noInput, slow: true };
  const DRIFT = { ...FOCUS, dx: 1 };
  /** The mid-range draws the EffectPool locks use, so the spin of the ring is stable. */
  const midRng = (): AnmRng => ({
    randomU32InRange: (bound) => Math.trunc(bound / 2),
    randomF32InRange: (bound) => bound / 2,
  });

  function glowRunner(): { runner: StageRunner; pool: EffectPool } {
    const pool = new EffectPool({
      rng: midRng(),
      templates: EFFECT_TEMPLATES,
      scriptBytes: TH08_EFFECT_SCRIPT_BYTES,
    });
    const runner = new StageRunner({
      gs: createGameState('normal', 7),
      ecl: {
        version: 2048,
        subCount: 1,
        subs: [{ id: 0, offset: 0, instructions: [] }],
        timelines: [{ index: 0, offset: 0, instructions: [] }],
      },
      subFactory: () => (_e: EnemySlot) =>
        (function* () {
          yield 9999;
        })(),
      effectPool: pool,
    });
    return { runner, pool };
  }

  const glows = (pool: EffectPool): EffectView[] =>
    pool.views.filter((view) => view.id === HITBOX_GLOW_TEMPLATE);

  it('lights exactly one glow on the press edge and holds it while Shift stays down', () => {
    const { runner, pool } = glowRunner();
    for (let i = 0; i < 30; i++) runner.tick(noInput);
    expect(glows(pool)).toHaveLength(0);

    runner.tick(FOCUS);
    // The ship ticks after the pool, so the press registers this frame and the ring first
    // draws next frame -- and it never draws twice.
    expect(pool.live).toBe(1);
    expect(glows(pool)).toHaveLength(0);
    runner.tick(FOCUS);
    expect(glows(pool)).toHaveLength(1);
    expect(glows(pool)[0].sprite).toBe(218);

    // The ramp lands on full alpha after the script's twenty frames, `STOP` holds it, and
    // holding the key down must never light a second ring.
    for (let i = 0; i < 40; i++) runner.tick(FOCUS);
    expect(glows(pool)).toHaveLength(1);
    expect(glows(pool)[0].alpha).toBe(1);
    const spin = glows(pool)[0].rotation;
    runner.tick(FOCUS);
    expect(glows(pool)[0].rotation).not.toBe(spin);
  });

  it('fades the ring out over the script thirty frames instead of cutting it', () => {
    const { runner, pool } = glowRunner();
    for (let i = 0; i < 40; i++) runner.tick(FOCUS);
    expect(glows(pool)[0].alpha).toBe(1);

    runner.tick(noInput);
    runner.tick(noInput);
    expect(glows(pool)).toHaveLength(1);
    const fading = glows(pool)[0].alpha;
    expect(fading).toBeLessThan(1);
    expect(fading).toBeGreaterThan(0.9);
    // Still on screen a dozen frames later: the release interrupts the script, it does not
    // delete the effect.
    for (let i = 0; i < 10; i++) runner.tick(noInput);
    expect(glows(pool)).toHaveLength(1);
    expect(glows(pool)[0].alpha).toBeLessThan(fading);
    for (let i = 0; i < 25; i++) runner.tick(noInput);
    expect(glows(pool)).toHaveLength(0);
    expect(pool.live).toBe(0);
  });

  it('reuses the one slot, so a fresh press replaces a ring that is still fading', () => {
    const { runner, pool } = glowRunner();
    for (let i = 0; i < 40; i++) runner.tick(FOCUS);
    for (let i = 0; i < 10; i++) runner.tick(noInput);
    expect(glows(pool)).toHaveLength(1);
    expect(glows(pool)[0].alpha).toBeLessThan(1);

    // Press again mid-fade. Retail owns one reserved slot and one pointer, so the ship
    // must never end up with a fading ring stacked under a bright one.
    runner.tick(FOCUS);
    expect(pool.live).toBe(1);
    for (let i = 0; i < 40; i++) runner.tick(FOCUS);
    expect(glows(pool)).toHaveLength(1);
    expect(glows(pool)[0].alpha).toBe(1);
  });

  it('rides the ship, one calc chain behind it', () => {
    const { runner, pool } = glowRunner();
    runner.tick(FOCUS);
    runner.tick(DRIFT);
    for (let i = 0; i < 20; i++) {
      const lastFrame = { x: runner.player.x, y: runner.player.y };
      runner.tick(DRIFT);
      const glow = glows(pool)[0];
      expect(glow).toBeTruthy();
      expect([glow.x, glow.y]).toEqual([lastFrame.x, lastFrame.y]);
    }
    // And it is still put there by the mover, not by a spawn that simply followed: let go
    // of Shift and the ring keeps its place while the ship walks away from it.
    const parked = { ...noInput, dx: 1 };
    for (let i = 0; i < 40; i++) runner.tick(parked);
    expect(glows(pool)).toHaveLength(0);
    expect(runner.player.x).toBeGreaterThan(192);
  });
});
