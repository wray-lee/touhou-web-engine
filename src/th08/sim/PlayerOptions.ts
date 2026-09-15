/**
 * The option slots - 僚机 / 式神 / 分身 - and the way retail steers them.
 *
 * A `.sht` firing entry carries an option index at `+0x20`, and 98 of the 227
 * shipped entries are non-zero, i.e. fired from an option's position rather than
 * from the ship (`ShtFile.ts`'s `ShtShotEntry.option`). Those are not decoration:
 * they are how 紫's 式神, 妖梦's blades, 蕾米莉亚's four familiars and 爱丽丝's
 * dolls exist at all, and until now the port had no option model whatsoever, so
 * every one of those entries silently fell back to the ship.
 *
 * Retail keeps four `PlayerOptionState` records of `0x2F4` bytes at `Player+0x40C`
 * and picks one update route per (shot type, slot) out of
 * `g_PlayerOptionUpdateCallbacks` (`Player.cpp:168-181`). Which route a slot gets
 * is not a guess: the twelve rows line up entry-for-entry with the option indices
 * the eight shipped `.sht` files actually use, and {@link OPTION_ROUTES} cites
 * both sides of that agreement.
 */
import { AnmVm, type AnmRng } from '../../engine/anm/AnmVm';
import type { AnmPack } from '../../engine/anm/AnmPack';

/** One steered option. Fields are named after the `PlayerOptionState` offsets. */
export interface PlayerOptionState {
  /** `+0x2A4`, the position the shots come out of. */
  x: number;
  y: number;
  /** `+0x2BC`, the smoothed chase velocity. */
  vx: number;
  vy: number;
  /** `+0x2D4`-ish anchor the orbit routes swing around. */
  targetX: number;
  targetY: number;
  /** `+0x2C8` `state2C8`: 0 inactive, 1 starting, 2 running, 3 leaving. */
  state: number;
  /** `+0x2CC` `substate2CC`: which of {@link PlayerOptionState}'s modes is driving. */
  substate: number;
  /** `+0x2E0`, the option's own frame counter. */
  timer: number;
  /** `+0x2DC`, the swing angle the orbit routes advance every frame. */
  orbitAngle: number;
  /** The direction a route wants the sprite to face, in radians. */
  facingAngle: number;
  /** The sign of `vm.scale.x`, which is how retail turns the sprite around. */
  scaleSign: number;
  /**
   * `PlayerOptionState::vm`, the script that says what the body looks like.
   *
   * Retail runs it once per frame right after the route (`Player.cpp:915`), arms it
   * from the route's own `SetAndExecuteScriptIdx`, and steers its turns through
   * `SetInterrupt` - so the body's animation is part of the route, not something a
   * host decorates it with afterwards.
   */
  vm: AnmVm;
}

/** Four slots, matching retail's fixed array. */
export const OPTION_SLOTS = 4;

/**
 * What a slot looks like after retail arms it: `Player.cpp:678` `memset`s the
 * whole `0x2F4` bytes to zero and then writes only the two callbacks, so every
 * field here starts at zero - including the facing angle, which the route itself
 * sets to `-pi/2` when it first runs.
 */
export function blankOption(rng: AnmRng): PlayerOptionState {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    targetX: 0,
    targetY: 0,
    state: 0,
    substate: 0,
    timer: 0,
    orbitAngle: 0,
    facingAngle: 0,
    scaleSign: 1,
    vm: new AnmVm(rng),
  };
}

/**
 * What an option needs from the game to move.
 *
 * `shotWindowOpen` is `Player.timerE2AC4 >= 0`, the twenty-frame window that
 * holding fire keeps lit (`Player.cpp:919`). It is what gates the switch to
 * enemy-chasing, which is why a 式神 drifts back beside the ship the moment the
 * player lets go of the button.
 */
