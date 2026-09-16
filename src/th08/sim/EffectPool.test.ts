/**
 * The retail effect pool: template ids, movers, and the two clocks that retire an effect.
 *
 * The table and the scripts are the shipped ones, so every number asserted below is a
 * number the retail decompile states too (`EffectManager.cpp`), not one this port invented.
 */
import { describe, expect, it } from 'vitest';
import {
  EFFECT_MAIN_SLOTS,
  EFFECT_SECONDARY_SLOTS,
  EffectPool,
  type EffectCamera,
  type EffectPoolDeps,
} from './EffectPool';
import {
  EFFECT_TEMPLATES,
  TH08_EFFECT_SCRIPT_BYTES,
  effectScriptBytes,
} from '../../games/th08/data/th08-effect-anm';
import { EnemyManager } from './EnemyManager';
import { EnemySlot } from './EnemySlot';
import { createGameState } from './GameState';
import type { AnmRng } from '../../engine/anm/AnmVm';

/** The retail orbit fade bound (`EffectManager.cpp:487-495`). */
const ORBIT_FADE_BOUND = 20;

/** Mid-range draws: an angle lands on 0 and a magnitude on half its span. */
function halfRng(): AnmRng {
  return {
    randomU32InRange: (bound) => Math.trunc(bound / 2),
    randomF32InRange: (bound) => bound / 2,
  };
}

function deps(rng: AnmRng = halfRng()): EffectPoolDeps {
  return { rng, templates: EFFECT_TEMPLATES, scriptBytes: TH08_EFFECT_SCRIPT_BYTES };
}

function viewAt(pool: EffectPool, id: number) {
  return pool.views.find((v) => v.id === id) ?? null;
}

function idleSlot(pool: EffectPool | null): EnemySlot {
  const gs = createGameState();
  // A sub that holds its position for the whole test: the slot stays alive so its effect
  // requests can be inspected frame by frame.
  const mgr = new EnemyManager(
    gs,
    () =>
      function* idle() {
        yield 100000;
      },
  );
  mgr.effectPool = pool;
  return mgr.spawn(0, 120, 80)!;
}

describe('retail effect template table', () => {
  it('is the 66-row table the decompile states', () => {
    expect(EFFECT_TEMPLATES).toHaveLength(66);
    // The two ids the shipped ECL reaches most, checked against the recompiled table
    // (`linux_runtime.cpp:148`) rather than against this port.
    expect(EFFECT_TEMPLATES[13]).toEqual({
      scriptIdx: 45,
      update: 'EffectOrbitUpdate',
      init: 'EffectOrbitInit',
    });
    expect(EFFECT_TEMPLATES[26]).toEqual({
      scriptIdx: 53,
      update: 'FUN_004271a0',
      init: 'FUN_004270c0',
    });
    // Row 16 is `{0, 0, 0}`: script 0 really is the script, not a missing value.
    expect(EFFECT_TEMPLATES[16].scriptIdx).toBe(0);
  });

  it('names a script that the lifted pack contains', () => {
    for (const [id, template] of EFFECT_TEMPLATES.entries()) {
      expect(effectScriptBytes(id), `template ${id} script ${template.scriptIdx}`).toBeTruthy();
    }
    expect(TH08_EFFECT_SCRIPT_BYTES).toHaveLength(116);
  });
});

