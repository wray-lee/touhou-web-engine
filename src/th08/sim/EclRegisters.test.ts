/**
 * The registers that used to be missing from the decode tables.
 *
 * An unnamed register is not merely unread: `EclEmitTs` falls back to the raw
 * operand, so `if (0x2770 >= 5)` became `if (10096 >= 5)` -- always true -- and
 * stage 4b refused to attach a single mirror. `e.i0 = 5 - 0x2765` became
 * `5 - 10085`. Register 0x2765 is what stage 1's Hermite tangents are built
 * from, and read as a literal it handed the interpolator a tangent of a million
 * pixels, which reached `NaN` a few hundred frames later and poisoned the slot
 * (`AllRoutes.test.ts` spent a whole session refusing `posX` over it).
 *
 * So the value here is not the naming. It is that each register now has the
 * storage retail gives it, and that the tables cannot silently lose one again.
 */
import { describe, expect, it } from 'vitest';
import {
  EnemySlot,
  FLOAT_FIELD_BY_ID,
  INT_FIELD_BY_ID,
  WRITABLE_FLOAT_FIELD_BY_ID,
  drainSlotRefusals,
} from './EnemySlot';
import { StageRunner } from './StageRunner';
import { REG_POS_X, REG_POS_Y, INTERP_HERMITE } from './EclInterpolator';
import { createGameState, addTimeOrbs, type GameState } from './GameState';
import { ItemPool } from './ItemPool';
import type { EclTimelineInstruction } from '../format/EclFile';
import type { PlayerInput } from './PlayerSim';

/** A float operand travels as its IEEE-754 representation, like the real ECL. */
const bits = (v: number): number => new Int32Array(new Float32Array([v]).buffer)[0];

const ins = (time: number, opcode: number, args: number[]): EclTimelineInstruction =>
  ({
    offset: 0,
    time,
    opcode,
    size: 8 + args.length * 4,
    difficultyMask: 0xff,
    args: new Int32Array(args),
  }) as unknown as EclTimelineInstruction;

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

const hold: SubFn = () =>
  (function* () {
    yield 6000;
  })();

const idle: PlayerInput = {
  dx: 0,
  dy: 0,
  shoot: false,
  bomb: false,
  slow: false,
} as unknown as PlayerInput;

const rig = (): { s: EnemySlot; gs: GameState } => {
  const gs = createGameState();
  const s = new EnemySlot(gs);
  s.reset(100, 100, 500, gs);
  return { s, gs };
};

const slot = () => rig().s;

/** Timeline op 0, sub 0, at (120, 200) with 1000 HP, driven in the real frame order. */
function harness(subs: Record<number, SubFn> = {}) {
  const gs = createGameState('normal', 7);
  drainSlotRefusals();
  const runner = new StageRunner({
    gs,
    ecl: {
      version: 2048,
      subCount: 1,
      subs: [],
      timelines: [
        {
          index: 0,
          offset: 0,
          instructions: [ins(2, 0, [0, bits(120), bits(200), bits(6000), -2, 1000])],
        },
      ],
    } as never,
    subFactory: (id: number) => subs[id] ?? hold,
  });
  const one = () => runner.enemies.slots.find((s) => s.active) as EnemySlot;
  const to = (frames: number) => {
    while (gs.frame < frames) runner.tick(idle);
    return one();
  };
  return { runner, gs, one, to };
}

