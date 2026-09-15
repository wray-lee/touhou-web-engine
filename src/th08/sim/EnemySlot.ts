/**
 * One enemy slot in the 480-entry pool (EnemyManager.enemies[481]).
 *
 * This is the concrete implementation of EnemyCtx that the translated
 * ECL generators write to. It holds the register file, the position,
 * the generator instance, and the per-frame update state.
 */

import type { EnemyCtx } from '../danmaku/EnemyCtx';
import { packLaser, packShot, type LaserDescriptor, type ShotDescriptor } from '../danmaku/ShotDescriptor';
import type { GameState } from './GameState';
import { PLAYFIELD_W, PLAYFIELD_H } from './Playfield';
import type { BulletPool } from './BulletPool';
import type { SeTick } from './BulletTransform';
import type { LaserPool } from './LaserPool';
import type { EnemyManager } from './EnemyManager';
import type { ItemPool } from './ItemPool';
import type { EffectHandle, EffectPool } from './EffectPool';
import { isLastSpellCard } from './LastSpellCards';
import { AnmVm } from '../../engine/anm/AnmVm';
import type { AnmPack } from '../../engine/anm/AnmPack';
import { normalizeAngle } from '../core/math';
import { EclInterpolator, REG_POS_X, REG_POS_Y, REG_POS_Z, type InterpWorld } from './EclInterpolator';
import {
  DEFAULT_APPEAR_FRAMES,
  SHOT_RECORD_SLOTS,
  blankShotRecords,
  launchPattern,
  simplePattern,
  type BulletWorld,
  type ShotPattern,
  type ShotRecord,
} from './BulletTransform';
import { damageOrbThreshold } from './ShotDamage';

/** One coloured segment of a boss life bar (ECL op 158 SETLIFEBARSLICE). */
export interface GaugeSlice {
  start: number;
  stop: number;
  /** Packed RGB, or -1 for the retail default gradient. */
  color: number;
}

/** One-shot visual request emitted by an ECL effect opcode. */
export interface SlotFx {
  kind: 'burst' | 'aura';
  x: number;
  y: number;
  angle: number;
  color: number;
  scale: number;
  /** ANM script id the original would have played. */
  script: number;
}

/**
 * One spell card as the two ECL drivers ended it. `captured` is the case that
 * pays; a card whose clock ran out is a miss, and the time left on the plate at
 * the break decides the reward, exactly like `Spellcard::EndSpell`.
 */
export interface SpellResult {
  name: string;
  owner: string;
  /** Bonus still standing at the break — what the capture is worth. */
  bonus: number;
  /** Bonus the card opened with, for the practice screen's best-of table. */
  fullBonus: number;
  /** Countdown length the card declared (`Spellcard::timer114`). */
  timerFrames: number;
  /** Frames left on the clock at the break (`Spellcard::timer108`). */
  remainingFrames: number;
  /** Frames the card was up before it ended. */
  elapsedFrames: number;
  /** Op 155: this countdown never charges a card, so capture pays flat. */
  noTimeoutPenalty: boolean;
  captured: boolean;
  /**
   * `Spellcard::flags` bit 5: the id was in `g_LastSpellNumbers`, so a miss says
   * "Last Spell Failed" instead of "Spell Bonus Failed" (`Spellcard.cpp:1209`).
   */
  isLastSpell: boolean;
}

/**
 * Register file private to one coroutine.
 *
 * A th08 enemy can run several ECL subs at once (`callSubAlloc`), and each of
 * them keeps its own f/i/ci/param registers while sharing the position, HP and
 * movement state of the enemy. Swapping this bank in around `next()` gives
 * exactly that: no cross-talk between lanes, one visible entity.
 */
type RegBank = {
  f: number[];
  ef: number[];
  i: number[];
  ei: number[];
  ci: number[];
  cxi: number[];
  cxf: number[];
  cf: number[];
};

/** A concurrently running `callSubAlloc` coroutine. */
interface Lane {
  generator: Generator<number, void, void>;
  waitFrames: number;
  regs: RegBank;
  dead: boolean;
}

/** Lane 0 is the enemy's own script, so lanes 1..3 are extra. */
const MAX_LANES = 4;

/**
 * Fallback collision radius for a bullet whose type the host cannot resolve.
 *
 * Retail sizes the circle from the loaded `etama` sprite (`BulletManager.cpp`
 * `AddedCallback` classifies every type by `loadedSprite->heightPx`), so the
 * host injects that table through `bulletRadiusFor`; this is the middle of
 * retail's range for the types that slip past it.
 */
const BULLET_HIT_RADIUS = 4;

/**
 * `SOUND_FAMILIAR_SPAWN` (`SoundPlayer.hpp:56`, index 0x24): the summon cue ops
 * 90..92 play at the parent's position, even when the launch itself is refused.
 */
const SOUND_FAMILIAR_SPAWN = 0x24;

/** `EffectManager::SpawnEffect00425B70(0x20, …)`: the flash a familiar arrives in. */
const EFFECT_FAMILIAR_SPAWN = 0x20;

/**
 * The register tables live in `core/EclRegisters.ts` so the translator can read
 * them without importing the sim layer; they are re-exported here because that
 * is where the slot that resolves them has always advertised them from.
 */
import {
  ECL_GAME_TIME_SCALE,
  FLOAT_FIELD_BY_ID,
  INT_FIELD_BY_ID,
  WRITABLE_FLOAT_FIELD_BY_ID,
} from '../core/EclRegisters';

export { ECL_GAME_TIME_SCALE, FLOAT_FIELD_BY_ID, INT_FIELD_BY_ID, WRITABLE_FLOAT_FIELD_BY_ID };

/**
 * One write the slot refused, or one motion op that got handed a non-finite
 * operand. The pool's transforms and life are deliberately not allowed to hold
 * `NaN`: see the comment on `_px`.
 */
export interface SlotRefusal {
  /** Guard that fired: `posX`, `hp`, `moveArc`, `linkChild`, ... */
  op: string;
  /** Index in the 480-entry pool. */
  slot: number;
  /** ECL sub the slot is running; with `slot` this names the instruction. */
  sub: number;
  /** `enemy+0x2D88` frame counter, so a sweep can say *when*. */
  timer: number;
  /** The operands that were refused. */
  args: number[];
  /** Caller chain trimmed to the frames that identify the offending op. */
  at: string;
}

/** Refusals since the last drain, capped so one bad stage cannot flood the log. */
const REFUSALS: SlotRefusal[] = [];
const REFUSAL_CAP = 512;

/**
 * Take and clear the refusal log.
 */
export function drainSlotRefusals(): SlotRefusal[] {
  const out = REFUSALS.slice();
  REFUSALS.length = 0;
  return out;
}

export class EnemySlot implements EnemyCtx {
  // --- Active flag ---
  active = false;
  slotIndex = 0;

  // --- Float registers ---
  f0 = 0;
  f1 = 0;
  f2 = 0;
  f3 = 0;
  f4 = 0;
  f5 = 0;
  f6 = 0;
  f7 = 0;
  ef0 = 0;
  ef1 = 0;
  ef2 = 0;
  ef3 = 0;
  ef4 = 0;
  ef5 = 0;
  ef6 = 0;
  ef7 = 0;

  // --- Int registers ---
  i0 = 0;
  i1 = 0;
  i2 = 0;
  i3 = 0;
  i4 = 0;
  i5 = 0;
  i6 = 0;
  i7 = 0;
  ei0 = 0;
  ei1 = 0;
  ei2 = 0;
  ei3 = 0;
  ei4 = 0;
  ei5 = 0;
  ei6 = 0;
  ei7 = 0;

  // --- Context registers ---
  ci0 = 0;
  ci1 = 0;
  ci2 = 0;
  ci3 = 0;
  cxi0 = 0;
  cxi1 = 0;
  cxi2 = 0;
  cxi3 = 0;
  cxf0 = 0;
  cxf1 = 0;
  cxf2 = 0;
  cxf3 = 0;
  /**
   * `context + 0x68` / `+ 0x6C` (registers 0x276e / 0x276f): the two spare floats
   * that sit between `ci0..3` (+0x58) and `cxi0..3` (+0x70). Scripts use them
   * as a scratch point -- `ecldata1` sub 38 parks an offset sprite position in
   * them to measure a bearing -- and they are copied into a familiar with the
   * rest of the 0x18..+0x90 context block.
   */
  cf0 = 0;
  cf1 = 0;

  // --- Call parameters ---
  //
  // These are not a second register file. Retail reads `param0..3` out of the
  // call block by value (`EclOperandsInt.cpp:103-110`) and `cxi0..3`/`cxf0..3`
  // out of the same bytes through the context pointer (`:63-66`, `:99-102`), and
  // `CallSubOnEnemy` closes the loop by storing the 0x20-byte
  // `EclCallParameterCopy` (`EclDependencies.cpp:476`) at `context + 0x70`
  // (`:499-502`) — which is precisely where `CONTEXT + 0x70`/`+ 0x80` keeps
  // `cxi0..3` and `cxf0..3`, because `EclDependencies.cpp:534` pins the context
  // at `enemy + 0x7f8`. The caller writes `paramN`, the callee reads it back as
  // `cxiN`, and there is only ever one dword between them. Stage 1's 蛍符
  // familiars need exactly that: `ecldata1` sub 38 sets `param0 = 120` and
  // `param1 = 60` before calling sub 39, which divides the angle spans by
  // `cxi0` and hands `cxi1` to the child as its HP.
  get param0(): number {
    return this.cxi0;
  }
  set param0(v: number) {
    this.cxi0 = v;
  }
  get param1(): number {
    return this.cxi1;
  }
  set param1(v: number) {
    this.cxi1 = v;
  }
  get param2(): number {
    return this.cxi2;
  }
  set param2(v: number) {
    this.cxi2 = v;
  }
  get param3(): number {
    return this.cxi3;
  }
  set param3(v: number) {
    this.cxi3 = v;
  }
  get fparam0(): number {
    return this.cxf0;
  }
  set fparam0(v: number) {
    this.cxf0 = v;
  }
  get fparam1(): number {
    return this.cxf1;
  }
  set fparam1(v: number) {
    this.cxf1 = v;
  }
  get fparam2(): number {
    return this.cxf2;
  }
  set fparam2(v: number) {
    this.cxf2 = v;
  }
  get fparam3(): number {
    return this.cxf3;
  }
  set fparam3(v: number) {
    this.cxf3 = v;
  }

  // --- Position / velocity ---
  //
  // `_px`, `_py`, `_pz` and the life pair below sit behind accessors on
  // purpose: that is not defensive padding, it is what keeps a slot alive.
  // A shipped script can hand the transform a `NaN` -- dividing an angle span
  // by a zero `cxi0` is the easy way -- and an ordinary field then *keeps* it.
  // Once `_x` is `NaN` the slot is unrecoverable: `NaN | 0` reads back as HP 0
  // so nothing is drawn, `applyDamage` has no bar left to finish, and the
  // bounds cull never fires because its comparison is false. An invisible,
  // unkillable enemy that never leaves the pool is exactly the
  // "killed the mob but its sprite stayed behind" bug.
  // Refusing the write holds the last good value, and `drainSlotRefusals`
  // reports the op so the bad register still gets fixed upstream instead of
  // being quietly smothered.
  private _px = 0;
  private _py = 0;
  private _pz = 0;
  get _x(): number {
    return this._px;
  }
  set _x(v: number) {
    this._px = this.finiteNumber('posX', v, this._px);
  }
  get _y(): number {
    return this._py;
  }
  set _y(v: number) {
    this._py = this.finiteNumber('posY', v, this._py);
  }
  get _z(): number {
    return this._pz;
  }
  set _z(v: number) {
    this._pz = this.finiteNumber('posZ', v, this._pz);
  }

  // --- HP ---
  private _ph = 0;
  private _pmaxHp = 0;
  get _hp(): number {
    return this._ph;
  }
  set _hp(v: number) {
    this._ph = this.finiteNumber('hp', v, this._ph);
  }
  get _maxHp(): number {
    return this._pmaxHp;
  }
  set _maxHp(v: number) {
    this._pmaxHp = this.finiteNumber('maxHp', v, this._pmaxHp);
  }

  // --- Bounds (auto-removal) ---
  /**
   * `enemy+0x2D70 / +0x2D74`, written by op 77. Retail stores the *full* extent --
   * `PlayerBuildAabb` (`Player.cpp:3501-3507`) halves it -- and
   * `EnemyManager.cpp:172` files 24 into it at spawn, so 24 is the default here too.
   */
  private boundsW = 24;
  private boundsH = 24;
  /**
   * `enemy+0x2D7C / +0x2D80`, the *secondary* hitbox armed by op 78. Retail keeps it
   * separate from the op-77 box and runs a second `FUN_00451670` pass against it
   * (`EnemyManagerUpdate.cpp:654-666`), which is how a long boss can be shot through
   * its body and its wings at once. Zero on both axes means "no secondary box".
   */
  private altBoundsW = 0;
  private altBoundsH = 0;

  // --- ANM state ---
  anmScript = 0;
  /**
   * The six primary scripts, in retail argument order: straight, turn-left,
   * turn-right, back-to-straight-from-left, back-to-straight-from-right, spare.
   * `SetPrimaryAnmScripts` (`EclDependencies.cpp:462-472`) files them at
   * +0x3332, +0x3338, +0x333A, +0x3334, +0x3336 and +0x333C - deliberately not
   * in address order, so the slot order here is the operand order.
   */
  anmScripts: number[] = [-1, -1, -1, -1, -1, -1];
  /** `+0x332E`: 0 straight, 1 left, 2 right, -1 for the 0xFF "never set" mark. */
  anmDirection = -1;
  /**
   * Bit 2 of `+0x3328`. Ops 58-61 set it, which retargets every later script id
   * from `enemy.anm` onto the stage's own `stgNNenm.anm` (`FUN_00423150` picks
   * the pack off the same bit at `EclDependencies.cpp:853-855`).
   */
  anmUseStagePack = false;
  /**
   * Retail runs one ANM script per enemy alongside its ECL: the sprite cycle,
   * the spin, the scale-in and the fade all live in that bytecode. When a pack
   * is wired this slot drives a real VM instead of approximating from the
   * lifted frame table.
   */
  private anm: AnmVm | null = null;
  /** Bytecode store handed down by the manager; null keeps the legacy path. */
  anmPack: AnmPack | null = null;
  /** The stage's own `stgNNenm.anm`, used while `anmUseStagePack` is set. */
  anmPackAlt: AnmPack | null = null;
  /** Manifest name of the stage pack, so the adapter can find its atlas page. */
  anmStageName = '';
  /**
   * Collision radius in pixels for an ECL bullet type, supplied by the host so
   * the sim stays free of asset-table knowledge. Null keeps `BULLET_HIT_RADIUS`.
   */
  bulletRadiusFor: ((type: number) => number) | null = null;
  /**
   * Drawn half-size for an ECL bullet, which is what retail's off-field test
   * measures with: a 48px eyeball leaves the array sooner than a pellet.
   */
  bulletSizeFor: ((type: number, color: number) => number) | null = null;
  /** Sprite cell the ANM script asked for, or null when it draws nothing. */
  anmSprite: number | null = null;
  /** Interpolated draw scale and alpha coming out of the same script. */
  anmScale = 1;
  /** Sign of the script's X scale: the two turn cycles are one sprite mirrored. */
  anmFlipX = false;
  anmAlpha = 255;
  /**
   * `EMUF1_HAS_BEEN_IN_BOUNDS` (bit 24 of 0x3324): set the first frame the
   * sprite rectangle overlaps the playfield. The off-screen retire below only
   * arms after this, which is what lets the scripts spawn bosses and helpers
   * above the top edge without them vanishing on their first step.
   */
  hasBeenInBounds = false;
  /**
   * `EMUF1_ALLOW_OFFSCREEN` (`0x3324` bit 28, the same bit ops 79/80/81 address as
   * `op79Bit28`): opt out of the off-screen retire. Nothing else in the script
   * layer can keep a helper alive above the top edge, so this is what a launcher
   * node relies on to survive its own entry movement.
   */
  get allowOffscreen(): boolean {
    return (this.flags & 0x10000000) !== 0;
  }
  /**
   * `EMUF1_NO_SPRITE` (`0x3324` bit 4): the slot stays out of the draw list
   * entirely (`EnemyManagerUpdate.cpp:985-993` buckets a live enemy for drawing
   * only while this bit is clear). Scripts reach it through op 79 with `v & 8`,
   * op 80 with `v & 8` to set it and op 81 with `v & 8` to clear it.
   */
  get noSprite(): boolean {
    return (this.flags & 0x10) !== 0;
  }
  /**
   * `LinkedChildFlags1::linkedChild` (`EclRunLow.inl:134`, bit 8 of 0x3324): this
   * slot was launched by one of ops 90..92 and belongs to `parentSlotIndex`. A
   * linked child takes no player collision, hands half of every hit it absorbs to
   * its parent's life bar, and cannot launch children of its own.
   */
  linkedChild = false;
  /** `enemy+0x2DA4`: the slot that launched this familiar, or -1 for none. */
  parentSlotIndex = -1;
  /**
   * `EMUF1_INHERIT_PARENT_POSITION` (set by op 92, read back as
   * `copyFollowVelocity` at `EnemyManagerUpdate.cpp:492-500`): the familiar's own
   * coordinates become an offset and it rides on top of the parent's position.
   */
  followParentPosition = false;
  /** `enemy+0x3380`: linked children currently hanging off this slot. */
  childCount = 0;
  /** `enemy+0x2D34` for a following child: its own, parent-relative position. */
  private ownX = 0;
  /** Own position for Y (`enemy+0x2D34`). */
  private ownY = 0;
  /** `enemy+0x2E08`: score paid out when this slot dies (retail default 100). */
  scoreValue = 100;
  /**
   * `enemy+0x3304`: item type this slot drops when it dies. -2 (the value ops
   * 90..92 pass for a familiar) means nothing falls out of it.
   */
  dropType = -2;
  /**
   * `EMUF1_SUPPRESS_DEATH_EFFECTS` (`0x3324` bit 10): set by the card-capture chain
   * payoff right before the wipe, so a familiar that is already bursting into time
   * orbs does not also play its own death effect (`EnemyManager.cpp:287`).
   */
  get deathEffectsSuppressed(): boolean {
    return (this.flags & 0x400) !== 0;
  }
  set deathEffectsSuppressed(value: boolean) {
    this.flags = value ? this.flags | 0x400 : this.flags & ~0x400;
  }
  /**
   * `enemy+0x3308`: extra `ITEM_POINT` grants queued to fall out of this slot when
   * it dies (`EnemyManager.cpp:854-863`), written by timeline ops 11/12.
   */
  pointDrops = 0;
  /**
   * `enemy+0x330C`: the same queue for `ITEM_POWER_SMALL`, which turns into
   * `ITEM_POINT` once power is capped at 128 (`EnemyManager.cpp:846-849`).
   */
  powerDrops = 0;