export interface OptionWorld {
  playerX: number;
  playerY: number;
  shotWindowOpen: boolean;
  /**
   * `g_CurFrameInput & 1`, the fire button itself. The chase gives up only when
   * the twenty-frame window has closed *and* the button is off (`:2074`), so
   * this is not the same question as `shotWindowOpen`.
   */
  fireHeld: boolean;
  /** `Player.bombState.frameStop`: under a stopped clock the option holds station. */
  frameStop: boolean;
  /** A frame's worth of candidate targets, in retail's own terms. */
  homingCandidates(): OptionCandidate[];
  /** Spawn a spark at an option's position, for the routes that leave a trail. */
  onTrail?(x: number, y: number, color: number): void;
  /**
   * `player->anmFile`, the pack the route's `SetAndExecuteScriptIdx` reads. A null
   * pack leaves the option with no body to draw, which is what happens before the
   * extractor has supplied `playerNN.anm`.
   */
  anmPack: AnmPack | null;
  /** `g_EclGameTimeScale`, the frame multiplier the option's own script advances by. */
  timeScale: number;
}

/** An enemy an option could chase. */
export interface OptionCandidate {
  x: number;
  y: number;
  /** `EnemyManagerUpdate::HasAttachedEnemy()` - part of a multi-body enemy. */
  hasAttached: boolean;
  /**
   * `EnemyManagerUpdateEnemy::slotIndex`, the identity the target is remembered by.
   *
   * Retail holds a pointer, so a target dies with its enemy: the update pass clears
   * `g_Player.optionHomingTarget` for every slot that is no longer active
   * (`EnemyManagerUpdate.cpp:448-452`) and the release path does the same
   * (`EnemyManager.cpp:803-804`). A reused position view cannot say that, so the
   * slot index is carried along and an absent index means the enemy is gone.
   * Omitted only by callers that have no identity to offer.
   */
  id?: number;
}

/**
 * `g_PlayerOptionUpdateCallbacks`, twelve rows of four (`Player.cpp:168-181`).
 *
 * `none` marks a slot retail leaves NULL. The other names are the retail function
 * number that drives the slot, so "which route" always resolves to a citation.
 * `f930`, `ee70` and `f2d0` are named-but-unmodelled rather than quietly dropped:
 * their steering bodies (`Player.cpp:2286-2396`, `:2399-2465` and the route-3 exit
 * table at `:203-206`) are not translated yet.
 *
 * `f2d0` deserves a word, because it is the one slot the twelve-row table cannot
 * express. 妖梦's blade (`ply03a`'s option 3 entries) is not armed by the main
 * table at all: `Player.cpp:737-753` gives shot type 3 a *second* arming path that
 * runs on focus **release**, installing `g_PlayerRoute3ExitUpdateCallbacks` on slot
 * 2 and seeding the sixteen-entry position history at `Player+0x2CC` that the blade
 * then rides. So for that shot type the table under-reports by one slot, and
 * {@link route3ExitSlot} is where the missing slot is stated.
 */
export type OptionRoute = 'none' | 'e3a0' | 'ea40' | 'eb70' | 'f930' | 'ee70' | 'f5e0' | 'f2d0';

/**
 * The shot types that carry the extra focus-release blade in slot 2
 * (`Player.cpp:737`, which tests `shotType == 3` and nothing else).
 */
export function route3ExitSlot(shotType: number): number | null {
  return shotType === 3 ? 2 : null;
}

