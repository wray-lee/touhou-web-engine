/**
 * Touhou 8 player simulation, ported from Player.cpp.
 *
 * Frame-exact state machine: alive → dying (30f) → respawning (30f+60f cancel)
 * → alive (240f blink invuln). All timing from the reference decomp.
 *
 * Uses the Rng for nothing directly (player is deterministic given inputs),
 * but wires through GameState so the bomb damage path can access rank.
 */

import type { GameState } from './GameState';
import { MOVE_BITS, movementAxisSpeeds, movementDirectionIndex } from '../../engine/core/Movement';
import { addTimeOrbs, decreaseSubrank, increaseSubrank, randomizeAntiTamper } from './GameState';
import { PLAYFIELD_W, PLAYFIELD_H, RESPAWN_X, RESPAWN_Y } from './Playfield';
import {
  BULLET_CANCEL_FRAMES,
  DEATHBOMB_ORB_DRAIN,
  DEATH_FRAMES as DEATH_ANIM_FRAMES,
  SPAWN_FRAMES as SPAWN_ANIM_FRAMES,
  bombCost,
  deathbombBudget,
  graceAfterBomb,
  graceWindowFrames,
  shipTransform,
  type ShipTransform,
} from '../../touhou-common/player/DeathCycle';
import { YoukaiGauge, gaugeBoundsFor } from './YoukaiGauge';

export type PlayerState = 'alive' | 'dying' | 'respawning' | 'dead';

/** Constants from the reference (Player.cpp + plyNNa.sht). */
export const DEATH_FRAMES = DEATH_ANIM_FRAMES;
export const SPAWN_FRAMES = SPAWN_ANIM_FRAMES;
export const CANCEL_FRAMES = BULLET_CANCEL_FRAMES;
export const INITIAL_BOMBS = 3;
export const DEATH_POWER_COST = 16;
export const DEATH_POWER_FLOOR = 16;
export const MAX_POWER = 128;
/** Default `plyNNa.sht + 0x14`. Marisa's pair reads 12; everyone else 10. */
export const ITEM_GRAB_DEFAULT = 10;
/**
 * Half of the hit box for the default (Reimu) `.sht`: `ply00a.sht + 0x0C` reads
 * 1.65 and `Player::AddedCallback` halves it (`Player.cpp:1619-1622`).
 */
export const HITBOX_HALF_DEFAULT = 0.825;
/** Half of the graze box, `ply00a.sht + 0x10 / 2` (`Player.cpp:1624-1627`). */
export const GRAZE_HALF_DEFAULT = 1.4;
/** Half of the item box, `ply00a.sht + 0x18 / 2` (`Player.cpp:1629-1632`). */
export const ITEM_BOX_HALF_DEFAULT = 12;
export const POWER_THRESHOLDS = [8, 24, 48, 80, 128] as const;
export const MAX_HIT_DAMAGE = 70;
/**
 * Frames in a stance before the hitbox appears with it (`Player.cpp:716, 778`).
 * Retail deliberately delays the dot so tapping Shift never flashes one.
 */
export const HITBOX_DELAY_FRAMES = 7;
/** Frames the previous stance must have lasted to earn the switch puff (`:701, :765`). */
export const STANCE_PUFF_FRAMES = 4;
/**
 * Frames a stance must have settled before the 妖率计 will move at all
 * (`Player.cpp:924`, `+8 >= 30`). Flipping to the partner therefore costs half a
 * second of meter, which is what keeps a stance-dancer from parking the needle at
 * either extreme.
 */
export const STANCE_METER_DELAY_FRAMES = 30;
/** Frames the fire window stays open once the button is pressed (`Player.cpp:3326`). */
const SHOT_WINDOW_FRAMES = 20;
/** `g_GameManager.unk3ddc0 < 20`: the walk stays asleep for the stage's first second. */
const SHOT_WINDOW_WARMUP = 20;
/** Frames the swap flourish stays on screen after 低速 takes over (`:696, :760`). */
export const SWITCH_FLASH_FRAMES = 14;

/**
 * The eight-way resolver is an engine primitive (`core/Movement.ts`), not a TH08
 * idea, so it is re-exported rather than duplicated: the sim reads its movement
 * vocabulary from one file, and the presentation layer reaches the same function
 * without depending on the game.
 */