  // --- Angle / anchor registers (ECL 0x2755..0x2761) ---
  /**
   * Sprite facing. Retail only feeds the drawn rotation from the heading for the
   * trail VMs (`enemy+0x3324` bit 25), so this stays a field of its own that the
   * ANM VM owns; the ECL heading is `heading` below.
   */
  rotAngle = 0;
  /** Per-frame spin applied to `rotAngle` while no ANM VM owns the sprite. */
  rotationRate = 0;
  /** `enemy+0x2DD0` (register 0x275a): tween origin armed by ops 64/66/72/73. */
  originX = 0;
  /** Tween origin for Y (`enemy+0x2DD4`, 0x275b). */
  originY = 0;
  /** Tween origin for Z (`enemy+0x2DD8`, 0x275c). */
  originZ = 0;

  // --- Danmaku plan ---
  /** ECL sub id this slot was spawned with, the key into the shot tables. */
  subId = 0;

  // --- Flags ---
  /** `enemy+0x3324`. Ops 79/80/81 are the only script writers; see `noSprite`. */
  flags = 0;
  /** `enemy+0x3328`. Only the op 79/80/81 selector and op 83's flash bit. */
  flags2 = 0;
  invulnerable = false;
  damageEnabled = true;
  /**
   * `EMUF1_NO_DAMAGE_DURING_STOP` (`enemy+0x3324` bit 31), owned by op 183
   * (`EclRunHigh.inl:1048-1050`). While Sakuya's clock is stopped the whole combat
   * pass is skipped for a slot that armed this (`EnemyManagerUpdate.cpp:614-617`),
   * which is how her cards keep a boss invulnerable for the duration of the freeze.
   */
  noDamageDuringStop = false;
  /**
   * `EMUF1_PAUSE_TIMER` (`enemy+0x3324` bit 30), owned by op 173
   * (`EclRunHigh.inl:1045-1047`) and also armed by op 176 (`:1066`). While a player
   * card is playing (`Player+0xFDC`) a slot with this bit set does not run its ECL at
   * all (`EnemyManagerUpdate.cpp:466-472`), which is how a boss holds its pattern
   * still for the length of your bomb instead of firing into the freeze.
   */
  pauseTimer = false;
  /**
   * `enemy+0x5354`, the freeze timer op 160 arms. While it runs, a boss takes a
   * ninth of the frame's damage and everything else takes none
   * (`EnemyManagerUpdate.cpp:710-716`); it counts down once per frame at `:982`.
   */
  freezeFrames = 0;
  /**
   * `enemy+0x2E10`, the damage accumulator behind `Player::FUN_00451670`'s
   * 时符-for-damage exchange. `EnemyManager.cpp:216` files the threshold itself in
   * at spawn, so the first orb is one full threshold of damage away, not two.
   */
  hitAccumulator = 0;
  /** `enemy+0x3354`: this frame's applied damage, cleared before each pass. */
  lastFrameDamage = 0;

  // --- Timer ---
  private _timer = 0;

  // --- Generator ---
  generator: Generator<number, void, void> | null = null;
  waitFrames = 0;
  /** Extra `callSubAlloc` coroutines running alongside the main script. */
  private lanes: (Lane | null)[] = [null, null, null, null];
  /** Value parked by op 2; some scripts read it back through the timer. */
  secondaryTime = 0;

  // --- Back-reference to game state ---
  private gs: GameState;

  // External references wired by EnemyManager
  bulletPool: BulletPool | null = null;
  /** Lasers share the pool plumbing but not the bullet slots: retail keeps 0x100
   * of them beside the bullets, addressed by their own stride. */
  laserPool: LaserPool | null = null;
  enemyManager: EnemyManager | null = null;
  itemPool: ItemPool | null = null;
  /**
   * Retail's effect pool, injected by the host that owns the ANM tables. Ops
   * 128/139/140/174 address it by template id; without it the slot falls back to the
   * one-shot `fxRequests` notes the placeholder art reads.
   */
  effectPool: EffectPool | null = null;
  /** `enemy+0x5360[0..0x53c0]`: this enemy's orbit effects, faded when it dies. */
  private orbitEffects: EffectHandle[] = [];
  /** `enemy+0x53C8`: the single effect op 174 keeps replacing. */
  private youkaiEffect: EffectHandle | null = null;
  /**
   * `enemy+0x3310`/`+0x3311`: the two `DeathAnm` bytes ECL op 138 owns. Retail reads
   * them on every death (`EnemyManagerUpdate.cpp:884-888`), and because no shipped
   * TH08 script uses op 138 they stay at the 0 written on spawn
   * (`EnemyManager.cpp:185-186`), which is why every corpse pays effect 0 and effect 4.
   */
  private deathEffect1 = 0;
  private deathEffect2 = 0;
  playerRef: { x: number; y: number } | null = null;

  // --- Retail motion model (Enemy::FUN_00422c40, EnemyManager.cpp:49-148) ---
  /**
   * `enemy+0x2D4C`: the per-frame velocity the integrator adds to the position.
   * The four interpolation modes are the only writers, which is what lets a
   * script retarget a heading while a tween is still in flight.
   */
  private motorX = 0;
  /** Motion velocity for Y (`enemy+0x2D4C`). */
  private motorY = 0;
  /** `enemy+0x2D40`: parent offset; the drawn position is pos + offset. */
  private parentOffX = 0;
  /** Parent offset for Y (`enemy+0x2D40`). */
  private parentOffY = 0;
  /** `enemy+0x2D94` (register 0x2755): heading of polar motion. */
  private heading = 0;
  /** `enemy+0x2D98` (0x2756): per-frame heading delta. */
  headingVel = 0;
  /** `enemy+0x2DA8` (0x2757): speed along the heading. */
  moveSpeed = 0;
  /** `enemy+0x2DAC` (0x2758): per-frame speed delta. */
  speedAccel = 0;
  /** `enemy+0x2D9C` (0x275d): orbit angle. */
  orbitAngle = 0;
  /** `enemy+0x2DA0` (0x275e): per-frame orbit angle delta. */
  orbitAngleVel = 0;
  /** `enemy+0x2DB0` (0x2759): orbit radius. */
  orbitRadius = 0;
  /** `enemy+0x2DB4`: per-frame orbit radius delta. */
  orbitRadiusVel = 0;
  /** `enemy+0x2DC4` (0x275f): tween displacement. */
  tweenDX = 0;
  /** `enemy+0x2DC8` (0x2760): tween displacement for Y. */
  tweenDY = 0;
  /** `enemy+0x2DCC` (0x2761): the third component of the same tween vector. */
  tweenDZ = 0;
  /**
   * `enemy+0x3354` (register 0x2763): the damage the last hit dealt. Retail
   * clears it when the slot is filed (`EnemyManagerUpdate.cpp:640`) and stores
   * it on every hit (`:719`), which is what lets a script branch on how hard it
   * was just struck.
   */
  lastDamage = 0;
  /**
   * `enemy+0x2D64` (registers 0x2765..0x2767): the displacement the previous
   * frame integration actually produced, after the clamp box and the mirror bit
   * have had their say. Read-only for scripts -- `ResolveFloatLValue` has no
   * case for it -- and the one honest way a pattern can measure its own speed:
   * `ecldata1` sub 32 multiplies it by the Hermite window to get the tangent.
   */
  private observedX = 0;
  /** Observed displacement for Y (`enemy+0x2D68`). */
  private observedY = 0;
  /** Observed displacement for Z (`enemy+0x2D6C`). */
  private observedZ = 0;
  /** `enemy+0x2D58`: where the integrator found the slot at the start of the frame. */
  private lastFrameX = 0;
  /** Last-frame position for Y (`enemy+0x2D58`). */
  private lastFrameY = 0;
  /** Last-frame position for Z (`enemy+0x2D58`). */
  private lastFrameZ = 0;
  /** `enemy+0x2DDC`: motion countdown. */
  private motionTimer = 0;
  /** `enemy+0x2DE8`: duration the countdown was armed with. */
  private motionDuration = 0;
  /** `enemy+0x3340`: left edge of the clamp box op 75 arms. */
  private clampMinX = 0;
  /** `enemy+0x3344`: minimum-Y edge of the clamp box. */
  private clampMinY = 0;
  /** `enemy+0x3348`: right edge of the clamp box. */
  private clampMaxX = 0;
  /** `enemy+0x334C`: maximum-Y edge of the clamp box. */
  private clampMaxY = 0;

  // Boss state
  bossLives = 0;
  bossPhase = 0;
  /**
   * The boss marker this slot holds (`enemy+0x3313`): 0 gates the timeline,
   * 1..3 are the extra seats stage 6 uses, and 255 means "not a boss".
   */
  bossMarker = 255;
  /** Retail's boss bit (`enemy+0x3324` bit 1), owned by op 127. */
  isBoss = false;
  spellTimeout = 0;
  spellHp = 0;
  dropSpecId = 0;

  // --- Boss gauge declared by the script (ops 127 / 131 / 148 / 158 / 137) ---
  /** True once the ECL gave this slot a life bar. */
  hasGauge = false;
  /** Spare bars left after the one on screen (op 148). */
  gaugePips = 0;
  /** Coloured segments keyed by slice index (op 158). */
  gaugeSlices: GaugeSlice[] = [];
  /** Spell-card countdown in frames; 0 = untimed (op 137). */
  gaugeTimerFrames = 0;
  // --- Spell-card drivers (ECL ops 130 / 132 / 133 / 134 / 153) ------------
  /**
   * HP below which life-bar `i` fires, armed by op 133 (`enemy+0x3358`).
   * -1 means disarmed, exactly like retail: crossing one clamps HP back up to
   * the threshold and hands the script to `phaseSubs[i]`.
   */
  readonly phaseThresholds: number[] = [-1, -1, -1, -1];
  /** Sub each armed life-bar phase jumps to (`enemy+0x3368`). */
  readonly phaseSubs: number[] = [-1, -1, -1, -1];
  /** Countdown length from op 134 (`enemy+0x3378`); -1 = disarmed. */
  spellTimerFrames = -1;
  /** Sub that runs when the countdown expires (`enemy+0x337C`). */
  spellTimerSub = -1;
  /** Frames already counted towards expiry (`enemy+0x2E14`). */
  spellTimerElapsed = 0;
  /** Sub that takes the place of death (op 130, `enemy+0x2CEE`); -1 = just die. */
  deathCallbackSub = -1;
  /**
   * Seconds left on the clock when this slot's card last ended
   * (`enemy+0x53CC`); the host turns it into the time-orb reward.
   */
  lastSpellSecondsLeft = 0;
  /** Op 155: this slot's countdown expiring carries no card penalty (`bit27`). */
  noTimeoutPenalty = false;
  /**
   * Retail's `EMUF2_DEATH_LATCH`: the death pass runs once and stays spent
   * until something puts HP back above zero (`EnemyManagerUpdate.cpp:761-766`).
   */
  private deathLatch = false;
  /** Points still owed by the live card (`Spellcard::bonusProgress`). */
  private cardBonusProgress = 0;
  /** Frames the live card has been up (`Spellcard::bonusCounter`). */
  private cardElapsedFrames = 0;
  /** Full countdown the live card declared (`Spellcard::timer114`). */
  private cardFrames = 0;
  /** Stops one card from paying twice when a driver and op 123 both fire. */
  private cardSettled = true;
  /** op 184: the live card's bonus is held still instead of decaying. */
  private cardBonusFrozen = false;
  /** Card outcomes produced this frame, drained into `EnemyManager.frameSpellResults`. */
  readonly spellResults: SpellResult[] = [];
  /** Sprite tint from op 100; -1 keeps the atlas colour. */
  spriteColor = -1;
  /** Secondary ANM script from op 57; -1 when unset. */
  extraAnmScript = -1;
  /** Set on the frame this slot dies so the manager emits FX once. */
  deathPending = false;
  /** Slot timer of the last life-bar break, so one frame cannot pop two. */
  private barBreakFrame = -1;
  /** One-shot visual requests queued by the effect opcodes this frame. */
  readonly fxRequests: SlotFx[] = [];
  /** Sounds requested during this frame, in order, with their positions. */
  readonly sfxRequests: SeTick[] = [];
  /** Set when the script starts an auto-playing animation (op 128 family). */
  animAuto = false;

  // --- Shot emission (ECL ops 82, 96..110) -------------------
  /** Lateral offset added to the muzzle position (retail `enemy+0x2db8`, op 110). */
  shotOriginX = 0;
  /** Vertical muzzle offset (retail `enemy+0x2dbc`). */
  shotOriginY = 0;
  /**
   * Squared distance inside which the enemy stops firing (`enemy+0x3350`, set by
   * op 82 as a pixel radius, initialised to 1024 = 32px like retail).
   */
  shotNoFireRadiusSq = 1024;
  /**
   * Bit 11 of `enemy+0x3324`, the flag the shot-transform gates at ops 96..104 read.
   *
   * Retail's only writer is `Enemy::FUN_0042c420` (`EnemyManager.cpp:972`), and that
   * function has one call site, behind `EMUF1_PRE_ECL_UPDATE` (bit 8 of the same
   * word, `EnemyManagerUpdate.cpp:475`). Nothing in the recovered sources ever sets
   * bit 8 -- the only writes to `+0x3324` are `|= 1`, `|= 0x40`, `|= 0x400`, and
   * `EnemyManager::Initialize` memsets the whole manager (`:157`) -- so the flag is
   * false for every shipped enemy and both gates are provably inert. The field stays
   * because the *rule* is real: a script that ever sets bit 8 turns it on.
   */
  youkaiForm = false;
  /** Frames between repeats of the held shot instruction (`enemy+0x3060`, op 105). */
  shotRepeatFrames = 0;
  /** Countdown towards the next replay of `heldShot`. */
  private shotRepeatTimer = 0;
  /** Bit 17 of `enemy+0x3324`: queue shots instead of firing them (ops 107/108). */
  private shotsHeld = false;
  /**
   * `0x3324` bit 18, named `spawnVariant` by `SpawnEnemy1` (`EnemyTimeline.cpp:22-42`):
   * every horizontal movement delta is negated, so a timeline can launch the same
   * entry script twice and get a left-handed and a right-handed wave
   * (`EnemyManager.cpp:1010-1013`, `:135-136`, `EclRunLow.inl:390-391`). 625 of the
   * 1563 timeline spawns in the shipped stages set it.
   */
  get mirrorX(): boolean {
    return (this.flags & 0x40000) !== 0;
  }
  set mirrorX(value: boolean) {
    this.flags = value ? (this.flags | 0x40000) >>> 0 : (this.flags & ~0x40000) >>> 0;
  }
  /** Timeline name for the same bit, which is the one `EnemyManager` arms. */
  get mirrorMovement(): boolean {
    return this.mirrorX;
  }
  set mirrorMovement(value: boolean) {
    this.mirrorX = value;
  }
  /** The raw op 96..104 operands last handed to `spawnShot`, kept for replay. */
  private heldShot: number[] | null = null;

  /**
   * The shot descriptor, which retail keeps at `enemy+0x2E24` and every shot
   * instruction reads out of. Op 111 installs its 18 transform records, op 113
   * its two sound ids, and `FUN_0042f5f0` copies both into each bullet, so the
   * records a bullet carries are the ones that were in place when it was fired.
   */
  private shotRecords: ShotRecord[] = blankShotRecords();
  /** Frozen copy handed to spawned bullets; refreshed only after op 111 writes. */
  private shotRecordsFrozen: ShotRecord[] = blankShotRecords();
  private shotRecordsDirty = true;
  private shotTransformSound = -1;
  private shotSpawnSound = 0;
  /** Reused operand vector: the launcher reads it synchronously. */
  private readonly shotPattern: ShotPattern = simplePattern();
  private bulletWorldCache: BulletWorld | null = null;

