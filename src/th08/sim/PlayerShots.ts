/**
 * The retail player-shot layer: `Player.shots[128]`, the `.sht` firing walk, and
 * the integrator that moves them.
 *
 * Everything in this file is a transcription of four functions in `Player.cpp`:
 *
 *  - `FUN_00451500` (`:3288-3348`) owns the twenty-frame shooting window and
 *    decides *when* a volley is attempted;
 *  - `FUN_00450f60` (`:3090-3160`) picks the power tier and walks the firing
 *    chain, one entry per free slot;
 *  - `FUN_0044fb70` (`:2633-2680`) fills one shot slot from one entry - origin,
 *    offsets, velocity, hitbox, animation, sound, and the 妖怪 marker;
 *  - `FUN_00451150` (`:3166-3215`) moves every live shot, culls the ones that
 *    leave the field, and retires the ones whose script ends.
 *
 * The point of doing it this way is that the *weapon* stops being a description
 * the port wrote for itself. Damage, projectile count, cadence, spread, speed,
 * hitbox size, which option fires it, and which sprite it draws all come out of
 * the retail `.sht` through `parseShtTables`, and the numbers in the shipped
 * files are the ones the original's own balance was built from: `ply00a` fires
 * every five frames for 48 damage at tier 8 and every fifteen for 14 at the side
 * angles, which is 霊夢's weapon, not this file's opinion about it.
 *
 * Two callbacks in `g_PlayerShotUpdateCallbacks` are named here and not modelled,
 * because their bodies drive retail's ECL-timeline association (`Player+0xE2A44`
 * reservations and `player->timelines[]`) rather than a shot of their own: `4`
 * (`FUN_0044fe20`, 爱丽丝's doll anchor) and the per-frame `4`/`5`
 * (`FUN_004505d0`/`FUN_00450840`, the beams those anchors carry). Those entries are
 * *skipped* rather than approximated, and {@link PlayerShotPool.skipped} counts
 * exactly how many shots a given frame lost to that gap.
 */

import type { ShtPowerTable, ShtShotEntry } from '../format/ShtFile';
import { shtTableForPower } from '../format/ShtFile';
import { AnmVm, type AnmRng } from '../../engine/anm/AnmVm';
import type { AnmPack } from '../../engine/anm/AnmPack';

/** `Player.shots[128]` (`Player.hpp:180`, `C_ASSERT(sizeof(PlayerShot) == 0x484)`). */
export const PLAYER_SHOT_SLOTS = 128;

/** `state462`: 0 free, 1 live, 2 already spent on a hit but still drawn. */
export const SHOT_FREE = 0;
export const SHOT_LIVE = 1;
export const SHOT_SPENT = 2;

/** One slot, named after the `PlayerShot` offsets the decomp reads. */
export interface PlayerShot {
  /** `+0x462`. */
  state: number;
  /** `+0x2A4`, the sim position the collision pass boxes against. */
  x: number;
  y: number;
  /** `+0x43C`/`+0x440`, the velocity the integrator adds every frame. */
  vx: number;
  vy: number;
  /** `+0x44C`, the speed the `FUN_00450320` steerer ramps between 1 and 10. */
  speed: number;
  /** `+0x450`, the angle the sprite is turned to. */
  angle: number;
  /** `+0x454`. */
  timer: number;
  /** `ZunTimer::subFrame`, the fraction a slow-motion frame leaves unpaid. */
  timerSub: number;
  /** `ZunTimer::FUN_0040d3d0` for the last tick: did `timer` move that frame? */
  timerAdvanced: boolean;
  /** `+0x460` from `entry+0x1C`, in the same hundredths the damage cap uses. */
  damage: number;
  /** `+0x464` from `entry+0x22`; 4 and 5 are exempt from the playfield cull. */
  type: number;
  /** `+0x430`/`+0x434` from `entry+0x0C`/`entry+0x10`. */
  hitboxWidth: number;
  hitboxHeight: number;
  /** `+0x46C`: the focus byte as it stood when the shot left the ship. */
  focusedAtSpawn: number;
  /** `+0x46E` from `entry+0x24`, before the `+10` the script index needs. */
  animationIndex: number;
  /** `+0x470`: draw tinted 0x4040ff because the meter was 极度妖怪. */
  youkaiMark: number;
  /** `entry+0x1E`, kept signed: negative is what drops a 时符 past the threshold. */
  youkaiItemGate: number;
  /** `+0x474`/`+0x478`/`+0x47C`, resolved from `entry+0x2C`/`+0x30`/`+0x34`. */
  updateCb: number;
  renderCb: number;
  collisionCb: number;
  /** The chain entry this slot is riding, for the passes that re-read it. */
  entry: ShtShotEntry | null;
  /** `PlayerShot::vm`, the ANM script that says how long this shot lives. */
  vm: AnmVm;
}