export { MOVE_BITS, movementAxisSpeeds, movementDirectionIndex };

export interface PlayerInput {
  dx: number; // -1, 0, 1
  dy: number; // -1, 0, 1
  shoot: boolean;
  bomb: boolean;
  slow: boolean;
  /**
   * The raw `g_CurFrameInput` direction bits. When present they win over `dx` /
   * `dy`, because the eight-way index below needs to see *which* keys are held,
   * not the difference between them: up-plus-down is down to retail and stillness
   * to a delta. A replay always supplies this.
   */
  dirBits?: number;
  /**
   * Optional world-space point to fly at, used by pointer steering (touch drag
   * and the opt-in mouse mode). When present it wins over `dx` / `dy`, and the
   * ship moves straight at it at the full focus speed instead of the 8-way
   * keyboard grid.
   */
  moveTarget?: { x: number; y: number } | null;
}

export class PlayerSim {
  x: number;
  y: number;
  state: PlayerState = 'alive';
  stateTimer = 0;
  cancelTimer = 0;
  invulnTimer = 0;
  /**
   * `0xE2A68`: frames left of the deathbomb grace window. The ship waits on the
   * death spot for this long before the dissolve starts, and a bomb press inside
   * it comes out as the partner's deathbomb variant.
   */
  graceTimer = 0;
  /** `field_4`: raised every frame the grace window is open, and read by `acceptBomb`. */
  deathbombArmed = false;
  /** Set for the tick on which a press came out of the grace window, i.e. a deathbomb. */
  deathbomb = false;
  /**
   * Set for one tick on the frame the window runs out, which is the frame retail
   * pays the power bill and throws the drop pile (`FUN_0044cbf0:1318-1369`). The
   * stage reads it to spawn items; a ship that deathbombs never sees it fire.
   */
  deathSettled = false;
  /** Frames into the 30-frame death dissolve (`this->timer` while DYING). */
  deathTimer = 0;
  /**
   * The `player->timer` that `FUN_0040be30` arms in the same breath as the card's
   * duration (`PlayerBomb.cpp:170-171`), so it outlives the card by 30..60 frames.
   * While it runs the ship is in `PLAYER_STATE_DEAD`: it stops being drawn as the
   * normal sprite and goes red for two frames of every eight (`Player.cpp:1457-1479`).
   */
  bombStateTimer = 0;
  /** The red half of that flash, `timer % 8 < 2`. */
  get bombStateFlash(): boolean {
    return this.bombStateTimer > 0 && this.bombStateTimer % 8 < 2;
  }
  /**
   * `playerState != PLAYER_STATE_ALIVE` inside the hit test.
   *
   * `FUN_0040be30` puts the ship in `PLAYER_STATE_DEAD` in the same call that arms
   * the card (`PlayerBomb.cpp:172`), and `Player::FUN_0044a230` / `FUN_0044a360`
   * answer a hit in that state by returning 1 *without* reaching `Die()`
   * (`Player.cpp:335-336`, `:362-363`). So the bomb's real protection is this window
   * -- the whole card plus the 30..60 frames of red flash after it -- and not the
   * size of its cancel circle. Grazing keeps working (the graze test only refuses
   * DYING and SPAWNING, `:385`), and so does moving and shooting (`:1093`).
   */
  get bombImmune(): boolean {
    return this.bombStateTimer > 0;
  }
  /**
   * `0xE2A70`: frames of full-screen bullet cancel left. Retail's only post-respawn
   * protection -- there is no invulnerability timer in the reference at all.
   */
  get graceFrames(): number {
    return this.graceTimer;
  }

  memberIndex: 0 | 1 = 0;
  switchFlash = 0;

  /**
   * `field_3`: focus (Shift) held. Retail's only real use of the button, and the
   * thing that swaps the ship between its two animation stances.
   */
  isSlow = false;
  /**
   * The byte at `Player+5` (`Player.hpp:157`), which retail names `isYoukai` and
   * reads back through `Player::IsYoukai()`. It is drawn as the hitbox dot, and it
   * is also the 阴阳 switch the stage scripts test -- one field, two consumers. The
   * seven-frame lag is why the dot flickers in instead of snapping on with the key
   * (`Player.cpp:716-717, 778-779`).
   */
  hitboxVisible = false;
  /** `field_8`: frames spent in the current stance; gates the dot and the puff. */
  stanceTimer = 0;
  /** One-tick flags for the 低速 entry/exit puffs (effects 29 and 28). */
  focusEntered = false;
  focusExited = false;
  /**
   * Set by `StageRunner` for the frames a conversation is on screen. Retail hangs
   * the whole 妖率計 block on `!Gui::IsDialogPresent()` (`Player.cpp:924`), so the
   * meter holds its breath across a talk scene exactly as it does across a card.
   */
  holdGauge = false;

