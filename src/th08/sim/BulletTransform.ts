/**
 * Bullet transform records: the half of ECL that actually makes danmaku move.
 *
 * A shot instruction (`EnemySlot.dispatchShot`) only picks a starting heading and
 * speed. Everything interesting after that - bullets that accelerate out of a
 * cluster, curve, stop, restart, bounce off the frame, wrap around it, change
 * sprite mid-flight, split into a nested pattern, or simply expire - comes from a
 * chain of up to 18 `BulletTransformRecord`s that the launcher copies into the
 * bullet (`BulletManager.cpp:261`). ECL opcode 111 installs one record at a time
 * (`EclRunHigh.inl:414-428`), and it writes them into the shot descriptor that
 * lives at `enemy+0x2E24`, which is why the record has to be in place before the
 * `spawnShot` that uses it.
 *
 * Two things about the walker matter as much as the handlers:
 *
 * - A record only applies to a bullet whose shot flag word carries its kind bit
 *   (`BulletManager.cpp:340`), so one setup can serve the eight bullets of a ring
 *   with different behaviour each.
 * - A record with `allowWhileActive == 0` is *held back* while any other handler
 *   is armed. Kind `WAIT` exists to exploit exactly that: it arms a handler that
 *   does nothing but count down, which blocks the rest of the chain until it
 *   clears. That is how retail times a bullet's second and third moves.
 */

import { normalizeAngle } from '../core/math';
import { PLAYFIELD_W, PLAYFIELD_H, outsidePlayfield } from './Playfield';
import type { Bullet, BulletPool } from './BulletPool';

/** `BulletTransformRecord`, 0x18 bytes (`BulletManager.hpp:11-20`). */
export interface ShotRecord {
  /** Which handler this arms, and which shot flag bit gates it. */
  kind: number;
  /** Apply even while another handler is armed. */
  allowWhileActive: number;
  int0: number;
  int1: number;
  float0: number;
  float1: number;
}

/** The 18 slots the original reserves. */
export const SHOT_RECORD_SLOTS = 18;

/** A fresh, inert record: kind 0 terminates the chain. */
export function blankShotRecord(): ShotRecord {
  return { kind: 0, allowWhileActive: 0, int0: 0, int1: 0, float0: 0, float1: 0 };
}

export function blankShotRecords(): ShotRecord[] {
  return Array.from({ length: SHOT_RECORD_SLOTS }, blankShotRecord);
}

/**
 * `Bullet::FUN_0042ffc0:346-477`. The values are the `record->kind` the switch
 * compares against, and they double as the shot flag bits that admit them.
 */
export const REC = {
  /** 16-frame outward push added to the bullet's own speed at birth. */
  BIRTH_PUSH: 0x1,
  /** Constant acceleration along a fixed heading. */
  ACCELERATE: 0x10,
  /** Per-frame speed and heading deltas: the curve and the slow-down. */
  CURL: 0x20,
  /** Bleed to a stop, then step the heading and restart. Relative turn. */
  RAMP_TURN: 0x40,
  /** Same cycle, but re-aims at the ship each time it restarts. */
  RAMP_HOME: 0x80,
  /** Same cycle with an absolute heading. */
  RAMP_SET: 0x100,
  /** Bounce off the left and right frame, and off the top. */
  BOUNCE: 0x400,
  /** Bounce off the left and right frame only. */
  BOUNCE_X: 0x800,
  /** Ignore the off-field test for `int0` frames. */
  HOLD: 0x2000,
  /** Change to bullet type `int0`, sprite `int1`, mid-flight. */
  RESPRITE: 0x4000,
  /** Expire: the bullet fades out and hands the slot back. */
  FADE_OUT: 0x40000,
  /** Play a sound and move on. */
  SOUND: 0x80000,
  /** Hold the chain for `int0` frames without doing anything else. */
  WAIT: 0x20000,
  /** Wrap horizontally across the playfield. */
  WRAP_X: 0x400000,
  /** Wrap vertically across the playfield. */
  WRAP_Y: 0x800000,
  /** Split: fire a nested pattern from the bullet and fade the parent. */
  FORK: 0x1000000,
} as const;

/** The shot flag that makes a bullet immune to cancellation and collection. */
export const SF_NO_CANCEL = 0x1000;
/** The shot flags that put a bullet through an appearing animation instead. */
export const SF_APPEAR = 2 | 4 | 8;
/**
 * The armed-handler mask that earns a grace window off-field. Bounce and
 * respawn can bring a bullet back, so retail gives it 0x80 frames first - and
 * tests it against the active handler word 0xDAC, not the shot flag word
 * (`BulletManager.cpp:864`).
 */