  /**
   * The eight ECL interpolators at `context + 0x9C`, which op 36 installs and the
   * tail of `RunEcl` steps. This is the machine that glides a boss between
   * positions; ops 63..78 only drive the polar producer.
   */
  private readonly interpolators = new EclInterpolator();
  private interpWorldCache: InterpWorld | null = null;
  /** Frames on which a slot ran, so a sweep can prove the tail is wired. */
  interpSteps = 0;
  /** Slots op 36 filled over this slot's lifetime. */
  interpInstalls = 0;

  constructor(gs: GameState) {
    this.gs = gs;
  }

  /**
   * Record one refused write or motion op.
   *
   * The stack is trimmed to the two frames above this file, which for a
   * translated script is the generated `subNN` function: with the ECL file and
   * sub id that is enough to read straight to the instruction. Only the first
   * `REFUSAL_CAP` events carry it, because a stage that really is poisoned
   * would otherwise spend its whole frame budget building strings.
   */
  private refuse(op: string, args: number[]): void {
    if (REFUSALS.length >= REFUSAL_CAP) return;
    const stack = new Error().stack ?? '';
    REFUSALS.push({
      op,
      slot: this.slotIndex,
      sub: this.subId,
      timer: this._timer,
      args,
      at: stack.split('\n').slice(3, 6).join(' <- '),
    });
  }

  /** Keep `value` when it is usable, otherwise hold `fallback` and report. */
  private finiteNumber(op: string, value: number, fallback: number): number {
    if (Number.isFinite(value)) return value;
    this.refuse(op, [value]);
    return fallback;
  }

  /**
   * Guard for the movement ops: a non-finite operand means the motion never
   * starts, which leaves the entity on its last sane path instead of
   * destroying it. The op name is the useful half -- it points at the register
   * that went bad, which a raw position write cannot.
   */
  private finiteArgs(op: string, ...args: number[]): boolean {
    for (const a of args) {
      if (Number.isFinite(a)) continue;
      this.refuse(op, args);
      return false;
    }
    return true;
  }

  /** Reset for reuse from the pool. */
  reset(x: number, y: number, hp: number, gs: GameState): void {
    this.active = true;
    this._x = x;
    this._y = y;
    this._z = 0;
    this.motorX = 0;
    this.motorY = 0;
    this.parentOffX = 0;
    this.parentOffY = 0;
    this.heading = 0;
    this.headingVel = 0;
    this.moveSpeed = 0;
    this.speedAccel = 0;
    this.orbitAngle = 0;
    this.orbitAngleVel = 0;
    this.orbitRadius = 0;
    this.orbitRadiusVel = 0;
    this.tweenDX = 0;
    this.tweenDY = 0;
    this.tweenDZ = 0;
    this.observedX = 0;
    this.observedY = 0;
    this.observedZ = 0;
    this.lastFrameX = x;
    this.lastFrameY = y;
    this.lastFrameZ = 0;
    this.motionTimer = 0;
    this.motionDuration = 0;
    this.clampMinX = 0;
    this.clampMinY = 0;
    this.clampMaxX = 0;
    this.clampMaxY = 0;
    this._hp = hp;
    this._maxHp = hp;
    this._timer = 0;
    this.waitFrames = 0;
    this.invulnerable = false;
    this.damageEnabled = true;
    this.flags = 0;
    this.flags2 = 0;
    this.generator = null;
    for (let k = 0; k < this.lanes.length; k++) this.lanes[k] = null;
    this.secondaryTime = 0;
    this.gs = gs;
    this.f0 = 0;
    this.f1 = 0;
    this.f2 = 0;
    this.f3 = 0;
    this.f4 = 0;
    this.f5 = 0;
    this.f6 = 0;
    this.f7 = 0;
    this.i0 = 0;
    this.i1 = 0;
    this.i2 = 0;
    this.i3 = 0;
    this.i4 = 0;
    this.i5 = 0;
    this.i6 = 0;
    this.i7 = 0;
    this.ei0 = 0;
    this.ei1 = 0;
    this.ei2 = 0;
    this.ei3 = 0;
    this.ei4 = 0;
    this.ei5 = 0;
    this.ei6 = 0;
    this.ei7 = 0;
    this.ef0 = 0;
    this.ef1 = 0;
    this.ef2 = 0;
    this.ef3 = 0;
    this.ef4 = 0;
    this.ef5 = 0;
    this.ef6 = 0;
    this.ef7 = 0;
    this.ci0 = 0;
    this.ci1 = 0;
    this.ci2 = 0;
    this.ci3 = 0;
    this.cxi0 = 0;
    this.cxi1 = 0;
    this.cxi2 = 0;
    this.cxi3 = 0;
    this.cxf0 = 0;
    this.cxf1 = 0;
    this.cxf2 = 0;
    this.cxf3 = 0;
    this.cf0 = 0;
    this.cf1 = 0;
    this.lastDamage = 0;
    this.boundsW = 24;
    this.boundsH = 24;
    this.altBoundsW = 0;
    this.altBoundsH = 0;
    this.freezeFrames = 0;
    this.lastFrameDamage = 0;
    this.noDamageDuringStop = false;
    this.pauseTimer = false;
    // `EnemyManager.cpp:216` seeds the accumulator with the threshold itself.
    this.hitAccumulator = damageOrbThreshold(gs.shotType);
    this.anmScript = 0;
    // `EnemyManager.cpp:191-193` files -1 into +0x3332/+0x3338/+0x333A on spawn,
    // which is what keeps the direction machine asleep until an op arms it.
    this.anmScripts = [-1, -1, -1, -1, -1, -1];
    this.anmDirection = -1;
    this.anmUseStagePack = false;
    this.anm?.reset();
    this.anmSprite = null;
    this.anmScale = 1;
    this.anmFlipX = false;
    this.anmAlpha = 255;
    this.hasBeenInBounds = false;
    this.linkedChild = false;
    this.parentSlotIndex = -1;
    this.followParentPosition = false;
    this.childCount = 0;
    this.ownX = x;
    this.ownY = y;
    this.scoreValue = 100;
    this.dropType = -2;
    this.pointDrops = 0;
    this.powerDrops = 0;
    this.shotOriginX = 0;
    this.shotOriginY = 0;
    this.shotNoFireRadiusSq = 1024;
    this.youkaiForm = false;
    this.shotRepeatFrames = 0;
    this.shotRepeatTimer = 0;
    this.shotsHeld = false;
    this.mirrorMovement = false;
    this.heldShot = null;
    // `EnemyManager` zeroes the enemy, and with it the shot descriptor at +0x2E24.
    this.shotRecords = blankShotRecords();
    this.shotRecordsFrozen = blankShotRecords();
    this.shotRecordsDirty = true;
    this.shotTransformSound = -1;
    this.shotSpawnSound = 0;
    // `EnemyManager` zeroes the script context, interpolators included.
    this.interpolators.reset();
    this.rotAngle = 0;
    this.rotationRate = 0;
    this.originX = x;
    this.originY = y;
    this.originZ = 0;
    this.bossLives = 0;
    this.bossPhase = 0;
    this.bossMarker = 255;
    this.isBoss = false;
    this.cardBonusFrozen = false;
    this.spellTimeout = 0;
    this.spellHp = 0;
    this.dropSpecId = 0;
    this.hasGauge = false;
    this.gaugePips = 0;
    this.gaugeSlices = [];
    this.gaugeTimerFrames = 0;
    this.spriteColor = -1;
    this.extraAnmScript = -1;
    this.deathPending = false;
    this.barBreakFrame = -1;
    this.fxRequests.length = 0;
    this.sfxRequests.length = 0;
    this.animAuto = false;
    // The slot is going back to the pool, so its handles go with it: retail NULLs
    // `enemy+0x5360[]` and zeroes the count (`EnemyManager.cpp:246-254`).
    this.orbitEffects.length = 0;
    this.youkaiEffect = null;
    // `EnemyManager.cpp:185-186` zeroes both `DeathAnm` bytes when a slot is handed
    // out, so the next enemy starts on the default effect 0 / effect 4 pair.
    this.deathEffect1 = 0;
    this.deathEffect2 = 0;
  }

  /** Reinterpret int32 bits as float32. */
  private static i2f(v: number): number {
    const buf = new DataView(new ArrayBuffer(4));
    buf.setInt32(0, v, true);
    return buf.getFloat32(0, true);
  }

  /** Fresh zeroed register bank. */
  private static blankRegs(): RegBank {
    return {
      f: [0, 0, 0, 0, 0, 0, 0, 0],
      ef: [0, 0, 0, 0, 0, 0, 0, 0],
      i: [0, 0, 0, 0, 0, 0, 0, 0],
      ei: [0, 0, 0, 0, 0, 0, 0, 0],
      ci: [0, 0, 0, 0],
      cxi: [0, 0, 0, 0],
      cxf: [0, 0, 0, 0],
      cf: [0, 0],
    };
  }

  /** Copy the slot's register fields into a bank. */
  private captureRegs(): RegBank {
    const r = EnemySlot.blankRegs();
    const fields = this as unknown as Record<string, number>;
    for (let k = 0; k < 8; k++) {
      r.f[k] = fields['f' + k];
      r.ef[k] = fields['ef' + k];
      r.i[k] = fields['i' + k];
      r.ei[k] = fields['ei' + k];
    }
    for (let k = 0; k < 4; k++) {
      r.ci[k] = fields['ci' + k];
      r.cxi[k] = fields['cxi' + k];
      r.cxf[k] = fields['cxf' + k];
      if (k < 2) r.cf[k] = fields['cf' + k];
    }
    return r;
  }

  /** Install a bank onto the slot's register fields. */
  private applyRegs(r: RegBank): void {
    const fields = this as unknown as Record<string, number>;
    for (let k = 0; k < 8; k++) {
      fields['f' + k] = r.f[k];
      fields['ef' + k] = r.ef[k];
      fields['i' + k] = r.i[k];
      fields['ei' + k] = r.ei[k];
    }
    for (let k = 0; k < 4; k++) {
      fields['ci' + k] = r.ci[k];
      fields['cxi' + k] = r.cxi[k];
      fields['cxf' + k] = r.cxf[k];
      if (k < 2) fields['cf' + k] = r.cf[k];
    }
  }

  /**
   * Hand the ECL register file to a familiar this slot is about to summon.
   *
   * `SpawnEnemy2` (`EnemyTimeline.cpp:104-107`) calls `CallEclSub` first and then
   * overwrites `context + 0x18 .. + 0x90` with the parent's own block, which is
   * exactly the 30 dwords `ResolveInt`/`ResolveFloat` name as `i0..i7` (0x18),
   * `f0..f7` (0x38), `ci0..ci3` (0x58) and `cxi0..cxi3` (0x70) plus `cxf0..cxf3`
   * (0x80). `ei0..ei7`/`ef0..ef7` are deliberately absent: they live in the Enemy
   * struct (`0x2ca8`/`0x2cc8`), outside the copied range, so a familiar always
   * starts those at zero.
   *
   * This is the only channel a summoner has to tell its familiars where to go:
   * ops 90..92 pass `(0,0)` as the position in every stage of the retail game,
   * and the parent instead writes the launch angle into `f0` and the radius into
   * `f1` right before the call (see `ecldata1.ts` sub 21, the 蛍符 familiars).
   * Without the copy the child's `moveArc(100, f0, rate, f1)` runs at speed 0 and
   * every familiar piles up on top of its boss.
   */
  inheritRegistersFrom(parent: EnemySlot): void {
    const from = parent.captureRegs();
    const to = this.captureRegs();
    for (let k = 0; k < 8; k++) {
      to.f[k] = from.f[k];
      to.i[k] = from.i[k];
    }
    for (let k = 0; k < 4; k++) {
      to.ci[k] = from.ci[k];
      to.cxi[k] = from.cxi[k];
      to.cxf[k] = from.cxf[k];
    }
    this.applyRegs(to);
  }

  /**
   * Start (lane >= 0) or stop (lane < 0 / sub < 0) an attached coroutine.
   * `callSubAlloc` is how a boss keeps moving while a helper script fires.
   */
  callSubAlloc(lane: number, sub: number) {
    const index = lane | 0;
    if (index < 0 || index >= MAX_LANES) return;
    if (sub < 0) {
      this.lanes[index] = null;
      return;
    }
    const manager = this.enemyManager;
    if (!manager) return;
    const generator = manager.makeSub(sub, this);
    if (!generator) return;
    const regs = EnemySlot.blankRegs();
    const previous = this.lanes[index];
    this.lanes[index] = { generator, waitFrames: 0, regs: previous ? previous.regs : regs, dead: false };
  }

  /** Remote variant (op 88): `lane` is the target enemy slot index. */
  callSubRemote(lane: number, sub: number) {
    this.enemyManager?.runSubOnSlot(lane | 0, sub | 0);
  }

  /** Park the secondary countdown (op 2). It is not a wait: timing comes from
   *  the instruction times themselves, so this is just a register write. */
  setSecondaryTime(frames: number) {
    this.secondaryTime = frames | 0;
  }

  /**
   * `yield e.delay(n)` — op 2 *is* the delay, so this hands the frame count
   * back to the generator while arming the secondary timer the retail VM keeps
   * alongside it.
   */
  delay(frames: number): number {
    const n = Math.max(0, frames | 0);
    this.secondaryTime = n;
    return n;
  }

  /**
   * Read one of this slot's registers by ECL register id (ops 86 / 87 accept
   * either the id or a plain field index).
   */
  readField(field: number, table: Record<number, string>): number {
    const name = table[field];
    if (!name) return 0;
    const value = (this as unknown as Record<string, unknown>)[name];
    return typeof value === 'number' ? value : 0;
  }

  /** Advance one game frame. */
  tick(): void {
    if (!this.active) return;
    // A following child stores its own position separately, so the script always
    // sees the coordinates it wrote last frame rather than the composited ones.
    this.rebaseLinkedChild();
    this._timer++;
    if (this.deathLatch && this._hp > 0) this.deathLatch = false;
    // `EnemyManagerUpdate.cpp:982-983`: the freeze timer runs down on its own clock,
    // and the frame's damage is cleared before the shot pass refills it.
    if (this.freezeFrames > 0) this.freezeFrames--;
    this.lastFrameDamage = 0;
    if (this.spellTimerFrames >= 0) {
      this.gaugeTimerFrames = Math.max(0, this.spellTimerFrames - this.spellTimerElapsed);
      this.spellTimerElapsed++;
    } else if (this.gaugeTimerFrames > 0) {
      this.gaugeTimerFrames--;
    }
    this.tickCardBonus();

    // Run the generator until it yields (waits) or returns.
    if (this.waitFrames > 0) {
      this.waitFrames--;
    } else if (this.generator) {
      const result = this.generator.next();
      if (result.done) {
        this.active = false;
        return;
      }
      this.waitFrames = Math.max(0, (result.value ?? 0) - 1);
    }

    // The two card drivers run between the script and the animation, and a
    // transition re-enters the script in the same frame.
    this.stepSpellDrivers();
    if (!this.active) return;

    // Attached coroutines, each with its own register bank.
    this.stepLanes();

    // The interpolator tail belongs to RunEcl, so it runs after the script and
    // the lanes but before the motion producer and its integrator.
    this.stepInterpolators();

    // Retail steps the enemy's ANM script after its ECL, over the same position
    // and rotation storage (`EnemyManagerUpdate.cpp:592-611`). Syncing in and
    // back out reproduces that hand-off: ECL aims, ANM interpolates and draws.
    this.updateAnmDirection();
    this.tickAnm();

    // Retail advances the motion producer at the tail of the script pass and only
    // integrates it in the manager update, clamping on both sides of the step
    // (`EnemyManagerUpdate.cpp:486-490`). Both steps carry `g_EclGameTimeScale`, which
    // an ECL `ex 18` drops for a scripted slow-motion beat (`EclExIns.cpp:829-837`).
    this.stepMotionModel(this.gs.timeScale);
    this.clampPosition();
    this.integrateMotion(this.gs.timeScale);
    this.clampPosition();
    // Without a VM the facing rate has to be integrated here; with one the
    // script owns the same field, so stepping it twice would double the spin.
    if (!this.anm && this.rotationRate !== 0) this.rotAngle += this.rotationRate;
    // Linked children (op 92) are composited onto their parent before anything
    // reads the position: shots, collision, bounds and the renderer all see the
    // retail `0x2D88 = 0x2D34 + 0x2D40`.
    this.applyLinkedChildAnchor();

    // Danmaku rides on the movement the script produced this frame.
    this.tickShotRepeat();

    this.stepBoundsRetire();
  }

  /** Put a following child back on its own coordinates for this frame's script. */
  private rebaseLinkedChild(): void {
    if (!this.followParentPosition) return;
    this._x = this.ownX;
    this._y = this.ownY;
  }

  /**
   * The detach half of `EnemyOverlay::FUN_0042adb0` (`EnemyManager.cpp:282-290`):
   * bit 10 goes up so the death pass skips the explosion, `0x2DA4` is cleared, the
   * drop type is disarmed, and — for a slot that rode on the parent — the follow
   * offset is frozen at the parent's position, which is what keeps the familiar
   * drawing where it stood instead of snapping back to its local offset.
   */
  detachFromParent(parentX: number, parentY: number): void {
    this.deathEffectsSuppressed = true;
    this.dropType = -2;
    if (this.followParentPosition) {
      // `rebaseLinkedChild` has already run this frame, so `_x` is the local part
      // of `0x2D88 = 0x2D34 + 0x2D40` and the sum is the render position.
      this._x = this.ownX + parentX;
      this._y = this.ownY + parentY;
    }
    this.ownX = this._x;
    this.ownY = this._y;
    this.followParentPosition = false;
    this.linkedChild = false;
    this.parentSlotIndex = -1;
  }