/** What the firing layer needs from the game, one name per retail read. */
export interface PlayerShotWorld {
  /** `Player.primaryShtFile` / `secondaryShtFile`, chosen by `Player+3`. */
  primary: ShtPowerTable[];
  secondary: ShtPowerTable[];
  /** `Player+3`, the settled-focus byte: zero reads the primary table set. */
  focusByte: number;
  /** `g_GameManager.GetPower()`, in the same units as the tier gates. */
  power: number;
  /** `g_GameManager.shotType`, 0-11. */
  shotType: number;
  /** `Player+0xFDC`, non-zero while a spell card is playing. */
  cardRunning: boolean;
  /** `Player+0xFE0`, the card variant word. */
  cardPhase: number;
  /** `Player+0xFF4`, the card's own frame counter. */
  cardFrames: number;
  /** `Player.timerE2AC4`: the position inside the twenty-frame shot window. */
  shotWindow: number;
  /** `ZunTimer::FUN_0040d3d0` - the window timer moved on this frame. */
  shotWindowAdvanced: boolean;
  /** `(g_GuiMessageInputCurrent & 1) != 0`, the fire button. */
  shootHeld: boolean;
  /** `g_Gui.IsDialogPresent()`. */
  dialogPresent: boolean;
  /** `Player.bombState.frameStop` in the strict sense: 咲夜's stopped clock. */
  frameStop: boolean;
  /** `GameManager::GaugeIsExtremelyYoukai`. */
  extremelyYoukai: boolean;
  /** `Player+0x2B4`, the muzzle every `entry+0x20 == 0` shot starts from. */
  aimX: number;
  aimY: number;
  /** `PlayerOptionState::position` per slot, for the `entry+0x20` 1..4 origins. */
  optionPositions(): ReadonlyArray<{ x: number; y: number } | null>;
  /** `g_Player.optionHomingTarget`, read by `FUN_00450240`. */
  homingTarget: { x: number; y: number } | null;
  /** `Player.tailPosition0`, the point `FUN_00450320` steers 霊夢's charms to. */
  tailX: number;
  tailY: number;
  /** `Player.optionStates[2].facingAngle`, which `FUN_00450110` fires along. */
  bladeAngle: number;
  /** `g_GameManager.IsWithinPlayfield`'s box, in field coordinates. */
  bounds: { left: number; right: number; top: number; bottom: number };
  /** `g_EclGameTimeScale`, applied to the position step. */
  timeScale: number;
  /** The pack `g_PlayerAnmFilenames` named for this shot type. */
  anmPack: AnmPack | null;
  /** Cell size for the VM, so a script's own scale factors land on real pixels. */
  spriteSize(sprite: number): { x: number; y: number } | null;
  /** `g_SoundPlayer.PlaySoundPositionedByIdx`. */
  onSound?(index: number, x: number): void;
  /** `g_Rng.GetRandomF32`, shared with the ECL layer so draws stay in sequence. */
  rng: AnmRng;
}