describe('observed velocity (registers 0x2765..0x2767)', () => {
  it('is the displacement the last frame integration produced, one frame late', () => {
    const { to } = harness({
      0: (e) =>
        (function* () {
          e.movePolar(6000, 0, 0, 4);
          for (;;) yield 1;
        })(),
    });
    const atFour = to(4);
    expect(atFour).toBeTruthy();
    const observed = atFour.velocityX;
    const x4 = atFour.posX;
    expect(observed).toBeCloseTo(4, 3);
    expect(atFour.velocityY).toBeCloseTo(0, 3);
    // `EnemyManager.cpp:1008-1009` books `0x2D64 = pos - lastPos` *before* adding
    // `0x2D4C`, so the register is always yesterday's step, never today's.
    const atFive = to(5);
    expect(atFive.posX - x4).toBeCloseTo(observed, 3);
    expect(atFive.velocityX).toBeCloseTo(observed, 3);
  });

  it('arrests at the clamp edge, and the register reports the arrest', () => {
    // op 75 arms `enemy+0x3340..0x334C`, and the manager clamps on both sides of
    // the step (`EnemyManagerUpdate.cpp:486-490`), so a producer that keeps
    // pushing parks rather than sawtoothing. Because `0x2D64` is a plain
    // difference of positions it inherits the same one-frame lag as every other
    // reading: it keeps reporting the last real step for one frame after the
    // slot has stopped, then falls to exactly zero. That lag is the register's
    // signature, so the test pins all three phases.
    const { to } = harness({
      0: (e) =>
        (function* () {
          // 152 = spawn 120 + twelve steps of 4, so the flight outlives the sample.
          // A tighter box arrests before frame 6 and the mid-flight reading is gone.
          e.setMotionClamp(-1000, -1000, 152, 1000);
          e.movePolar(6000, 0, 0, 4);
          for (;;) yield 1;
        })(),
    });
    const moving = to(6);
    expect(moving.posX).toBeCloseTo(136, 2);
    expect(moving.velocityX).toBeCloseTo(4, 3);
    // Parked, but yesterday was still a real step.
    const landed = to(11);
    expect(landed.posX).toBeCloseTo(152, 2);
    expect(landed.velocityX).toBeCloseTo(4, 3);
    const parked = to(14);
    expect(parked.posX).toBeCloseTo(152, 2);
    expect(parked.velocityX).toBe(0);
  });

  it('stays finite through the stage-1 Hermite tangent it feeds', () => {
    // `ecldata1` sub 32 verbatim: tangent = velocity x window, then op 36. Before
    // 0x2765 was decoded the first line became `f2 = 10085 * 100`.
    const { to } = harness({
      0: (e) =>
        (function* () {
          // Slow enough that the two producers cannot walk it out of the playfield
          // before the window closes, which would cull it for the wrong reason.
          e.movePolar(6000, 0, 0, 0.25);
          e.f2 = e.velocityX * 100;
          e.f3 = e.randSignF(400);
          e.interpSlot(REG_POS_X, 180, INTERP_HERMITE, 0, e.posX, 260, e.f2, e.f3);
          e.f2 = e.velocityY * 100;
          e.f3 = e.randSignF(400);
          e.interpSlot(REG_POS_Y, 180, INTERP_HERMITE, 0, e.posY, 260, e.f2, e.f3);
          for (;;) yield 1;
        })(),
    });
    const s = to(400);
    expect(s).toBeTruthy();
    expect(Number.isFinite(s.posX)).toBe(true);
    expect(Number.isFinite(s.posY)).toBe(true);
    expect(drainSlotRefusals()).toEqual([]);
  });
});

describe('the last component of the tween vector (register 0x2761)', () => {
  it('is its own field, and is a declared destination', () => {
    const s = slot();
    s.tweenDZ = 9;
    expect(s.tweenDZ).toBe(9);
    expect(WRITABLE_FLOAT_FIELD_BY_ID[0x2761]).toBe('tweenDZ');
  });
});

describe('context float pair (registers 0x276e..0x276f)', () => {
  it('is separate storage from cxf0..3, which it used to alias', () => {
    // `EclOperandsFloat.cpp:122-123` puts these at `context + 0x68`, six dwords
    // below `cxf0` at +0x80. The alias meant a script that parked a scratch point
    // in cf0/cf1 destroyed the caller's first two float parameters.
    const s = slot();
    s.cxf0 = 11;
    s.cf0 = 22;
    expect(s.cxf0).toBe(11);
    expect(s.cf0i).toBe(22);
  });

  it('is reachable as a destination, matching ResolveFloatLValue 0x276E/0x276F', () => {
    const { s } = rig();
    s.interpSlot(0x276e, 2, 0, 0, 0, 90, 0, 0);
    s.tick();
    s.tick();
    expect(s.cf0).toBe(90);
    expect(WRITABLE_FLOAT_FIELD_BY_ID[0x276e]).toBe('cf0');
    expect(WRITABLE_FLOAT_FIELD_BY_ID[0x276f]).toBe('cf1');
  });
});

describe('life-bar thresholds and the hit record', () => {
  it('exposes the op 133 thresholds to scripts as phase0..phase3', () => {
    const s = slot();
    s.setPhase(2, 4000, 12);
    expect(s.phase2).toBe(4000);
    expect(s.phase0).toBe(-1);
  });

  it('records the damage a landed hit settled at', () => {
    // `EnemyManagerUpdate.cpp:718-719` subtracts and stores the same number, so
    // a hit the invincibility timer froze really does record zero.
    const s = slot();
    s.applyDamage(37);
    expect(s.lastDamage).toBe(37);
    expect(s.hp).toBe(500 - 37);
    expect(INT_FIELD_BY_ID[0x2763]).toBe('lastDamage');
  });
});

