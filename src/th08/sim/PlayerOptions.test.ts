/**
 * The option slots, checked two ways.
 *
 * The first check is the interesting one: `g_PlayerOptionUpdateCallbacks` is a
 * twelve-by-four table of function pointers in the decomp, and the eight shipped
 * `.sht` files independently say which slots each character really fires from.
 * Those two sources were never written against each other, so the fact that they
 * agree - slot for slot, shot type for shot type, once 妖梦's focus-release blade is
 * counted - is what says the reading of both is right and not a story fitted to
 * whichever file was open.
 *
 * The rest is the steering: `chaseTo`'s one-sixteenth lead with twenty percent
 * damping, the arming and release edges, the takeover test's three conditions, and
 * the enemy pass that chooses a target by x-window and height rather than by
 * distance.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import {
  armedOptions,
  OptionSystem,
  pickHomingTarget,
  route3ExitSlot,
  type OptionCandidate,
  type OptionWorld,
} from './PlayerOptions';
import { parseShtTables } from '../format/ShtFile';
import { Rng } from '../core/Rng';

/** The body scripts are allowed to draw, so they get a seeded generator. */
const RNG = new Rng(1);

const RAW_DIR = join(process.cwd(), 'public', 'assets', 'th08', 'raw');

/** `g_Player1ShtFiles` / `g_Player2ShtFile` (`Player.cpp:49-57`), by shot type. */
const SHT_BY_SHOT_TYPE: [string, string][] = [
  ['ply00a', 'ply00as'],
  ['ply01a', 'ply01as'],
  ['ply02a', 'ply02as'],
  ['ply03a', 'ply03as'],
  // Rows 4-11 are the solos, and a solo loads the same file on both sides
  // (`g_Player1ShtFiles` and `g_Player2ShtFile` agree, `Player.cpp:49-61`), so
  // 紫's 式神 entries in `ply00as` belong to shot type 5 and not to 霊夢's solo.
  ['ply00a', 'ply00a'],
  ['ply00as', 'ply00as'],
  ['ply01a', 'ply01a'],
  ['ply01as', 'ply01as'],
  ['ply02a', 'ply02a'],
  ['ply02as', 'ply02as'],
  ['ply03a', 'ply03a'],
  ['ply03as', 'ply03as'],
];

const hasAssets = [...new Set(SHT_BY_SHOT_TYPE.flat())].every((f) =>
  existsSync(join(RAW_DIR, `${f}.sht`)),
);

const cache = new Map<string, Set<number>>();
/** Which option slots a `.sht` fires from, as zero-based indices. */
function optionIndicesUsed(file: string): Set<number> {
  const hit = cache.get(file);
  if (hit) return hit;
  const used = new Set<number>();
  const tables = parseShtTables(new Uint8Array(readFileSync(join(RAW_DIR, `${file}.sht`))));
  for (const t of tables) for (const e of t.entries) if (e.option > 0) used.add(e.option - 1);
  cache.set(file, used);
  return used;
}

function world(over: Partial<OptionWorld> = {}): OptionWorld {
  return {
    playerX: 192,
    playerY: 384,
    shotWindowOpen: false,
    fireHeld: false,
    frameStop: false,
    modeFlag: 0,
    movementDirection: 0,
    moving: false,
    homingCandidates: () => [],
    anmPack: null,
    timeScale: 1,
    ...over,
  };
}

const cand = (x: number, y: number, hasAttached = false): OptionCandidate => ({ x, y, hasAttached });

describe.skipIf(!hasAssets)('the route table against the firing data', () => {
  it('arms exactly the slots that the .sht pair of each shot type fires from', () => {
    for (let shotType = 0; shotType < 12; shotType++) {
      const [primary, secondary] = SHT_BY_SHOT_TYPE[shotType];
      const used = new Set([...optionIndicesUsed(primary), ...optionIndicesUsed(secondary)]);
      const armed = new Set(armedOptions(shotType));
      const exit = route3ExitSlot(shotType);
      if (exit !== null) armed.add(exit);
      expect([...used].sort(), `shotType ${shotType} (${primary}/${secondary})`).toEqual(
        [...armed].sort(),
      );
    }
  });

  it('gives 紫 exactly one 式神, in slot zero, and 霊夢 none', () => {
    expect(armedOptions(0)).toEqual([0]);
    expect(optionIndicesUsed('ply00a').size).toBe(0);
    expect([...optionIndicesUsed('ply00as')]).toEqual([0]);
  });
});