export const AF_GRACE = 0xdc0;

/** `bullet+0xDB8`: 0 free, 1 live, 2..4 appearing, 5 dying. */
export const BULLET_LIVE = 1;
export const BULLET_DYING = 5;

/** A bullet only collides while it is fully live. */
export function isLive(b: Bullet): boolean {
  return b.state === BULLET_LIVE;
}

/** What a record needs from the running game. */
export interface BulletWorld {
  playerX: number;
  playerY: number;
  /** Retail's `g_Rng`, which the random aim modes draw from. */
  rng: { randomF32InRange(range: number): number };
  /** Collision radius for a bullet type, from the host's etama table. */
  radiusFor(type: number): number;
  /** Sprite half-width for a bullet type, which sets the off-field margin. */
  sizeFor(type: number, color: number): number;
  /** `transformSound` / `spawnSound` ids, played by the host. */
  onSound(id: number, x: number): void;
}

/**
 * One sound the scripts asked for during a frame, with the position that places it.
 *
 * Retail has two entry points - `PlaySoundByIdx` and `PlaySoundPositionedByIdx`
 * (`SoundPlayer.cpp:487/516`) - and the second one is what every bullet and hit
 * sound uses, so the x has to survive all the way to the audio layer.
 */
export interface SeTick {
  id: number;
  /** Playfield x, or `Number.NaN` when the request carries no position. */
  x: number;
}

/**
 * `BulletSpawnDescriptor` as the launcher needs it: the shot instruction resolved
 * against the enemy's registers, plus the record chain that rides along with it.
 */
export interface ShotPattern {
  /** 0..8, from the opcode. */
  aimMode: number;
  type: number;
  color: number;
  count1: number;
  count2: number;
  speed1: number;
  speed2: number;
  angle: number;
  angleStep: number;
  transformFlags: number;
  records: readonly ShotRecord[];
  /** `transformStartIndex`: where a forked pattern starts in the chain. */
  startIndex: number;
  /** `transformSound`, armed at the first record that needs it. */
  transformSound: number;
  /** Collision radius, resolved by the launcher from the host's table. */
  radius: number;
  /** Sprite half-width, resolved the same way. */
  halfSize: number;
  /** Frames spent appearing; retail gets this from the template's ANM script. */
  appearFrames: number;
  /** `player` only for shots a host fires by hand, outside the machine. */
  tag?: 'enemy' | 'player';
}

/** A one-slot pattern for hosts that just want a plain bullet. */
export function simplePattern(over: Partial<ShotPattern> = {}): ShotPattern {
  return {
    aimMode: 0,
    type: 0,
    color: 0,
    count1: 1,
    count2: 1,
    speed1: 2,
    speed2: 2,
    angle: 0,
    angleStep: 0,
    transformFlags: 0,
    records: NO_RECORDS,
    startIndex: 0,
    transformSound: -1,
    radius: 3,
    halfSize: 8,
    appearFrames: DEFAULT_APPEAR_FRAMES,
    tag: 'enemy',
    ...over,
  };
}

const NO_RECORDS: readonly ShotRecord[] = [];

/**
 * Frames a bullet stays in its appearing animation. Retail ends it when the
 * template`s birth ANM script finishes; the template table at raw 0x4c6d30 is not
 * recoverable from the shipped data, so this is the one number in the file that is
 * an estimate rather than a transcription. 8 frames is short enough that no bullet
 * is ever unfair, and long enough that a cluster materialises instead of popping.
 */
export const DEFAULT_APPEAR_FRAMES = 8;

/** Frames a bullet that expires by record lingers while it fades out. */
export const DEATH_FRAMES = 8;

/**
 * `BulletManager::FUN_00430e10` + `FUN_0042f5f0`: lay out one shot instruction and
 * put every bullet it describes into the pool.
 *
 * The nine aim modes are the opcode minus 96, and the operand order is
 * `BulletManager.hpp`'s `BulletSpawnDescriptor`. A full array stops the pattern
 * where it stands, which is retail behaviour and not a fallback: 0x600 slots is
 * the real ceiling.
 */