  /**
   * `EnemyManagerUpdate.cpp:492-505`: while a linked child inherits its parent's
   * position, `0x2D40` is reloaded from the parent every frame and the child's
   * real position is the sum of the two vectors.
   */
  private applyLinkedChildAnchor(): void {
    if (!this.followParentPosition) return;
    const parent = this.enemyManager?.slotAt(this.parentSlotIndex);
    if (!parent || !parent.active) return;
    // Composing onto a non-finite parent is how a bad position used to latch:
    // ownX/ownY kept it and rebaseLinkedChild handed it straight back into _x
    // on every later frame, so the familiar stayed poisoned for the rest of
    // the stage even after the parent recovered.
    if (!Number.isFinite(parent.posX) || !Number.isFinite(parent.posY)) return;
    this.ownX = this._x;
    this.ownY = this._y;
    this.parentOffX = parent.posX;
    this.parentOffY = parent.posY;
    this._x = this.ownX + this.parentOffX;
    this._y = this.ownY + this.parentOffY;
  }

  /**
   * `GameManager::IsWithinPlayfield` (th08 0x4399ac): true while the sprite
   * rectangle straddles the playfield. The half-extents come from the sprite,
   * so an enemy hanging over an edge still counts as on screen.
   */
  static isWithinPlayfield(x: number, y: number, width: number, height: number): boolean {
    if (x + width / 2 < 0) return false;
    if (x - width / 2 > PLAYFIELD_W) return false;
    if (y + height / 2 < 0) return false;
    if (y - height / 2 > PLAYFIELD_H) return false;
    return true;
  }

  /**
   * `EnemyManagerUpdate.cpp:550-590`. The retire is two-stage: a slot only
   * becomes eligible to die off screen once its sprite has actually been inside
   * the playfield, so entering patterns can start above the top edge. The
   * engine's `EMUF1_NO_SPRITE` gate is reproduced by `stepBoundsRetire` below,
   * with the op-77 bounding box standing in for the sprite size when a slot has
   * no animation VM attached (the ECL-only paths used by the tests).
   */
  private stepBoundsRetire(): void {
    const vm = this.anm;
    const spriteless = vm !== null && vm.sprite === 0;
    const width = vm && !spriteless ? vm.spriteSize.x : this.boundsW;
    const height = vm && !spriteless ? vm.spriteSize.y : this.boundsH;
    const within = EnemySlot.isWithinPlayfield(this._x, this._y, width, height);
    if (!spriteless && !this.hasBeenInBounds && within) {
      this.hasBeenInBounds = true;
      return;
    }
    if (this.hasBeenInBounds && !this.allowOffscreen && !within) this.active = false;
  }

  /** Decay the live card's bonus the way `Spellcard`'s update pass does. */
  private tickCardBonus(): void {
    if (!this.gs.spellName || this.cardSettled) return;
    // Op 155 clocks carry no card at all, and op 184 freezes a card's bonus.
    if (this.noTimeoutPenalty || this.cardBonusFrozen) return;
    this.cardElapsedFrames++;
    this.cardBonusProgress -= Math.trunc(this.cardElapsedFrames / 60);
    this.cardBonusProgress -= this.cardBonusProgress % 10;
    if (this.cardBonusProgress < 0) this.cardBonusProgress = 0;
  }

  /**
   * Step the two card drivers until neither fires: a boss that loses two bars
   * in one frame, or whose new card re-arms a timer that is already spent, has
   * to resolve both before it draws, exactly like the retail `goto` back into
   * the script. Four passes is the most a script can chain in one frame.
   */
  private stepSpellDrivers(): void {
    for (let guard = 0; guard < 4 && this.active; guard++) {
      if (!this.checkSpellPhases() && !this.checkSpellTimeout()) return;
    }
  }

  /**
   * `Enemy::FUN_0042b490`: the life-bar driver. Crossing a threshold clamps HP
   * back up to it — the overkill is discarded, not carried into the next card —
   * and hands the script to that phase's sub.
   */
  private checkSpellPhases(): boolean {
    for (let i = 0; i < this.phaseThresholds.length; i++) {
      const threshold = this.phaseThresholds[i];
      if (threshold < 0 || this._hp >= threshold) continue;
      this.phaseThresholds[i] = -1;
      this._hp = threshold;
      this.bossPhase = i + 1;
      this.lastSpellSecondsLeft = this.spellSecondsLeft();
      this.settleCard(true);
      this.spellTimerFrames = -1;
      this.gaugeTimerFrames = 0;
      // `EnemyManager.cpp:515`: the life-bar change pays out the familiar chain
      // *before* the same driver wipes the field, so every familiar that is still
      // linked at the capture turns into time orbs.
      this.enemyManager?.familiarChainPayoff(this, 1);
      this.breakSpellState();
      this.enterSpellSub(this.phaseSubs[i]);
      return true;
    }
    return false;
  }

  /**
   * `Enemy::FUN_0042b930`: the countdown driver. Expiry refills the boss to the
   * highest threshold still armed, charges nothing for the card, and sweeps the
   * field unless op 155 said this timer is not a card clock.
   */
  private checkSpellTimeout(): boolean {
    if (this.spellTimerFrames < 0 || this.spellTimerElapsed < this.spellTimerFrames) return false;
    this.lastSpellSecondsLeft = 0;
    let best = 0;
    let bestIndex = -1;
    for (let i = 0; i < this.phaseThresholds.length; i++) {
      const threshold = this.phaseThresholds[i];
      if (threshold < 0 || threshold <= best) continue;
      best = threshold;
      bestIndex = i;
    }
    if (bestIndex >= 0) {
      this.phaseThresholds[bestIndex] = -1;
      this._hp = best;
    }
    const sub = this.spellTimerSub;
    this.spellTimerFrames = -1;
    this.spellTimerSub = this.deathCallbackSub;
    this.spellTimerElapsed = 0;
    this.gaugeTimerFrames = 0;
    if (!this.noTimeoutPenalty) {
      this.settleCard(false);
      this.gs.spellName = null;
      this.gs.spellBonus = 0;
      this.gs.spellFrames = 0;
      this.removeAllBullets();
    }
    // A card that runs out of clock detaches the chain without paying it
    // (`EnemyManager.cpp:700`, mode 0).
    this.enemyManager?.familiarChainPayoff(this, 0);
    this.breakSpellState();
    this.enterSpellSub(sub);
    return true;
  }

  /**
   * Shared tail of both drivers: the phase sub owns the enemy now, so its
   * coroutines and its held shot instruction are dropped, and every plain
   * enemy on the field dies with it (`EnemyManager.cpp:517-533`).
   */
  private breakSpellState(): void {
    this.releaseLanes();
    this.shotRepeatFrames = 0;
    this.shotRepeatTimer = 0;
    this.enemyManager?.wipeNonBossEnemies(this.slotIndex);
  }

  /** Drop the four `callSubAlloc` coroutines. */
  private releaseLanes(): void {
    for (let k = 0; k < this.lanes.length; k++) this.lanes[k] = null;
  }

  /**
   * Restart the main script at `sub`, running its first instruction this frame
   * the way `run_enemy_ecl_after_pause` does. A sub the script table does not
   * know about leaves the current one alone.
   */
  private enterSpellSub(sub: number): void {
    const manager = this.enemyManager;
    if (!manager || sub < 0) return;
    const generator = manager.makeSub(sub, this);
    if (!generator) return;
    this.generator = generator;
    this.waitFrames = 0;
    const result = generator.next();
    if (result.done) {
      this.active = false;
      return;
    }
    this.waitFrames = Math.max(0, (result.value ?? 0) - 1);
  }

  /**
   * `EnemyManagerUpdate.cpp:765-910`: the death pass runs once per life. With a
   * death sub it hands the script over instead of retiring the slot, which is
   * what lets a boss flee, transform, or open its next card.
   */
  private resolveDeath(): void {
    if (this.deathLatch) return;
    this.deathLatch = true;
    this.lastSpellSecondsLeft = this.spellSecondsLeft();
    this.settleCard(true);
    // `Enemy::FUN_0042a820` (`EnemyManager.cpp:240-255`): the death pass flags every orbit
    // this enemy was carrying, which is the 16-frame fade rather than a disappearance.
    for (const orbit of this.orbitEffects) orbit.fade();
    this.orbitEffects.length = 0;
    this.spellTimerFrames = -1;
    this.gaugeTimerFrames = 0;
    for (let i = 0; i < this.phaseThresholds.length; i++) this.phaseThresholds[i] = -1;
    // `EnemyManagerUpdate.cpp:793-798`: an attached familiar leaves its
    // parent's chain on the death pass, and the parent's counter is what ECL
    // register 0x2770 reads. Without the decrement a boss that once had five
    // mirrors can never attach another one.
    if (this.parentSlotIndex >= 0) {
      const attachedTo = this.enemyManager?.slotAt(this.parentSlotIndex);
      if (attachedTo && attachedTo.active && attachedTo.childCount > 0) attachedTo.childCount--;
    }
    this.releaseLanes();
    this.shotRepeatFrames = 0;
    this.shotRepeatTimer = 0;
    const sub = this.deathCallbackSub;
    if (sub >= 0) {
      this.deathCallbackSub = -1;
      this._hp = 0;
      this.enterSpellSub(sub);
      return;
    }
    this._hp = 0;
    // `EnemyManagerUpdate.cpp:857-861`: a dying boss releases the marker, which
    // is what lets the next wave spawn and the timeline run out.
    if (this.isBoss) {
      this.isBoss = false;
      this.bossMarker = 255;
      this.gs.isBossPresent = false;
    }
    this.active = false;
    this.deathPending = true;
    this.spawnDeathEffects();
  }

  /**
   * Step this slot's ANM script once, sharing position and facing with the ECL.
   *
   * A script that runs out is left alone on purpose: the primary enemy VM's
   * `ExecuteScript` result is discarded at `EnemyManagerUpdate.cpp:598` (only
   * the two trail VMs get parked), so `Static` ends the animation without
   * retiring the enemy. Lifetime stays with the ECL and the bounds cull.
   */
  private tickAnm(): void {
    const vm = this.anm;
    if (!vm || vm.finished) return;
    vm.pos.x = this._x;
    vm.pos.y = this._y;
    vm.rotation.z = this.rotAngle;
    vm.angleVel.z = this.rotationRate;
    vm.step(1);
    this._x = vm.pos.x;
    this._y = vm.pos.y;
    this.rotAngle = vm.rotation.z;
    this.rotationRate = vm.angleVel.z;
    this.anmSprite = vm.visible ? vm.sprite : null;
    const scaleX = vm.scale.x;
    this.anmFlipX = Number.isFinite(scaleX) && scaleX < 0;
    const absX = Math.abs(scaleX);
    this.anmScale = Number.isFinite(absX) && absX > 0 ? absX : 1;
    this.anmAlpha = Math.max(0, Math.min(255, Math.round(vm.color1.a)));
  }

  /**
   * `Enemy::FUN_00423150` (`EclDependencies.cpp:812-883`), the facing switch.
   *
   * The motion producer at +0x2D4C decides the turn: left past -0.01, right past
   * +0.01, and bit 18 of the motion flags swaps the two because it mirrors the
   * same producer on the way into the integrator. Returning to straight is not
   * the straight script either: retail plays the script that *ends* the lean,
   * picked by which side the enemy was leaning to, which is what stops a fairy
   * from snapping upright mid-flight.
   *
   * The block is gated on the slot still having hit points, and on script 1 being
   * armed. `EnemyManager.cpp:191-193` files -1 there on spawn, so enemies set up
   * with a bare op 54 keep that script however they move.
   */
  private updateAnmDirection(): void {
    if (this.hp <= 0) return;
    if (this.anmScripts[1] < 0) return;
    let direction = 0;
    if (this.motorX < -0.01) direction = 1;
    else if (this.motorX > 0.01) direction = 2;
    if (this.mirrorX) direction = direction === 1 ? 2 : direction === 2 ? 1 : 0;
    const previous = this.anmDirection;
    if (previous === direction) return;
    this.anmDirection = direction;
    const script =
      direction === 0
        ? previous === -1
          ? this.anmScripts[0]
          : previous === 1
            ? this.anmScripts[3]
            : this.anmScripts[4]
        : this.anmScripts[direction];
    if (script < 0) return;
    this.anmScript = script;
    this.attachAnm(script);
  }

  /**
   * Advance every `callSubAlloc` lane by one frame. Each lane owns its
   * registers, so the bank is swapped in for the step and back out after.
   */
  private stepLanes(): void {
    if (!this.active) {
      for (let k = 0; k < this.lanes.length; k++) this.lanes[k] = null;
      return;
    }
    for (let k = 0; k < this.lanes.length; k++) {
      const lane = this.lanes[k];
      if (!lane) continue;
      if (lane.waitFrames > 0) {
        lane.waitFrames--;
        continue;
      }
      const saved = this.captureRegs();
      this.applyRegs(lane.regs);
      const result = lane.generator.next();
      lane.regs = this.captureRegs();
      this.applyRegs(saved);
      if (result.done) this.lanes[k] = null;
      else lane.waitFrames = Math.max(0, (result.value ?? 0) - 1);
    }
  }

  /** Move this frame's queued visual requests into `out`. */
  drainFx(out: SlotFx[]): SlotFx[] {
    for (const fx of this.fxRequests) out.push(fx);
    this.fxRequests.length = 0;
    return out;
  }

  /** Move this frame's queued sound ids into `out`. */
  drainSfx(out: SeTick[]): SeTick[] {
    for (const request of this.sfxRequests) out.push(request);
    this.sfxRequests.length = 0;
    return out;
  }

  /** Move this frame's finished spell cards into `out`. */
  drainSpellResults(out: SpellResult[]): SpellResult[] {
    for (const card of this.spellResults) out.push(card);
    this.spellResults.length = 0;
    return out;
  }

  /**
   * A boss changed card: plain enemies get zeroed and die with it, which is how
   * the field is clear when the new plate goes up.
   */
  forcePhaseWipeDeath(): void {
    this._hp = 0;
    this.resolveDeath();
  }

  // --- EnemyCtx read-only properties ---
  get posX() {
    return this._x;
  }
  set posX(v: number) {
    this._x = v;
  }
  get posY() {
    return this._y;
  }
  set posY(v: number) {
    this._y = v;
  }
  get posZ() {
    return this._z;
  }
  set posZ(v: number) {
    this._z = v;
  }
  get playerX() {
    return this.playerRef ? this.playerRef.x : 192;
  }
  get playerY() {
    return this.playerRef ? this.playerRef.y : 384;
  }
  get playerZ() {
    return 0;
  }
  /**
   * Movement heading, `enemy+0x2D94` (register 0x2755). Ops 65..69 write it and
   * `FUN_00422c40` integrates it; the fan-pattern helpers read it back to aim.
   */
  get moveAngle() {
    return this.heading;
  }
  set moveAngle(value: number) {
    this.heading = value;
  }
  get timer() {
    return this._timer;
  }
  get hp() {
    return this._hp;
  }
  get hpF() {
    return this._hp;
  }
  get hpRatio() {
    return this._maxHp > 0 ? this._hp / this._maxHp : 0;
  }
  /** Heading from this enemy to the player (ECL register 0x2740). */
  get angleToPlayer() {
    return Math.atan2(this.playerY - this._y, this.playerX - this._x);
  }
  /** Distance from this enemy to the player (ECL register 0x2742). */
  get distToPlayer() {
    const dx = this.playerX - this._x;
    const dy = this.playerY - this._y;
    return Math.hypot(dx, dy);
  }
  /**
   * Register 0x2770 (`EclOperandsInt.cpp:139-144`): the length of the attach
   * chain this slot belongs to. A head reports its own chain; a member asks the
   * enemy it is attached to, which is what lets stage 4b stop spawning mirrors
   * at five (`if (0x2770 >= 5)`) and stage 1 ask whether it is the last link.
   */
  get parentChainCount(): number {
    let index = this.parentSlotIndex;
    if (index < 0) return this.childCount;
    let node: EnemySlot | null | undefined;
    for (let hop = 0; hop < 32; hop++) {
      node = this.enemyManager?.slotAt(index);
      if (!node || !node.active) return 0;
      if (node.parentSlotIndex < 0) return node.childCount;
      index = node.parentSlotIndex;
    }
    return node?.childCount ?? 0;
  }
  /**
   * Register 0x2772 (`EclOperandsInt.cpp:153-158`): 2 while the last spell is
   * still payable -- won orbs plus the orbs still on the field reach the
   * threshold -- else 0. Stages 1 to 3 gate the boss's last-spell break on it.
   * Retail's middle term, `Spellcard::pendingTimeOrbs`, needs no field here:
   * `StageRunner.bankSpellResults` pays that reward on the frame the card is
   * captured rather than dripping it seven at a time, so it is already inside
   * `timeOrbs`.
   */
  get timeOrbReady(): number {
    const held = this.gs.timeOrbs + (this.itemPool?.timeOrbCount ?? 0);
    return held >= this.gs.lastSpellTimeOrbThreshold ? 2 : 0;
  }
  get playerIsYoukai() {
    return this.gs.playerIsYoukai ? 1 : 0;
  }
  /** Register 0x2773: which spell-card state the scripts are allowed to read. */
  get spellCardState() {
    return this.enemyManager?.hasGaugeOwner() ? 1 : 0;
  }
  get spellCardTimer() {
    return this.gaugeTimerFrames;
  }
  get randInt() {
    return this.gs.rng.randomU32();
  }
  get randIntMasked() {
    return this.gs.rng.randomU32() & 0x7fffffff;
  }
  applyDamage(amount: number): void {
    if (!this.active || this.invulnerable || !this.damageEnabled) return;
    // `Enemy::FUN_0042b370` (EnemyManager.cpp:415-464) only does anything for a
    // linked child: the familiar itself never loses HP, it forwards half of every
    // hit to the parent and refuses to push the parent below the highest life-bar
    // threshold still armed. That is why a boss ringed by familiars has to be
    // chewed through them instead of out-damaged directly.
    if (this.linkedChild) {
      this.damageParentFromChild(Math.max(0, amount) >> 1);
      return;
    }
    // The bar that just broke is not chewed by the same frame's leftovers.
    if (this.barBreakFrame === this._timer) return;
    this.lastDamage = Math.max(0, amount);
    this._hp -= this.lastDamage;
    if (this._hp > 0) return;
    if (this.gaugePips > 0) {
      // Retail breaks a single life bar: the pip count drops, the next bar
      // starts full, and the overkill from that hit is discarded.
      this.gaugePips--;
      this._hp = this._maxHp;
      this.barBreakFrame = this._timer;
      return;
    }
    this.resolveDeath();
  }