describe('the attach chain (register 0x2770)', () => {
  /** Two slots that can see each other, which is all the walk needs. */
  function pair() {
    const gs = createGameState();
    const head = new EnemySlot(gs);
    head.reset(10, 10, 500, gs);
    const child = new EnemySlot(gs);
    child.reset(20, 20, 100, gs);
    const slots: Record<number, EnemySlot> = { 0: head, 1: child };
    head.slotIndex = 0;
    child.slotIndex = 1;
    const manager = { slotAt: (i: number) => slots[i] ?? null } as never;
    head.enemyManager = manager;
    child.enemyManager = manager;
    return { head, child };
  }

  it('counts from the head the slot is hanging off, whoever asks', () => {
    const { head, child } = pair();
    head.childCount = 3;
    child.parentSlotIndex = head.slotIndex;
    expect(head.parentChainCount).toBe(3);
    expect(child.parentChainCount).toBe(3);
  });

  it('walks past a mid-chain member to the head', () => {
    const gs = createGameState();
    const make = (index: number): EnemySlot => {
      const s = new EnemySlot(gs);
      s.reset(0, 0, 100, gs);
      s.slotIndex = index;
      return s;
    };
    const head = make(0);
    const mid = make(1);
    const leaf = make(2);
    const slots: Record<number, EnemySlot> = { 0: head, 1: mid, 2: leaf };
    const manager = { slotAt: (i: number) => slots[i] ?? null } as never;
    for (const s of [head, mid, leaf]) s.enemyManager = manager;
    head.childCount = 2;
    mid.parentSlotIndex = 0;
    leaf.parentSlotIndex = 1;
    expect(leaf.parentChainCount).toBe(2);
  });

  it('leaves the count when a familiar dies, so the five-mirror cap can release', () => {
    const { head, child } = pair();
    head.childCount = 5;
    child.parentSlotIndex = head.slotIndex;
    child.applyDamage(5000);
    expect(head.childCount).toBe(4);
    // Stage 4b gates each mirror on `parentChainCount >= 5`; a counter that only
    // ever grows is how that route silently stopped attaching anything.
    expect(head.parentChainCount).toBe(4);
  });

  it('is a sensor in both switches, and writable in neither', () => {
    expect(WRITABLE_FLOAT_FIELD_BY_ID[0x2770]).toBeUndefined();
    expect(FLOAT_FIELD_BY_ID[0x2770]).toBe('parentChainCount');
    expect(INT_FIELD_BY_ID[0x2770]).toBe('parentChainCount');
  });
});

describe('the last-spell test (register 0x2772)', () => {
  it('is 2 only once won orbs plus the field reach the threshold', () => {
    const { s, gs } = rig();
    gs.lastSpellTimeOrbThreshold = 600;
    expect(s.timeOrbReady).toBe(0);
    addTimeOrbs(gs, 500);
    const items = new ItemPool(gs);
    s.itemPool = items;
    items.spawn('timeOrb', 100, 100);
    items.spawn('timeOrb', 100, 110);
    expect(items.timeOrbCount).toBe(2);
    // 500 won + 2 still on the field = 502, short of the 600 the card asks for.
    expect(s.timeOrbReady).toBe(0);
    addTimeOrbs(gs, 97);
    expect(s.timeOrbReady).toBe(0);
    addTimeOrbs(gs, 1);
    expect(s.timeOrbReady).toBe(2);
  });

  it('resolves in the int switch only', () => {
    // `EclOperandsFloat.cpp:167-168`: case 0x2772 falls through to
    // `default: return operand`, so a float operand naming it stays raw. Only the
    // int switch computes it, and the translator has to keep that difference.
    expect(INT_FIELD_BY_ID[0x2772]).toBe('timeOrbReady');
    expect(FLOAT_FIELD_BY_ID[0x2772]).toBeUndefined();
  });

  it('is 0 for a stage that never armed a last-spell threshold', () => {
    // The default is positive infinity: the shipped build only lowers it from the
    // globals block, whose writer is not in the decompile.
    expect(slot().timeOrbReady).toBe(0);
  });
});

describe('the night clock (ECL op 181)', () => {
  it('tolls one hour at a time and stops dead at dawn', () => {
    const { s, gs } = rig();
    for (let hour = 1; hour <= 12; hour++) {
      s.clockControl();
      expect(gs.clockTime).toBe(hour);
    }
    s.clockControl();
    expect(gs.clockTime).toBe(12);
    // It asked for the bell on every chime that actually moved the hand.
    const rang = s.drainSfx([]).filter((request) => request.id === 0x2d).length;
    expect(rang).toBe(12);
  });
});