export function launchPattern(
  pool: BulletPool,
  world: BulletWorld,
  p: ShotPattern,
  x: number,
  y: number,
): number {
  const angleToPlayer = Math.atan2(world.playerY - y, world.playerX - x);
  const twoPi = Math.PI * 2;
  let spawned = 0;
  for (let ring = 0; ring < p.count2; ring++) {
    const shotSpeed = p.count2 > 1 ? p.speed1 - ((p.speed1 - p.speed2) * ring) / p.count2 : p.speed1;
    for (let i = 0; i < p.count1; i++) {
      let shot = 0;
      let speed = shotSpeed;
      switch (p.aimMode) {
        case 0:
        case 1: {
          // Odd counts centre the fan on the base heading; even counts straddle it.
          shot +=
            (p.count1 & 1) !== 0 ? ((i + 1) / 2) * p.angleStep : (i / 2) * p.angleStep + p.angleStep * 0.5;
          if ((i & 1) !== 0) shot = -shot;
          if (p.aimMode === 0) shot += angleToPlayer;
          shot += p.angle;
          break;
        }
        case 2:
          shot += angleToPlayer;
          shot += (i * twoPi) / p.count1;
          shot += ring * p.angleStep + p.angle;
          break;
        case 3:
          shot += (i * twoPi) / p.count1;
          shot += ring * p.angleStep + p.angle;
          break;
        case 4:
          shot += angleToPlayer;
          shot += Math.PI / p.count1;
          shot += (i * twoPi) / p.count1;
          shot += p.angle;
          break;
        case 5:
          shot += Math.PI / p.count1;
          shot += (i * twoPi) / p.count1;
          shot += p.angle;
          break;
        case 6:
          shot = world.rng.randomF32InRange(p.angle - p.angleStep) + p.angleStep;
          break;
        case 7:
          speed = world.rng.randomF32InRange(p.speed1 - p.speed2) + p.speed2;
          shot += (i * twoPi) / p.count1;
          shot += ring * p.angleStep + p.angle;
          break;
        case 8:
          shot = world.rng.randomF32InRange(p.angle - p.angleStep) + p.angleStep;
          speed = world.rng.randomF32InRange(p.speed1 - p.speed2) + p.speed2;
          break;
        default:
          shot += p.angle;
          break;
      }
      const b = pool.launch(p, x, y, normalizeAngle(shot), speed);
      // The original runs the record walker once at spawn, before the first
      // frame, so a birth push or an acceleration is already armed on frame 1.
      if (!b) return spawned;
      advanceShotRecords(b, world, pool);
      spawned++;
    }
  }
  return spawned;
}

/**
 * `Bullet::FUN_0042ffc0`: consider one record per frame.
 *
 * Records that the shot flag word rejects are skipped in the same call, so a
 * mixed ring walks straight through the slots that are not for it. `HOLD`,
 * `RESPRITE`, `SOUND` and `FORK` chain onward without waiting for the next frame;
 * every other kind arms a handler and stops.
 */