  // Resources (carried across stages, only reset by continue)
  lives: number;
  bombs: number;
  power = 0;
  maxPower = MAX_POWER;
  powerLost = 0;
  score = 0;
  graze = 0;

  /**
   * The four move speeds, defaulted to `ply00a`/`ply00as` and overwritten per team
   * by the stage loader. Retail keeps four figures because the eight-way index
   * gives diagonals their own per-axis speed; see `movementAxisSpeeds`.
   */
  fastSpeed = 4.0;
  slowSpeed = 2.0;
  /**
   * Per-axis component of a diagonal move at full speed (`plyNNa.sht + 0x2C`).
   * Retail stores this beside the axis speed rather than deriving it, and every
   * shipped table happens to hold `fastSpeed / sqrt 2`.
   */
  fastDiagonalSpeed = 4.0 * Math.SQRT1_2;
  /** Per-axis component of a diagonal move while focused (`+ 0x30`). */
  slowDiagonalSpeed = 2.0 * Math.SQRT1_2;
  /** `plyNNa.sht + 0x14`: how fast a grabbed item flies at the ship. */
  itemGrabSpeed = ITEM_GRAB_DEFAULT;
  /**
   * `plyNNa.sht + 0x34`: the clock on items that are still falling freely, read
   * off the primary table while unfocused (`ItemManager.cpp:207-209`).
   */
  itemTimeScale = 0.9;
  /** The same float off the partner's table, used while focused. */
  itemTimeScaleFocused = 0.9;
  /** Half of the hit box (`plyNNa.sht + 0x0C / 2`); the stage overwrites it per team. */
  hitboxHalfExtent = HITBOX_HALF_DEFAULT;
  /** Half of the graze box (`plyNNa.sht + 0x10 / 2`). */
  grazeHalfExtent = GRAZE_HALF_DEFAULT;
  /** Half of the item box (`plyNNa.sht + 0x18 / 2`); items carry the same box. */
  itemPickupHalfExtent = ITEM_BOX_HALF_DEFAULT;
  /**
   * `Player.cpp:791-872` picks the ship's animation from the *intended* horizontal
   * speed (`field_0xE2A9C`), never from how far the sprite actually travelled. The
   * renderer's lean machine therefore reads these, and retail's own test is a bare
   * sign compare with no dead zone. Deriving the lean from the position delta
   * instead feeds sub-pixel noise around zero, which retriggers `main2left` /
   * `left2main` every other frame -- that is the idle twitch.
   */
  leanX = 0;
  leanY = 0;

  // Shot cooldown
  shootCooldown = 0;
  shotLevel = 0;
  /** Set for exactly one tick when a bomb was successfully activated. */
  bombTriggered = false;

  /**
   * 永夜抄's human/youkai meter. Retail drives it from held fire and the flying
   * form, so it lives with the player rather than the stage.
   */
  readonly gauge: YoukaiGauge;
  /**
   * `timerE2ADC`: retail parks this at 50 when a boss-attached enemy dies,
   * and 时符 only move the meter once it has run out.
   */
  private killHoldoff = 0;
  /**
   * `g_Player.timerE2AC4` (`Player.hpp:196`): where the ship stands in the 20-frame
   * fire window, with -1 meaning the window is shut.
   *
   * `Player.cpp:919` re-opens it whenever fire is held and no dialogue is up, and
   * `FUN_00451500` (`:3289-3352`) walks it one step a frame and closes it at twenty.
   * Two things read the result: the 妖率 push at `:928` only runs while it is open,
   * and a hovering 时符 releases the field as soon as it shuts
   * (`ItemManager.cpp:236`). That is the difference between orbs piling up while you
   * shoot and the whole screen coming to you the moment you stop.
   *
   * Retail also freezes the walk inside a card whose `Player+0xFE0` has reached 4
   * (`FUN_00451d50`, `Player.cpp:3510-3514`). Our card driver does not carry that
   * sub-state, so that one freeze is not modelled.
   */
  shotWindowTimer = -1;
  /** Whether the fire window is open, which is the only form the read takes. */
  get shotWindowOpen(): boolean {
    return this.shotWindowTimer >= 0;
  }

