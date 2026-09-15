/**
 * The retail bullet array, with its state machine and transform machine.
 *
 * `g_BulletManager.bullets[0x600]` (`BulletManager.hpp:143`) is a fixed pool that
 * is never grown, so a full array really does end a danmaku pattern early
 * (`BulletManager::FUN_00430e10:689`). Every field this file keeps mirrors a
 * `Bullet` offset:
 *
 * | offset | field            | meaning                                          |
 * |--------|------------------|--------------------------------------------------|
 * | 0xD44  | x, y             | position                                         |
 * | 0xD50  | vx, vy           | velocity, already scaled per frame               |
 * | 0xD68  | speed            | the polar speed the velocity is derived from     |
 * | 0xD74  | angle            | the polar heading                                |
 * | 0xDA8  | hold             | frames left that suppress the off-field test     |
 * | 0xDB8  | state            | 0 free, 1 live, 2..4 appearing, 5 dying          |
 * | 0xDB0  | tfFlags          | the shot instruction flag word                   |
 * | 0xDAC  | tfActive         | which transform handlers are running now         |
 * | 0xDD0  | tfRecords        | the record chain copied from the shot setup      |
 * | 0xDCC  | tfIndex          | next record to consider                          |
 * | 0xDC8  | tSound           | sound played whenever a record arms              |
 *
 * The per-frame order follows `BulletManager::OnUpdate:808-937`: advance the
 * record chain, run every armed handler, tick the hold timer, integrate, test the
 * playfield. Collision lives in `Collision.ts`, because the caller owns the ship.
 */

import { outsidePlayfield } from './Playfield';
import {
  BULLET_LIVE,
  BULLET_DYING,
  SF_APPEAR,
  SF_NO_CANCEL,
  advanceShotRecords,
  isLive,
  runShotHandlers,
  simplePattern,
  type BulletWorld,
  type ShotPattern,
} from './BulletTransform';

export type { BulletWorld, ShotPattern, ShotRecord } from './BulletTransform';
export { BULLET_LIVE, BULLET_DYING, SF_NO_CANCEL, isLive, simplePattern } from './BulletTransform';

/** A detached bullet with every field zeroed, for hosts that build their own. */
export const blankBullet = createBullet;

/** The chain a hand-built bullet has: none, which is also what retail reads as a terminator. */
const NO_RECORDS: ShotPattern['records'] = [];

export interface Bullet {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  speed: number;
  type: number;
  color: number;
  radius: number;
  /** `IsWithinPlayfield`'s width and height arguments: the drawn sprite box. */
  fieldW: number;
  fieldH: number;
  damage: number;
  lifetime: number;
  grazed: boolean;
  tag: 'enemy' | 'player';
  /** `bullet+0xDB8`. */
  state: number;
  /** `bullet+0xDA8`: >0 keeps the bullet alive outside the playfield. */
  hold: number;
  /** `bullet+0xDAC`: the armed transform handlers. */
  tfActive: number;
  /** `bullet+0xDB0`: the shot instruction's flag word. */
  tfFlags: number;
  /** `bullet+0xDCC`: the next record the chain walker looks at. */
  tfIndex: number;
  /** `bullet+0xDD0`, shared by every bullet from one shot instruction. */
  tfRecords: ShotPattern['records'];
  /** `bullet+0xDC8`. */
  tSound: number;
  /** `bullet+0xD80` and `bullet+0xD8C`. */
  age: number;
  age2: number;
  /** Frames left in an appear or death animation. */
  animLeft: number;
  /** Scratch for the armed handlers; the offsets are quoted in `BulletTransform`. */
  h1: number;
  h10t: number;
  h10ax: number;
  h10ay: number;
  h10dur: number;
  h20t: number;
  h20ds: number;
  h20da: number;
  h20dur: number;
  h40t: number;
  h40s: number;
  h40a: number;
  h40dur: number;
  h40rep: number;
  h40cnt: number;
  hBounceSpeed: number;
  hBounceDone: number;
  hBounceMax: number;
  /** `bullet+0x105C`, the WAIT record's countdown. */
  hWait: number;
  /** `bullet+0x1088`, shared by the two wrap records. */
  hWrap: number;
  /** Frames outside the playfield, for the 0xDC0 grace window. */
  oob: number;
  /** Set once the bullet has been counted as a graze. */
  hitLatch: boolean;
  /** Set while an appear animation saw the ship inside the bullet. */
  touchedPlayer: boolean;
}