describe('effect movers', () => {
  it('throws id 26 out along its heading on the retail ease-out curve', () => {
    const pool = new EffectPool(deps());
    pool.spawn(26, 100, 200, { velocity: { x: 0, y: 0, z: 0 } });
    pool.update();
    const first = viewAt(pool, 26);
    expect(first).toBeTruthy();
    const offsets: number[] = [];
    for (let frame = 0; frame < 90; frame++) {
      pool.update();
      const view = viewAt(pool, 26);
      if (view) offsets.push(view.x - 100);
    }
    if (offsets.length > 1) {
      for (let i = 1; i < offsets.length; i++) {
        expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1]);
      }
    }
    // `FUN_004271a0` caps the travel at 128px times the spawn magnitude, which the fixed
    // rng puts at 0.75; the flare never runs past it.
    for (const offset of offsets) expect(offset).toBeLessThanOrEqual(96.01);
  });

  it('pulls id 17 in from 256px away', () => {
    const pool = new EffectPool(deps());
    pool.spawn(17, 100, 100);
    pool.update();
    const first = viewAt(pool, 17);
    expect(first).toBeTruthy();
    let last = first!;
    for (let frame = 0; frame < 55; frame++) {
      pool.update();
      const view = viewAt(pool, 17);
      if (!view) break;
      last = view;
    }
    expect(Math.abs(last.x - 100)).toBeLessThan(Math.abs(first!.x - 100));
  });

  it('grows an orbit to its target radius and follows its owner', () => {
    const pool = new EffectPool(deps());
    const owner = { x: 192, y: 120 };
    const handle = pool.spawn(13, owner.x, owner.y, {
      color: 0xff6060d0,
      axis: { x: 0, y: 0, z: 1 },
      radius: 30,
      ownerPos: () => owner,
    });
    expect(handle).toBeTruthy();
    pool.update();
    // The orbit grows 0.3px a frame from zero (EnemyManager.cpp:1039), so the first owner's own position.
    const opening = viewAt(pool, 13)!;
    expect(Math.hypot(opening.x - owner.x, opening.y - owner.y)).toBeCloseTo(0.3, 4);
    for (let frame = 0; frame < 100; frame++) pool.update();
    const view = viewAt(pool, 13)!;
    const distance = Math.hypot(view.x - owner.x, view.y - owner.y);
    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThanOrEqual(30.01);

    owner.x = 120;
    pool.update();
    const moved = viewAt(pool, 13)!;
    expect(moved.x).toBeLessThan(view.x);

    handle!.fade();
    for (let frame = 0; frame < ORBIT_FADE_BOUND && viewAt(pool, 13); frame++) pool.update();
    expect(viewAt(pool, 13)).toBeNull();
  });

  it('retires effects when their script runs out', () => {
    const pool = new EffectPool(deps());
    for (let i = 0; i < 40; i++) {
      pool.spawn(26, 100 + i, 200, { velocity: { x: 0, y: 0, z: 0 } });
    }
    expect(pool.live).toBeGreaterThan(0);
    for (let frame = 0; frame < 4000 && pool.live > 0; frame++) pool.update();
    expect(pool.live).toBe(0);
    expect(pool.views).toHaveLength(0);
  });

  it('fills both pools without ever exceeding them', () => {
    const pool = new EffectPool(deps());
    const attempts = EFFECT_MAIN_SLOTS + EFFECT_SECONDARY_SLOTS + 400;
    for (let i = 0; i < attempts; i++) {
      pool.spawn(i % 2 === 0 ? 33 : 16, 10, 10, { secondary: i % 2 !== 0 });
    }
    expect(pool.live).toBeLessThanOrEqual(EFFECT_MAIN_SLOTS + EFFECT_SECONDARY_SLOTS);
    expect(pool.spawned + pool.dropped).toBe(attempts);
    for (let frame = 0; frame < 400; frame++) pool.update();
    pool.clear();
    expect(pool.live).toBe(0);
  });

  it('cannot have an old handle fade a slot it no longer owns', () => {
    const pool = new EffectPool(deps());
    const first = pool.spawn(13, 10, 10, { radius: 40 });
    expect(first).toBeTruthy();
    pool.update();
    first!.stop();
    expect(pool.live).toBe(0);
    const second = pool.spawn(13, 10, 10, { radius: 40 })!;
    first!.fade();
    pool.update();
    expect(pool.live).toBe(1);
    second.stop();
    expect(pool.live).toBe(0);
  });
});

describe('ECL routes its effect ids to the pool', () => {
  it('op 139 and op 140 spawn by template id', () => {
    const pool = new EffectPool(deps());
    const slot = idleSlot(pool);
    slot.spawnEffectAt(40, 1, -1);
    slot.spawnEffectAngle(26, 1, -1, 0, 0, 0);
    expect(pool.spawned).toBe(2);
    expect(slot.fxRequests).toHaveLength(0);
    pool.update();
    expect(pool.views.some((v) => v.id === 40)).toBe(true);
    expect(pool.views.some((v) => v.id === 26)).toBe(true);
  });

  it('op 174 replaces its own effect in the second pool', () => {
    const pool = new EffectPool(deps());
    const slot = idleSlot(pool);
    slot.effectWithYoukai(1);
    pool.update();
    expect(pool.live).toBe(1);
    slot.effectWithYoukai(1);
    expect(pool.live).toBe(1);
  });

  it('falls back to the fx notes when no pool was injected', () => {
    const slot = idleSlot(null);
    slot.spawnEffect(6, 0, 0, 0, 1124073472);
    expect(slot.fxRequests).toHaveLength(1);
    expect(slot.fxRequests[0].kind).toBe('aura');
  });
});