/**
 * The matrix, with the `.sht` option indices that agree with each row.
 *
 * Rows 0-3 are the four pairs and 4-11 the eight solos, and each row is checked
 * against the firing entries of the `.sht` that `g_Player1ShtFiles` gives that
 * shot type (`EclGlobals`/`Player.cpp:49-57`):
 *
 * | row | route  | `.sht`            | option indices the file really uses |
 * |-----|--------|-------------------|---------------------------------|
 * | 0   | `e3a0` | `ply00a`/`ply00as`| 1 - and only on `ply00as`, 紫     |
 * | 1   | `ea40` | `ply01a`/`ply01as`| 1 - only on `ply01as`, 爱丽丝      |
 * | 2   | `eb70` | `ply02a`/`ply02as`| 1..4 - only on `ply02as`, 蕾米莉亚 |
 * | 3   | `f930` | `ply03a`/`ply03as`| 1,2 - only on `ply03as`, 妖妖      |
 * | 4   | none   | `ply00a` (solo 霊夢) | -                            |
 * | 5   | `e3a0` | `ply00as` (solo 紫) | 1                           |
 * | 6   | none   | `ply01a` (solo 魔理沙) | -                           |
 * | 7   | `ea40` | `ply01as` (solo 爱丽丝) | 1                         |
 * | 8   | none   | `ply02a` (solo 咲夜) | -                            |
 * | 9   | `ee70` | `ply02as` (solo 蕾米莉亚) | 1..4                     |
 * | 10  | `f5e0` | `ply03a` (solo 妖梦) | 3 - and slot 2 only, here   |
 * | 11  | `f930` | `ply03as` (solo 妖妖) | 1,2                       |
 *
 * That agreement is not something the table could be fitted to after the fact:
 * row 10 arms only slot index 2, and `ply03a` - the table shot type 10 loads -
 * is the only file that ever uses option 3.
 */
export const OPTION_ROUTES: readonly (readonly OptionRoute[])[] = [
  /* 0  霊夢&紫     */ ['e3a0', 'none', 'none', 'none'],
  /* 1  魔理沙&爱丽丝 */ ['ea40', 'none', 'none', 'none'],
  /* 2  咲夜&蕾米莉亚 */ ['eb70', 'eb70', 'eb70', 'eb70'],
  /* 3  妖梦&妖妖    */ ['f930', 'f930', 'none', 'none'],
  /* 4  霊夢 solo    */ ['none', 'none', 'none', 'none'],
  /* 5  紫 solo      */ ['e3a0', 'none', 'none', 'none'],
  /* 6  魔理沙 solo  */ ['none', 'none', 'none', 'none'],
  /* 7  爱丽丝 solo   */ ['ea40', 'none', 'none', 'none'],
  /* 8  咲夜 solo    */ ['none', 'none', 'none', 'none'],
  /* 9  蕾米莉亚 solo */ ['ee70', 'ee70', 'ee70', 'ee70'],
  /* 10 妖梦 solo    */ ['none', 'none', 'f5e0', 'none'],
  /* 11 妖妖 solo    */ ['f930', 'f930', 'none', 'none'],
];

/** The route per slot for one of the twelve shot types. */
export function optionRoutes(shotType: number): readonly OptionRoute[] {
  return OPTION_ROUTES[Math.max(0, Math.min(11, shotType | 0))];
}

/** `Player.cpp:685-690`: a slot is only alive at all if its route is non-NULL. */
export function armedOptions(shotType: number): number[] {
  const routes = optionRoutes(shotType);
  const out: number[] = [];
  for (let i = 0; i < OPTION_SLOTS; i++) if (routes[i] !== 'none') out.push(i);
  return out;
}

/**
 * The script each route arms its body with - the argument of the
 * `SetAndExecuteScriptIdx` at the head of that route's `case 1:`.
 *
 * | route | `Player.cpp` | body |
 * |-------|--------------|------|
 * | `e3a0` | `:2005` | 紫's 式神 |
 * | `ea40` | `:2176` | 爱丽丝's doll |
 * | `eb70` | `:2209` | one of 蕾米莉亚's four familiars |
 * | `ee70` | `:2285` | the same body, driven by the untranslated route |
 * | `f2d0` | `:2395` | 妖梦's exit blade |
 * | `f5e0` | `:2484` | 妖梦 solo's blade |
 * | `f930` | `:2582` | 妖妖's two blades |
 */