describe('the chaser', () => {
  it('appears only while focus is held, and walks out after sixteen frames', () => {
    const sys = new OptionSystem(RNG);
    const w = world();
    sys.setFocus(true, 0);
    sys.tick(w);
    expect(sys.options[0].state).toBe(2);
    expect(sys.options[0].y).toBeCloseTo(384 - 96, 10);
    sys.setFocus(false, 0);
    expect(sys.options[0].state).toBe(3);
    // The dispatcher advances `option+0x2E0` after the route has read it
    // (`Player.cpp:908-917`), and the route leaves when the value it reads is
    // already past sixteen - so the exit frame plus seventeen more frames.
    for (let f = 0; f < 18; f++) sys.tick(w);
    expect(sys.options[0].state).toBe(0);
  });

  it('leads the anchor by a sixteenth of the gap, damped twenty percent', () => {
    const sys = new OptionSystem(RNG);
    const w = world({ playerX: 192, playerY: 384 });
    sys.setFocus(true, 0);
    // Frame one is the state-1 seed, which parks it at the anchor's column.
    sys.tick(w);
    // Now the ship moves away and the 式神 has to catch up.
    const before = { x: sys.options[0].x, y: sys.options[0].y };
    sys.tick(world({ playerX: 292, playerY: 384 }));
    const o = sys.options[0];
    // gap/16 = 6.25, damped from rest: v = (6.25 - 0) * 0.2 = 1.25.
    expect(o.vx).toBeCloseTo(1.25, 10);
    expect(o.x - before.x).toBeCloseTo(1.25, 10);
  });

  it('only breaks off to chase after ten frames with fire held and a target', () => {
    const target = cand(192, 100);
    const sys = new OptionSystem(RNG);
    const w = world({ shotWindowOpen: true, homingCandidates: () => [target] });
    sys.setFocus(true, 0);
    for (let f = 0; f < 10; f++) {
      sys.tick(w);
      expect(sys.options[0].substate).not.toBe(3);
    }
    sys.tick(w);
    expect(sys.options[0].substate).toBe(3);
    // The window is what lit the chase, and it stays lit for twenty frames after
    // the button goes off. With the button still down the 式神 keeps chasing
    // through a closed window; the give-up at `:2074` needs both to be off.
    sys.tick(world({ shotWindowOpen: false, fireHeld: true, homingCandidates: () => [target] }));
    expect(sys.options[0].substate).toBe(3);
    sys.tick(world({ shotWindowOpen: false, fireHeld: false, homingCandidates: () => [target] }));
    expect(sys.options[0].substate).toBe(0);
    expect(sys.homingTarget).toBeNull();
  });

  it('turns to face where it is going, and settles back to neutral when it stops', () => {
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 0);
    sys.tick(world({ playerX: 192 }));
    sys.tick(world({ playerX: 92 }));
    expect(sys.options[0].scaleSign).toBe(1);
    expect(sys.options[0].substate).toBe(1);
    // `:2120` only zeroes `vel.x` under `fabsf(vel.x) < 0.05`, and the chase
    // decays about twenty percent a frame, so "dead still" takes a while to
    // arrive; hold the ship still until the integrator has actually run out.
    for (let f = 0; f < 80 && sys.options[0].substate === 1; f++) sys.tick(world({ playerX: 92 }));
    // Neutral again: `:2057-2062` flips `scale.x` back positive with the substate.
    expect(sys.options[0].vx).toBe(0);
    expect(sys.options[0].substate).toBe(0);
    expect(sys.options[0].scaleSign).toBe(1);
  });
});

describe('the enemy pass that chooses a target', () => {
  it('has nothing to choose for a shot type with no options', () => {
    const sys = new OptionSystem(RNG);
    sys.initShotType(4);
    const w = world({ homingCandidates: () => [cand(192, 100)] });
    sys.tick(w);
    sys.tick(w);
    expect(sys.options.every((o) => o.state === 0)).toBe(true);
  });
});

describe('the solos, which arm once at load and never leave', () => {
  it('keeps 紫 solo’s 式神 out with focus off, and gives 霊夢 solo none', () => {
    const yukari = new OptionSystem(RNG);
    yukari.initShotType(5);
    yukari.tick(world());
    expect(yukari.options[0].state).toBe(2);
    yukari.setFocus(false, 5);
    yukari.setFocus(true, 5);
    yukari.setFocus(false, 5);
    yukari.tick(world());
    expect(yukari.options[0].state).toBe(2);

    const reimu = new OptionSystem(RNG);
    reimu.initShotType(4);
    reimu.setFocus(true, 4);
    reimu.tick(world());
    expect(reimu.options.every((o) => o.state === 0)).toBe(true);

    const sakuya = new OptionSystem(RNG);
    sakuya.initShotType(8);
    sakuya.setFocus(true, 8);
    sakuya.tick(world());
    expect(sakuya.options.every((o) => o.state === 0)).toBe(true);
  });

  it('arms all four familiars for 蕾米莉亚 solo and both blades for 妖妖 solo', () => {
    const remilia = new OptionSystem(RNG);
    remilia.initShotType(9);
    expect(remilia.options.map((o) => o.state)).toEqual([1, 1, 1, 1]);
    const youmu = new OptionSystem(RNG);
    youmu.initShotType(3);
    expect(youmu.options.map((o) => o.state)).toEqual([0, 0, 0, 0]);
    youmu.setFocus(true, 3);
    expect(youmu.options.map((o) => o.state)).toEqual([1, 1, 0, 0]);
  });
});