describe('the retail death pass', () => {
  it('pays effect 0 once and effect 4 four times for every corpse', () => {
    const pool = new EffectPool(deps());
    const slot = idleSlot(pool);
    slot.applyDamage(99999);
    // No shipped script uses op 138, so both DeathAnm bytes are still the 0 the
    // spawner wrote (`EnemyManager.cpp:185-186`), which is what makes this the
    // default look of every enemy death in the game.
    expect(pool.spawned).toBe(5);
    pool.update();
    expect(pool.views.filter((v) => v.id === 0)).toHaveLength(1);
    expect(pool.views.filter((v) => v.id === 4)).toHaveLength(4);
  });

  it('lets op 138 retarget both ids', () => {
    const pool = new EffectPool(deps());
    const slot = idleSlot(pool);
    slot.setDeathEffects(17, 20, 0);
    slot.applyDamage(99999);
    pool.update();
    expect(pool.views.filter((v) => v.id === 17)).toHaveLength(1);
    expect(pool.views.filter((v) => v.id === 24)).toHaveLength(4);
  });

  it('mutes the explosion when the first byte reads negative', () => {
    const pool = new EffectPool(deps());
    const slot = idleSlot(pool);
    slot.setDeathEffects(200, 0, 0);
    slot.applyDamage(99999);
    expect(pool.spawned).toBe(0);
  });

  it('op 140 hands the mover a decoded angle, not its raw bits', () => {
    const pool = new EffectPool(deps());
    const slot = idleSlot(pool);
    slot.spawnEffectAngle(26, 1, -1, Math.PI / 2, 0, 0);
    for (let frame = 0; frame < 89; frame++) pool.update();
    const view = viewAt(pool, 26);
    expect(view).toBeTruthy();
    // A quarter turn is straight down the field, and the half-range draw caps the
    // travel at 0.75 * 128 (`FUN_004271a0`).
    expect(view!.y).toBeGreaterThan(160);
    expect(Math.abs(view!.x - 120)).toBeLessThan(1);
  });

  it('op 140 still honours the -999 random-heading sentinel', () => {
    const quarter = {
      randomU32InRange: (bound: number) => Math.trunc(bound / 2),
      randomF32InRange: (bound: number) => bound * 0.25,
    };
    const pool = new EffectPool(deps(quarter));
    const slot = idleSlot(pool);
    slot.spawnEffectAngle(26, 1, -1, -999, 0, 0);
    for (let frame = 0; frame < 89; frame++) pool.update();
    const view = viewAt(pool, 26);
    expect(view).toBeTruthy();
    // 0.25 turns minus pi is straight up, on a 0.375 magnitude throw.
    expect(view!.y).toBeLessThan(40);
    expect(Math.abs(view!.x - 120)).toBeLessThan(1);
  });
});

/**
 * A `g_Background.unk6394` stand-in.
 *
 * `dir` is `normalize(vector1)` exactly as `Background.cpp:496-497` computes it, so
 * the two cameras below differ only in where the backdrop is looking.
 */
function stdCamera(at: { x: number; y: number; z: number }): EffectCamera {
  const len = Math.hypot(at.x, at.y, at.z) || 1;
  return {
    eye: { x: 0, y: 0, z: 1000 },
    at,
    dir: { x: at.x / len, y: at.y / len, z: at.z / len },
    project: (x, y) => ({ x: 192 + x / 8, y: 224 + y / 8, scale: 1 }),
  };
}