  private gs: GameState;

  constructor(gs: GameState) {
    this.gs = gs;
    this.gauge = new YoukaiGauge(gaugeBoundsFor(gs.shotType));
    this.x = RESPAWN_X;
    this.y = RESPAWN_Y;
    this.lives = gs.lives;
    this.bombs = gs.bombs;
    this.power = gs.power;
    // A stage joins the run that is already in progress, so the score and the
    // graze count are read back exactly like the lives and power above.
    this.score = gs.score;
    this.graze = gs.graze;
  }

  /**
   * One frame of `Player.cpp:919` then `FUN_00451500`, in that order: the button
   * re-arms a shut window before the walk runs, the walk closes it at twenty, a held
   * button re-opens it in the very frame it closes, and a ship that is dying or on
   * its way back in always leaves it shut (`:3344-3347`, where `1` is SPAWNING and
   * `2` is DYING).
   *
   * The walk does not start until twenty frames into the stage, which is retail's way
   * of skipping the entrance animation (`unk3ddc0 < 20` at `:3292`).
   */
  private stepShotWindow(shooting: boolean): void {
    if (shooting && this.shotWindowTimer < 0) this.shotWindowTimer = 0;
    if (this.gs.frame < SHOT_WINDOW_WARMUP || this.shotWindowTimer < 0) return;
    this.shotWindowTimer++;
    if (this.shotWindowTimer >= SHOT_WINDOW_FRAMES) this.shotWindowTimer = -1;
    if (shooting && this.shotWindowTimer < 0) this.shotWindowTimer = 0;
    if (this.state === 'dying' || this.state === 'respawning') this.shotWindowTimer = -1;
  }

  /** Sync state back to GameState. */
  syncToGameState(): void {
    this.gs.lives = this.lives;
    this.gs.bombs = this.bombs;
    this.gs.power = this.power;
    this.gs.score = this.score;
    this.gs.graze = this.graze;
    this.gs.youkaiGauge = this.gauge.value;
  }

  /** Update shot level from power thresholds. */
  private updateShotLevel(): void {
    let level = 0;
    while (level < POWER_THRESHOLDS.length && this.power >= POWER_THRESHOLDS[level]) level++;
    this.shotLevel = level;
  }

  /** Process one frame of input + state machine. */
  tick(input: PlayerInput): void {
    this.bombTriggered = false;
    this.stepShotWindow(input.shoot);
    if (this.state === 'dying') {
      this.tickDying();
      // `acceptBomb` is reachable from the death window: that is what a deathbomb
      // is. Everything else about being dead is enforced by the state guard below.
      this.tryBomb(input.bomb);
      this.updateShotLevel();
      this.syncToGameState();
      return;
    }

    if (this.state === 'respawning') {
      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.state = 'alive';
        // `FUN_0044d180:1444`: becoming ALIVE re-arms the grace counter from
        // `plyNNa.sht + 0x8`, which is what makes the next deathbomb window legal.
        this.graceTimer = deathbombBudget(this.gs.shotType);
      }
    }

    if (this.cancelTimer > 0) this.cancelTimer--;

    if (this.invulnTimer > 0) this.invulnTimer--;
    // The card's own state clock keeps running whether or not the card is still up
    // -- retail decrements it in the ship's update, not in the bomb's.
    if (this.bombStateTimer > 0) this.bombStateTimer--;

    if (this.state !== 'alive' && this.state !== 'respawning') return;