  /** Route a familiar's absorbed damage into the parent's bar, clamped by phase. */
  private damageParentFromChild(damage: number): void {
    if (damage <= 0) return;
    const parent = this.enemyManager?.slotAt(this.parentSlotIndex);
    if (!parent || !parent.active) return;
    let floor = 0;
    for (const threshold of parent.phaseThresholds) {
      if (threshold > floor) floor = threshold;
    }
    parent.absorbChildDamage(damage, floor);
  }

  /** The parent's half of `FUN_0042b370`: subtract, then clamp at the phase floor. */
  absorbChildDamage(damage: number, floor: number): void {
    if (!this.active || this.invulnerable || !this.damageEnabled) return;
    if (this.barBreakFrame === this._timer) return;
    this._hp -= damage;
    if (this._hp <= floor) this._hp = floor;
    if (this._hp > 0) return;
    if (this.gaugePips > 0) {
      this.gaugePips--;
      this._hp = this._maxHp;
      this.barBreakFrame = this._timer;
      return;
    }
    this.resolveDeath();
  }
  get maxHp() {
    return this._maxHp;
  }
  set maxHp(v: number) {
    this._maxHp = v;
  }
  get maxHpF() {
    return this._maxHp;
  }
  set maxHpF(v: number) {
    this._maxHp = v;
  }
  get difficulty() {
    return this.gs.difficultyId;
  }
  get difficultyF() {
    return this.gs.difficultyId;
  }
  get rank() {
    return this.gs.rank;
  }
  get rankF() {
    return this.gs.rank;
  }
  get shotType() {
    return this.gs.shotType;
  }
  get shotTypeF() {
    return this.gs.shotType;
  }
  /** Register 0x2765: last frame's real X displacement. */
  get velocityX() {
    return this.observedX;
  }
  /** Register 0x2766: last frame's real Y displacement. */
  get velocityY() {
    return this.observedY;
  }
  /** Register 0x2767: last frame's real Z displacement. */
  get velocityZ() {
    return this.observedZ;
  }
  get enemyType() {
    return 0;
  }
  get enemySlot() {
    return this.slotIndex;
  }
  get randAngle() {
    return this.gs.rng.randomF32InRange(Math.PI * 2) - Math.PI;
  }
  get randU31() {
    return this.gs.rng.randomU32() & 0x7fffffff;
  }
  get randF32() {
    return this.gs.rng.randomF32();
  }
  get randU32() {
    return this.gs.rng.randomU32();
  }
  get randF32S() {
    return this.gs.rng.randomF32Signed();
  }
  get randU31f() {
    return this.gs.rng.randomU32() & 0x7fffffff;
  }
  get randU32f() {
    return this.gs.rng.randomU32();
  }
  get randF32i() {
    return Math.trunc(this.gs.rng.randomF32());
  }
  get randF32Si() {
    return Math.trunc(this.gs.rng.randomF32Signed());
  }
  get cf0i() {
    return Math.trunc(this.cf0);
  }
  set cf0i(v: number) {
    this.cf0 = v;
  }
  get cf1i() {
    return Math.trunc(this.cf1);
  }
  set cf1i(v: number) {
    this.cf1 = v;
  }
  /** `enemy + 0x3358 + i*4` (registers 0x2768..0x276b): the four armed bar floors. */
  get phase0() {
    return this.phaseThresholds[0];
  }
  get phase1() {
    return this.phaseThresholds[1];
  }
  get phase2() {
    return this.phaseThresholds[2];
  }
  get phase3() {
    return this.phaseThresholds[3];
  }

  // --- EnemyCtx methods ---
  isDiff(mask: number): boolean {
    return (this.gs.difficultyMask & mask) !== 0;
  }

  // ANM
  /** op 54: one script on the primary sprite, addressed against `enemy.anm`. */
  setAnm(script: number) {
    this.anmUseStagePack = false;
    this.anmScript = script;
    this.attachAnm(script);
  }
  /** op 58: the same, addressed against the stage's own pack. */
  setAnmAlt(script: number) {
    this.anmUseStagePack = true;
    this.anmScript = script;
    this.attachAnm(script);
  }
  /**
   * `SetPrimaryAnmScripts` (`EclRunLow.inl:210-214`).
   *
   * The six ids are filed but nothing is attached: retail only writes 0xFF into
   * +0x332E and lets `FUN_00423150` choose the first script on the next update,
   * which is the same frame the slot is stepped. Attaching here as well would
   * restart the cycle every frame instead of once.
   */
  private setPrimaryAnmScripts(
    s0: number,
    s1: number,
    s2: number,
    s3: number,
    s4: number,
    s5: number,
    stagePack: boolean,
  ): void {
    this.anmUseStagePack = stagePack;
    this.anmScripts = [s0, s1, s2, s3, s4, s5];
    this.anmDirection = -1;
    this.anmScript = s0;
  }
  setAnmScripts6(base: number) {
    this.setPrimaryAnmScripts(base, base + 1, base + 2, base + 3, base + 4, base + 5, false);
  }
  setAnmScripts6x(a: number, b: number, c: number, d: number, e2: number, f: number) {
    this.setPrimaryAnmScripts(a, b, c, d, e2, f, false);
  }
  setAnmScripts6xAlt(a: number, b: number, c: number, d: number, e2: number, f: number) {
    this.setPrimaryAnmScripts(a, b, c, d, e2, f, true);
  }
  /**
   * Put the named `enemy.anm` script on this slot's VM and run its setup block
   * immediately, which is what `SetAndExecuteScript` does on the spawn frame.
   */
  private attachAnm(script: number): void {
    const pack = this.anmUseStagePack ? (this.anmPackAlt ?? this.anmPack) : this.anmPack;
    if (!pack) return;
    const words = pack.words(script);
    if (!words) return;
    const vm = this.anm ?? (this.anm = new AnmVm(this.gs.rng));
    vm.pos.x = this._x;
    vm.pos.y = this._y;
    vm.rotation.z = this.rotAngle;
    vm.angleVel.z = this.rotationRate;
    vm.attach(words);
    this.anmSprite = vm.visible ? vm.sprite : null;
  }
  /** Let the renderer drive the assigned ANM scripts instead of holding frame 0. */
  autoAnm() {
    this.animAuto = true;
  }
  /** Secondary layer: script `args[1]` plays alongside the main one (op 57). */
  setExtraAnm(...args: number[]) {
    if (args.length >= 2) this.extraAnmScript = args[1];
  }
  setExtraAnmAlt(...args: number[]) {
    this.setExtraAnm(...args);
  }

  // Movement -- the four retail interpolation modes
  //
  // Ops 63..76 do not "move an enemy". Each one arms a producer that
  // `Enemy::FUN_00422c40` runs every frame into `enemy+0x2D4C`, and
  // `Enemy::FUN_0042deb0` integrates that velocity into `enemy+0x2D34`; the ops
  // below are a literal transcription of `EclRunLow.inl:737-905` plus the two
  // `EclHelpers` configurators.

  /**
   * op 63 (`EclRunLow.inl:737-743`): an absolute write of `0x2D34`, not an offset.
   * `sub_48` calling it with (192, 224) -- the centre of the playfield -- is what
   * settles the reading; the previous `+=` sent every entry pattern off-screen.
   */
  setRelPos(x: number, y: number) {
    if (!this.finiteArgs('setRelPos', x, y)) return;
    this._x = x;
    this._y = y;
    this._z = 0;
    this.clampPosition();
  }
  setPos(x: number, y: number) {
    if (!this.finiteArgs('setPos', x, y)) return;
    this._x = x;
    this._y = y;
  }
  /**
   * op 65 (`:744-751`): heading plus speed, mode 1 with no duration, i.e. "keep
   * going this way". This is not the sprite rotation -- that lives in the ANM VM.
   */
  setHeadingSpeed(angle: number, speed: number) {
    if (!this.finiteArgs('setHeadingSpeed', angle, speed)) return;
    this.heading = normalizeAngle(angle);
    this.moveSpeed = speed;
    this.interpMode = 1;
    this.motionDuration = 0;
    this.motionTimer = 0;
  }
  /**
   * op 66 (`:752-764`): a straight segment. Without a duration it degrades to
   * op 65; with one it becomes `ConfigurePolarMotion`, whose origin is the *drawn*
   * position, so a familiar starts its approach from where it is actually seen.
   */
  movePolar(duration: number, easing: number, angle: number, speed: number) {
    if (!this.finiteArgs('movePolar', duration, easing, angle, speed)) return;
    if (duration <= 0) {
      this.setHeadingSpeed(angle, speed);
      return;
    }
    this.configurePolarMotion(duration, easing, angle, speed);
  }
  /**
   * op 64 (`EclHelpers::ConfigureRelativeMotion`, 0x420F40): the operands are an
   * absolute waypoint stored as a displacement from the drawn position, and the
   * in-flight velocity is cleared on the way in.
   */
  moveRelative(duration: number, easing: number, x: number, y: number) {
    if (!this.finiteArgs('moveRelative', duration, easing, x, y)) return;
    this.tweenDX = x - this.renderX;
    this.tweenDY = y - this.renderY;
    this.originX = this._x;
    this.originY = this._y;
    this.originZ = this._z;
    this.motionTimer = duration;
    this.motionDuration = duration;
    this.easingMode = easing;
    this.interpMode = 2;
    this.motorX = 0;
    this.motorY = 0;
    if (this.mirrorX) this.tweenDX = -this.tweenDX;
  }
  /** `EclHelpers::ConfigurePolarMotion` (0x420D10), shared by ops 66, 67 and 69. */
  private configurePolarMotion(duration: number, easing: number, angle: number, speed: number): void {
    const heading = normalizeAngle(angle);
    this.tweenDX = Math.cos(heading) * speed * duration;
    this.tweenDY = Math.sin(heading) * speed * duration;
    this.originX = this.renderX;
    this.originY = this.renderY;
    this.originZ = 0;
    this.motionTimer = duration;
    this.motionDuration = duration;
    this.easingMode = easing;
    this.interpMode = 2;
    if (this.mirrorX) this.tweenDX = -this.tweenDX;
  }
  /**
   * op 67 (`BeginBoundaryAwareMove`, th08 0x422020, `EclDependencies.cpp:128-191`):
   * pick a random heading that points away from the player, then fold it back
   * inside the clamp box, which is how the fairies bounce along the edges instead
   * of flying off the screen. Every one of its 72 call sites is preceded by op 75.
   */
  moveBounce(duration: number, easing: number, speed: number) {
    if (!this.finiteArgs('moveBounce', duration, easing, speed)) return;
    const quarter = Math.PI / 2;
    const rng = this.gs.rng.randomF32InRange(quarter);
    let angle = this.playerX < this._x ? normalizeAngle(rng + (3 * Math.PI) / 4) : rng - Math.PI / 4;
    if (this._x < this.clampMinX + 96) {
      if (angle > quarter) angle = Math.PI - angle;
      else if (angle < -quarter) angle = -Math.PI - angle;
    }
    if (this._x > this.clampMaxX - 96) {
      if (angle < quarter && angle >= 0) angle = Math.PI - this.heading;
      else if (angle > -quarter && angle <= 0) angle = -Math.PI - angle;
    }
    if (this._y < this.clampMinY + 48 && angle < 0) angle = -angle;
    if (this._y > this.clampMaxY - 48 && angle > 0) angle = -angle;
    if (duration <= 0) {
      this.heading = angle;
      this.moveSpeed = speed;
      this.interpMode = 1;
      this.motionDuration = 0;
      this.motionTimer = 0;
    } else {
      this.configurePolarMotion(duration, easing, angle, speed);
    }
  }
  /** op 68 (`:772-781`): aim along the heading to the player. Mode untouched. */
  moveToPlayer(angleOffset: number, speed: number) {
    if (!this.finiteArgs('moveToPlayer', angleOffset, speed)) return;
    this.heading = normalizeAngle(angleOffset + this.angleToPlayer);
    this.moveSpeed = speed;
  }
  /**
   * op 69 (`:782-802`): op 66 with the angle measured from the player. Note the
   * asymmetry in retail -- only the zero-duration branch adds `angleToPlayer`,
   * the timed branch hands operand 2 to `ConfigurePolarMotion` unchanged.
   */
  moveToPlayerPolar(duration: number, easing: number, angle: number, speed: number) {
    if (!this.finiteArgs('moveToPlayerPolar', duration, easing, angle, speed)) return;
    if (duration <= 0) {
      this.moveToPlayer(angle, speed);
      this.interpMode = 1;
      // Operand 0 is re-read for the countdown, so a non-positive duration still
      // lands in `0x2DDC`; the producer only ticks it while `0x2DE8` is positive.
      this.motionDuration = duration;
      this.motionTimer = duration;
      return;
    }
    this.configurePolarMotion(duration, easing, angle, speed);
  }
  /** op 70 (`:809-812`): per-frame heading delta, which starts mode 1 turning. */
  setHeadingVel(rate: number) {
    if (!this.finiteArgs('setHeadingVel', rate)) return;
    this.headingVel = rate;
    this.interpMode = 1;
  }
  /** op 71 (`:813-816`): per-frame speed delta, which starts mode 1 ramping. */
  setSpeedAccel(rate: number) {
    if (!this.finiteArgs('setSpeedAccel', rate)) return;
    this.speedAccel = rate;
    this.interpMode = 1;
  }
  /**
   * op 72 (`:817-845`): mode 3, the orbit and spiral producer anchored on the
   * operand pair. Params 1..6 are already floats in the instruction -- the
   * signature says so -- and running them through `i2f` is what turned a
   * coordinate into `2.69e-43` and then into an invisible, unkillable enemy.
   */
  moveOrbit(
    duration: number,
    x: number,
    y: number,
    angle: number,
    angleVel: number,
    radius: number,
    radiusVel: number,
  ) {
    if (!this.finiteArgs('moveOrbit', duration, x, y, angle, angleVel, radius, radiusVel)) return;
    this.motionTimer = duration;
    this.motionDuration = duration;
    this.originX = x;
    this.originY = y;
    this.orbitAngle = angle;
    this.orbitAngleVel = angleVel;
    this.orbitRadius = radius;
    this.orbitRadiusVel = radiusVel;
    this.flags = (this.flags | 0x3000) >>> 0;
  }
  /** op 73 (`:846-867`): mode 3 around the enemy's own position, radius from 0. */
  moveArc(duration: number, angle: number, angleVel: number, radiusVel: number) {
    if (!this.finiteArgs('moveArc', duration, angle, angleVel, radiusVel)) return;
    this.motionTimer = duration;
    this.motionDuration = duration;
    this.originX = this._x;
    this.originY = this._y;
    this.originZ = this._z;
    this.orbitAngle = angle;
    this.orbitAngleVel = angleVel;
    this.orbitRadius = 0;
    this.orbitRadiusVel = radiusVel;
    this.flags = (this.flags | 0x3000) >>> 0;
  }
  /** op 74 (`:868-884`): mode 3 retune -- anchor, angle and radius all survive. */
  setAccel(duration: number, angleVel: number, radiusVel: number) {
    if (!this.finiteArgs('setAccel', duration, angleVel, radiusVel)) return;
    this.motionTimer = duration;
    this.motionDuration = duration;
    this.orbitAngleVel = angleVel;
    this.orbitRadiusVel = radiusVel;
    this.flags = (this.flags | 0x3000) >>> 0;
  }
  /** op 75 (`:885-900`): arm the position clamp box at `enemy+0x3340..0x334C`. */
  setMotionClamp(minX: number, minY: number, maxX: number, maxY: number) {
    if (!this.finiteArgs('setMotionClamp', minX, minY, maxX, maxY)) return;
    this.clampMinX = minX;
    this.clampMinY = minY;
    this.clampMaxX = maxX;
    this.clampMaxY = maxY;
    this.flags = (this.flags | 0x80000) >>> 0;
  }
  /** op 76 (`:901-904`): disarm the clamp box. Nothing about velocity changes. */
  clearMotionClamp() {
    this.flags = (this.flags & ~0x80000) >>> 0;
  }
  setBounds(w: number, h: number) {
    this.boundsW = w;
    this.boundsH = h;
  }
  /** op 78 (`EclRunLow.inl:914-921`): the second hitbox, at its own two offsets. */
  setBoundsAlt(w: number, h: number) {
    this.altBoundsW = w;
    this.altBoundsH = h;
  }
  /** The op-77 box as a half extent, which is the form `PlayerBuildAabb` needs. */
  get hitboxHalfWidth(): number {
    return this.boundsW / 2;
  }
  get hitboxHalfHeight(): number {
    return this.boundsH / 2;
  }
  /** True when op 78 armed a second box worth testing (`+0x2D7C.x > 0.0f`). */
  get hasSecondaryHitbox(): boolean {
    return this.altBoundsW > 0;
  }
  get secondaryHitboxHalfWidth(): number {
    return this.altBoundsW / 2;
  }
  get secondaryHitboxHalfHeight(): number {
    return this.altBoundsH / 2;
  }