export function advanceShotRecords(b: Bullet, world: BulletWorld, pool: BulletPool | null): void {
  let rec: ShotRecord | null = null;
  for (;;) {
    if (b.tfIndex >= SHOT_RECORD_SLOTS) return;
    rec = b.tfRecords[b.tfIndex] ?? null;
    if (!rec || rec.kind === 0) return;
    // Two different reasons to not run a record, and they do opposite things
    // to the index. A record that may not overlap an armed handler waits where
    // it stands, which is what turns WAIT into a delay for everything behind
    // it; a record the shot flag word does not admit is not part of this
    // bullet's chain at all, so it is stepped over in the same call.
    if (rec.allowWhileActive === 0 && b.tfActive !== 0) return;
    if ((b.tfFlags & rec.kind) === 0) {
      b.tfIndex++;
      continue;
    }
    break;
  }
  const r = rec as ShotRecord;
  const chained = () => {
    b.tfIndex++;
    advanceShotRecords(b, world, pool);
  };

  switch (r.kind) {
    case REC.BIRTH_PUSH:
      b.tfActive |= REC.BIRTH_PUSH;
      b.h1 = 0;
      break;

    case REC.ACCELERATE: {
      b.tfActive |= REC.ACCELERATE;
      const heading = r.float1 > -990 ? r.float1 : b.angle;
      b.h10ax = Math.cos(heading) * r.float0;
      b.h10ay = Math.sin(heading) * r.float0;
      b.h10t = 0;
      b.h10dur = r.int0;
      if (b.tfIndex !== 0 && b.tSound >= 0) world.onSound(b.tSound, b.x);
      break;
    }

    case REC.CURL:
      b.tfActive |= REC.CURL;
      b.h20ds = r.float0;
      b.h20da = r.float1;
      b.h20t = 0;
      b.h20dur = r.int0;
      if (b.tfIndex !== 0 && b.tSound >= 0) world.onSound(b.tSound, b.x);
      break;

    case REC.RAMP_TURN:
    case REC.RAMP_HOME:
    case REC.RAMP_SET:
      b.tfActive |= r.kind;
      b.h40a = r.float0;
      b.h40s = r.float1 > -999 ? r.float1 : b.speed;
      b.h40t = 0;
      b.h40dur = r.int0;
      b.h40rep = r.int1;
      b.h40cnt = 0;
      break;

    case REC.BOUNCE:
    case REC.BOUNCE_X:
      b.tfActive |= r.kind;
      b.hBounceSpeed = r.float0 >= 0 ? r.float0 : b.speed;
      b.hBounceMax = r.int0;
      b.hBounceDone = 0;
      break;

    case REC.WAIT:
      b.tfActive |= REC.WAIT;
      b.hWait = r.int0;
      break;

    case REC.WRAP_X:
    case REC.WRAP_Y:
      b.tfActive |= r.kind;
      b.hWrap = r.int0;
      break;

    case REC.HOLD:
      b.hold = r.int0;
      chained();
      return;

    case REC.RESPRITE:
      b.type = r.int0 | 0;
      b.color = r.int1 | 0;
      b.radius = world.radiusFor(b.type);
      b.fieldW = world.sizeFor(b.type, b.color) * 2;
      b.fieldH = b.fieldW;
      chained();
      return;

    case REC.SOUND:
      world.onSound(r.int0, b.x);
      chained();
      return;

    case REC.FADE_OUT:
      b.state = BULLET_DYING;
      b.animLeft = DEATH_FRAMES;
      b.tfIndex++;
      return;

    case REC.FORK: {
      if (!pool) {
        b.tfIndex++;
        return;
      }
      const next = b.tfRecords[b.tfIndex + 1];
      if (!next) {
        b.tfIndex++;
        return;
      }
      const bits = r.int0 >>> 0;
      const fork: ShotPattern = {
        aimMode: (bits >>> 24) & 0x7f,
        type: (bits >>> 16) & 0xff,
        color: (bits >>> 8) & 0xff,
        startIndex: bits & 0xff,
        count1: r.int1 | 0,
        speed1: r.float0,
        speed2: r.float1,
        count2: next.int0 | 0,
        transformFlags: next.int1 >>> 0,
        angle: next.float0,
        angleStep: next.float1,
        records: b.tfRecords,
        transformSound: -1,
        radius: world.radiusFor((bits >>> 16) & 0xff),
        halfSize: world.sizeFor((bits >>> 16) & 0xff, (bits >>> 8) & 0xff),
        appearFrames: DEFAULT_APPEAR_FRAMES,
        tag: 'enemy',
      };
      b.tfIndex += 2;
      launchPattern(pool, world, fork, b.x, b.y);
      // A set high bit on int0 asks for the parent to fade out as it splits;
      // otherwise it stays, and can split again on a later frame.
      if (r.int0 < 0) {
        b.state = BULLET_DYING;
        b.animLeft = DEATH_FRAMES;
      }
      return;
    }

    default:
      break;
  }
  b.tfIndex++;
}

/**
 * The armed-handler dispatch, `BulletManager::OnUpdate:822-849`, in the original's
 * bit order. Each one is the matching `Bullet::FUN_00432xxx`.
 */
export function runShotHandlers(b: Bullet, world: BulletWorld): void {
  const f = b.tfActive;
  if (f === 0) return;

  if (f & REC.BIRTH_PUSH) birthPush(b);
  if (f & REC.ACCELERATE) accelerate(b);
  if (f & REC.CURL) curl(b);
  if (f & 0x40) rampCycle(b, 0x40, 'relative', world);
  if (f & 0x100) rampCycle(b, 0x100, 'absolute', world);
  if (f & 0x80) rampCycle(b, 0x80, 'home', world);
  if (f & 0xc00) bounce(b, world);
  if (f & 0x20000) {
    if (b.hWait <= 0) b.tfActive &= ~0x20000;
    else b.hWait--;
  }
  if (f & 0x400000) {
    wrap(b, 'x');
    if (b.hWrap <= 0) b.tfActive &= ~0x400000;
    else b.hWrap--;
  }
  if (f & 0x800000) {
    wrap(b, 'y');
    if (b.hWrap <= 0) b.tfActive &= ~0x800000;
    else b.hWrap--;
  }
}