    /*
     * Focus. `Player.cpp:665-781` reads the stance every frame and only acts on the
     * edges: it resets the stance counter, arms the enter/exit puff when the previous
     * stance lasted at least four frames, and raises the hitbox only after seven
     * frames in the new one.
     *
     * The source of the stance is the interesting half of `:665-667`: while a spell
     * card is playing the Shift button is thrown away and the card variant's low bit
     * is used instead. Because `acceptBomb` builds that variant as
     * `focus | deathbomb ? flip : plain` (`Player.cpp:1238-1246`), a deathbomb always
     * comes out with the *opposite* stance in the low bit -- which is how 永夜抄 hands
     * the ship to the partner for the length of the card, and why the same bit is what
     * walks the 妖率计 (`Player.cpp:1194-1200`).
     */
    const focusHeld = this.gs.bombRunning ? this.gs.bombForcedFocus : input.slow;
    this.focusEntered = false;
    this.focusExited = false;
    if (focusHeld !== this.isSlow) {
      if (this.stanceTimer >= STANCE_PUFF_FRAMES) {
        if (focusHeld) this.focusEntered = true;
        else this.focusExited = true;
      }
      this.isSlow = focusHeld;
      this.stanceTimer = 0;
    } else {
      this.stanceTimer++;
    }
    if (this.stanceTimer >= HITBOX_DELAY_FRAMES) this.hitboxVisible = this.isSlow;

    /*
     * 低速 = 自机交替. This is Imperishable Night's signature mechanic and it is
     * baked into the art, not bolted on: every `playerNN.anm` ships two stance
     * families, scripts 0-4 over the human's frames and scripts 5-9 over the
     * youkai partner's own frames (`player00` upright 0-3 / 低速 11-14, and so on).
     * `Player.cpp:791-820` then takes the fast speed from the primary .sht and the
     * focus speed from the secondary one, i.e. from the partner's table. Holding
     * Shift therefore *is* the member swap -- there is no separate change key in
     * `Global.hpp:97-126` because there is nothing else to change.
     */
    const member: 0 | 1 = this.isSlow ? 1 : 0;
    if (member !== this.memberIndex) {
      this.memberIndex = member;
      this.switchFlash = SWITCH_FLASH_FRAMES;
    } else if (this.switchFlash > 0) {
      this.switchFlash--;
    }

    /*
     * 妖率计. `Player.cpp:937-938` decides the sign with `field_3`, the focus flag:
     * firing while upright charges the human side, firing while focused charges the
     * youkai side, and letting go relaxes back to neutral after 30 idle frames.
     *
     * `Player.cpp:924-925` gates the whole block on two things first: the stance must
     * have settled for `STANCE_METER_DELAY_FRAMES`, and no card may be playing. So a
     * Shift press freezes the meter for half a second, and a card freezes it for its
     * whole duration -- during which the only thing that can move it is the card's own
     * forced swing (`StageRunner` passes `force`).
     */
    this.gauge.frameStop = this.gs.bombRunning;
    if (
      this.stanceTimer >= STANCE_METER_DELAY_FRAMES &&
      !this.gs.bombRunning &&
      !this.holdGauge
    ) {
      // `Player.cpp:939` / `:961` push the meter through
      // `(i32)(gaugeDelta * g_EclGameTimeScale)`, so a scripted slow-motion slows
      // the 妖力 gauge down with everything else.
      this.gauge.tick({
        shooting: input.shoot,
        isYoukai: this.isSlow,
        timeScale: this.gs.timeScale,
      });
    }
    if (this.killHoldoff > 0) this.killHoldoff--;

    // Movement. Retail takes the fast pair from the primary .sht and the focus
    // pair from the secondary one (`Player.cpp:791-820`), i.e. the partner's table
    // governs slow travel, and it walks an eight-way index rather than a
    // normalised vector: see `movementDirectionIndex`.
    const axis = this.isSlow ? this.slowSpeed : this.fastSpeed;
    const diagonal = this.isSlow ? this.slowDiagonalSpeed : this.fastDiagonalSpeed;
    // `Player.cpp:880-881` scales the two finished components by
    // `g_EclGameTimeScale` on their way into the velocity fields `+0x3F8`/`+0x3FC`,
    // which are the same fields the walk animation reads - so under a slow-motion
    // the ship crawls, and its lean crawls with it.
    const ts = this.gs.timeScale;
    if (input.moveTarget) {
      // Pointer steering: home straight in, and stop inside a pixel so the ship
      // does not buzz around the cursor.
      const ox = input.moveTarget.x - this.x;
      const oy = input.moveTarget.y - this.y;
      const dist = Math.hypot(ox, oy);
      if (dist > 1) {
        const travel = Math.min(dist, axis) * ts;
        this.x += (ox / dist) * travel;
        this.y += (oy / dist) * travel;
        this.leanX = (ox / dist) * travel;
        this.leanY = (oy / dist) * travel;
      } else {
        this.leanX = 0;
        this.leanY = 0;
      }
    } else {
      const bits =
        input.dirBits ??
        (input.dy < 0 ? MOVE_BITS.up : 0) |
          (input.dy > 0 ? MOVE_BITS.down : 0) |
          (input.dx < 0 ? MOVE_BITS.left : 0) |
          (input.dx > 0 ? MOVE_BITS.right : 0);
      const [vx, vy] = movementAxisSpeeds(movementDirectionIndex(bits), axis, diagonal);
      this.x += vx * ts;
      this.y += vy * ts;
      this.leanX = vx * ts;
      this.leanY = vy * ts;
    }
    this.x = Math.max(8, Math.min(PLAYFIELD_W - 8, this.x));
    this.y = Math.max(16, Math.min(PLAYFIELD_H - 16, this.y));