  // Frame step -- Enemy::FUN_00422c40, FUN_0042deb0 and ClampPosition

  /**
   * `enemy+0x3324` bits 12-13: which producer fills `0x2D4C` this frame. 0 keeps
   * whatever the last one left, which is how a finished entry drift turns into a
   * straight cruise.
   */
  get interpMode(): number {
    return (this.flags >>> 12) & 3;
  }
  set interpMode(value: number) {
    this.flags = ((this.flags & ~0x3000) | ((value & 3) << 12)) >>> 0;
  }
  /**
   * `enemy+0x3324` bits 14-16: the easing curve mode 2 walks. Ops 64/66/67 name it
   * "motionMode" and ops 72..74 leave it alone, exactly like the bitfield.
   */
  get easingMode(): number {
    return (this.flags >>> 14) & 7;
  }
  set easingMode(value: number) {
    this.flags = ((this.flags & ~0x1c000) | ((value & 7) << 14)) >>> 0;
  }
  /** `enemy+0x3324` bit 19: op 75's clamp box is armed. */
  get motionClampOn(): boolean {
    return (this.flags & 0x80000) !== 0;
  }
  /** `enemy+0x2D88`: what the renderer draws, i.e. logical position + parent. */
  get renderX(): number {
    return this._x + this.parentOffX;
  }
  /** Drawn position for Y (`enemy+0x2D88`). */
  get renderY(): number {
    return this._y + this.parentOffY;
  }

  /**
   * ECL op 36 (`InstallInterpolationSlot`, `EclDependencies.cpp:361-389`).
   *
   * The destination arrives as the raw operand, exactly as the original stores it,
   * because the slot resolves it again on every frame it runs. The four parameters
   * are already what `DEP_READ_FLOAT` would hand over: an indirect operand reads its
   * register once here, and a literal stays a literal that the callback resolves
   * again per frame.
   */
  interpSlot(
    variable: number,
    duration: number,
    callback: number,
    easing: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number,
  ): void {
    const ok = this.interpolators.install(variable, duration | 0, callback | 0, easing | 0, p0, p1, p2, p3);
    if (ok) this.interpInstalls++;
    else this.refuse('interpSlot', [variable, duration, callback, easing, p0, p1, p2, p3]);
  }

  /**
   * The frame tail at `EclRun.cpp:131-202`, which retail gates on `life > 0`
   * (`enemy+0x2DFC`, `EnemyManagerUpdate.cpp:124`): an entity with no life to lose
   * is a decoration, and its script never gets to tween. A slot that drives a
   * position register does not move the
   * enemy directly: the tail turns the move into this frame velocity in
   * `enemy+0x2D4C`, points `enemy+0x2D94` along it, and rewinds the motion target so
   * that the integrator stays the only thing that advances it.
   */
  private stepInterpolators(): void {
    if (this._hp <= 0) return;
    if (this.interpolators.activeCount === 0) return;
    const savedX = this._x;
    const savedY = this._y;
    const savedZ = this._z;
    this.interpSteps++;
    if (!this.interpolators.step(this.interpWorld())) return;
    this.motorX = this._x - savedX;
    this.motorY = this._y - savedY;
    this.heading = normalizeAngle(Math.atan2(this.motorY, this.motorX));
    this._x = savedX;
    this._y = savedY;
    this._z = savedZ;
  }

  /** The accessor pair the callbacks run against, built once per slot. */
  private interpWorld(): InterpWorld {
    if (!this.interpWorldCache) {
      this.interpWorldCache = {
        resolve: (value: number) => this.resolveInterpFloat(value),
        write: (variable: number, value: number) => this.writeInterpRegister(variable, value),
      };
    }
    return this.interpWorldCache;
  }

  /**
   * `EnemyOverlay::ResolveFloat` (`EclOperandsFloat.cpp:116-118`) reads the three
   * position registers from the drawn vector, not from the motion target the
   * callback writes. That difference is what lets a homing curve re-read its own
   * last result without feeding back into itself.
   */
  private resolveInterpFloat(value: number): number {
    const id = Math.trunc(value);
    if (id === REG_POS_X) return this.renderX;
    if (id === REG_POS_Y) return this.renderY;
    if (id === REG_POS_Z) return this._z;
    const name = FLOAT_FIELD_BY_ID[id];
    if (!name) return value;
    const field = (this as unknown as Record<string, unknown>)[name];
    return typeof field === 'number' ? field : value;
  }

  /** `ResolveFloatLValue`: only a register the switch knows is a destination. */
  private writeInterpRegister(variable: number, value: number): void {
    const name = WRITABLE_FLOAT_FIELD_BY_ID[Math.trunc(variable)];
    if (!name) return;
    (this as unknown as Record<string, number>)[name] = value;
  }
  /** Fill `enemy+0x2D4C` from whichever producer bits 12-13 selected. */
  private stepMotionModel(scale: number): void {
    switch (this.interpMode) {
      case 0:
        // No producer: `0x2D4C` retains its last value, so the slot coasts.
        break;
      case 1: {
        this.heading = normalizeAngle(this.heading + scale * this.headingVel);
        this.moveSpeed = scale * this.speedAccel + this.moveSpeed;
        this.motorX = Math.cos(this.heading) * this.moveSpeed;
        this.motorY = Math.sin(this.heading) * this.moveSpeed;
        if (this.motionDuration > 0 && --this.motionTimer <= 0) this.interpMode = 0;
        break;
      }
      case 2: {
        this.motionTimer--;
        let p = this.motionDuration > 0 ? 1 - this.motionTimer / this.motionDuration : 1;
        if (p < 0) p = 0;
        p = EnemySlot.applyEasing(p, this.easingMode);
        this.motorX = this.originX + this.tweenDX * p - this._x;
        this.motorY = this.originY + this.tweenDY * p - this._y;
        // Mirrored slots negate the velocity twice -- once here and once in the
        // integrator -- which is why the single flip in the configurator is what
        // actually reflects the path (`EnemyManager.cpp:134-136`, `1010-1013`).
        if (this.mirrorX) this.motorX = -this.motorX;
        this.heading = Math.atan2(this.motorY, this.motorX);
        if (this.motionTimer <= 0) {
          this.interpMode = 0;
          this._x = this.originX + this.tweenDX;
          this._y = this.originY + this.tweenDY;
          this.motorX = 0;
          this.motorY = 0;
        }
        break;
      }
      case 3: {
        this.orbitAngle = normalizeAngle(this.orbitAngle + scale * this.orbitAngleVel);
        this.orbitRadius = scale * this.orbitRadiusVel + this.orbitRadius;
        const px = Math.cos(this.orbitAngle) * this.orbitRadius;
        const py = Math.sin(this.orbitAngle) * this.orbitRadius;
        this.motorX = px + this.originX - this._x;
        this.motorY = py + this.originY - this._y;
        this.heading = Math.atan2(this.motorY, this.motorX);
        if (this.motionDuration > 0 && --this.motionTimer <= 0) this.interpMode = 0;
        break;
      }
    }
  }

  /** The easing table in `FUN_00422c40` case 2, bits 14-16 of `0x3324`. */
  private static applyEasing(p: number, mode: number): number {
    switch (mode) {
      case 1:
        return p * p;
      case 2:
        return p * p * p;
      case 3:
        return p * p * p * p;
      case 4:
        return 1 - (1 - p) * (1 - p);
      case 5:
        return 1 - (1 - p) * (1 - p) * (1 - p);
      case 6:
        return 1 - (1 - p) * (1 - p) * (1 - p) * (1 - p);
      default:
        return p;
    }
  }

  /**
   * `Enemy::FUN_0042deb0` (`EnemyManager.cpp:1005-1016`).
   *
   * The order matters twice over. Retail first books the *previous* frame's
   * displacement into `0x2D64` and only then integrates, so a script that reads
   * the velocity registers sees a finished, clamped number rather than the raw
   * motor it just armed -- which is exactly what the stage 1 Hermite tweens need
   * to keep their tangents proportional. Then the mirror bit flips the sign of
   * the X addition, so `0x2D64` picks up the reflection for free.
   */
  private integrateMotion(scale: number): void {
    this.observedX = this._x - this.lastFrameX;
    this.observedY = this._y - this.lastFrameY;
    this.observedZ = this._z - this.lastFrameZ;
    this.lastFrameX = this._x;
    this.lastFrameY = this._y;
    this.lastFrameZ = this._z;
    this._x += this.mirrorX ? -scale * this.motorX : scale * this.motorX;
    this._y += scale * this.motorY;
  }

  /** `Enemy::ClampPosition` (`EnemyManager.cpp:868-882`). */
  private clampPosition(): void {
    if (!this.motionClampOn) return;
    if (this._x < this.clampMinX) this._x = this.clampMinX;
    else if (this._x > this.clampMaxX) this._x = this.clampMaxX;
    if (this._y < this.clampMinY) this._y = this.clampMinY;
    else if (this._y > this.clampMaxY) this._y = this.clampMaxY;
  }

  // Flags / hitbox
  /**
   * op 79 (`EclRunLow.inl:923-931`). One operand drives six bits across the two
   * flag words, and three of them are stored inverted — `!(v & 1)` lands on bit 6,
   * `!(v & 2)` on bit 2 and `!(v & 4)` on bit 3, while bits 4 and 28 and the second
   * word's bit 6 keep their polarity. Assigning the operand to a flag word, which
   * is what this used to do, therefore sets six bits the script never asked for and
   * clears `active`.
   */
  writeScriptFlags(v: number) {
    this.setFlag1(6, (v & 1) === 0);
    this.setFlag1(2, (v & 2) === 0);
    this.setFlag1(3, (v & 4) === 0);
    this.setFlag1(4, (v & 8) !== 0);
    this.setFlag1(28, (v & 0x10) !== 0);
    this.flags2 = v & 0x20 ? this.flags2 | 0x40 : this.flags2 & ~0x40;
  }
  /**
   * op 80 (`EclRunLow.inl:933-946`): the clear half of the pair. Note the split
   * polarity — the low three selectors clear, `v & 8` sets `EMUF1_NO_SPRITE` and
   * `v & 0x10` sets `allowOffscreen`, which is why a familiar launched under
   * `v = 0x10` survives walking off the top of the screen.
   */
  clearScriptFlags(v: number) {
    if (v & 1) this.setFlag1(6, false);
    if (v & 2) this.setFlag1(2, false);
    if (v & 4) this.setFlag1(3, false);
    if (v & 8) this.setFlag1(4, true);
    if (v & 0x10) this.setFlag1(28, true);
    if (v & 0x20) this.flags2 |= 0x40;
  }
  /** op 81 (`EclRunLow.inl:948-961`): the set half, with the same split polarity. */
  setScriptFlags(v: number) {
    if (v & 1) this.setFlag1(6, true);
    if (v & 2) this.setFlag1(2, true);
    if (v & 4) this.setFlag1(3, true);
    if (v & 8) this.setFlag1(4, false);
    if (v & 0x10) this.setFlag1(28, false);
    if (v & 0x20) this.flags2 &= ~0x40;
  }
  /** Set or clear one bit of `enemy+0x3324`. */
  private setFlag1(bit: number, on: boolean): void {
    const mask = 1 << bit;
    this.flags = on ? this.flags | mask : (this.flags & ~mask) >>> 0;
  }

  // Remote
  /** Peek at another enemy's int register (op 86) — boss <-> helper hand-offs. */
  readIntRemote(slot: number, field: number) {
    return this.enemyManager?.readIntSlot(slot, field) ?? 0;
  }
  /** Peek at another enemy's float register (op 87). */
  readFloatRemote(slot: number, field: number) {
    return this.enemyManager?.readFloatSlot(slot, field) ?? 0;
  }
  setParams(a: number, b: number) {
    this.param0 = a;
    this.param1 = b;
  }

  // Linked children — ECL ops 90, 91 and 92
  //
  // These were translated as three flavours of "kill self" for a long time, which
  // silently deleted every boss that owns a familiar pattern. `EclRunLow.inl:1014`
  // `-1203` shows what they really do: launch a second enemy, link it to this one,
  // and hand it the ECL sub named by operand 0. The three cases differ only in
  // where the child lands and whether it keeps riding along.

  /** op 90 — child lands at the absolute offset in operands 1/2. */
  linkChildStandard(sub: number, x: number, y: number, hp: number, dropType: number, score: number) {
    this.linkChild(0, sub, x, y, hp, dropType, score);
  }
  /** op 91 — operands 1/2 are added to this enemy's position. */
  linkChildRelative(sub: number, x: number, y: number, hp: number, dropType: number, score: number) {
    this.linkChild(1, sub, x, y, hp, dropType, score);
  }
  /** op 92 — absolute offset again, but the child follows this enemy forever. */
  linkChildAttached(sub: number, x: number, y: number, hp: number, dropType: number, score: number) {
    this.linkChild(2, sub, x, y, hp, dropType, score);
  }

  /**
   * Shared body of the linked-child cluster. `SpawnChildStandard0041F110` refuses
   * the launch unless the parent still has HP and is not itself a familiar, and
   * the summon cue at `SOUND_FAMILIAR_SPAWN` (0x24) plays either way.
   */
  private linkChild(
    mode: number,
    sub: number,
    x: number,
    y: number,
    hp: number,
    dropType: number,
    score: number,
  ) {
    const manager = this.enemyManager;
    this.playSfx(SOUND_FAMILIAR_SPAWN);
    if (!manager || this._hp <= 0 || this.linkedChild) return;
    const relative = mode === 1;
    const childX = relative ? this._x + x : x;
    const childY = relative ? this._y + y : y;
    // A familiar launched onto a non-finite coordinate inherits it through the
    // follow anchor below and then never leaves the pool, so the summon is
    // dropped; the cue sound above still plays, as in the original.
    if (!this.finiteArgs('linkChild', childX, childY, hp)) return;
    // `EffectManager.SpawnEffect00425B70(0x20, …)` rides on the child's own VM,
    // mirrored and spun the other way on odd slots; the host only gets the flash.
    this.fxRequests.push({
      kind: 'burst',
      x: childX,
      y: childY,
      angle: 0,
      color: -1,
      scale: 1,
      script: EFFECT_FAMILIAR_SPAWN,
    });
    manager.spawnLinkedChild({
      subId: sub | 0,
      x: childX,
      y: childY,
      hp: hp | 0,
      dropType: dropType | 0,
      score: score | 0,
      parentIndex: this.slotIndex,
      followParent: mode === 2,
    });
    this.childCount++;
  }

  // Spawn
  /**
   * Spawn a helper relative to this enemy (ops 47 / 108). The translated
   * scripts always pass sub id, an x/y/z offset in pixels and the HP.
   */
  spawnEnemy(...args: number[]) {
    if (args.length < 5 || !this.enemyManager) return;
    const [sub, dx, dy, , hp] = args;
    this.enemyManager.spawn(sub | 0, this._x + dx, this._y + dy, hp);
  }
  spawnEnemyAlt(...args: number[]) {
    this.spawnEnemy(...args);
  }