function createBullet(): Bullet {
  return {
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    speed: 0,
    type: 0,
    color: 0,
    radius: 3,
    fieldW: 16,
    fieldH: 16,
    damage: 1,
    lifetime: 0,
    grazed: false,
    tag: 'enemy',
    state: 0,
    hold: 0,
    tfActive: 0,
    tfFlags: 0,
    tfIndex: 0,
    tfRecords: NO_RECORDS,
    tSound: -1,
    age: 0,
    age2: 0,
    animLeft: 0,
    h1: 0,
    h10t: 0,
    h10ax: 0,
    h10ay: 0,
    h10dur: 0,
    h20t: 0,
    h20ds: 0,
    h20da: 0,
    h20dur: 0,
    h40t: 0,
    h40s: 0,
    h40a: 0,
    h40dur: 0,
    h40rep: 0,
    h40cnt: 0,
    hBounceSpeed: 0,
    hBounceDone: 0,
    hBounceMax: 0,
    hWait: 0,
    hWrap: 0,
    oob: 0,
    hitLatch: false,
    touchedPlayer: false,
  };
}

/** `g_BulletManager.bullets[0x600]`. */
export const MAX_BULLETS = 0x600;
/** Frames a bullet may keep living after leaving the playfield (retail 0x80). */
const OOB_GRACE = 0x80;
/**
 * Armed handlers that can bring a bullet back to the frame get the window
 * instead of an instant kill: BOUNCE, BOUNCE_X and RESPRITE (`0xDC0` tested
 * against `bullet+0xDAC`, the *active* mask, at `BulletManager.cpp:864`).
 */
const OOB_GRACE_HANDLERS = 0xdc0;
/** Frames a bullet that dies by record stays on screen. */
const DEATH_ANIM_FRAMES = 8;

export class BulletPool {
  readonly bullets: Bullet[];
  private cursor = 0;

  /** A full array is retail behaviour, but a host still wants to see it happen. */
  readonly stats = {
    refused: 0,
    spawned: 0,
    /** Bullets armed with a non-empty record chain (`record->kind != 0`). */
    recorded: 0,
  /** Frames on which some bullet had a transform handler running. */
    handlerFrames: 0,
  };

  /**
   * `g_EclGameTimeScale`, which `BulletManager.cpp:183-184` folds into a fresh
   * bullet's velocity but not into its raw speed field `+0xD68`. The host keeps
   * this in step with its own time scale once per frame; `arm` is the one site
   * that needs it without a `BulletWorld` in hand.
   */
  timeScale = 1;

  constructor() {
    this.bullets = Array.from({ length: MAX_BULLETS }, createBullet);
  }

  /**
   * `BulletManager::FUN_0042f5f0`: take a free slot and arm it.
   *
   * The scan starts at the slot after the one last filled, which is retail's
   * `bulletCursor`, so a lunate stage-6 pattern that overflows loses the same
   * bullets the original would.
   */
  launch(pattern: ShotPattern, x: number, y: number, angle: number, speed: number): Bullet | null {
    const bullets = this.bullets;
    const n = bullets.length;
    for (let i = 0; i < n; i++) {
      const b = bullets[this.cursor];
      this.cursor = (this.cursor + 1) % n;
      if (b.active) continue;
      this.arm(b, pattern, x, y, angle, speed);
      this.stats.spawned++;
      return b;
    }
    this.stats.refused++;
    return null;
  }

  /** Fill one slot the way the original initialises a bullet. */
  private arm(b: Bullet, p: ShotPattern, x: number, y: number, angle: number, speed: number): void {
    b.active = true;
    b.state = BULLET_LIVE;
    b.tag = p.tag ?? 'enemy';
    b.type = p.type;
    b.color = p.color;
    b.angle = angle;
    b.speed = speed;
    // `:183-184`: velocity launches at `speed * g_EclGameTimeScale`, while the
    // raw `+0xD68` keeps the unscaled figure the handlers renormalise from.
    b.vx = Math.cos(angle) * (speed * this.timeScale);
    b.vy = Math.sin(angle) * (speed * this.timeScale);
    b.x = x;
    b.y = y;
    b.radius = p.radius;
    b.fieldW = p.halfSize * 2;
    b.fieldH = p.halfSize * 2;
    b.damage = 1;
    b.lifetime = 0;
    b.grazed = false;
    b.hitLatch = false;
    b.touchedPlayer = false;
    b.hold = 0;
    b.oob = 0;
    b.animLeft = 0;
    b.tfFlags = p.transformFlags >>> 0;
    b.tfActive = 0;
    b.tfRecords = p.records;
    b.tfIndex = p.startIndex;
    if (p.records.length > 0) this.stats.recorded++;
    b.tSound = p.transformSound;
    b.age = 0;
    b.age2 = 0;
    b.h1 = 0;
    b.h10t = 0;
    b.h10ax = 0;
    b.h10ay = 0;
    b.h10dur = 0;
    b.h20t = 0;
    b.h20ds = 0;
    b.h20da = 0;
    b.h20dur = 0;
    b.h40t = 0;
    b.h40s = 0;
    b.h40a = 0;
    b.h40dur = 0;
    b.h40rep = 0;
    b.h40cnt = 0;
    b.hBounceSpeed = 0;
    b.hBounceDone = 0;
    b.hBounceMax = 0;
    b.hWait = 0;
    b.hWrap = 0;
    // Shot flags 2/4/8 put the bullet through an appearing animation instead of
    // dropping it in hot: it starts four frames back along its own velocity and
    // walks in at a fraction of its speed, which is what keeps a bullet spawned
    // on top of the ship from being unavoidable.
    const appear = b.tfFlags & SF_APPEAR;
    if (appear !== 0) {
      b.state = (appear & 2) !== 0 ? 2 : (appear & 4) !== 0 ? 3 : 4;
      b.animLeft = p.appearFrames;
      b.x -= b.vx * 4;
      b.y -= b.vy * 4;
    }
  }