export const OPTION_SCRIPTS: Record<OptionRoute, number> = {
  none: -1,
  e3a0: 18,
  ea40: 29,
  eb70: 24,
  ee70: 24,
  f2d0: 21,
  f5e0: 21,
  f930: 21,
};

/** How far an option trails the ship in the `e3a0` route: ninety-six pixels up. */
const CHASER_ANCHOR_OFFSET = 96;
/** Both chaser integrators clamp their anchor to this, so an option never leaves the top. */
const CHASER_MIN_Y = 32;
/** `option+0x2E0 >= 10`: a fresh 式神 rides with the ship before it takes a target. */
const CHASER_TAKEOVER_FRAMES = 10;
/**
 * `PlayerOptionHomingToPlayer:2127`, the only line in the whole route that sends it.
 *
 * `player00.anm` script 18 - the 式神's own body - declares interrupt labels 1, 2,
 * 3, 4 and 5, and 3 is the attack: the pose it takes up while it is chasing a target.
 * Nothing else asks for it, so a route that moves the body without sending it is a
 * 式神 that flies at the enemy and never hits it.
 */
const CHASER_ATTACK_INTERRUPT = 3;
/** `fabsf(vel.x) < 0.05 -> 0`, the only component retail snaps. */
const VELOCITY_SNAP = 0.05;

/**
 * The shared shape of both `e3a0` integrators: chase a point at one sixteenth
 * of the remaining gap per frame, smoothed twenty percent into the current
 * velocity, and snap a near-still x so the sprite can decide which way it faces.
 *
 * `PlayerOptionHomingToPlayer` (`Player.cpp:2104-2135`) and
 * `PlayerOptionHomingToTarget` (`:2138-2157`) differ only in the point.
 */
function chaseTo(o: PlayerOptionState, tx: number, ty: number): void {
  const dx = (tx - o.x) / 16;
  const dy = (ty - o.y) / 16;
  o.vx += (dx - o.vx) * 0.2;
  o.vy += (dy - o.vy) * 0.2;
  o.x += o.vx;
  o.y += o.vy;
  if (Math.abs(o.vx) < VELOCITY_SNAP) o.vx = 0;
}

/**
 * `g_Player.optionHomingTarget`, chosen in the enemy pass
 * (`EnemyManagerUpdate.cpp:747-758`), not by the ship.
 *
 * Retail's test is not "nearest enemy": an enemy qualifies only while its x is
 * within sixty-four pixels of the ship's aim column, it is not itself a launched
 * familiar, and it beats the current target only by being *further up the screen*.
 * The pass runs once per live enemy per frame, so a 式神 walks its aim steadily
 * upward through a formation instead of snapping to whatever is closest.
 *
 * "Not itself a launched familiar" is `TargetEnemyHelpersOverlay::HasAttachedEnemy`
 * (`EclManager.cpp:129-132`), which is `enemy+0x2DA4 != 0` - the pointer to the
 * enemy that launched it through one of ops 90..92, not a count of the children it
 * owns. `Enemy::FUN_0042b370` (`EnemyManager.cpp:421-463`) reads the same field to
 * hand half of a familiar's absorbed damage to that launcher, so the exclusion is
 * "aim at the body, not at a limb". The port's counterpart is `EnemySlot.linkedChild`
 * / `parentSlotIndex`, which is documented against the very same offset.
 *
 * The winner is compared against one anchor and aimed at another (`+0x2D34`
 * versus `+0x2D88`); our enemy slots carry a single position, so both are that.
 */