  // Boss
  setInvuln() {
    this.invulnerable = true;
  }
  clearInvuln() {
    this.invulnerable = false;
  }
  enableDamage() {
    this.damageEnabled = true;
  }
  disableDamage() {
    this.damageEnabled = false;
  }
  /**
   * op 127 (`EclRunHigh.inl:635-665`): claim or release a boss marker slot.
   * A non-negative argument makes this the boss in slot `arg`, and only slot 0
   * drives the "boss present" flag the timeline waits on; a negative argument
   * releases the marker the slot is holding, which is how a fleeing boss lets
   * the stage run out without ever being killed.
   */
  setBossPresent(arg: number) {
    const marker = arg | 0;
    if (marker >= 0) {
      this.bossMarker = marker;
      this.isBoss = true;
      if (marker === 0) this.gs.isBossPresent = true;
      return;
    }
    if (this.bossMarker < 4) this.gs.isBossPresent = false;
    this.isBoss = false;
    this.bossMarker = 255;
  }
  /** Boss HP for the current life bar (op 131 SETLIVES). */
  setLives(count: number) {
    this.hasGauge = true;
    this._hp = count;
    this._maxHp = Math.max(1, count);
    // A fresh bar re-arms the death pass, which is what lets a boss take its
    // next card after a death sub has spent the previous one.
    if (count > 0) this.deathLatch = false;
  }
  /** Spare bars behind the visible one (op 148) — drawn as gauge pips. */
  eclSetLives(count: number) {
    this.hasGauge = true;
    this.gaugePips = Math.max(0, count | 0);
  }
  /** One coloured gauge segment spanning HP [start, stop) (op 158). */
  setLifeBarSlice(index: number, start: number, stop: number, color = -1) {
    this.gaugeSlices[index | 0] = { start, stop, color: color & 0xffffff };
  }
  /** Spell-card countdown in frames; -1 means untimed (op 137). */
  setTimeout(frames: number) {
    this.gaugeTimerFrames = Math.max(0, frames | 0);
  }
  /**
   * Gauge timer params (op 152). Translated scripts use all zeros to stop the
   * timer, so any other non-zero value is taken as the countdown length.
   */
  setGaugeTimer(...args: number[]) {
    const frames = args.length >= 2 ? args[1] : 0;
    if (frames > 0) this.gaugeTimerFrames = frames | 0;
  }
  /**
   * Op 122: publish the card the script just declared. `Spellcard::StartSpell`
   * keeps the name, owner, id, face script and bonus together, and the HUD and
   * the cut-in both read them back off the game state.
   */
  startSpell(name: string, owner: string, number: number, face: number, bonus: number) {
    this.gs.spellName = name;
    this.gs.spellOwner = owner;
    this.gs.spellNumber = number | 0;
    this.gs.spellFace = face | 0;
    this.gs.spellBonus = bonus | 0;
    this.gs.spellFrames = 0;
    // `Spellcard::StartSpell` opens the card with its full bonus and starts the
    // clock that decays it (`Spellcard.cpp:775-784`).
    this.cardBonusProgress = bonus | 0;
    this.cardFrames = Math.max(0, this.spellTimerFrames);
    this.cardElapsedFrames = 0;
    this.cardSettled = false;
  }
  /** Op 123: the card is over; the banner and the cut-in go with it. */
  endSpell() {
    this.settleCard(false);
    this.gs.spellName = null;
    this.gs.spellBonus = 0;
    this.gs.spellFrames = 0;
  }

  /** Frames still on the countdown, as the scripts and the plate see them. */
  private spellSecondsLeft(): number {
    if (this.spellTimerFrames < 0) return 0;
    return Math.max(0, Math.trunc((this.spellTimerFrames - this.spellTimerElapsed) / 60));
  }

  /**
   * Publish how the live card ended. `captured` means the bar was broken before
   * the clock ran out, which is the only case that pays (`Spellcard::EndSpell`
   * checks the time-out flag at `Spellcard.cpp:1060-1073`).
   */
  private settleCard(captured: boolean): void {
    if (this.cardSettled || !this.gs.spellName) return;
    this.cardSettled = true;
    const remaining =
      this.spellTimerFrames >= 0 ? Math.max(0, this.spellTimerFrames - this.spellTimerElapsed) : 0;
    const progress = Math.max(0, this.cardBonusProgress);
    this.spellResults.push({
      name: this.gs.spellName,
      owner: this.gs.spellOwner,
      bonus: captured ? progress - (progress % 10) : 0,
      fullBonus: captured ? this.gs.spellBonus : 0,
      remainingFrames: remaining,
      timerFrames: this.cardFrames,
      elapsedFrames: this.cardElapsedFrames,
      noTimeoutPenalty: this.noTimeoutPenalty,
      captured,
      isLastSpell: isLastSpellCard(this.gs.spellNumber),
    });
  }

  // Shots / bullets (ECL ops 82, 96..110)

  /**
   * Int operand indirection, mirroring `EclOperands::ResolveInt`: an operand
   * naming a register reads that register, anything else is the literal.
   */
  private resolveIntOperand(value: number): number {
    const name = INT_FIELD_BY_ID[value];
    if (!name) return value;
    const field = (this as unknown as Record<string, unknown>)[name];
    return typeof field === 'number' ? Math.trunc(field) : value;
  }

  /**
   * Float twin: `EnemyOverlay::ResolveFloat` truncates the operand to pick a
   * register, so `10016.0` means `f0` while an ordinary speed stays as it is.
   */
  private resolveFloatOperand(bits: number): number {
    const value = EnemySlot.i2f(bits);
    const name = FLOAT_FIELD_BY_ID[Math.trunc(value)];
    if (!name) return value;
    const field = (this as unknown as Record<string, unknown>)[name];
    return typeof field === 'number' ? field : value;
  }

  /** True while a boss life bar is live — retail's `g_Spellcard.IsActive()`. */
  private get inSpellCard(): boolean {
    return this.enemyManager?.hasGaugeOwner() ?? false;
  }

  /**
   * ECL ops 96..104, the bullet launchers. `EclRunHigh.inl:394-412` sends all
   * nine to one handler that parks the instruction while the hold flag is set
   * and otherwise hands it to `DispatchShotInstruction`, whose aim mode is
   * `opcode - 0x60`. Operands arrive raw because the original resolves them
   * against the register file here, at fire time, not at translation time.
   */
  spawnShot(desc: ShotDescriptor): void {
    if (this._hp <= 0) return;
    // Back to the interpreter's own words: ops 105..109 replay the exact vector a
    // launcher was fired with, and register-indirect fields have to stay indirect
    // for that replay to track the ship the way the original does.
    const raw = packShot(desc);
    if (this.shotsHeld) {
      // Retail `memcpy(enemy + 0x3034, instruction, ...)`: the newest held shot
      // replaces the previous one and `shotRepeatFrames` fires it from `tick`.
      this.heldShot = raw;
      return;
    }
    this.lastShot = raw;
    this.dispatchShot(...raw);
  }

  /** The last shot instruction, replayed on demand by op 109. */
  private lastShot: number[] | null = null;

  /**
   * `BulletManager::FUN_00430e10` + `FUN_0042f5f0`: build the descriptor, then
   * lay out `count2` rings of `count1` bullets under the mode's geometry.
   *
   * Takes the operands as a rest list because ops 105..109 replay the exact
   * argument vector an earlier shot instruction was built from.
   */
  private dispatchShot(...args: number[]): void {
    const [
      mode,
      packed,
      countRaw,
      ringsRaw,
      speed1Raw,
      speed2Raw,
      angleRaw,
      stepRaw,
      transformFlags,
      operandFlags,
    ] = args;
    const pool = this.bulletPool;
    if (!pool) return;
    const tf = transformFlags >>> 0;
    // Ops 96..104 gate on bit 11 of `enemy+0x3324`, which retail only ever sets
    // inside the familiar sync -- see `EnemySlot.youkaiForm` for why these two
    // branches are provably never taken by shipped data.
    if (((tf & 0x8000) !== 0 && !this.youkaiForm) || ((tf & 0x10000) !== 0 && this.youkaiForm)) return;
    const noFire = this.shotNoFireRadiusSq;
    if (noFire > 0) {
      const dx = this._x - this.playerX;
      const dy = this._y - this.playerY;
      if (dx * dx + dy * dy < noFire) return;
    }

    const bulletType =
      (operandFlags & 1) !== 0 ? this.resolveIntOperand((packed << 16) >> 16) : (packed << 16) >> 16;
    const color = (operandFlags & 2) !== 0 ? this.resolveIntOperand(packed >> 16) : packed >> 16;
    let count1 = (operandFlags & 4) !== 0 ? this.resolveIntOperand(countRaw) : countRaw | 0;
    let count2 = (operandFlags & 8) !== 0 ? this.resolveIntOperand(ringsRaw) : ringsRaw | 0;
    let speed1 = (operandFlags & 0x10) !== 0 ? this.resolveFloatOperand(speed1Raw) : EnemySlot.i2f(speed1Raw);
    let speed2 = (operandFlags & 0x20) !== 0 ? this.resolveFloatOperand(speed2Raw) : EnemySlot.i2f(speed2Raw);
    const angle = (operandFlags & 0x40) !== 0 ? this.resolveFloatOperand(angleRaw) : EnemySlot.i2f(angleRaw);
    const angleStep =
      (operandFlags & 0x80) !== 0 ? this.resolveFloatOperand(stepRaw) : EnemySlot.i2f(stepRaw);

    if (!this.inSpellCard) {
      // Rank would add `ScaleInt/FloatBasedOnRank` deltas here; the per-enemy
      // rank offsets are op 105/106 territory, so only the clamps carry over.
      if (count1 <= 0) count1 = 1;
      if (count2 <= 0) count2 = 1;
      if (speed1 !== 0 && speed1 < 0.3) speed1 = 0.3;
      if (speed2 < 0.3) speed2 = 0.3;
    }

    const radius = this.bulletRadiusFor ? this.bulletRadiusFor(bulletType) : BULLET_HIT_RADIUS;
    const originX = this._x + this.shotOriginX;
    const originY = this._y + this.shotOriginY;
    if (this.shotRecordsDirty) {
      // Bullets keep a reference to the array they were fired with, so a write
      // from op 111 has to produce a new one rather than mutate the old.
      this.shotRecordsFrozen = this.shotRecords.map((r) => ({ ...r }));
      this.shotRecordsDirty = false;
    }
    const pattern = this.shotPattern;
    pattern.aimMode = mode;
    pattern.type = bulletType;
    pattern.color = color;
    pattern.count1 = count1;
    pattern.count2 = count2;
    pattern.speed1 = speed1;
    pattern.speed2 = speed2;
    pattern.angle = angle;
    pattern.angleStep = angleStep;
    pattern.transformFlags = tf;
    pattern.records = this.shotRecordsFrozen;
    pattern.startIndex = 0;
    pattern.transformSound = this.shotTransformSound;
    pattern.radius = radius;
    pattern.halfSize = this.bulletSizeFor ? this.bulletSizeFor(bulletType, color) : radius * 2;
    pattern.appearFrames = DEFAULT_APPEAR_FRAMES;
    pattern.tag = 'enemy';
    // Flag 0x200 on the instruction, not op 113, is what plays the muzzle sound
    // (`BulletManager::FUN_00430e10:704`).
    if ((tf & 0x200) !== 0) this.playSfx(this.shotSpawnSound);
    launchPattern(pool, this.shotWorld(), pattern, originX, originY);
  }
  /** Replay the held shot instruction once every `shotRepeatFrames` frames. */
  private tickShotRepeat(): void {
    const held = this.heldShot;
    if (!held || this.shotRepeatFrames <= 0) return;
    this.shotRepeatTimer++;
    if (this.shotRepeatTimer < this.shotRepeatFrames) return;
    this.shotRepeatTimer = 0;
    this.dispatchShot(...held);
  }

  /** Fire the stored descriptor again (op 109). */
  spawnShotNow() {
    if (this.lastShot) this.dispatchShot(...this.lastShot);
  }

  /**
   * ECL ops 114 and 115, the laser launchers (`EclRunHigh.inl:478-545`).
   *
   * Both share one handler and differ by a single field: `aimMode`. Op 115 leaves
   * it 0, which makes `SpawnLaserPattern` add the angle from the spawn point to
   * the player, so the beam tracks the ship; op 114 sets it 1 and the operand
   * angle is already absolute.
   *
   * The instruction's 13 operand words are handed over raw because the first word
   * packs two i16s — type at bit 0, colour at bit 16 — and the interpreter
   * resolves each of them through `ResolveInt`/`ResolveFloat` only when its own
   * `operandFlags` bit is set. The bit numbering follows the declared parameter
   * list, so the packed word is parameter 0 and 1 and every later word shifts by
   * one.
   */
  spawnLaser(desc: LaserDescriptor): void {
    const pool = this.laserPool;
    if (!pool) return;
    const [
      opcode,
      packed,
      angleRaw,
      speedRaw,
      tailRaw,
      headRaw,
      startLengthRaw,
      widthRaw,
      startTimeRaw,
      durationRaw,
      despawnRaw,
      hitboxStartRaw,
      hitboxEndRaw,
      transformFlagsRaw,
      operandFlags,
    ] = packLaser(desc);
    const indirect = (n: number) => (operandFlags & (1 << n)) !== 0;
    const bulletType = (packed << 16) >> 16;
    const color = indirect(1) ? this.resolveIntOperand(packed >> 16) : packed >> 16;
    const angle = indirect(2) ? this.resolveFloatOperand(angleRaw) : EnemySlot.i2f(angleRaw);
    const speed = indirect(3) ? this.resolveFloatOperand(speedRaw) : EnemySlot.i2f(speedRaw);
    const tail = indirect(4) ? this.resolveFloatOperand(tailRaw) : EnemySlot.i2f(tailRaw);
    const head = indirect(5) ? this.resolveFloatOperand(headRaw) : EnemySlot.i2f(headRaw);
    const startLength = indirect(6)
      ? this.resolveFloatOperand(startLengthRaw)
      : EnemySlot.i2f(startLengthRaw);
    const width = indirect(7) ? this.resolveFloatOperand(widthRaw) : EnemySlot.i2f(widthRaw);
    // The four timing operands and the flag word travel as plain i32s: only the
    // first seven operands are reinterpreted as floats.
    const startTime = indirect(8) ? this.resolveIntOperand(startTimeRaw) : startTimeRaw | 0;
    const duration = indirect(9) ? this.resolveIntOperand(durationRaw) : durationRaw | 0;
    const despawnDuration = indirect(10) ? this.resolveIntOperand(despawnRaw) : despawnRaw | 0;
    // The last three operands are read straight out of the instruction: the
    // handler never consults `operandFlags` past bit 10.
    const hitboxStartTime = hitboxStartRaw | 0;
    const hitboxEndDelay = hitboxEndRaw | 0;
    const flags = transformFlagsRaw | 0;

    const x = this._x + this.shotOriginX;
    const y = this._y + this.shotOriginY;
    pool.spawn({
      x,
      y,
      // `aimMode == 0` is op 115: the beam is relative to the ship direction.
      angle:
        opcode === 115
          ? normalizeAngle(Math.atan2(this.playerY - y, this.playerX - x) + angle)
          : normalizeAngle(angle),
      tail,
      head,
      startLength,
      width,
      speed,
      startTime,
      hitboxStartTime,
      duration,
      despawnDuration,
      hitboxEndDelay,
      flags,
      color,
      bulletType,
    });
  }

  /** Repeat interval for the held shot (op 105). */
  setShotRepeat(frames: number) {
    this.shotRepeatFrames = Math.max(0, frames | 0);
    this.shotRepeatTimer = 0;
  }
  /** Repeat interval with a random phase, so a wall of enemies desyncs (op 106). */
  setShotRepeatRand(frames: number) {
    const interval = Math.max(0, frames | 0);
    this.shotRepeatFrames = interval;
    this.shotRepeatTimer = interval > 0 ? this.gs.rng.randomU32InRange(interval) : 0;
  }
  /** Park following shot instructions instead of firing them (op 107). */
  holdShots() {
    this.shotsHeld = true;
  }
  /** Release the held shot instruction (op 108). */
  releaseShots() {
    this.shotsHeld = false;
  }
  /** Move the muzzle relative to the enemy (op 110). */
  setShotOrigin(x: number, y: number) {
    this.shotOriginX = Number.isFinite(x) ? x : 0;
    this.shotOriginY = Number.isFinite(y) ? y : 0;
  }
  /** Stop firing while the player is this close; squared at load (op 82). */
  setShotNoFireRadius(radius: number) {
    const r = Number.isFinite(radius) ? radius : 0;
    this.shotNoFireRadiusSq = r * r;
  }
  /** Alternate hit flash (op 83, `enemy+0x3328` bit 1). */
  setHitFlash(flag: number) {
    this.hitFlash = (flag & 1) !== 0;
  }

  /** Second flag word bit 1: bigger hit effect when the enemy is hit. */
  hitFlash = false;
  aimAtPlayer(_mode: number, _angle: number) {}
  clearAllBullets() {
    this.bulletPool?.clearByTag('enemy');
  }
  removeBulletsRadius(radius: number) {
    this.bulletPool?.clearInRadius(this._x, this._y, radius);
  }
  removeAllBullets() {
    this.bulletPool?.clearByTag('enemy');
  }

  // Items
  spawnItem(type: number) {
    const kinds = ['powerSmall', 'powerBig', 'powerFull', 'point', 'life', 'bomb', 'timeOrb'] as const;
    this.itemPool?.spawn(kinds[type] ?? 'powerSmall', this._x, this._y);
  }
  spawnItemBatch(..._args: number[]) {
    for (let i = 0; i < 5; i++)
      this.itemPool?.spawn('point', this._x + (this.gs.rng.randomF32() - 0.5) * 32, this._y);
  }
  spawnItemRandom(arg: number) {
    this.spawnItem(arg);
  }

  // Effects / sound
  //
  // ECL names an *effect id*, never a sprite. `g_EffectTemplates[id]` resolves that id to
  // an `etama.anm` script plus the two movers that position it, and the pool blits whatever
  // sprite the script currently selects (`EffectManager.cpp:121-190`). Without an injected
  // pool -- a headless sim test, a build without the lifted table -- these same calls fall
  // back to the one-shot `fxRequests` notes the placeholder art reads.

