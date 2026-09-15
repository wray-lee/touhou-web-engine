/**
 * The ECL interpolator array, which is how a stage actually glides an enemy.
 *
 * Op 36 installs a slot and the tail of RunEcl steps it, so the two things worth
 * pinning are the arithmetic - the Catmull-Rom basis, the easing table, the
 * per-frame re-resolution - and the frame tail's move-becomes-velocity rewind,
 * which is the only reason a tween survives contact with the motion integrator.
 */
import { describe, expect, it } from 'vitest';
import {
  EclInterpolator,
  INTERP_HERMITE,
  REG_POS_X,
  REG_POS_Y,
  easeProgress,
  type InterpWorld,
} from './EclInterpolator';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import type { EnemySlot } from './EnemySlot';
import type { EclTimelineInstruction } from '../format/EclFile';
import type { PlayerInput } from './PlayerSim';

type SubFn = (e: EnemySlot) => Generator<number, void, void>;

const ins = (time: number, args: number[]): EclTimelineInstruction =>
  ({
    offset: 0,
    time,
    opcode: 0,
    size: 8 + args.length * 4,
    difficultyMask: 0xff,
    args: new Int32Array(args),
  }) as unknown as EclTimelineInstruction;

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

/** A register file the slots can read and write, with the writes recorded. */
function fakeWorld(regs: Record<number, number> = {}): InterpWorld & { writes: number[][] } {
  const writes: number[][] = [];
  return {
    writes,
    resolve: (value: number) => {
      const id = Math.trunc(value);
      return id in regs ? regs[id] : value;
    },
    write: (variable: number, value: number) => {
      const id = Math.trunc(variable);
      writes.push([id, value]);
      regs[id] = value;
    },
  };
}

describe('installing a slot', () => {
  it('takes a free slot and retargets one already driving the same register', () => {
    const ip = new EclInterpolator();
    expect(ip.install(10016, 60, 0, 0, 0, 100, 0, 0)).toBe(true);
    expect(ip.activeCount).toBe(1);
    // Same destination: the running tween is retargeted, not duplicated.
    expect(ip.install(10016, 30, 0, 0, 0, 50, 0, 0)).toBe(true);
    expect(ip.activeCount).toBe(1);
    expect(ip.slots[0].duration).toBe(30);
    expect(ip.slots[0].p1).toBe(50);
  });

  it('drops the instruction once all eight slots belong to another register', () => {
    const ip = new EclInterpolator();
    for (let i = 0; i < 8; i++) expect(ip.install(10016 + i, 60, 0, 0, 0, 1, 0, 0)).toBe(true);
    expect(ip.install(10099, 60, 0, 0, 0, 1, 0, 0)).toBe(false);
    expect(ip.activeCount).toBe(8);
  });
});

describe('the callbacks', () => {
  it('walks a linear slot from start to end and frees it at the duration', () => {
    const ip = new EclInterpolator();
    const world = fakeWorld();
    ip.install(10016, 4, 0, 0, 10, 20, 0, 0);
    const seen: number[] = [];
    for (let f = 0; f < 5; f++) {
      ip.step(world);
      seen.push(world.writes.at(-1)![1]);
    }
    expect(seen).toEqual([12.5, 15, 17.5, 20, 20]);
    expect(ip.activeCount).toBe(0);
  });

  it('re-resolves a parameter that names a register on every frame', () => {
    const ip = new EclInterpolator();
    const regs: Record<number, number> = { 10016: 100 };
    const world = fakeWorld(regs);
    // Parameter 0 holds the number 10016, which is f0, so the start tracks f0.
    ip.install(10017, 4, 0, 0, 10016, 200, 0, 0);
    ip.step(world);
    expect(regs[10017]).toBeCloseTo(125, 4);
    regs[10016] = 180;
    ip.step(world);
    // start 180, end 200, t 0.5: the new start is used, not the installed one.
    expect(regs[10017]).toBeCloseTo(190, 4);
  });

  it('runs the six named easing curves over the same window', () => {
    expect(easeProgress(0, 0.5)).toBeCloseTo(0.5, 6);
    expect(easeProgress(1, 0.5)).toBeCloseTo(0.25, 6);
    expect(easeProgress(2, 0.5)).toBeCloseTo(0.125, 6);
    expect(easeProgress(3, 0.5)).toBeCloseTo(0.0625, 6);
    expect(easeProgress(4, 0.5)).toBeCloseTo(0.75, 6);
    expect(easeProgress(5, 0.5)).toBeCloseTo(0.875, 6);
    expect(easeProgress(6, 0.5)).toBeCloseTo(0.9375, 6);
  });

  it('anchors a Hermite on its start point, because the weights sum in pairs', () => {
    const ip = new EclInterpolator();
    const world = fakeWorld();
    ip.install(10016, 2, INTERP_HERMITE, 0, 10, 110, 0, 0);
    ip.step(world);
    const half = world.writes.at(-1)![1];
    // w0 + w1 = 1 at every t, so with no tangents the point sits between the ends.
    expect(half).toBeCloseTo(60, 6);
    ip.step(world);
    expect(world.writes.at(-1)![1]).toBeCloseTo(110, 6);
  });

  it('lets the tangents carry a Hermite past the straight line', () => {
    const ip = new EclInterpolator();
    const world = fakeWorld();
    // The stage-1 shape: start and end both at 100, with a tangent that swings out.
    ip.install(10016, 4, INTERP_HERMITE, 0, 100, 100, 400, -400);
    const path: number[] = [];
    for (let f = 0; f < 4; f++) {
      ip.step(world);
      path.push(world.writes.at(-1)![1]);
    }
    expect(path[0]).toBeGreaterThan(100);
    expect(path[3]).toBeCloseTo(100, 6);
  });
});