/** Is this frame one where the ship may shoot at all (`FUN_00451500`)? */
export function canAttemptShot(world: PlayerShotWorld): boolean {
  // `:3300`: the window is closed until the player pressed fire again.
  if (world.shotWindow < 0) return false;
  // `FUN_00451d50` (`:3510-3514`): a card whose variant word is exactly 4 holds
  // the ship's fire for its whole opening beat.
  if (world.cardRunning && world.cardPhase === 4) return false;
  // `:3309-3315`: 魔理沙's and 爱丽丝's weapons are the ones a stopped clock
  // silences; everyone else keeps shooting through it.
  if (world.frameStop && (world.shotType === 1 || world.shotType === 6 || world.shotType === 7)) {
    return false;
  }
  return world.shotWindowAdvanced;
}

/**
 * Which power tier fires, with the card-scripted override from
 * `FUN_00450f60:3103-3112` in front of the ordinary walk.
 *
 * The override is why 蕾米莉亚's cards change shape partway through: once the
 * card's own clock passes sixty frames, the script's variant word jumps the
 * table walk straight to tier 6 or 7 regardless of power.
 */
export function shotTablesFor(world: PlayerShotWorld): ShtPowerTable | null {
  const tables = world.focusByte === 0 ? world.primary : world.secondary;
  if (tables.length === 0) return null;
  if (
    world.cardRunning &&
    ((world.shotType === 2 && (world.cardPhase & 1) !== 0) || world.shotType === 9) &&
    world.cardFrames >= 60
  ) {
    const tier = (world.cardPhase & 2) !== 0 ? 7 : 6;
    return tables[Math.min(tier, tables.length - 1)];
  }
  return shtTableForPower(tables, world.power);
}

/**
 * The aim point `FUN_00450320` steers 霊夢's homing charms at.
 *
 * `EnemyManagerUpdate.cpp:724-746` does not choose the nearest enemy: while no
 * boss is being tracked it takes the *lowest* enemy on the screen, and once a
 * boss is in play it keeps the boss whose x is closest to the muzzle. The
 * `valid` flag is what makes the two rules exclusive, and `-999` is retail's
 * own sentinel (`Player.cpp:1496`), which every consumer tests as `< -100`.
 */
/** The shape of `Player.tailPosition0` plus its valid bit, as the aim rules see it. */
export type AimPoint = { x: number; y: number; valid: boolean };

/**
 * What that sentinel looks like between frames. `Player::Update` writes it back over the
 * aim point every frame after the firing chain has read it (`Player.cpp:1100`,
 * `FUN_0044d420:1493-1497`), so each frame chooses its target from scratch. Frozen so a
 * caller cannot write through the constant it hands {@link trackedAimPoint}.
 */
export const UNTRACKED_AIM: AimPoint = Object.freeze({ x: -999, y: -999, valid: false });

export function trackedAimPoint(
  current: AimPoint,
  muzzleX: number,
  enemies: ReadonlyArray<{ x: number; y: number; boss: boolean }>,
): AimPoint {
  const next = { ...current };
  for (const enemy of enemies) {
    if (enemy.boss) {
      const previous = Math.abs(next.x - muzzleX);
      const candidate = Math.abs(enemy.x - muzzleX);
      if (!next.valid || previous > candidate) {
        next.x = enemy.x;
        next.y = enemy.y;
      }
      next.valid = true;
      continue;
    }
    if (!next.valid && next.y < enemy.y) {
      next.x = enemy.x;
      next.y = enemy.y;
    }
  }
  return next;
}

/** `AddNormalizeAngle`, kept local so the layer does not lean on the ECL side. */
function normalizeAngle(a: number): number {
  const twoPi = Math.PI * 2;
  let v = a % twoPi;
  if (v > Math.PI) v -= twoPi;
  else if (v < -Math.PI) v += twoPi;
  return v;
}