describe('the enemy pass that chooses a target', () => {
  it('ignores anything outside the sixty-four pixel column', () => {
    expect(pickHomingTarget(null, [cand(260, 100)], 192)).toBeNull();
    expect(pickHomingTarget(null, [cand(255, 100)], 192)?.y).toBe(100);
  });

  it('skips a body that has an attached enemy of its own', () => {
    expect(pickHomingTarget(null, [cand(192, 100, true)], 192)).toBeNull();
  });

  it('walks upward: a candidate wins only by being higher, never nearer', () => {
    const low = cand(192, 300);
    const highButFurther = cand(200, 120);
    expect(pickHomingTarget(low, [highButFurther], 192)).toBe(highButFurther);
    const higher = cand(192, 60);
    expect(pickHomingTarget(higher, [cand(192, 200)], 192)).toBe(higher);
  });
});

/** Collect the sparks a route throws, so the colour and the cadence are both checkable. */
function trailSpy(): { calls: { x: number; y: number; color: number }[]; w: (over: Partial<OptionWorld>) => OptionWorld } {
  const calls: { x: number; y: number; color: number }[] = [];
  return {
    calls,
    w: (over: Partial<OptionWorld>) =>
      world({ onTrail: (x, y, color) => calls.push({ x, y, color }), ...over }),
  };
}

describe('the two blades of 妖妖, FUN_0044f930', () => {
  it('arms both slots on the focus edge and puts them either side of the ship', () => {
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 3);
    expect(sys.options.map((o) => o.route)).toEqual(['f930', 'f930', 'none', 'none']);
    sys.tick(world({ playerX: 192, playerY: 384 }));
    // `:2596` falls through, so the frame that arms a blade has already swung it: the
    // anchor is one nine-percent step from the ship's own column toward ±32.
    expect(sys.options[0].targetX).toBeLessThan(192);
    expect(sys.options[1].targetX).toBeGreaterThan(192);
  });

  it('swings three degrees a frame in opposite directions on a radius of six', () => {
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 3);
    const step = Math.PI / 60;
    let left = 0;
    let right = 0;
    for (let f = 0; f < 30; f++) {
      sys.tick(world());
      if (f === 0) {
        left = sys.options[0].orbitAngle;
        right = sys.options[1].orbitAngle;
        continue;
      }
      const dLeft = sys.options[0].orbitAngle - left;
      const dRight = sys.options[1].orbitAngle - right;
      // Both angles are wrapped, so the only frame where the step is not the plain
      // difference is the one that crosses pi - and there it crosses by exactly -pi.
      expect(Math.abs(Math.abs(dLeft) - step) < 1e-12 || Math.abs(Math.abs(dLeft) - (Math.PI * 2 - step)) < 1e-12).toBe(true);
      expect(dLeft).toBeGreaterThan(0);
      expect(dRight).toBeLessThan(0);
      left = sys.options[0].orbitAngle;
      right = sys.options[1].orbitAngle;
    }
    for (const o of sys.options.slice(0, 2)) {
      expect(Math.hypot(o.x - o.targetX, o.y - o.targetY)).toBeCloseTo(6, 9);
    }
  });

  it('settles its anchor thirty-two pixels either side of the ship', () => {
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 3);
    for (let f = 0; f < 400; f++) sys.tick(world({ playerX: 192, playerY: 384 }));
    expect(sys.options[0].targetX).toBeCloseTo(160, 1);
    expect(sys.options[1].targetX).toBeCloseTo(224, 1);
    expect(sys.options[0].targetY).toBeCloseTo(384, 1);
  });

  it('throws 0x80602050 sparks from the body, one per frame', () => {
    const spy = trailSpy();
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 3);
    sys.tick(spy.w({}));
    expect(spy.calls).toHaveLength(2);
    expect(spy.calls.every((c) => c.color === 0x80602050)).toBe(true);
    const first = sys.options[0];
    expect(spy.calls[0].x).toBeCloseTo(first.x, 9);
    expect(spy.calls[0].y).toBeCloseTo(first.y, 9);
  });
});