export function pickHomingTarget(
  current: OptionCandidate | null,
  candidates: OptionCandidate[],
  aimX: number,
): OptionCandidate | null {
  // `EnemyManagerUpdate.cpp:448-452` and `EnemyManager.cpp:803-804`: retail holds a
  // pointer, so a target dies with the enemy behind it. Re-resolving the held id
  // against this frame's live candidates is the same rule with a value type, and it
  // is what stops a 式神 from parking at the top edge after the thing it chased
  // has flown off screen.
  let best =
    current === null || current.id === undefined
      ? current
      : (candidates.find((c) => c.id === current.id) ?? null);
  for (const c of candidates) {
    if (Math.abs(c.x - aimX) >= 64) continue;
    if (c.hasAttached) continue;
    if (best === null || best.y > c.y) best = c;
  }
  return best;
}

/**
 * The four option slots, their arming edge and their per-frame steering.
 *
 * Retail arms on the *rising edge* of focus and only for a pair shot type
 * (`Player.cpp:669-693`), and releases on the falling edge into a sixteen-frame
 * exit (`:723-746`) - which is the whole of why a 式神 appears when you press
 * Shift and drifts away when you let go, rather than being a permanent fixture.
 */
export class OptionSystem {
  readonly options: PlayerOptionState[];
  /** The RNG the body scripts draw through - retail shares one `g_Rng` with everything. */
  private readonly rng: AnmRng;

  /** `g_Player.optionHomingTarget`, chosen by {@link pickHomingTarget}. */
  homingTarget: OptionCandidate | null = null;

  /** `Player+0x2B4`, the muzzle the shot origins and the x-window both use. */
  aimX = 0;

  /** `Player+0x03`, the settled-focus byte the arming edge reads. */
  private focused = false;

  /** `Player+0x08`, counted up while focused; seven makes the ship a 妖怪. */
  focusFrames = 0;

  constructor(rng: AnmRng) {
    this.rng = rng;
    this.options = Array.from({ length: OPTION_SLOTS }, () => blankOption(rng));
  }

  /** Drop everything, the way a stage reset does. */
  clear(): void {
    for (const o of this.options) Object.assign(o, blankOption(this.rng));
    this.homingTarget = null;
    this.focused = false;
    this.focusFrames = 0;
  }

  /**
   * `Player.cpp:664-666`: while a spell card is up, focus is *scripted*, not
   * pressed - the card's own bit 0 of `Player+0xFE0` drives it. Otherwise it is
   * the message-input focus bit.
   */
  setFocus(focus: boolean, shotType: number): void {
    if (focus && !this.focused) this.arm(shotType);
    if (!focus && this.focused) this.release(shotType);
    if (focus) {
      this.focusFrames = this.focused ? this.focusFrames + 1 : 0;
    } else {
      this.focusFrames = 0;
    }
    this.focused = focus;
  }

  /**
   * Seven settled focused frames is what makes the ship youkai
   * (`Player.cpp:713-714`, read back at `:783-789`). The port already keeps this
   * in `PlayerSim`, so it is exposed here rather than duplicated behind it.
   */
  get settledAsYoukai(): boolean {
    return this.focusFrames >= 7;
  }

  /** `:675-690` - zero every slot, install its route, and start it if it has one. */
  private arm(shotType: number): void {
    // `:671`: the focus edge arms options for a pair shot type only.
    if (shotType > 3) return;
    this.install(shotType);
  }

  /**
   * `:1705-1727`, run once when the player object is created: a solo shot type
   * installs its option callbacks there and never touches them again, so the
   * permanent options of 紫, 爱丽丝, 蕾米莉亚, 妖梦 and 妖妖 are always out while
   * 霊夢's and 魔理沙's solos have none.
   */
  initShotType(shotType: number): void {
    this.clear();
    if (shotType > 3) this.install(shotType);
  }

  /** The shared body of both arming paths: `memset`, install, start if non-NULL. */
  private install(shotType: number): void {
    const routes = optionRoutes(shotType);
    for (let i = 0; i < OPTION_SLOTS; i++) {
      const o = this.options[i];
      Object.assign(o, blankOption(this.rng));
      o.substate = 0;
      if (routes[i] !== 'none') {
        o.state = 1;
        o.timer = 0;
      }
    }
    this.homingTarget = null;
  }