/** `VectorAngle(y, x)`, which is `atan2` with the arguments the decomp passes. */
function vectorAngle(dy: number, dx: number): number {
  return Math.atan2(dy, dx);
}

function blankShot(rng: AnmRng): PlayerShot {
  return {
    state: SHOT_FREE,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    angle: 0,
    timer: 0,
    timerSub: 0,
    timerAdvanced: true,
    damage: 0,
    type: 0,
    hitboxWidth: 0,
    hitboxHeight: 0,
    focusedAtSpawn: 0,
    animationIndex: 0,
    youkaiMark: 0,
    youkaiItemGate: 0,
    updateCb: 0,
    renderCb: 0,
    collisionCb: 0,
    entry: null,
    vm: new AnmVm(rng),
  };
}

/**
 * The 128 slots, fired and walked exactly as `Player` walks them.
 *
 * The pool deliberately does not own the shot window timer, the power, or the
 * options: those live in `PlayerSim` and `OptionSystem`, and retail reaches them
 * through `this`. Passing them in is what keeps each half testable against its own
 * citation instead of against a simulation of the other.
 */
export class PlayerShotPool {
  readonly shots: PlayerShot[];

  /** Entries dropped this frame because their fire callback is not modelled. */
  skipped = 0;

  private windowSeen = -1;

  /** Kept so {@link clear} can rebuild slots without a fresh VM per shot. */
  private readonly rng: AnmRng;

  constructor(rng: AnmRng) {
    this.rng = rng;
    this.shots = Array.from({ length: PLAYER_SHOT_SLOTS }, () => blankShot(rng));
  }

  /** Put every slot back, the way a stage reset does. */
  clear(): void {
    for (const shot of this.shots) {
      const keep = shot.vm;
      Object.assign(shot, blankShot(this.rng), { vm: keep });
      keep.reset();
    }
    this.skipped = 0;
    this.windowSeen = -1;
  }

  /** The live slots, in `FUN_004512f0`'s own slot order. */
  live(): PlayerShot[] {
    return this.shots.filter((shot) => shot.state !== SHOT_FREE);
  }

  /**
   * `FUN_00451500:3303-3322` plus `FUN_00450f60`. Returns the number of shots
   * that left the ship this frame.
   */
  fire(world: PlayerShotWorld): number {
    const advanced = world.shotWindow >= 0 && world.shotWindow !== this.windowSeen;
    this.windowSeen = world.shotWindow;
    if (!canAttemptShot({ ...world, shotWindowAdvanced: advanced })) return 0;
    const table = shotTablesFor(world);
    if (!table || table.entries.length === 0) return 0;

    let fired = 0;
    let e = 0;
    this.skipped = 0;
    // The chain is consumed by *slots*: one entry per free slot, and an entry that
    // declines to fire hands the same slot to the next entry (`:3152-3158`).
    for (let s = 0; s < PLAYER_SHOT_SLOTS; s++) {
      if (this.shots[s].state !== SHOT_FREE) continue;
      for (;;) {
        const entry = table.entries[e];
        if (!entry) return fired;
        const result = this.fireEntry(this.shots[s], entry, world);
        if (result) fired++;
        e++;
        // `:3149-3152`: the terminator is read after the entry is advanced, so the
        // last entry of a chain still fires and then ends the walk.
        if (e >= table.entries.length) return fired;
        if (result) break;
      }
    }
    return fired;
  }