describe('the .std ember families', () => {
  // Stage 1 is 蛍火の行方, and the fireflies are ECL: `sub_14` sits off the top of the
  // field and throws 16 of template 51 every four frames for the whole stage. Retail
  // survives that because the ember callback retires a particle once it leaves a 20
  // degree cone around the camera (`EffectManager.cpp:534-551`). This port used to
  // default the spawn velocity to -9999 instead of retail's zeroed `vector1`, which the
  // ember seed then read as a speed: every firefly ran off to x = -1.7e6 and never
  // retired, so the 512-slot pool was full before the first fairy died and the death,
  // bomb and item effects that share it were silently dropped.
  it('reads a velocity-less spawn as zero velocity, not as a sentinel', () => {
    const pool = new EffectPool(deps());
    // No camera: the mover falls back to drifting on the field from the spawn point.
    pool.spawn(51, 30, -16, { count: 16, color: 0 });
    let furthest = 0;
    for (let frame = 0; frame < 4000; frame++) {
      pool.update();
      for (const view of pool.views) furthest = Math.max(furthest, Math.abs(view.x - 30));
    }
    // An ember thrown with no velocity wanders a few thousandths a frame. Reading the
    // retired-slot sentinel as a speed put it at x = -1.7e6 inside a second.
    expect(furthest).toBeLessThan(1);
  });

  it('retires an ember the moment it leaves the camera cone', () => {
    // The seed lands half the look offset plus 50 off each axis, so a camera that is
    // only 100 units down its own axis puts the ember well outside the 20 degree cone.
    const pool = new EffectPool({ ...deps(), camera: () => stdCamera({ x: 0, y: 0, z: -100 }) });
    pool.spawn(51, 30, -16, { count: 16, color: 0 });
    pool.update();
    expect(pool.live).toBe(0);
    expect(pool.views).toHaveLength(0);
  });

  it('keeps an ember inside the cone and puts it on the field through the projection', () => {
    const pool = new EffectPool({ ...deps(), camera: () => stdCamera({ x: 0, y: 0, z: -2000 }) });
    pool.spawn(51, 30, -16, { count: 16, color: 0 });
    pool.update();
    expect(pool.live).toBe(16);
    // The seed parks an ember at `vector1 + vector0` of the camera and 50 units up the
    // view axis, so it is nowhere near the (30, -16) it was spawned at; the projection
    // is what puts that world point on the field.
    for (const view of pool.views) {
      expect(view.x).toBe(192);
      expect(view.y).toBeCloseTo(224 - 50 / 8, 3);
    }
  });

  it('leaves the pool able to answer a real spawn after a whole stage of ambience', () => {
    const pool = new EffectPool({ ...deps(), camera: () => stdCamera({ x: 0, y: 0, z: -100 }) });
    for (let frame = 0; frame < 2000; frame++) {
      if (frame % 4 === 0) pool.spawn(51, 30, -16, { count: 16, color: 0 });
      pool.update();
    }
    expect(pool.spawned).toBe(8000);
    expect(pool.dropped).toBe(0);
    expect(pool.live).toBeLessThan(EFFECT_MAIN_SLOTS / 4);
    // The thing the saturation used to cost: a death flare still gets a slot.
    expect(pool.spawn(26, 100, 100, { count: 1, velocity: { x: 0, y: 0, z: 0 } })).not.toBeNull();
  });
});

/**
 * Template 22, the 判定点光环 the ship lights on the focus edge.
 *
 * These are the first assertions in this file that come off `th08.exe` itself rather
 * than off the decompile: the template table at `0x004c6d30` says row 22 runs script
 * 54 with mover `FUN_00426c40` and no init callback, and script 54 is
 * `SPRITE 218; Z_WRITE_DISABLE; ALPHA 0; F_SET_RAND; ALPHA_TIME(20, 1, 255); STOP;
 * INTERRUPT_LABEL 1; ALPHA_TIME(30, 1, 0); DELETE`. That is what the four locks below
 * hold: the cell, the 20-frame fade in, the park-and-spin at `STOP`, and the
 * 30-frame fade out that only interrupt 1 can start.
 */