  /**
   * Advance every live bullet by one frame.
   *
   * `frozen` is Sakuya's stopped clock: retail gates only the position
   * integration on `g_EclScriptedGlobalUpdateFreeze` (`BulletManager.cpp:853`), so
   * an armed transform keeps walking its timers and the stopped bullets still
   * turn. That is what makes the clock bomb's wall re-enter motion on exactly the
   * heading it was aiming at.
   *
   * `world` is what the handlers need: the ship for the homing and fork records,
   * the rng for the random aim modes, and the sound sink.
   */
  tick(frozen = false, world: BulletWorld | null = null): void {
    const w: BulletWorld = world ?? BLANK_WORLD;
    for (const b of this.bullets) {
      if (!b.active) continue;
      if (b.tag === 'player') {
        // The player's own shots are not part of the transform machine.
        b.x += b.vx;
        b.y += b.vy;
        b.lifetime++;
        if (this.outOfField(b)) b.active = false;
        continue;
      }
      if (b.state === BULLET_LIVE) {
        advanceShotRecords(b, w, this);
        if (!b.active) continue;
        const armedBefore = b.tfActive;
        runShotHandlers(b, w);
        if (armedBefore !== 0) this.stats.handlerFrames++;
        if (b.hold > 0) b.hold--;
        if (b.state === BULLET_LIVE) {
          if (!frozen) {
            b.x += b.vx;
            b.y += b.vy;
          }
          b.age++;
          b.age2++;
        } else {
          b.age++;
        }
      }
      if (b.state === BULLET_DYING) {
        b.x += b.vx / 2;
        b.y += b.vy / 2;
        if (--b.animLeft <= 0) {
          b.active = false;
          b.state = 0;
          continue;
        }
      } else if (b.state > BULLET_LIVE) {
        const fraction = b.state === 2 ? 0.5 : b.state === 3 ? 1 / 2.5 : 1 / 3;
        b.x += b.vx * fraction;
        b.y += b.vy * fraction;
        b.age2--;
        if (--b.animLeft <= 0) b.state = BULLET_LIVE;
      }
      if (b.hold <= 0) {
        if (this.outOfField(b)) {
          if ((b.tfActive & OOB_GRACE_HANDLERS) !== 0) {
            if (++b.oob >= OOB_GRACE) {
              b.active = false;
              b.state = 0;
              continue;
            }
          } else if (b.oob === 0) {
            b.active = false;
            b.state = 0;
            continue;
          } else {
            b.oob--;
          }
        } else {
          b.oob = 0;
        }
      }
      b.lifetime++;
    }
  }

  /**
   * `GameManager::IsWithinPlayfield`, measured from the sprite's own size rather
   * than a fixed margin: a 48px eyeball is culled the moment its far edge clears
   * the frame, and a pellet keeps going a few pixels further.
   */
  private outOfField(b: Bullet): boolean {
    return outsidePlayfield(b.x, b.y, b.fieldW, b.fieldH);
  }

  /** `BulletManager::RemoveAllBullets` with a mode that is not 4: the slot is
   *  zeroed on the spot, and the host turns the bullet into an item. */
  clearByTag(tag: 'enemy' | 'player'): number {
    let n = 0;
    for (const b of this.bullets) {
      if (!b.active || b.tag !== tag) continue;
      b.active = false;
      b.state = 0;
      n++;
    }
    return n;
  }