  /**
   * Dispatch to `g_PlayerShotUpdateCallbacks` (`:209-211`), whose members are the
   * *fire* predicates: each one decides whether this entry fires now, and a few
   * rewrite the angle and speed after `FUN_0044fb70` has filled the slot.
   */
  private fireEntry(shot: PlayerShot, entry: ShtShotEntry, world: PlayerShotWorld): boolean {
    const value = world.shotWindow;
    const gated = entry.interval > 0 && value % entry.interval === entry.phase;
    switch (entry.updateCb) {
      case 1: {
        // `FUN_00450240` (`:2837-2864`): 紫's 式神 fires on the plain cadence, but
        // while the field has an aim target the shot turns to it and gains half
        // again the table speed. No target, no turn - the entry's own angle stands.
        if (!gated) return false;
        this.initSlot(shot, entry, world);
        if (world.homingTarget) {
          const angle = normalizeAngle(
            vectorAngle(world.homingTarget.y - shot.y, world.homingTarget.x - shot.x) +
              entry.angle +
              Math.PI / 2,
          );
          shot.speed = entry.speed * 1.5;
          shot.angle = angle;
          shot.vx = Math.cos(angle) * shot.speed;
          shot.vy = Math.sin(angle) * shot.speed;
        }
        return true;
      }
      case 2:
      case 3: {
        // `FUN_0044fdd0` (`:2696-2706`): 魔理沙's weapon holds its fire whenever a
        // card has scripted the ship, which is why her volley stops dead during the
        // opening of her own cards.
        if (world.cardRunning || !gated) return false;
        this.initSlot(shot, entry, world);
        return true;
      }
      case 7: {
        // `FUN_004501b0` (`:2820-2835`): one forty-eighth of a right angle of
        // jitter around straight up, which is what makes 蕾米莉亚's fan look ragged.
        if (!gated) return false;
        this.initSlot(shot, entry, world);
        const angle = world.rng.randomF32InRange(1) * (Math.PI / 48) - Math.PI / 2;
        shot.angle = angle;
        shot.vx = Math.cos(angle) * entry.speed;
        shot.vy = Math.sin(angle) * entry.speed;
        return true;
      }
      case 8: {
        // `FUN_00450110` (`:2779-2798`): 妖梦's blade throws along its own facing,
        // and a stopped clock keeps the blade sheathed.
        if (world.frameStop || !gated) return false;
        this.initSlot(shot, entry, world);
        const angle = normalizeAngle(world.bladeAngle + entry.angle);
        shot.angle = angle;
        shot.vx = Math.cos(angle) * entry.speed;
        shot.vy = Math.sin(angle) * entry.speed;
        return true;
      }
      case 4:
      case 5:
      case 6: {
        // `FUN_0044fe20`, `FUN_0044ffa0` and `FUN_00450080` reserve shot slots for
        // the timeline-driven beams (`player->timelines[]`, `Player+0xE2A44`), which
        // this port has not translated. Skipping keeps the field honest about the
        // gap; {@link skipped} says how big it is.
        this.skipped++;
        return false;
      }
      default: {
        if (!gated) return false;
        this.initSlot(shot, entry, world);
        return true;
      }
    }
  }

  /** `FUN_0044fb70` (`:2633-2680`), field by field. */
  private initSlot(shot: PlayerShot, entry: ShtShotEntry, world: PlayerShotWorld): void {
    if (entry.option === 0) {
      shot.x = world.aimX;
      shot.y = world.aimY;
    } else {
      const origin = world.optionPositions()[entry.option - 1];
      shot.x = origin ? origin.x : world.aimX;
      shot.y = origin ? origin.y : world.aimY;
    }
    shot.x += entry.dx;
    shot.y += entry.dy;
    shot.hitboxWidth = entry.field0c;
    shot.hitboxHeight = entry.field10;
    shot.angle = entry.angle;
    shot.speed = entry.speed;
    shot.vx = Math.cos(entry.angle) * entry.speed;
    shot.vy = Math.sin(entry.angle) * entry.speed;
    // `ZunTimer::SetCurrent(0)` (`FUN_0044fb70:2659`) also leaves `previous` at
    // -999, so the shot's first behaviour frame counts as a moved timer.
    shot.timer = 0;
    shot.timerSub = 0;
    shot.timerAdvanced = true;
    shot.focusedAtSpawn = world.focusByte;
    shot.damage = entry.field1c;
    shot.type = entry.field22;
    shot.animationIndex = entry.anmScript;
    if (entry.sound >= 0) world.onSound?.(entry.sound, world.aimX);
    // `entry+0x24 + 10`, the script `SetAndExecuteScriptIdx` runs on the slot's VM.
    this.attachScript(shot, entry.anmScript + 10, world);
    shot.youkaiMark = world.extremelyYoukai && entry.youkaiBoost > 0 ? 1 : 0;
    shot.youkaiItemGate = entry.youkaiBoost;
    shot.updateCb = entry.renderCb;
    shot.renderCb = entry.timerCb;
    shot.collisionCb = entry.collisionCb;
    shot.entry = entry;
    shot.state = SHOT_LIVE;
  }