describe('sign registers', () => {
  it('return plus or minus their operand, never NaN', () => {
    // The emitter used to drop the operand and call `e.randSignF()`, which
    // negated `undefined`. `@ts-nocheck` on the generated subs hid it from
    // TypeScript, and 18 call sites across the campaign fed the result straight
    // into a Hermite tangent.
    const s = slot();
    for (let i = 0; i < 60; i++) {
      expect([400, -400]).toContain(s.randSignF(400));
      expect([7, -7]).toContain(s.randSign(7));
    }
  });
});

describe('decoder tables', () => {
  it('name every register the float switch can write', () => {
    // `EclOperandsFloat.cpp:182-228`, one selector per writable dword. The
    // interpolator silently drops a destination outside this set, so a missing
    // entry is a tween that does nothing rather than one that fails loudly.
    for (const id of [
      0x2720, 0x2727, 0x2728, 0x272f, 0x273a, 0x273b, 0x273c, 0x2749, 0x274c, 0x2751, 0x2754, 0x2755, 0x2759,
      0x275a, 0x275c, 0x275d, 0x275e, 0x275f, 0x2760, 0x2761, 0x276e, 0x276f,
    ]) {
      expect(WRITABLE_FLOAT_FIELD_BY_ID[id], 'writable ' + id.toString(16)).toBeTruthy();
    }
  });

  it('declares the velocity triple, the thresholds and the sensors as read-only', () => {
    for (const id of [0x2763, 0x2764, 0x2765, 0x2766, 0x2767, 0x2768, 0x276b, 0x2770]) {
      expect(WRITABLE_FLOAT_FIELD_BY_ID[id], 'writable ' + id.toString(16)).toBeUndefined();
    }
  });

  it('names every id the int switch reads', () => {
    // The read switch is `EclOperandsInt.cpp:40-163`. `node .scratch/regdiff.cjs`
    // diffs these two tables against the decompile and now reports 100 of 100.
    const intIds = [
      0x2710, 0x2717, 0x2718, 0x271f, 0x2720, 0x2727, 0x2728, 0x272f, 0x2730, 0x2731, 0x2732, 0x2733, 0x2734,
      0x2737, 0x2738, 0x2739, 0x273a, 0x273b, 0x273c, 0x273d, 0x273e, 0x273f, 0x2740, 0x2741, 0x2742, 0x2743,
      0x2744, 0x2745, 0x2748, 0x2749, 0x274c, 0x274d, 0x2750, 0x2751, 0x2754, 0x2755, 0x2756, 0x2757, 0x2758,
      0x2759, 0x275a, 0x275b, 0x275c, 0x275d, 0x275e, 0x2763, 0x2764, 0x2765, 0x2766, 0x2767, 0x2768, 0x2769,
      0x276a, 0x276b, 0x276c, 0x276d, 0x276e, 0x276f, 0x2770, 0x2771, 0x2772, 0x2773, 0x2774,
    ];
    for (const id of intIds) {
      const known = INT_FIELD_BY_ID[id] ?? FLOAT_FIELD_BY_ID[id];
      expect(known, 'int register ' + id.toString(16)).toBeTruthy();
    }
  });

  it('names every id the float switch reads, except the two it does not', () => {
    // `EclOperandsFloat.cpp:46-169`. 0x2772 falls through to the raw operand and
    // 0x2774 has no float case at all; both are deliberate.
    const floatIds = [
      0x2710, 0x2717, 0x2718, 0x271f, 0x2720, 0x2727, 0x2728, 0x272f, 0x2730, 0x2731, 0x2732, 0x2733, 0x2734,
      0x2737, 0x2738, 0x2739, 0x273a, 0x273b, 0x273c, 0x273d, 0x273e, 0x273f, 0x2740, 0x2741, 0x2742, 0x2743,
      0x2744, 0x2745, 0x2748, 0x2749, 0x274c, 0x274d, 0x2750, 0x2751, 0x2754, 0x2755, 0x2756, 0x2757, 0x2758,
      0x2759, 0x275a, 0x275b, 0x275c, 0x275d, 0x275e, 0x275f, 0x2760, 0x2761, 0x2762, 0x2763, 0x2764, 0x2765,
      0x2766, 0x2767, 0x2768, 0x2769, 0x276a, 0x276b, 0x276c, 0x276d, 0x276e, 0x276f, 0x2770, 0x2771, 0x2773,
    ];
    for (const id of floatIds) {
      const known = FLOAT_FIELD_BY_ID[id] ?? INT_FIELD_BY_ID[id];
      expect(known, 'float register ' + id.toString(16)).toBeTruthy();
    }
  });
});