  /**
   * `:725-753` - every live slot walks out through its sixteen-frame exit, and
   * shot type 3 hands slot 2 to the route-3 exit blade on its way past.
   */
  private release(shotType: number): void {
    // `:726`/`:737`: only the four pair shot types have a focus release at all.
    // A solo's options were installed once by {@link initShotType} and never
    // leave, which is why 妖梦's blade and 蕾米莉亚's familiars are permanent.
    if (shotType > 3) return;
    for (const i of armedOptions(shotType)) {
      const o = this.options[i];
      if (o.state !== 0 && o.state !== 3) {
        o.state = 3;
        o.timer = 0;
      }
    }
    const exit = route3ExitSlot(shotType);
    if (exit !== null) {
      const o = this.options[exit];
      Object.assign(o, blankOption(this.rng));
      o.state = 1;
      o.timer = 0;
    }
  }

  /** One frame of every slot, in retail's slot order. */
  tick(world: OptionWorld, shotType: number): void {
    this.aimX = world.playerX;
    const routes = optionRoutes(shotType);
    const candidates = world.homingCandidates();
    // The target is chosen in the enemy pass, before the ship reads it.
    this.homingTarget = pickHomingTarget(this.homingTarget, candidates, this.aimX);
    for (let i = 0; i < OPTION_SLOTS; i++) {
      const route = routes[i];
      if (route === 'none') continue;
      const o = this.options[i];
      if (o.state === 0) continue;
      switch (route) {
        case 'e3a0':
          this.stepChaser(o, world);
          break;
        case 'ea40':
          this.stepStation(o, world);
          break;
        case 'eb70':
          this.stepOrbit(o, i, world);
          break;
        case 'f5e0':
          this.stepFacing(o, world);
          break;
        default:
          // `f930` and `ee70` are named in {@link optionRoutes} but not translated
          // yet, and a slot whose route is unknown must not pretend to move.
          break;
      }
      // `option+0x2E0` is zeroed at arming (`Player.cpp:686`) and the retail
      // routes all read the timer before they advance it, so the frame that arms
      // an option sees 0 and the takeover window opens on the frame after.
      //
      // The body script runs between the two: `:915` executes it straight after the
      // route, and only then advances the timer, so a fresh 式神 is already one
      // instruction into its entrance on the frame it appears.
      o.vm.step(world.timeScale);
      o.timer++;
    }
  }

  /**
   * The route's `case 1:` entrance: hand the slot the body script its row of
   * {@link OPTION_SCRIPTS} names. `SetAndExecuteScript` runs the first instruction
   * immediately, which is what {@link AnmVm.attach} does.
   */
  private startBody(o: PlayerOptionState, route: OptionRoute, world: OptionWorld): void {
    const script = OPTION_SCRIPTS[route];
    if (script < 0) return;
    const words = world.anmPack ? world.anmPack.words(script) : null;
    if (words) o.vm.attach(words);
  }

  /** The `case 3:` leave: interrupt 5 is the routes' shared "go away" label. */
  private leaveBody(o: PlayerOptionState): void {
    if (o.timer === 0) o.vm.setInterrupt(5);
  }