  /**
   * Run the shot's own animation. A script the pack does not have makes the VM
   * finish immediately, which is retail's own answer: `FUN_00451150:3211` frees the
   * slot when `ExecuteScript` fails, so a missing script means an invisible shot
   * rather than a made-up one.
   */
  private attachScript(shot: PlayerShot, script: number, world: PlayerShotWorld): void {
    const words = world.anmPack?.words(script) ?? null;
    if (!words) {
      shot.vm.reset();
      return;
    }
    shot.vm.attach(words);
    // Retail's cull reads the size out of the sprite the VM settled on
    // (`*(slot+0x224)+0x30/0x34`, `:3200-3206`), so the cell follows the script
    // rather than the other way round.
    const size = world.spriteSize(shot.vm.sprite);
    if (size) shot.vm.spriteSize = { x: size.x, y: size.y };
  }

  /**
   * `FUN_00451150` (`:3166-3215`): behaviour callback, then the position step, then
   * the playfield cull, then the animation. The order is the function's own, and
   * the cull is what a shot that has already left the field must not survive.
   */
  update(world: PlayerShotWorld): void {
    for (const shot of this.shots) {
      if (shot.state === SHOT_FREE) continue;
      // `ZunTimer::FUN_0040d3d0` reports what the *last* tick did, which is the
      // value the behaviour callbacks read.
      if (this.stepBehaviour(shot, world, shot.timerAdvanced)) {
        shot.state = SHOT_FREE;
        continue;
      }
      shot.x += world.timeScale * shot.vx;
      shot.y += world.timeScale * shot.vy;
      if (shot.type !== 4 && shot.type !== 5 && !this.withinPlayfield(shot, world)) {
        shot.state = SHOT_FREE;
        continue;
      }
      if (shot.vm.step(world.timeScale)) {
        shot.state = SHOT_FREE;
        continue;
      }
      this.tickTimer(shot, world.timeScale);
    }
  }

  /**
   * `FUN_00451670:3416-3431`, the shot's own half of a landed hit.
   *
   * Three types pierce: 4, 5 and 6 keep their live state and score again next
   * frame, which is how 妖梦's blade and the beam carriers stay put. Everything
   * else becomes `state = 2`, which is not "gone" but "spent and still drawn" - the
   * render pass keeps it at `z = 0.2`, and only type 3 keeps landing hits while in
   * that state. The hit script is the firing script's neighbour, `+11` rather than
   * `+10`, and retail restores the roll the shot was drawn at across the switch, so
   * a charm that turns into a spark does not snap upright first.
   */
  markHit(shot: PlayerShot, world: PlayerShotWorld): boolean {
    if (shot.state !== SHOT_LIVE) return false;
    if (shot.type === 4 || shot.type === 5 || shot.type === 6) return false;
    const roll = shot.vm.rotation.z;
    this.attachScript(shot, shot.animationIndex + 11, world);
    shot.vm.rotation.z = roll;
    if (shot.type !== 3) {
      shot.vx /= 8;
      shot.vy /= 8;
    }
    shot.state = SHOT_SPENT;
    // True is retail's "this slot just spent", which is also when `:3423` asks for
    // the landing spark, so the caller can pay it without re-deriving the rule.
    return true;
  }