describe('the focus hitbox glow (template 22 / script 54)', () => {
  const GLOW = 22;
  /** `etama_t1` cell 218, the 64x64 red-white marker the script names. */
  const GLOW_SPRITE = 218;

  function spawnGlow(owner = { x: 192, y: 384 }, slotIndex?: number) {
    const pool = new EffectPool(deps());
    const handle = pool.spawn(GLOW, owner.x, owner.y, {
      count: 1,
      color: -1,
      slotIndex,
      ownerPos: () => owner,
    });
    return { pool, handle, owner };
  }

  it('draws cell 218 and fades in over the script twenty frames', () => {
    const { pool } = spawnGlow();
    pool.update();
    const first = viewAt(pool, GLOW)!;
    expect(first.sprite).toBe(GLOW_SPRITE);
    // `ALPHA 0` comes before the ramp, so the first frame is still nearly dark; the
    // view alpha is the VM byte divided by 255, so a full ramp reads as 1.
    expect(first.alpha).toBeGreaterThan(0);
    expect(first.alpha).toBeLessThan(0.01);
    for (let frame = 0; frame < 18; frame++) pool.update();
    expect(viewAt(pool, GLOW)!.alpha).toBeLessThan(1);
    pool.update();
    expect(viewAt(pool, GLOW)!.alpha).toBe(1);
  });

  it('parks at STOP and keeps turning until the script is interrupted', () => {
    const { pool } = spawnGlow();
    for (let frame = 0; frame < 60; frame++) pool.update();
    const before = viewAt(pool, GLOW)!;
    expect(before.alpha).toBe(1);
    const spin = before.rotation;
    pool.update();
    // The angular velocity is the script's own random draw, so the lock is that it
    // turns at all and that nothing retires while `STOP` holds it.
    expect(viewAt(pool, GLOW)!.rotation).not.toBe(spin);
    for (let frame = 0; frame < 200; frame++) pool.update();
    expect(viewAt(pool, GLOW)!.alpha).toBe(1);
  });

  it('rides the ship it was lit for, and stays put without an owner', () => {
    const { pool, owner } = spawnGlow();
    pool.update();
    const atHome = viewAt(pool, GLOW)!;
    expect(atHome.x).toBe(owner.x);
    owner.y = 300;
    pool.update();
    expect(viewAt(pool, GLOW)!.y).toBe(300);

    const loose = new EffectPool(deps());
    loose.spawn(GLOW, 120, 200, { count: 1, color: -1 });
    loose.update();
    const parked = loose.views.find((v) => v.id === GLOW)!;
    expect([parked.x, parked.y]).toEqual([120, 200]);
    loose.update();
    expect([parked.x, parked.y]).toEqual([120, 200]);
  });

  it('fades out over thirty frames only after interrupt 1, then gives the slot back', () => {
    const { pool, handle } = spawnGlow();
    for (let frame = 0; frame < 25; frame++) pool.update();
    expect(viewAt(pool, GLOW)!.alpha).toBe(1);
    handle!.interrupt(1);
    pool.update();
    const fading = viewAt(pool, GLOW)!;
    expect(fading.alpha).toBeLessThan(1);
    expect(fading.alpha).toBeGreaterThan(0.99);
    for (let frame = 0; frame < 30 && viewAt(pool, GLOW); frame++) pool.update();
    expect(viewAt(pool, GLOW)).toBeNull();
    expect(pool.live).toBe(0);
    // An old handle must not be able to fade a slot it no longer owns.
    handle!.interrupt(1);
    expect(pool.live).toBe(0);
  });

  it('owns a named record, so a second press takes it back from a fading ring', () => {
    // `FUN_00425870` addresses `(slotIndex + 0x280) * 0x360` and `memset`s whatever is
    // there, which is the only reason the ship can never stack two glows.
    const { pool, handle } = spawnGlow(undefined, 2);
    for (let frame = 0; frame < 25; frame++) pool.update();
    handle!.interrupt(1);
    for (let frame = 0; frame < 10; frame++) pool.update();
    expect(pool.live).toBe(1);

    const again = pool.spawn(GLOW, 192, 384, {
      count: 1,
      color: -1,
      slotIndex: 2,
      ownerPos: () => ({ x: 192, y: 384 }),
    });
    expect(again).not.toBeNull();
    pool.update();
    expect(pool.live).toBe(1);
    const views = pool.views.filter((view) => view.id === GLOW);
    expect(views).toHaveLength(1);
    // The new ring is at the start of its own ramp, not the tail of the old one.
    expect(views[0].alpha).toBeLessThan(0.01);
    // The handle the first press held points at a generation that is gone: sending it an
    // interrupt must leave the new ring alone, and the new ring is still ramping up.
    const ramping = views[0].alpha;
    handle!.interrupt(1);
    pool.update();
    expect(viewAt(pool, GLOW)!.alpha).toBeGreaterThan(ramping);
  });
});