  /**
   * `FUN_0044e3a0` (`Player.cpp:1996-2100`), the 紫 route: a single 式神 that
   * rides ninety-six pixels above the ship, turns to face the way it is travelling,
   * and - while fire is held and it has been out for ten frames - breaks off to
   * chase the enemy the field chose for it.
   */
  private stepChaser(o: PlayerOptionState, world: OptionWorld): void {
    if (o.state === 1) {
      this.startBody(o, 'e3a0', world);
      o.state = 2;
      o.x = world.playerX;
      o.y = Math.max(CHASER_MIN_Y, world.playerY - CHASER_ANCHOR_OFFSET);
      o.vx = 0;
      o.vy = 0;
      this.homingTarget = null;
      return;
    }
    if (o.state === 3) {
      this.leaveBody(o);
      if (o.timer > 16) o.state = 0;
      return;
    }
    switch (o.substate) {
      case 3: {
        if (this.homingTarget !== null) {
          chaseTo(o, this.homingTarget.x, Math.max(CHASER_MIN_Y, this.homingTarget.y + 32));
        }
        // `:2074-2080`: two independent reasons to give up - the window has shut
        // *and* the button is off, or the target is gone. Letting go mid-window
        // does not call it home, which is why sustained fire keeps it forward.
        if ((!world.shotWindowOpen && !world.fireHeld) || this.homingTarget === null) {
          this.homingTarget = null;
          // `:2078`: giving up the chase is the script's own turn-for-home label.
          o.vm.setInterrupt(1);
          o.substate = 0;
        }
        break;
      }
      default: {
        // `:2017`, `:2035`, `:2053`: the three facing cases all dispatch on the
        // substate the frame came in with, so that is what the tests are keyed to.
        const dispatched = o.substate;
        chaseTo(o, world.playerX, Math.max(CHASER_MIN_Y, world.playerY - CHASER_ANCHOR_OFFSET));
        // `PlayerOptionHomingToPlayer:2121-2133` ends with the takeover test, and
        // its `else` clears the target outright: any frame that does not earn the
        // chase drops it, so the 式神 has to re-acquire through the enemy pass.
        if (world.shotWindowOpen && this.homingTarget !== null && o.timer >= CHASER_TAKEOVER_FRAMES) {
          o.vm.setInterrupt(CHASER_ATTACK_INTERRUPT);
          o.substate = 3;
        } else {
          this.homingTarget = null;
        }
        // The facing tests are part of the case that was dispatched, not of the
        // substate the chase may have just installed (`:2019-2069` runs them after
        // `PlayerOptionHomingToPlayer` returns), so a takeover on a frame where the
        // 式神 is still banking the wrong way is pulled straight back out of the
        // chase. Committing is then a matter of arriving banked with the target up.
        this.faceAlongTravel(o, dispatched);
        break;
      }
    }
  }

  /**
   * The facing flip at `:2016-2069`. Retail keeps it in the sprite's `scale.x`
   * sign and drives it off a three-state machine rather than off the sign of the
   * velocity, so a 式神 that stops dead still shows the way it last went.
   */
  private faceAlongTravel(o: PlayerOptionState, dispatched: number): void {
    if (dispatched === 0) {
      if (o.vx < 0) this.turnChaser(o, 1, 1);
      else if (o.vx > 0) this.turnChaser(o, 2, -1);
    } else if (dispatched === 1) {
      if (o.vx === 0) this.turnChaser(o, 0, 1);
      else if (o.vx > 0) this.turnChaser(o, 2, -1);
    } else if (dispatched === 2) {
      if (o.vx === 0) this.turnChaser(o, 0, 1);
      else if (o.vx < 0) this.turnChaser(o, 1, 1);
    }
  }

  /**
   * One branch of the facing machine.
   *
   * The scale sign is retail's own `if (scale.x < 0) scale.x = -scale.x` guard, which
   * only ever asks for a direction rather than toggling, so writing the wanted sign
   * is the same thing. The label is the part that used to be guessed wrong: every
   * branch that *turns* the sprite sends 2, and the two branches that come back to
   * rest send 1 - `:2021/2028/2039/2048/2057/2064`, read off the branch each one sits
   * in rather than off the scale sign it leaves behind, because one of the six pairs
   * 2 with a positive scale and the sign alone cannot name the label.
   */
  private turnChaser(o: PlayerOptionState, substate: number, scaleSign: number): void {
    o.vm.setInterrupt(substate === 0 ? 1 : 2);
    o.substate = substate;
    o.scaleSign = scaleSign;
  }