    // Shot cooldown
    if (this.shootCooldown > 0) this.shootCooldown--;

    // Bomb. A press while the ship is alive spends one bomb (two for a deathbomb,
    // which only the dying path above can produce).
    this.tryBomb(input.bomb);

    this.updateShotLevel();
    this.syncToGameState();
  }

  /**
   * The dying clock: the grace window first, then the 30-frame dissolve.
   * `FUN_0044cbf0` takes the countdown branch while `0xE2A68` is non-zero and only
   * falls through to the animation once it reaches zero, so the ship really does
   * sit and glow white for a beat before it goes.
   */
  private tickDying(): void {
    if (this.graceTimer > 0) {
      addTimeOrbs(this.gs, DEATHBOMB_ORB_DRAIN);
      this.graceTimer--;
      // `Player.cpp:1317` raises the deathbomb flag and `:1333` drops it again in
      // the same frame the counter empties, so the last frame of the window is the
      // last legal press.
      this.deathbombArmed = this.graceTimer > 0;
      if (this.graceTimer === 0) this.settleDeath();
      return;
    }
    this.stateTimer--;
    this.deathTimer = DEATH_ANIM_FRAMES - Math.max(0, this.stateTimer);
    if (this.stateTimer <= 0) this.respawn();
  }

  /** Take a hit. Returns true if the hit connected. */
  hit(): boolean {
    if (this.invulnTimer > 0 || this.state !== 'alive') return false;
    // All three retail lethal-collision sites run `RandomizeAntiTamper()` on the
    // frame before `Die()`, behind the same `playerState == ALIVE` gate this
    // function already reproduces (`Player.cpp:337`, `:364`, `:474`). It costs
    // sixteen `GetRandomU16` steps off the shared stream, so leaving it out
    // re-angles every later scripted shot.
    randomizeAntiTamper(this.gs);
    // `Player.cpp:550` -- dying resets the meter to neutral. The power bill is not
    // paid here: see `settleDeath`.
    this.gauge.onDeath();
    this.deathSettled = false;
    this.state = 'dying';
    this.deathTimer = 0;
    this.graceTimer = graceWindowFrames({
      bombs: this.bombs,
      timeOrbs: this.gs.timeOrbs,
      lastSpellTimeOrbThreshold: this.gs.lastSpellTimeOrbThreshold,
      spellCardActive: this.gs.spellName !== null,
      shotType: this.gs.shotType,
    });
    this.deathbombArmed = this.graceTimer > 0;
    this.stateTimer = DEATH_FRAMES;
    this.invulnTimer = 0;
    return true;
  }

  /**
   * The frame the death stops being cancellable (`Player.cpp:1318-1369`).
   *
   * Power is only paid here, which is the whole reason a deathbomb is worth two
   * bombs: the card buys the ship its power bar back for as long as the window
   * lasts. Out of lives, retail takes the entire bar instead of a 16-point slice.
   */
  private settleDeath(): void {
    if (this.lives <= 0) {
      this.powerLost += this.power;
      this.power = 0;
    } else {
      const shed = this.power <= DEATH_POWER_FLOOR ? this.power : DEATH_POWER_COST;
      this.power -= shed;
      this.powerLost += shed;
    }
    this.deathSettled = true;
    // `Player.cpp:1369`: the rank bill for a death, paid on the same frame the power
    // is. Sixteen steps off the ladder, which is what makes a stage you died in stay
    // visually gentler for the rest of its length.
    decreaseSubrank(this.gs, 1600);
  }

  /** Spend a life and fly back in. Returns false on game over. */
  respawn(): boolean {
    if (this.lives <= 0) {
      this.state = 'dead';
      this.gs.showRetryMenu = true;
      return false;
    }
    this.lives--;
    // `Player.cpp:1408` flies the ship back in with a fresh bomb count straight out
    // of `plyNNa.sht + 4`. That is why bombs are a per-life budget in 永夜抄 rather
    // than a per-run one, and it is the only place the reference ever refills them.
    this.bombs = this.deathbombRefill;
    this.x = RESPAWN_X;
    this.y = RESPAWN_Y;
    this.state = 'respawning';
    this.stateTimer = SPAWN_FRAMES;
    this.cancelTimer = CANCEL_FRAMES;
    this.graceTimer = 0;
    this.deathTimer = 0;
    this.deathbombArmed = false;
    // No invulnerability: immunity is the state machine, and the 60-frame
    // bullet-cancel below is the whole of the mercy period.
    this.invulnTimer = 0;
    return true;
  }

  /**
   * Spend a bomb. Retail buys no invulnerability with it (`acceptBomb` never
   * touches an invuln counter); what a card buys is its own cancel sweep, and the
   * only frames it can steal are the ones the enemy spends inside that sweep.
   */
  useBomb(): boolean {
    return this.tryBomb(true);
  }

  /** `acceptBomb` (`Player.cpp:1204-1296`), folded into one press. */
  private tryBomb(pressed: boolean): boolean {
    this.deathbomb = false;
    if (!pressed) return false;
    if (this.bombs <= 0) return false;
    const deathbomb = this.state === 'dying' && this.deathbombArmed && this.graceTimer > 0;
    if (!deathbomb && this.state !== 'alive') return false;
    const cost = bombCost(deathbomb, this.bombs);
    if (cost <= 0) return false;
    this.bombs -= cost;
    this.graceTimer = graceAfterBomb(this.graceTimer, this.gs.shotType);
    this.deathbomb = deathbomb;
    this.bombTriggered = true;
    // `Player.cpp:1287`: a card costs two rank steps of density, paid the frame it is
    // accepted.
    decreaseSubrank(this.gs, 200);
    return true;
  }

  /** Bombs the card that would fire right now costs (`acceptBomb:1244-1271`). */
  get bombCost(): number {
    return bombCost(this.deathbombArmed, this.bombs);
  }

  /** What `respawn()` refills the bomb count to: `plyNNa.sht + 4`. */
  get deathbombRefill(): number {
    return INITIAL_BOMBS;
  }

  /**
   * The ship's scale/blend pose for the grace window, the dissolve and the
   * spawn-in, or null when it draws as usual.
   */
  get shipPose(): ShipTransform | null {
    const pose = shipTransform(this.state, this.stateTimer, this.graceTimer);
    return pose.alpha >= 1 && pose.scaleX === 1 && pose.scaleY === 1 && !pose.whiteout ? null : pose;
  }

  /**
   * `Player::IsYoukai()` (`PlayerBomb.cpp:36-39`) -- the settled side, read by ECL
   * operand 0x2771, by the enemy interrupt that decides which of a card's two
   * bullet sets is live (`EnemyManager.cpp:939-973`), and by the graze push into
   * the meter (`Player.cpp:507-508`).
   *
   * Retail assigns this byte in exactly one place, the focus block: seven settled
   * frames of low-speed raise it and seven settled frames upright clear it, so it
   * is literally the same byte as {@link hitboxVisible}. Solos then overwrite it
   * every frame with their own half of the pair (`Player.cpp:783-789`) -- a solo
   * has no partner to trade stances with, so its side is fixed by the table index.
   */
  get isYoukai(): boolean {
    if (this.gs.shotType >= 4) return (this.gs.shotType & 1) === 1;
    return this.hitboxVisible;
  }

  /**
   * `EnemyManager.cpp:363-369`: a boss-attached kill drags the meter a twelfth
   * of the way back to neutral and opens a 50-frame hold-off on 时符 gauge gains.
   */
  onEnemyKilled(): void {
    this.gauge.onEnemyDeath();
    this.killHoldoff = 50;
  }

  /**
   * `ItemManager.cpp:638-642`: a 时符 pushes the meter by 111 toward the side that
   * is flying. Note which byte that test is on: retail reads `Player+3`, the focus
   * flag itself, not the settled side -- so the push lands on the frame Shift goes
   * down, seven frames before {@link isYoukai} would agree.
   */
  onTimeOrbCollected(): void {
    this.gauge.onTimeOrb(this.isSlow, this.killHoldoff);
  }

  /**
   * `Player.cpp:487-508`: what one graze is worth right now. The human side of
   * the meter counts grazes for more, the youkai side pays more score, and grazing
   * in youkai form feeds the meter.
   */
  grazeReward(): { grazeGain: number; score: number } {
    const reward = this.gauge.onGraze();
    if (this.isYoukai) this.gauge.add(reward.gaugeGain);
    // `Player.cpp:487-497`: a live card pays the score but stops both counters, so
    // neither the result-screen graze total nor the on-screen tally grows while your
    // own bomb is up.
    const gained = this.gs.bombRunning ? 0 : reward.grazeGain;
    this.graze = Math.min(999999, this.graze + gained);
    this.score += reward.score;
    // `Player.cpp:501`: the subrank bump sits outside the card guard at `:487`, so a
    // graze under your own stopped clock still buys rank.
    increaseSubrank(this.gs, 6);
    return { grazeGain: gained, score: reward.score };
  }

  /**
   * `Player.cpp:510-521`: what a graze is worth to the youkai side beyond the
   * number -- with the meter at its youkai extreme and a stage boss registered,
   * every single graze prints a 时符. A live spell card prints a second one, and a
   * team prints a third, because the partner's half of the pair collects in
   * parallel; a solo youkai has no partner and so loses that third (`:518`). A
   * laser graze asks for the extras to be suppressed (`Player.cpp:466` passes
   * `suppressExtraItems = 1`), and the first 时符 is not one of the extras.
   *
   * The gate at `:510` reads `!IsSoloHuman() || shotType == 10`, which looks odd
   * until you notice 妖夢 is the one solo whose shot type keeps the youkai reward:
   * `shotType == 10` is her slot in the table.
   */
  grazeTimeOrbs(bossPresent: boolean, spellcardActive: boolean, suppressExtras = false): number {
    const solo = this.gs.shotType >= 4;
    const soloHuman = solo && (this.gs.shotType & 1) === 0;
    if (soloHuman && this.gs.shotType !== 10) return 0;
    if (!bossPresent || !this.gauge.isExtremelyYoukai()) return 0;
    if (!spellcardActive || suppressExtras) return 1;
    const soloYoukai = solo && (this.gs.shotType & 1) === 1;
    return soloYoukai ? 2 : 3;
  }

  /** Add power, clamped to maxPower. Returns overflow. */
  addPower(amount: number): number {
    const before = this.power;
    this.power = Math.min(this.maxPower, this.power + amount);
    return this.power - before;
  }

  /** Continue (retry): reset resources, keep stage. */
  continue_(): void {
    this.lives = 3;
    this.bombs = INITIAL_BOMBS;
    this.power = 0;
    this.score = 0; // actually set to numRetries in original
    this.state = 'alive';
    this.stateTimer = 0;
    this.graceTimer = 0;
    this.deathTimer = 0;
    this.deathbombArmed = false;
    this.invulnTimer = 0;
    this.x = RESPAWN_X;
    this.y = RESPAWN_Y;
  }

  /** Reset for next stage (carry resources). */
  resetForStage(): void {
    this.x = RESPAWN_X;
    this.y = RESPAWN_Y;
    this.state = 'alive';
    this.stateTimer = 0;
    this.cancelTimer = 0;
    this.graceTimer = 0;
    this.deathTimer = 0;
    this.deathbombArmed = false;
    this.invulnTimer = 0;
  }

  get isFlying(): boolean {
    return this.state === 'alive' || this.state === 'respawning';
  }

  get isInvulnerable(): boolean {
    return this.invulnTimer > 0;
  }

  /** Blink pattern during invulnerability: visible except frame%8 < 2 (red flash). */
  get isBlinkRed(): boolean {
    return this.invulnTimer > 0 && this.gs.frame % 8 < 2;
  }
}