  /** `ZunTimer::Tick` (`Supervisor.hpp:384-389`) against the frame multiplier. */
  private tickTimer(shot: PlayerShot, timeScale: number): void {
    const previous = shot.timer;
    shot.timerSub += timeScale;
    const whole = Math.floor(shot.timerSub);
    shot.timer += whole;
    shot.timerSub -= whole;
    shot.timerAdvanced = shot.timer !== previous;
  }

  /**
   * The per-frame callbacks, indexed from `entry+0x2C` through
   * `g_PlayerShotRenderCallbacks` (`:212-213`) into `slot+0x474`. Returning true is
   * retail's "this shot is done".
   */
  private stepBehaviour(shot: PlayerShot, world: PlayerShotWorld, timerMoved: boolean): boolean {
    if (shot.state !== SHOT_LIVE) return false;
    switch (shot.updateCb) {
      case 1:
        this.steerToTail(shot, world, timerMoved);
        return false;
      case 3:
        // `FUN_00450580` (`:2903-2909`): a constant upward acceleration with a
        // tenth of randomness on top, which is 魔理沙's drive.
        shot.vy -= world.rng.randomF32InRange(0.1) + 0.27;
        return false;
      case 4:
      case 5:
        // The beam bodies (`FUN_004505d0`, `FUN_00450840`) ride
        // `player->timelines[]`; the shots that would carry them never spawn, so
        // this arm is unreachable for shipped data.
        return false;
      default:
        // No callback: `:3192-3196` still refreshes nothing, but the angle the
        // sprite draws at is only recomputed by the steerer, so it stays put.
        return false;
    }
  }

  /**
   * `FUN_00450320` (`:2869-2901`), 霊夢's charm: for its first forty frames, and
   * only on the frames where its own timer moved, it bends toward the tracked
   * enemy, keeping its speed inside one to ten. After that window it accelerates
   * back up by a third a frame, and either way it turns to face where it is going.
   */
  private steerToTail(shot: PlayerShot, world: PlayerShotWorld, moved: boolean): void {
    if (world.tailX > -100 && shot.timer < 40 && moved) {
      let dx = world.tailX - shot.x;
      let dy = world.tailY - shot.y;
      let magnitude = Math.sqrt(dx * dx + dy * dy) / (shot.speed / 4);
      if (magnitude < 1) magnitude = 1;
      dx = dx / magnitude + shot.vx;
      dy = dy / magnitude + shot.vy;
      magnitude = Math.sqrt(dx * dx + dy * dy);
      shot.speed = magnitude > 10 ? 10 : magnitude;
      if (shot.speed < 1) shot.speed = 1;
      shot.vx = (dx * shot.speed) / magnitude;
      shot.vy = (dy * shot.speed) / magnitude;
    } else if (shot.speed < 10) {
      shot.speed += 1 / 3;
      const dx = shot.vx;
      const dy = shot.vy;
      const magnitude = Math.sqrt(dx * dx + dy * dy) || 1;
      shot.vx = (dx * shot.speed) / magnitude;
      shot.vy = (dy * shot.speed) / magnitude;
    }
    shot.angle = vectorAngle(shot.vy, shot.vx);
  }

  /** `IsWithinPlayfield`, with the sprite's own half size added (`:3200-3208`). */
  private withinPlayfield(shot: PlayerShot, world: PlayerShotWorld): boolean {
    const size = shot.vm.spriteSize;
    const halfW = size.x / 2;
    const halfH = size.y / 2;
    const { left, right, top, bottom } = world.bounds;
    return (
      shot.x + halfW >= left && shot.x - halfW <= right && shot.y + halfH >= top && shot.y - halfH <= bottom
    );
  }
}