  /**
   * `BulletManager::RemoveBulletsInRadius` (ECL op 161), which also zeroes the
   * slot outright: no fade, because the bullet becomes a point on the spot.
   */
  clearInRadius(cx: number, cy: number, radius: number): number {
    const r2 = radius * radius;
    let n = 0;
    for (const b of this.bullets) {
      if (!b.active || b.state === BULLET_DYING) continue;
      const dx = b.x - cx;
      const dy = b.y - cy;
      if (dx * dx + dy * dy > r2) continue;
      b.active = false;
      b.state = 0;
      n++;
    }
    return n;
  }

  /**
   * One bullet caught by a cancel slot of `Player::FUN_00449ff0`.
   *
   * Retail does not zero the slot here the way ECL op 161 does: the bullet goes to
   * state 5, which is the little 点 animation the field then collects, and the host
   * drops `bulletCancelItemType` on the spot (`BulletManager.cpp:942-959`, and the
   * same shape in `RemoveAllBullets` at `:498-520`). Two things keep a bullet out of
   * it: the `0x1000` shot flag (`SF_NO_CANCEL`, tested in the same `if`), and being
   * the ship's own shot -- only the enemy channel is walked by that switch.
   */
  private cancelOne(b: Bullet): boolean {
    if (!b.active || b.tag !== 'enemy') return false;
    if (b.state === BULLET_DYING) return false;
    if ((b.tfFlags & SF_NO_CANCEL) !== 0) return false;
    this.beginDeath(b);
    return true;
  }

  /** The `slot->radius != 0` branch of `FUN_00449ff0`: a circle. */
  cancelInCircle(cx: number, cy: number, radius: number): number {
    const r2 = radius * radius;
    let n = 0;
    for (const b of this.bullets) {
      const dx = b.x - cx;
      const dy = b.y - cy;
      if (dx * dx + dy * dy > r2) continue;
      if (this.cancelOne(b)) n++;
    }
    return n;
  }

  /**
   * The rectangle branch of `FUN_00449ff0` (`Player::FUN_0044de60`): `w * h` about
   * (cx, cy), rotated by `angle` when the card gives the slot a facing.
   */
  cancelInRect(cx: number, cy: number, w: number, h: number, angle = 0): number {
    const halfW = w / 2;
    const halfH = h / 2;
    let n = 0;
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    for (const b of this.bullets) {
      const dx = b.x - cx;
      const dy = b.y - cy;
      const rx = angle === 0 ? dx : dx * cos - dy * sin;
      const ry = angle === 0 ? dy : dx * sin + dy * cos;
      if (Math.abs(rx) > halfW || Math.abs(ry) > halfH) continue;
      if (this.cancelOne(b)) n++;
    }
    return n;
  }

  /** `BulletManager::RemoveAllBullets(4)`: every live enemy bullet turns into a point. */
  cancelAllEnemy(): number {
    let n = 0;
    for (const b of this.bullets) if (this.cancelOne(b)) n++;
    return n;
  }

  /** Count of live bullets, whatever their state. */
  get activeCount(): number {
    let n = 0;
    for (const b of this.bullets) if (b.active) n++;
    return n;
  }

  /** Count of live enemy bullets that can actually hurt the ship. */
  get collidableCount(): number {
    let n = 0;
    for (const b of this.bullets) if (b.active && isLive(b) && b.tag === 'enemy') n++;
    return n;
  }

  /** Get all active bullets (for rendering). */
  getActive(): Bullet[] {
    return this.bullets.filter((b) => b.active);
  }

  /**
   * Legacy positional spawn, for hosts that describe one bullet at a time rather
   * than a whole shot pattern. It arms the same slot the launcher does.
   */
  spawn(
    x: number,
    y: number,
    angle: number,
    speed: number,
    type = 0,
    color = 0,
    radius = 3,
    damage = 1,
    tag: 'enemy' | 'player' = 'enemy',
  ): Bullet | null {
    const b = this.launch(simplePattern({ type, color, radius, tag }), x, y, angle, speed);
    if (b) b.damage = damage;
    return b;
  }

  /** Start a bullet's death animation; used by the collision pass. */
  beginDeath(b: Bullet): void {
    b.state = BULLET_DYING;
    b.animLeft = DEATH_ANIM_FRAMES;
    b.tfActive = 0;
  }
}

/** A world for hosts that never supply one, e.g. unit tests of the pool alone. */
const BLANK_WORLD: BulletWorld = {
  playerX: 0,
  playerY: 0,
  rng: { randomF32InRange: (range: number) => Math.random() * range },
  radiusFor: () => 3,
  sizeFor: () => 8,
  onSound: () => {},
};