/** `FUN_00432210`: 5 px/frame of extra push that falls away over 16 frames. */
function birthPush(b: Bullet): void {
  if (b.h1 <= 16) {
    const magnitude = 5 - (b.h1 * 5) / 16;
    b.vx = Math.cos(b.angle) * (magnitude + b.speed);
    b.vy = Math.sin(b.angle) * (magnitude + b.speed);
  } else {
    b.tfActive &= ~REC.BIRTH_PUSH;
  }
  b.h1++;
}

/** `FUN_004322b0`: add a fixed acceleration vector, and follow the result. */
function accelerate(b: Bullet): void {
  if (b.h10t >= b.h10dur) {
    b.tfActive &= ~REC.ACCELERATE;
  } else {
    b.vx += b.h10ax;
    b.vy += b.h10ay;
    if (Math.abs(b.vx) > 0.0001 || Math.abs(b.vy) > 0.0001) {
      b.angle = Math.atan2(b.vy, b.vx);
    }
  }
  b.h10t++;
}

/** `FUN_00432390`: change speed and heading by a fixed amount each frame. */
function curl(b: Bullet): void {
  if (b.h20t >= b.h20dur) {
    b.tfActive &= ~REC.CURL;
  } else {
    b.angle = normalizeAngle(b.angle + b.h20da);
    b.speed += b.h20ds;
    b.vx = Math.cos(b.angle) * b.speed;
    b.vy = Math.sin(b.angle) * b.speed;
  }
  b.h20t++;
}

/**
 * `FUN_00432460` / `FUN_004326e0` / `FUN_004325a0`: run the speed down to nothing
 * across the window, then jump the heading and start again, `int1` times.
 *
 * The three share everything but the way the new heading is chosen: relative to
 * the old one, aimed at the ship again, or absolute.
 */
function rampCycle(b: Bullet, bit: number, aim: 'relative' | 'absolute' | 'home', world: BulletWorld): void {
  let magnitude: number;
  if (b.h40t >= b.h40dur) {
    if (b.tSound >= 0) world.onSound(b.tSound, b.x);
    b.h40cnt++;
    if (b.h40cnt >= b.h40rep) b.tfActive &= ~bit;
    if (aim === 'relative') b.angle = normalizeAngle(b.angle + b.h40a);
    else if (aim === 'absolute') b.angle = b.h40a;
    else b.angle = normalizeAngle(Math.atan2(world.playerY - b.y, world.playerX - b.x) + b.h40a);
    b.speed = b.h40s;
    magnitude = b.speed;
    b.h40t = 0;
  } else {
    magnitude = b.speed - (b.h40t * b.speed) / b.h40dur;
  }
  b.vx = Math.cos(b.angle) * magnitude;
  b.vy = Math.sin(b.angle) * magnitude;
  b.h40t++;
}

/** `FUN_00432830`: reflect at the frame, 0x800 leaving the bottom edge open. */
function bounce(b: Bullet, world: BulletWorld): void {
  // Retail asks the reflect question with the same sprite box the cull uses,
  // so a fat bullet turns a few pixels before a pellet would; the actual
  // axis test is still against the raw centre.
  if (!outsidePlayfield(b.x, b.y, b.fieldW, b.fieldH)) return;
  if (b.tSound >= 0) world.onSound(b.tSound, b.x);
  if (b.x < 0 || b.x >= PLAYFIELD_W) b.angle = normalizeAngle(-b.angle - Math.PI);
  if (b.y < 0 || (b.y >= PLAYFIELD_H && (b.tfActive & REC.BOUNCE) !== 0)) {
    b.angle = normalizeAngle(-b.angle);
  }
  b.speed = b.hBounceSpeed;
  b.vx = Math.cos(b.angle) * b.speed;
  b.vy = Math.sin(b.angle) * b.speed;
  b.hBounceDone++;
  if (b.hBounceDone >= b.hBounceMax) b.tfActive &= ~0xc00;
}

/** `FUN_004329f0` / `FUN_00432aa0`: step over the edge and come back on the other. */
function wrap(b: Bullet, axis: 'x' | 'y'): void {
  if (axis === 'x') {
    if (b.x < 0) b.x += PLAYFIELD_W;
    else if (b.x > PLAYFIELD_W) b.x -= PLAYFIELD_W;
  } else {
    if (b.y < 0) b.y += PLAYFIELD_H;
    else if (b.y > PLAYFIELD_H) b.y -= PLAYFIELD_H;
  }
}

/** Clear a single transform bit; `^=` in the original, `&= ~` everywhere else. */
export function clearBit(bit: number): number {
  return ~bit >>> 0;
}