  /**
   * The orbit effect anchored to this enemy (op 128).
   *
   * Retail ignores the opcode's first operand and always asks for template 13, with the
   * spawn colour 0xFF6060D0; operands 1..3 are the orbit axis as three floats and operand
   * 4 the radius the orbit grows out to (`EclRunHigh.inl:667-680`, read back as a float in
   * `EnemyManager.cpp:1036-1046`).
   */
  spawnEffect(...args: number[]) {
    const axis = {
      x: EnemySlot.i2f(args[1] ?? 0),
      y: EnemySlot.i2f(args[2] ?? 0),
      z: EnemySlot.i2f(args[3] ?? 0),
    };
    const radius = EnemySlot.i2f(args[4] ?? 0);
    const pool = this.effectPool;
    if (!pool) {
      const scale = Number.isFinite(radius) && radius > 0 ? radius : 160;
      this.fxRequests.push({
        kind: 'aura',
        x: this._x,
        y: this._y,
        angle: 0,
        color: -1,
        scale,
        script: args.length > 0 ? args[0] | 0 : 6,
      });
      return;
    }
    const handle = pool.spawn(13, this._x, this._y, {
      color: 0xff6060d0,
      axis,
      radius,
      ownerPos: () => (this.active ? { x: this._x, y: this._y } : null),
    });
    // `enemy+0x5360` is a 24-slot array of this enemy's orbits; past that retail walks off
    // the end of it, so the port simply stops remembering extras.
    if (handle && this.orbitEffects.length < 24) this.orbitEffects.push(handle);
  }
  /**
   * Op 138 (`EclRunHigh.inl:429-433`): three bytes straight into the enemy's
   * `DeathAnm` slots. Retail clamps them to `u8`, and the first one is read back as
   * `i8`, so a value of 200 would be negative and silence the death effects.
   */
  setDeathEffects(...args: number[]) {
    this.deathEffect1 = (args[0] ?? 0) & 0xff;
    this.deathEffect2 = (args[1] ?? 0) & 0xff;
    // Operand 3 lands on `enemy+0x3312`, which no death path in the binary reads, so
    // it is accepted for the record and dropped.
  }

  /**
   * The retail death pass, `EnemyManagerUpdate.cpp:884-888`: one copy of
   * `DeathAnm1` and four of `DeathAnm2 + 4`, both at full white. `DeathAnm1` is only
   * paid when the signed byte is non-negative, which is how a script mutes an
   * explosion without touching anything else.
   */
  private spawnDeathEffects(): void {
    const pool = this.effectPool;
    if (!pool || this.deathEffectsSuppressed) return;
    if (this.deathEffect1 < 128) {
      pool.spawn(this.deathEffect1, this._x, this._y, { count: 1, color: -1 });
      pool.spawn(this.deathEffect2 + 4, this._x, this._y, { count: 4, color: -1 });
    }
  }

  /**
   * An effect thrown along a heading (op 140): id, count, colour, then the velocity whose
   * x is an angle for the radial movers (`EclRunHigh.inl:795-812`).
   */
  spawnEffectAngle(...args: number[]) {
    const id = args.length > 0 ? args[0] | 0 : 0;
    const count = args.length >= 2 ? args[1] : 1;
    const color = args.length >= 3 ? args[2] : -1;
    // Operands 3..5 are f32s by the time the translator has decoded them — either an
    // immediate or `ResolveFloat` of a register — so they arrive as plain numbers. The
    // angle is what decides the look: `-999` is retail's own "pick a random heading"
    // sentinel (`FUN_004270c0`), which only survives if nothing re-reads the bits.
    const velocity = {
      x: args[3] ?? 0,
      y: args[4] ?? 0,
      z: args[5] ?? 0,
    };
    const pool = this.effectPool;
    if (!pool) {
      this.fxRequests.push({
        kind: 'burst',
        x: this._x,
        y: this._y,
        angle: velocity.x,
        color,
        scale: 1,
        script: id,
      });
      return;
    }
    pool.spawn(id, this._x, this._y, { count, color, velocity });
  }
  /** One-shot effect on top of this enemy (op 139). */
  spawnEffectAt(...args: number[]) {
    const id = args.length > 0 ? args[0] | 0 : 0;
    const count = args.length >= 2 ? args[1] : 1;
    const color = args.length >= 3 ? args[2] : -1;
    const pool = this.effectPool;
    if (!pool) {
      this.fxRequests.push({
        kind: 'burst',
        x: this._x,
        y: this._y,
        angle: 0,
        color,
        scale: Math.max(1, count),
        script: id,
      });
      return;
    }
    pool.spawn(id, this._x, this._y, { count, color });
  }
  /**
   * Queue the sound id; the host maps it onto the real th08 SE bank.
   *
   * `id >= 0` is retail's own guard (`BulletManager.cpp:1266`, and `NO_SOUND` is -1),
   * so index 0 - the tick the pause menu also uses - is a request like any other.
   * `x` is `PlaySoundPositionedByIdx`'s pan source; leave it out for the unpositioned
   * form, which retail centres.
   */
  playSfx(id: number, x = Number.NaN) {
    if (id >= 0) this.sfxRequests.push({ id: id | 0, x });
  }
  /**
   * The effect that reads differently on the two sides (op 174).
   *
   * It is not a conditional spawn: retail always fires, into the second pool at id+0x20,
   * and then hands the VM interrupt 2 for a youkai ship or 1 for a human one, so the
   * script itself picks the branch (`EclRunHigh.inl:1089-1101`). The effect it replaces is
   * retired on the spot rather than faded.
   */
  effectWithYoukai(arg: number) {
    const pool = this.effectPool;
    this.youkaiEffect?.stop();
    if (!pool) {
      this.spawnEffect(arg);
      return;
    }
    this.youkaiEffect = pool.spawn((arg | 0) + 0x20, this._x, this._y, {
      color: -1,
      secondary: true,
      interrupt: this.gs.playerIsYoukai ? 2 : 1,
    });
  }
  /**
   * Stage background sequence start (op 179). The 3D `.std` scroller is driven
   * by the host, which listens for this through `EnemyManager.stageBgRequests`.
   */
  startStageBg() {
    this.enemyManager?.notifyStageBg();
  }

  // Generated ECL methods
  nop(..._args: number[]) {}
  nop3(..._args: number[]) {}
  /** op 8 (`EclRunLow.inl:522-525`): the int twin, sign applied to a resolved operand. */
  randSign(val: number): number {
    return this.gs.rng.randomU16() & 1 ? val : -val;
  }
  /** op 9 (`EclRunLow.inl:526-532`): the same coin flip on a float. */
  randSignF(val: number): number {
    return this.gs.rng.randomU16() & 1 ? val : -val;
  }
  /**
   * op 184 (`Spellcard::FUN_0041f0e0`): hold the live card's bonus still so it
   * stops decaying with the clock. Nothing else: it never made a boss immune.
   */
  complexBossInit(arg: number) {
    this.cardBonusFrozen = arg !== 0;
  }
  complexSetup(..._args: number[]) {}
  /**
   * op 133 (`EclRunHigh.inl:746-757`): arm life-bar slot `i` so that dropping
   * below `threshold` hands the script to `sub`. -1 disarms a slot again.
   */
  setPhase(i: number, threshold: number, sub: number) {
    const slot = i | 0;
    if (slot < 0 || slot >= this.phaseThresholds.length) return;
    this.phaseThresholds[slot] = threshold | 0;
    this.phaseSubs[slot] = sub | 0;
  }
  setSpellHP(...args: number[]) {
    if (args.length >= 2) this.spellHp = args[1];
  }
  /**
   * ECL op 111 (`EclRunHigh.inl:414-428`): install one `BulletTransformRecord`.
   *
   * The address the original writes, `enemy+0x2E44`, is `0x2E24 + 0x20`: the
   * transform array inside the shot descriptor, at the record stride of 0x18. The
   * earlier read of this opcode as an interpolator is what left every curve,
   * acceleration, bounce, split and mid-flight sprite change unimplemented, and
   * the bullet array jammed full of the speed-zero clusters those records exist to
   * launch.
   */
  setShotRecord(
    index: number,
    kind: number,
    allowWhileActive: number,
    int0: number,
    int1: number,
    float0: number,
    float1: number,
  ): void {
    const slot = index | 0;
    if (slot < 0 || slot >= SHOT_RECORD_SLOTS) return;
    const record = this.shotRecords[slot];
    record.kind = kind >>> 0;
    record.allowWhileActive = allowWhileActive | 0;
    record.int0 = int0 | 0;
    record.int1 = int1 | 0;
    record.float0 = float0;
    record.float1 = float1;
    this.shotRecordsDirty = true;
  }

  /**
   * ECL op 113 (`EclRunHigh.inl:953-962`): the shot sounds. The flag bit this
   * raises at `+0x3020` is inside the descriptor' + T + 's transform word, which the
   * very next shot instruction overwrites with its own operand, so in practice
   * only the two sound ids survive to matter.
   */
  setShotSound(spawn: number, transform: number): void {
    this.shotSpawnSound = spawn | 0;
    this.shotTransformSound = transform | 0;
  }

  /** The world the transform handlers read: ship, rng, art tables, sound. */
  private shotWorld(): BulletWorld {
    if (this.bulletWorldCache) return this.bulletWorldCache;
    const self = this;
    this.bulletWorldCache = {
      get playerX() {
        return self.playerX;
      },
      get playerY() {
        return self.playerY;
      },
      rng: { randomF32InRange: (range: number) => self.gs.rng.randomF32InRange(range) },
      radiusFor: (type: number) => (self.bulletRadiusFor ? self.bulletRadiusFor(type) : 4),
      sizeFor: (type: number, color: number) => (self.bulletSizeFor ? self.bulletSizeFor(type, color) : 8),
      onSound: (id: number, x: number) => {
        self.playSfx(id, x);
      },
    };
    return this.bulletWorldCache;
  }
  /** op 59: the six scripts, addressed against `stgNNenm.anm`. */
  setAnmScripts6Alt(base: number) {
    this.setPrimaryAnmScripts(base, base + 1, base + 2, base + 3, base + 4, base + 5, true);
  }
  setColor(...args: number[]) {
    this.spriteColor = args.length > 0 ? args[0] & 0xffffff : -1;
  }
  setFloatField(field: number, value: number) {
    const k = 'ef' + field;
    if (k in this) (this as any)[k] = value;
  }
  setIntPair(a: number, b: number) {
    this.ei0 = a;
    this.ei1 = b;
  }
  setIntFields(...args: number[]) {
    for (let i = 0; i < args.length && i < 8; i++) (this as any)['ei' + i] = args[i];
  }
  enemyFunc95(..._args: number[]) {}
  /**
   * op 181 (`EclRunHigh.inl:1111-1121`): the night clock. Retail tolls it one
   * hour at a time and stops dead at 12, which is dawn -- past that the stage
   * result pays no 夜残得点 (`Gui.cpp:1210`) and stage 6B takes its ending
   * branch (`Gui.cpp:311-324`). The bell is sound 0x2D.
   */
  clockControl() {
    if (this.gs.clockTime >= 12) return;
    this.playSfx(0x2d);
    this.gs.clockTime += 1;
  }
  setMisc116(..._args: number[]) {}
  setMisc120(..._args: number[]) {}
  /**
   * Op 126: hand sub `args[0]` to attached lane `args[1]`. Translated scripts
   * use it as the boss body launcher — the entry script claims the marker, arms
   * the life-bar timers and then parks in a spin, while the named sub runs the
   * real phase/card script out of a lane. Same operands as `callSubAlloc`
   * (op 135) but in the other order, which is why every observed call site
   * passes `(sub, 1)`.
   */
  setMisc126(...args: number[]) {
    if (args.length < 2) return;
    this.callSubAlloc(args[1], args[0]);
  }
  setMisc129(..._args: number[]) {}
  /**
   * op 130 (`EclRunHigh.inl:687-691`): the sub that takes over in place of
   * death. This is how a boss's last bar becomes the next card or the flee.
   */
  setDeathCallbackSub(sub: number) {
    this.deathCallbackSub = sub | 0;
  }
  /** op 132: seek the countdown clock, which is how a script re-opens a card. */
  setSpellTimerElapsed(frames: number) {
    this.spellTimerElapsed = frames | 0;
  }
  /**
   * op 134 (`EclRunHigh.inl:758-768`): arm the card countdown. The plate timer
   * and the ECL's own `0x2774` read are both this window, so they are seeded
   * from here rather than kept as a second clock.
   */
  setSpellTimer(frames: number, sub: number) {
    this.spellTimerFrames = frames | 0;
    this.spellTimerSub = sub | 0;
    this.spellTimerElapsed = 0;
    if (this.hasGauge) this.gaugeTimerFrames = Math.max(0, this.spellTimerFrames);
    // Some scripts arm the clock after op 122; the card still owns that window.
    if (this.gs.spellName && !this.cardSettled && this.cardFrames <= 0) {
      this.cardFrames = Math.max(0, frames | 0);
    }
  }
  /**
   * op 136 (`EclRunHigh.inl:865`): the `ex` family. The first operand selects one
   * of 32 handlers out of `g_EclExInsn` (`EclGlobals.cpp:73-105`) and the rest are
   * that handler's own arguments, so this is a second opcode space hidden inside
   * one ECL instruction - the same shape as the ECL's own dispatch, one level down.
   *
   * Only `ex 18` has a modelled effect today. The rest are listed below with what
   * they actually do in retail and why they are safe to skip, rather than being
   * silently swallowed:
   *
   * - `0`, `1`, `5`, `6`, `10`, `14`, `15`, `17`, `20`, `23`, `24`: all of them are
   *   `ScreenEffect::RegisterChain` calls (`EclExIns.cpp:47-120`, `:801`) that ask
   *   the post-process manager for a chain - screen tint, shake, the 幻想庭园
   *   barrier wash. They change nothing about the simulation, and the port has no
   *   post-process chain manager, so skipping them costs pixels and not behaviour.
   * - `12` (`ReisenFreezeBullets`, `EclExIns.cpp:620-660`) plus `13`: the stage-5
   *   bullet freeze, which writes every live bullet's velocity to the release
   *   heading and swaps its sprite band. This is a real gameplay effect and the
   *   most-used `ex` in the shipped scripts (18 calls). It is not modelled yet.
   * - `22` (`MokouResurrection`, `:846`): a cut-in banner for stage 3's Mokou card.
   * - `30`: bump `g_ScreenEffectCounter`.
   * - `31` (`FUN_00425390`, `:971`): drop a 点 or 符 item depending on
   *   `Player+0xFDC` - i.e. it asks whether a spell card is playing.
   * - `26` (`FUN_00425070`, `:897`): `g_EclScriptedGlobalUpdateFreeze`, which the
   *   port already reaches through `StageRunner.worldFreeze`; the conversation and
   *   menu producers share that one channel with it.
   *
   * `ex 18` (`FUN_00424f90`, `EclExIns.cpp:825-837`) is the global slow-motion:
   * `g_EclGameTimeScale = 1 / value`, and `EclGlobals.cpp:117` makes that global
   * *be* `g_Supervisor.framerateMultiplier`, so every consumer that multiplies its
   * step by it crawls together - bullets launch and renormalise slower
   * (`BulletManager.cpp:184`, `:1192-1417`), enemy motion slows
   * (`EnemyManager.cpp:63-89`, `EnemyManagerUpdate.cpp:486`), so do lasers
   * (`:1046`), items (`ItemManager.cpp:210`), the ship itself
   * (`Player.cpp:880`) and its 妖力 meter (`:939`). Stage 6b opens with
   * `ex 18 4` and restores it with `ex 18 1`.
   */
  setMisc136(sub: number, value: number) {
    switch (sub | 0) {
      case 18: {
        // `EclExIns.cpp:833-836`: the operand is a divisor, and a zero operand is
        // what retail computes too - `1 / 0` is infinity, which is a stalled game,
        // so the scripts never send it. Guard the sign of the guard, not the maths.
        this.gs.timeScale = value === 0 ? 1 : 1 / value;
        break;
      }
      default:
        break;
    }
  }
  setMisc144(..._args: number[]) {}
  setMisc145(..._args: number[]) {}
  setMisc147(..._args: number[]) {}
  /** op 153 (`EclRunHigh.inl:978-981`): the countdown now expires into death. */
  resetSpellTimerSub() {
    this.spellTimerSub = this.deathCallbackSub;
    this.spellTimerElapsed = 0;
  }
  /** op 155: stop the countdown from charging a card for time or bullets. */
  setMisc155(...args: number[]) {
    this.noTimeoutPenalty = (args[0] ?? 0) !== 0;
  }
  setMisc159(..._args: number[]) {}
  /**
   * op 160 (`EclRunHigh.inl:1003`): arm `enemy+0x5354`, the damage-freeze timer.
   * While it runs a boss takes a ninth of the frame's damage and a plain enemy takes
   * none, which is the grace window a script uses to make an entrance unhittable
   * without switching the sprite off.
   */
  setMisc160(...args: number[]) {
    this.freezeFrames = args[0] ?? 0;
  }
  setMisc165(..._args: number[]) {}
  setMisc167(..._args: number[]) {}
  /**
   * Op 173 (`EclRunHigh.inl:1045-1047`): `EMUF1_PAUSE_TIMER`. Hold this slot's script
   * for the duration of a player card.
   */
  setMisc173(...args: number[]) {
    this.pauseTimer = (args[0] ?? 0) !== 0;
  }
  /**
   * Op 175 (`EclRunHigh.inl:1104`): arm or clear the shared table slot 91, which
   * every timeline spawn checks before it is allowed to put an enemy on screen.
   */
  pauseEnemySpawns(...args: number[]) {
    this.gs.spawnPaused = (args[0] ?? 0) !== 0;
  }
  setMisc177(..._args: number[]) {}
  setMisc178(..._args: number[]) {}
  setMisc182(..._args: number[]) {}
  /**
   * op 183 (`EclRunHigh.inl:1048-1050`): `EMUF1_NO_DAMAGE_DURING_STOP`. Armed, the
   * slot is skipped by the whole shot/damage pass while Sakuya's clock is stopped.
   */
  setMisc183(...args: number[]) {
    this.noDamageDuringStop = (args[0] ?? 0) !== 0;
  }
}