describe('the release blade of 妖梦, FUN_0044f2d0', () => {
  /** Focus, fly for a while, let go - which is the only way slot 2 gets a route. */
  function armedWithTrail(frames = 4): OptionSystem {
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 3);
    for (let f = 0; f < frames; f++) sys.tick(world({ moving: true }));
    sys.setFocus(false, 3);
    return sys;
  }

  it('is not in the table: focus release installs it over slot 2', () => {
    const sys = new OptionSystem(RNG);
    sys.setFocus(true, 3);
    expect(sys.options[2].route).toBe('none');
    sys.setFocus(false, 3);
    expect(sys.options[2].route).toBe('f2d0');
    expect(sys.options[2].state).toBe(1);
    // `:741-745` walks the two table slots out on their way past.
    expect(sys.options[0].state).toBe(3);
    expect(sys.options[1].state).toBe(3);
  });

  it('rides where the ship was sixteen frames of movement ago', () => {
    const sys = armedWithTrail();
    sys.tick(world({ playerX: 192, playerY: 384, moving: true }));
    const anchor = { x: sys.trailAnchorX, y: sys.trailAnchorY };
    expect(anchor.x).toBeCloseTo(192, 9);
    // The ship leaves, and the oldest sample cannot change until the history has
    // turned all the way over - sixteen frames of it.
    for (let f = 0; f < 15; f++) sys.tick(world({ playerX: 292, playerY: 384, moving: true }));
    expect(sys.trailAnchorX).toBeCloseTo(192, 9);
    sys.tick(world({ playerX: 292, playerY: 384, moving: true }));
    expect(sys.trailAnchorX).toBeCloseTo(292, 9);
  });

  it('holds its circle where it was while the ship stands still', () => {
    const sys = armedWithTrail();
    sys.tick(world({ playerX: 192, playerY: 384, moving: true }));
    const before = sys.trailAnchorX;
    for (let f = 0; f < 40; f++) sys.tick(world({ playerX: 60, playerY: 384, moving: false }));
    // `:985` is the whole of it: no velocity, no shift, so the blade keeps orbiting
    // the spot she paused over instead of sliding under her feet.
    expect(sys.trailAnchorX).toBe(before);
  });

  it('turns to face the way the ship is going, jumping anything past a right angle', () => {
    const sys = armedWithTrail();
    sys.tick(world({ playerX: 192, playerY: 384 }));
    expect(sys.options[2].facingAngle).toBeCloseTo(-Math.PI / 2, 9);
    // Up is a half turn away, so `:2448-2451` puts the blade there outright.
    sys.tick(world({ movementDirection: 1 }));
    expect(sys.options[2].facingAngle).toBeCloseTo(Math.PI / 2, 9);
    // Right is three quarters of a turn, which wraps past pi first and then eases:
    // the wrap is why this is not a plain shortest-arc lerp.
    sys.tick(world({ movementDirection: 4 }));
    expect(sys.options[2].facingAngle).toBeCloseTo(Math.PI / 2 + (Math.PI - Math.PI / 2) * 0.07, 9);
    // And a ship with no direction bits turns nothing at all.
    const held = sys.options[2].facingAngle;
    sys.tick(world({ movementDirection: 0 }));
    expect(sys.options[2].facingAngle).toBe(held);
  });

  it('leaves the body alone and never picks a homing target', () => {
    const sys = armedWithTrail();
    const target = cand(192, 100);
    for (let f = 0; f < 40; f++) {
      sys.tick(world({ shotWindowOpen: true, fireHeld: true, homingCandidates: () => [target] }));
    }
    expect(sys.options[2].substate).toBe(0);
    expect(sys.options[2].state).toBe(2);
  });
});

describe('the solo blade of 妖梦, FUN_0044f5e0', () => {
  it('paints the body white and throws violet while unfocused', () => {
    const spy = trailSpy();
    const sys = new OptionSystem(RNG);
    sys.initShotType(10);
    expect(sys.options[2].route).toBe('f5e0');
    sys.tick(spy.w({ movementDirection: 1 }));
    const color = sys.options[2].vm.color1;
    expect([color.a, color.r, color.g, color.b]).toEqual([255, 255, 255, 255]);
    expect(spy.calls.map((c) => c.color)).toEqual([0x80405080]);
  });

  it('keeps the body red and burns pink while focused', () => {
    const spy = trailSpy();
    const sys = new OptionSystem(RNG);
    sys.initShotType(10);
    sys.tick(spy.w({ modeFlag: 1, movementDirection: 1 }));
    const color = sys.options[2].vm.color1;
    expect([color.a, color.r, color.g, color.b]).toEqual([255, 255, 128, 128]);
    expect(spy.calls.map((c) => c.color)).toEqual([0xfff05080]);
  });

  it('throws nothing at all when the ship is standing still', () => {
    const spy = trailSpy();
    const sys = new OptionSystem(RNG);
    sys.initShotType(10);
    sys.tick(spy.w({ movementDirection: 0 }));
    // `:2503`'s `goto optionUpdateDone` is past the spark as well as past the turn,
    // which is the one difference this route has from the release blade.
    expect(spy.calls).toHaveLength(0);
  });
});