describe('the frame tail', () => {
  it('reports only the position registers, which are the ones needing a rewind', () => {
    const ip = new EclInterpolator();
    expect(ip.install(10016, 4, 0, 0, 0, 1, 0, 0)).toBe(true);
    expect(ip.step(fakeWorld())).toBe(false);
    const ip2 = new EclInterpolator();
    ip2.install(REG_POS_X, 4, 0, 0, 0, 1, 0, 0);
    expect(ip2.step(fakeWorld())).toBe(true);
    const ip3 = new EclInterpolator();
    ip3.install(REG_POS_Y, 4, 0, 0, 0, 1, 0, 0);
    expect(ip3.step(fakeWorld())).toBe(true);
  });
});

function harness(subs: Record<number, SubFn>) {
  const gs = createGameState('normal', 7);
  const runner = new StageRunner({
    gs,
    ecl: {
      version: 2048,
      subCount: 1,
      subs: [],
      timelines: [{ index: 0, offset: 0, instructions: [ins(2, [0, 120, 200, 400, -2, 1000])] }],
    } as never,
    subFactory: (id: number) => subs[id] ?? hold,
  });
  const slot = () => runner.enemies.slots.find((s) => s.active) as EnemySlot;
  const to = (frames: number) => {
    while (gs.frame < frames) runner.tick(idle);
    return slot();
  };
  return { runner, slot, to };
}

/** A linear position tween, which is what the shipped scripts use for registers. */
const glide: SubFn = (e) =>
  (function* () {
    e.interpSlot(REG_POS_X, 60, 0, 0, 120, 300, 0, 0);
    for (let i = 0; i < 400; i++) yield 1;
  })();

/** The stage-1 boss entrance shape: a Hermite that re-anchors on posX each frame. */
const home: SubFn = (e) =>
  (function* () {
    e.interpSlot(REG_POS_X, 120, 7, 0, 10042, 300, 0, 0);
    for (let i = 0; i < 400; i++) yield 1;
  })();
describe('an enemy under an interpolator', () => {
  it('reaches a linear target, then keeps the last step as coasting velocity', () => {
    const { to } = harness({ 0: glide });
    const early = to(31);
    // Halfway through a 60-frame window, one frame of the tween already spent.
    expect(early.posX).toBeGreaterThan(200);
    expect(early.posX).toBeLessThan(230);
    // The spawn lands on frame 2 and the script arms on frame 3, so the
    // 60-frame window closes one frame later than the arithmetic suggests.
    // The slot is the same object every frame, so read the number out of it.
    const parked = to(62).posX;
    expect(parked).toBeCloseTo(300, 4);
    // Producer mode 0 leaves enemy+0x2D4C alone (`EnemyManager.cpp:51`), and the
    // integrator keeps adding it, so a linear tween walks the enemy out of the
    // frame afterwards. Retail does the same, which is why the stages only use it
    // on registers the polar producer reads, never on posX for a park.
    expect(to(72).posX - parked).toBeCloseTo(30, 3);
  });

  it('parks a Hermite, because the basis flattens its own residual velocity', () => {
    const { to } = harness({ 0: home });
    const mid = to(60);
    expect(mid.posX).toBeGreaterThan(200);
    expect(mid.posX).toBeLessThan(300);
    expect(to(125).posX).toBeCloseTo(300, 3);
    // w1 = 3t^2 - 2t^3 has zero slope at t = 1, so the last delta is nil and the
    // coasting the linear case falls into never happens here.
    expect(to(180).posX).toBeCloseTo(300, 3);
  });

  it('steers a Hermite toward a target the script can move mid-flight', () => {
    // The stage-1 shape again, but the destination is retargeted while the curve
    // is running: op 36 finds the slot already bound to posX and reuses it.
    const chase: SubFn = (e) =>
      (function* () {
        e.interpSlot(REG_POS_X, 120, 7, 0, 10042, 150, 0, 0);
        for (let i = 0; i < 400; i++) {
          if (i === 60) e.interpSlot(REG_POS_X, 120, 7, 0, 10042, 260, 0, 0);
          yield 1;
        }
      })();
    const { to } = harness({ 0: chase });
    const first = to(55);
    expect(first.posX).toBeGreaterThan(120);
    expect(first.posX).toBeLessThan(150);
    // The retargeted window keeps driving the same register rather than fighting
    // it, and lands on the new destination.
    expect(to(190).posX).toBeCloseTo(260, 2);
  });
});