  /** `FUN_0044ea40` (`:2163-2200`), 爱丽丝's route: pinned thirty-two above. */
  private stepStation(o: PlayerOptionState, world: OptionWorld): void {
    if (o.state === 1) {
      this.startBody(o, 'ea40', world);
      o.state = 2;
      o.x = world.playerX;
      o.y = world.playerY - 32;
      return;
    }
    if (o.state === 3) {
      this.leaveBody(o);
      o.x = world.playerX;
      o.y = world.playerY - 32;
      if (o.timer > 16) o.state = 0;
      return;
    }
    // `:2176-2180`: a stopped clock leaves it where it was.
    if (!world.frameStop) {
      o.x = world.playerX;
      o.y = world.playerY - 32;
    }
  }

  /**
   * `FUN_0044eb70` (`:2205-2270`), 蕾米莉亚's route: four familiars, two of them
   * swinging out from a ±32 px anchor and two mirrored, each on a radius of eight.
   */
  private stepOrbit(o: PlayerOptionState, index: number, world: OptionWorld): void {
    if (o.state === 1) {
      this.startBody(o, 'eb70', world);
      o.state = 2;
      o.targetX = world.playerX + (index === 0 ? -30 : index === 1 ? -10 : index === 2 ? 10 : 30);
      o.targetY = world.playerY + (index === 0 || index === 3 ? -16 : -32);
      o.orbitAngle = index === 1 || index === 3 ? Math.PI : 0;
      return;
    }
    if (o.state === 3) {
      this.leaveBody(o);
      if (o.timer > 16) o.state = 0;
      return;
    }
    // The four constants are 1.5° and 2° per frame, written as the angles they are:
    // `Math.PI / 120` and `Math.PI / 90` land on the same float64 the binary carries,
    // where a copy of ZUN's float32 digits loses precision in JavaScript.
    const slow = Math.PI / 120;
    const fast = Math.PI / 90;
    const step = index === 0 ? slow : index === 1 ? -fast : index === 2 ? fast : -slow;
    // `:2239`: the swing only starts once the option has settled out.
    if (o.timer > 12) o.orbitAngle = normalizeOptionAngle(o.orbitAngle + step);
    o.x = o.targetX + Math.cos(o.orbitAngle) * 8;
    o.y = o.targetY + Math.sin(o.orbitAngle) * 8;
  }

  /**
   * `FUN_0044f5e0` (`:2473-2560`), 妖梦 solo's route: one blade on a slow circle
   * that turns to face the way the ship is moving, tinted by the meter.
   */
  private stepFacing(o: PlayerOptionState, world: OptionWorld): void {
    if (o.state === 1) {
      this.startBody(o, 'f5e0', world);
      o.state = 2;
      o.targetX = world.playerX;
      o.targetY = world.playerY;
      o.orbitAngle = 0;
      o.facingAngle = -Math.PI / 2;
    }
    if (o.state === 3) {
      this.leaveBody(o);
      if (o.timer > 16) o.state = 0;
      return;
    }
    if (o.state !== 2) return;
    o.orbitAngle = normalizeOptionAngle(o.orbitAngle + 0.05235987755982988);
    o.targetX += (world.playerX - o.targetX) * 0.05;
    o.targetY += (world.playerY - o.targetY) * 0.05;
    o.x = o.targetX + Math.cos(o.orbitAngle) * 8;
    o.y = o.targetY + Math.sin(o.orbitAngle) * 8;
    world.onTrail?.(o.x, o.y, 0xffff8080);
  }
}

/** `AddNormalizeAngle`, kept local so the module does not lean on the ECL layer. */
function normalizeOptionAngle(a: number): number {
  const twoPi = Math.PI * 2;
  let v = a % twoPi;
  if (v > Math.PI) v -= twoPi;
  else if (v < -Math.PI) v += twoPi;
  return v;
}
