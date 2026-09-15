import { Entity } from '../../engine/core/Entity';
import { Vector2 } from '../../engine/core/Vector2';
import { InputSystem } from '../../engine/core/InputSystem';
import { movementAxisSpeeds, movementDirectionIndex } from '../../engine/core/Movement';
import { Bullet, BulletConfig, obtainBullet } from '../../engine/core/Bullet';
import { Bounds } from '../../engine/core/BulletSystem';
import { BulletFactory } from '../bullet-patterns/BulletPattern';
import {
  BULLET_CANCEL_FRAMES,
  DEATHBOMB_ORB_DRAIN,
  DEATH_FRAMES,
  SPAWN_FRAMES,
  bombCost,
  graceAfterBomb,
  graceWindowFrames,
  shipTransform,
  type ShipTransform,
} from './DeathCycle';
import {
  CHARACTER_PROFILES,
  DEATH_POWER_COST,
  DEATH_POWER_FLOOR,
  MAX_POWER,
  POWER_THRESHOLDS,
  type CharacterId,
  type CharacterProfile,
  type MemberId,
  type MemberProfile,
  type ShotStyle,
} from './CharacterProfile';

export interface PlayerConfig {
  profile?: CharacterProfile;
  characterId?: CharacterId;
  fastSpeed?: number;
  slowSpeed?: number;
  hitboxRadius?: number;
  initialLives?: number;
  initialBombs?: number;
  /** Starting power in 1/128 units (128 = 2.00); clamped to the team cap. */
  initialPower?: number;
  playfield?: Bounds;
  /** Bullet creation hook — lets the game route shots through its object pool. */
  bulletFactory?: BulletFactory;
}

export const DEFAULT_PLAYFIELD: Bounds = {
  // World space, not canvas space: the 384x448 field is drawn inside a 640x480
  // window, and the renderer applies the offset. The ship keeps an 8px margin
  // from the walls exactly like the retail clip box.
  minX: 8,
  maxX: 376,
  minY: 16,
  maxY: 432,
};

/** Frames the swap flourish stays on screen after a focus switch. */
export const SWITCH_FLASH_FRAMES = 14;

/** Life cycle; see Player.hit / Player.respawn for the transitions. */
export type PlayerState = 'alive' | 'dying' | 'respawning' | 'dead';

/**
 * The 永夜抄 player: a two-person team where Shift is both focus and character
 * switch. Unfocused flies member A at full speed; holding Shift halves the speed,
 * exposes the hitbox and swaps in member B with a completely different weapon.
 */
export class Player extends Entity {
  /** The team this player belongs to (menu selection, leaderboard entry). */
  public team: CharacterProfile;
  public characterId: CharacterId;
  public characterName: string;
  /** 0 = member A (unfocused), 1 = member B (focused). */
  /** Death burst before the ship is allowed back (Player::Die -> 30 frames). */
  public static readonly DEATH_FRAMES = DEATH_FRAMES;
  /** Spawn-in scale/fade animation (FUN_0044d180 -> 30 frames). */
  public static readonly SPAWN_FRAMES = SPAWN_FRAMES;
  /** Post-respawn bullet-cancel volume (playerStateSlotCooldown = 60). */
  public static readonly BULLET_CANCEL_FRAMES = BULLET_CANCEL_FRAMES;
  /** plyNNa.sht bombCount: every team restarts a life with 3 bombs. */
  public static readonly INITIAL_BOMBS = 3;
  /** Respawn point: arcadeRegionSize.x / 2, arcadeRegionSize.y - 64. */
  /**
   * 192 = the centre of the 384-wide playfield (`sim/Playfield.ts` RESPAWN_X). This
   * used to read 224, the centre of the retired 448-wide field, so the presentation
   * ship came back 32px right of where the sim put it.
   */
  public static readonly RESPAWN_X = 192;
  public static readonly RESPAWN_Y = 384;
  /**
   * How far a volley lane may sit from the hitbox at the instant of firing.
   *
   * Retail fans a weapon out by angle rather than by moving the muzzle sideways, so
   * a volley always starts inside the ship silhouette. The launch points are not
   * recoverable from the decompile -- `PlayerRawShtFile` declares the whole first
   * 0x1c bytes of `plyNNa.sht` as `unknown_fields` (`Player.hpp:13-17`) -- so this
   * is an observed bound, and every lane is clamped to it rather than tuned to it.
   */
  public static readonly MUZZLE_LIMIT = 12;

  public memberIndex: 0 | 1 = 0;
  /** Frames left on the swap flourish; drives the renderer's flash. */
  public switchFlash = 0;
  public fastSpeed: number;
  public slowSpeed: number;
  /** Per-axis diagonal speed, unfocused (`plyNNa.sht + 0x2C`). */
  public fastDiagonalSpeed: number;
  /** Per-axis diagonal speed, focused (`plyNNas.sht + 0x30`). */
  public slowDiagonalSpeed: number;
  public bombDamage: number;
  /** Nearest target for homing shots, refreshed by the game each frame. */
  public aimTarget: { position: { x: number; y: number } } | null = null;
  public color: number;
  public accentColor: number;
  public isSlowMode = false;
  /**
   * Whether the hitbox dot is drawn. TH08 raises this a few frames *after* focus
   * is engaged (`Player.cpp:716, 778`), so it is deliberately not the same flag
   * as `isSlowMode`.
   */
  public hitboxVisible = false;
  /**
   * Intended horizontal velocity in px/frame, mirroring `PlayerSim.leanX`. The
   * renderer leans the ship from this rather than from `velocity`, because the
   * position delta carries wall-clamp and sub-pixel noise that retriggers the
   * lean/unlean transition forever. See `Player.cpp:791-872`.
   */
  public leanX: number | null = null;
  public lives: number;
  public bombs: number;
  /** Power in 1/128 units; 128 reads as 2.00 on the HUD. */
  public power = 0;
  /** Ceiling for power, from the team profile (128 = 2.00). */
  public maxPower = MAX_POWER;
  /**
   * Power shed by the most recent death, still owed to the drop-item spawner.
   * TH08 hands back one big P plus four small P, so the game reads this once.
   */
  public powerLost = 0;
  /**
   * 永夜抄 life cycle. `dying` freezes the ship behind a death burst for 30
   * frames, `respawning` flies the 60-frame spawn-in at the start position,
   * and `dead` is the game-over parking lot.
   */
  public state: PlayerState = 'alive';
  /** Countdown for the current non-alive state, in game frames. */
  public stateTimer = 0;
  /**
   * Frames left of the deathbomb grace window (`0xE2A68`). The ship holds on the
   * death spot, white, for exactly this long before it dissolves.
   */
  public graceTimer = 0;
  /** `field_4`: a press while this is set spends two bombs and the partner's card. */
  public deathbombArmed = false;
  /** One-tick flag: this frame the death stopped being cancellable. */
  public deathSettled = false;
  /** Inputs to the grace-window formula, kept current by the game. */
  public shotType = 0;
  public timeOrbs = 0;
  public lastSpellTimeOrbThreshold = Number.POSITIVE_INFINITY;
  public spellCardActive = false;
  /**
   * Frames left of the post-respawn bullet-cancel volume (playerStateSlotCooldown
   * = 60 in the reference). Bullets inside it vanish without being grazed.
   */
  public cancelTimer = 0;
  public score = 0;
  public graze = 0;
  public isInvulnerable = false;
  public invulnerabilityTimer = 0;
  /**
   * Set while a spell card's own state clock has the ship, on the frames it is meant
   * to read red. Mirrors `PlayerSim.bombStateFlash`; a game without that clock just
   * leaves it false.
   */
  public bombStateFlash = false;
  public shootCooldown = 0;
  public playfield: Bounds;
  public bulletFactory: BulletFactory;

  constructor(position: Partial<Vector2> = {}, config: PlayerConfig = {}) {
    const team =
      config.profile ??
      (config.characterId ? CHARACTER_PROFILES[config.characterId] : CHARACTER_PROFILES['reimu-yukari']);
    // The entity box is the team's `.sht` hit box half-extent, so the point the
    // player sees and the box bullets are tested against are one and the same number.
    super(position, {}, { radius: config.hitboxRadius ?? team.hitboxHalfExtent }, 'player');
    this.team = team;
    this.characterId = config.characterId ?? team.id;
    this.characterName = team.name;
    this.fastSpeed = config.fastSpeed ?? team.fastSpeed;
    this.slowSpeed = config.slowSpeed ?? team.slowSpeed;
    this.fastDiagonalSpeed = team.fastDiagonalSpeed;
    this.slowDiagonalSpeed = team.slowDiagonalSpeed;
    this.bombDamage = team.bombDamage;
    this.color = team.color;
    this.accentColor = team.accentColor;
    this.maxPower = team.maxPower;
    this.power = Math.min(this.maxPower, config.initialPower ?? 0);
    this.state = 'alive';
    this.lives = config.initialLives ?? 3;
    this.maxPower = config.profile ? config.profile.maxPower : this.maxPower;
    this.bombs = config.initialBombs ?? 3;
    this.playfield = config.playfield ?? DEFAULT_PLAYFIELD;
    this.bulletFactory = config.bulletFactory ?? ((cfg) => obtainBullet(cfg));
  }

  /** The member currently flying (A unfocused, B focused). */
  get member(): MemberProfile {
    return this.team.members[this.memberIndex];
  }

  /** The member standing down; the renderer trails it as a translucent shadow. */
  get partner(): MemberProfile {
    return this.team.members[this.memberIndex === 0 ? 1 : 0];
  }

  get memberId(): MemberId {
    return this.member.id;
  }

  /** Weapon read-outs follow the active member so HUD and tests stay truthful. */
  get shotStyle(): ShotStyle {
    return this.member.shotStyle;
  }
  get shotCount(): number {
    return this.member.shotCount;
  }
  get shotRate(): number {
    return this.member.shotRate;
  }
  get shotDamage(): number {
    return this.member.shotDamage;
  }
  get shotRadius(): number {
    return this.member.shotRadius;
  }
  get shotSpread(): number {
    return this.member.spread;
  }
  get shotColor(): number {
    return this.member.bulletColor;
  }
  get shotSprite(): string {
    return this.member.shotSprite;
  }

  applyProfile(team: CharacterProfile): void {
    this.team = team;
    this.characterId = team.id;
    this.characterName = team.name;
    this.fastSpeed = team.fastSpeed;
    this.slowSpeed = team.slowSpeed;
    this.fastDiagonalSpeed = team.fastDiagonalSpeed;
    this.slowDiagonalSpeed = team.slowDiagonalSpeed;
    this.bombDamage = team.bombDamage;
    this.color = team.color;
    this.accentColor = team.accentColor;
    this.maxPower = team.maxPower;
    this.power = Math.min(this.maxPower, this.power);
    // The collision box comes from the team's `.sht` block, so the drawn point and
    // the box bullets are tested against are the same number.
    this.hitbox.radius = team.hitboxHalfExtent;
  }

  /** Swap the flying member directly (tests, replays and scripted demos). */
  setMember(index: 0 | 1): boolean {
    if (this.memberIndex === index) return false;
    this.memberIndex = index;
    this.switchFlash = SWITCH_FLASH_FRAMES;
    return true;
  }

  /**
   * Enter or leave focus mode. In Imperishable Night this *is* the member swap:
   * `playerNN.anm` keeps the human's stance in scripts 0-4 and the partner's own
   * frames in the 低速 family scripts 5-9, and `Player.cpp:791-820` takes the
   * focus speed from the secondary (partner) .sht. There is no separate change
   * key in `Global.hpp:97-126` because Shift already does the switching.
   */
  setFocus(focused: boolean): void {
    this.isSlowMode = focused;
    this.setMember(focused ? 1 : 0);
  }

  /**
   * Raise power by amount (1/256 units) and report what actually landed,
   * so callers can score the overflow the way TH08 does at max power.
   */
  addPower(amount: number): number {
    const before = this.power;
    this.power = Math.min(this.maxPower, this.power + amount);
    return this.power - before;
  }

  /** Fill power to the team cap (the 電 item). Returns the amount gained. */
  fillPower(): number {
    return this.addPower(this.maxPower);
  }

  /** Point homing shots at the closest live target (null = fire straight). */
  setAimTarget(target: { position: { x: number; y: number } } | null): void {
    this.aimTarget = target;
  }

  /**
   * Put the ship back at the start position for a new stage.
   *
   * Lives, bombs and power deliberately survive: Touhou 8 carries all three
   * across the whole run, and only death (or a continue) touches them.
   */
  resetForStage(preserveScore = true): void {
    // The 384x448 field centres on x=192 and TH08 flies in at y=384, which is the
    // same point `PlayerSim` respawns on. The old 224/380 was the pre-layout
    // 448-wide centre, so a stage hand-off visibly nudged the ship sideways.
    this.position.x = 192;
    this.position.y = 384;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.isAlive = true;
    this.state = 'alive';
    this.stateTimer = 0;
    this.cancelTimer = 0;
    this.graceTimer = 0;
    this.deathbombArmed = false;
    this.deathSettled = false;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.shootCooldown = 0;
    this.switchFlash = 0;
    this.powerLost = 0;
    if (!preserveScore) this.score = 0;
  }

  /**
   * @param fieldPointer Where a pointer device wants the ship, already in this
   * player's own coordinate space, or `null` when nothing is steering. The field is
   * not the whole canvas (`canvasToWorldX`), so a host that draws it inside a
   * 640x480 window has to convert the cursor before handing it over -- the ECL
   * player sim gets the converted point, and this call needs the same one or the
   * two writers disagree by the playfield offset. Left out, the pointer is read as
   * already being in this player's space, which is what a full-window game wants.
   */
  handleInput(input: InputSystem, fieldPointer?: Vector2 | null): void {
    this.setFocus(input.isKeyDown('slow'));

    // Pointer steering: touch drag, or mouse when that option is enabled.
    const target =
      fieldPointer === undefined
        ? input.isSteering
          ? (input.getPointerTarget() ?? input.pointerPos)
          : null
        : fieldPointer;
    if (target) {
      const dx = target.x - this.position.x;
      const dy = target.y - this.position.y;
      const dist = Math.hypot(dx, dy);
      const speed = this.isSlowMode ? this.slowSpeed : this.fastSpeed;
      if (dist > 1) {
        const travel = Math.min(dist, speed);
        this.velocity.x = (dx / dist) * travel;
        this.velocity.y = (dy / dist) * travel;
      } else {
        this.velocity.x = 0;
        this.velocity.y = 0;
      }
      // The lean reads intent, same as the keyboard path, so a ship parked under
      // the cursor does not keep the tilt from its last move.
      this.leanX = this.velocity.x;
      return;
    }

    const speed = this.isSlowMode ? this.slowSpeed : this.fastSpeed;
    const diagonal = this.isSlowMode ? this.slowDiagonalSpeed : this.fastDiagonalSpeed;
    // Retail resolves the held keys into an eight-way index and reads a separate
    // per-axis figure for diagonals, so a corner is not a 41 % speed bonus.
    const bits = input.movementBits;
    const [vx, vy] = movementAxisSpeeds(movementDirectionIndex(bits), speed, diagonal);
    this.velocity.x = vx;
    this.velocity.y = vy;
    this.leanX = this.velocity.x;
  }

  /**
   * Decay only the fire-rate gate.
   *
   * `update()` owns this cooldown, but the ECL-driven stage runs its own player sim
   * and never calls `update()`. Without this the first volley latches `shootCooldown`
   * forever and the ship appears to have no weapon at all.
   */
  tickShootCooldown(dt = 1): void {
    if (this.shootCooldown > 0) this.shootCooldown = Math.max(0, this.shootCooldown - dt);
  }

  /**
   * Fire the active member's weapon. Every one of the eight members is a real
   * design point: homing charms, wide gap spreads, concentrated lasers and rapid
   * knives all behave differently, and none of them curl back on the shooter.
   */
  /** Pull a lane offset back inside `MUZZLE_LIMIT` of the ship centre line. */
  private muzzleX(offset: number): number {
    const limit = Player.MUZZLE_LIMIT;
    return this.position.x + Math.max(-limit, Math.min(limit, offset));
  }

  shoot(_time = 0): Bullet[] {
    if (this.shootCooldown > 0) return [];
    const m = this.member;
    this.shootCooldown = m.shotRate;

    const bullets: Bullet[] = [];
    // Shot level comes from g_PowerUpThresholds, not a flat divide: the same
    // power buys different extra projectiles per team ceiling.
    const level = Math.min(4, this.shotLevel);
    const count = m.shotCount + level;
    // Focus tightens the formation; the original trades coverage for precision.
    const spread = this.isSlowMode ? m.spread * 0.55 : m.spread;
    const lift = m.shotSpeed;
    const muzzleY = this.position.y - 18;

    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1) - 0.5;
      const lane = t * spread;
      const base: BulletConfig = {
        position: { x: this.muzzleX(lane * 26), y: muzzleY },
        radius: m.shotRadius,
        color: m.bulletColor,
        damage: Math.round(m.shotDamage * (this.isSlowMode ? 1.15 : 1)),
        tag: 'player-bullet',
        sprite: m.shotSprite,
        spin: m.spin,
      };

      switch (m.shotStyle) {
        case 'homing': {
          // Charm weapons launch along the fan, then steer at the target for a
          // bounded window. homingTurn caps the rate, so they curve, never orbit.
          const heading = -Math.PI / 2 + lane * 1.6;
          bullets.push(
            this.makeBullet({
              ...base,
              velocity: { x: Math.cos(heading) * lift, y: Math.sin(heading) * lift },
              heading,
              homingTurn: m.homingTurn,
              homingFrames: m.homingFrames,
              homingMaxTurn: m.homingMaxTurn,
            }),
          );
          break;
        }
        case 'spread': {
          const heading = -Math.PI / 2 + lane * 2.4;
          bullets.push(
            this.makeBullet({
              ...base,
              position: { x: this.muzzleX(lane * 34), y: muzzleY },
              velocity: { x: Math.cos(heading) * lift, y: Math.sin(heading) * lift },
              heading,
            }),
          );
          break;
        }
        case 'needle': {
          // Rapid knives: a tight column with alternating stagger for density.
          bullets.push(
            this.makeBullet({
              ...base,
              position: { x: this.muzzleX(lane * 14), y: muzzleY - (i % 2) * 7 },
              velocity: { x: lane * 6, y: -lift },
              damage: Math.round(m.shotDamage),
            }),
          );
          break;
        }
        default: {
          // 'laser': few but heavy, stacked on the centre line so they read as one beam.
          bullets.push(
            this.makeBullet({
              ...base,
              position: { x: this.muzzleX(lane * 7), y: muzzleY },
              velocity: { x: lane * 3, y: -lift },
              radius: m.shotRadius + 1.2,
              damage: Math.round(m.shotDamage * (this.isSlowMode ? 1.3 : 1)),
            }),
          );
        }
      }
    }
    return bullets;
  }

  private makeBullet(config: BulletConfig): Bullet {
    return this.bulletFactory(config);
  }

  /**
   * Take a hit: start the death sequence and pay the power bill.
   *
   * The reference costs 16 units (0.25) per death and zeroes anything at or
   * below 16, then hands the shed power back as drop items; see Player::Die and
   * the ITEM_POWER_* spawns that follow it.
   */
  /**
   * Take a hit and open the deathbomb window.
   *
   * The power bill is deliberately not paid here: `Player::Die` only touches power
   * once the grace counter runs out (`FUN_0044cbf0:1341-1346`), which is what makes a
   * deathbomb worth its two bombs.
   */
  hit(): boolean {
    if (this.isInvulnerable || this.state !== 'alive') return false;
    this.state = 'dying';
    this.stateTimer = Player.DEATH_FRAMES;
    this.graceTimer = graceWindowFrames({
      bombs: this.bombs,
      timeOrbs: this.timeOrbs,
      lastSpellTimeOrbThreshold: this.lastSpellTimeOrbThreshold,
      spellCardActive: this.spellCardActive,
      shotType: this.shotType,
    });
    this.deathbombArmed = this.graceTimer > 0;
    this.deathSettled = false;
    // The window itself is the protection: `FUN_0044cbf0` only reaches the ship once
    // it is ALIVE again.
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.emit('hit', this.lives);
    return true;
  }

  /**
   * The frame the window runs out: pay the power bill and arm the drop spawn
   * (`Player.cpp:1341-1369`). Out of lives the whole bar goes instead of a slice.
   */
  settleDeath(): void {
    const shed =
      this.lives <= 0 ? this.power : this.power <= DEATH_POWER_FLOOR ? this.power : DEATH_POWER_COST;
    this.power -= shed;
    this.powerLost += shed;
    this.deathSettled = true;
    this.emit('deathSettled');
  }

  /**
   * Spend one life and fly back in.
   *
   * Bombs deliberately survive. `Player.cpp:1341-1358` pays a death with power and a
   * drop of P items, and the only bomb it ever hands back is the `ITEM_BOMB` pickup the
   * Sakuya/Remilia side gets -- so the count carries through a death.
   *
   * @returns false when there are no lives left, i.e. the run is over.
   */
  respawn(): boolean {
    if (this.lives <= 0) {
      this.state = 'dead';
      this.isAlive = false;
      this.emit('gameover');
      return false;
    }
    this.lives -= 1;
    // `Player.cpp:1408` refills the bomb count from `plyNNa.sht + 4` on the way in.
    this.bombs = Player.INITIAL_BOMBS;
    this.position.x = Player.RESPAWN_X;
    this.position.y = Player.RESPAWN_Y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.state = 'respawning';
    this.stateTimer = Player.SPAWN_FRAMES;
    this.cancelTimer = Player.BULLET_CANCEL_FRAMES;
    this.graceTimer = 0;
    this.deathbombArmed = false;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.emit('respawn', this.lives);
    return true;
  }

  /** True while the ship is on screen and can be hit or can fire. */
  get isFlying(): boolean {
    return this.state === 'alive' || this.state === 'respawning';
  }

  /** Point-of-collection line for this team (plyNNa.sht + 0x1c). */
  get pointItemValueLine(): number {
    return this.team.pointItemValueLine;
  }

  /** Homing speed used once items are grabbed (sht + 0x14). */
  get itemGrabSpeed(): number {
    return this.team.itemGrabSpeed;
  }

  /**
   * Time scale on items that are still drifting on their own (sht + 0x34).
   *
   * `ItemManager.cpp:207-209` swaps the table with the focus flag, exactly like
   * the move speed does, so Sakuya's unfocused field falls at 0.65 and Remilia's
   * focused one at 0.9.
   */
  get itemTimeScale(): number {
    return this.isSlowMode ? this.team.itemTimeScaleFocused : this.team.itemTimeScale;
  }

  /** Half of the item box (sht + 0x18 / 2). */
  get itemPickupHalfExtent(): number {
    return this.team.itemPickupHalfExtent;
  }

  /** Half of the hit box (sht + 0x0C / 2). */
  get hitboxHalfExtent(): number {
    return this.team.hitboxHalfExtent;
  }

  /** Half of the graze box (sht + 0x10 / 2). */
  get grazeHalfExtent(): number {
    return this.team.grazeHalfExtent;
  }

  /** Shot level 0..5 from g_PowerUpThresholds {8,24,48,80,128}. */
  get shotLevel(): number {
    let level = 0;
    while (level < POWER_THRESHOLDS.length - 1 && this.power >= POWER_THRESHOLDS[level]) {
      level++;
    }
    return level;
  }

  /**
   * Spend a card. A press during the grace window is a deathbomb: it costs two bombs
   * (or everything left, if that is fewer) and belongs to the member not flying.
   * Retail buys no invulnerability with any of this (`acceptBomb:1244-1271`).
   */
  useBomb(): boolean {
    if (this.bombs <= 0) return false;
    const deathbomb = this.state === 'dying' && this.deathbombArmed && this.graceTimer > 0;
    if (!deathbomb && this.state !== 'alive') return false;
    const cost = bombCost(deathbomb, this.bombs);
    if (cost <= 0) return false;
    this.bombs -= cost;
    this.graceTimer = graceAfterBomb(this.graceTimer, this.shotType);
    this.emit('bomb', this.bombs);
    return true;
  }

  /**
   * Scale, blend and opacity for the grace window, the dissolve and the spawn-in.
   * `null` means the ship draws as usual.
   */
  get shipPose(): ShipTransform | null {
    const pose = shipTransform(this.state, this.stateTimer, this.graceTimer);
    if (pose.alpha >= 1 && pose.scaleX === 1 && pose.scaleY === 1 && !pose.whiteout) return null;
    return pose;
  }

  /** True while the ship is held white on the death spot inside its window. */
  get whiteoutHold(): boolean {
    return this.state === 'dying' && this.graceTimer > 0;
  }

  override update(dt: number): void {
    super.update(dt);

    if (this.shootCooldown > 0) {
      this.shootCooldown = Math.max(0, this.shootCooldown - dt);
    }
    if (this.switchFlash > 0) {
      this.switchFlash = Math.max(0, this.switchFlash - dt);
    }

    // Ticked first so a respawn armed this frame keeps its full cancel window.
    if (this.cancelTimer > 0) this.cancelTimer = Math.max(0, this.cancelTimer - dt);

    // Dying: the grace window first, then the dissolve, then respawn().
    if (this.state === 'dying') {
      if (this.graceTimer > 0) {
        this.timeOrbs = Math.max(0, this.timeOrbs + DEATHBOMB_ORB_DRAIN * dt);
        this.graceTimer = Math.max(0, this.graceTimer - dt);
        this.deathbombArmed = this.graceTimer > 0;
        if (this.graceTimer === 0) this.settleDeath();
      } else {
        this.stateTimer = Math.max(0, this.stateTimer - dt);
        if (this.stateTimer === 0) this.respawn();
      }
    } else if (this.state === 'respawning') {
      this.stateTimer = Math.max(0, this.stateTimer - dt);
      if (this.stateTimer === 0) {
        this.state = 'alive';
        this.graceTimer = graceAfterBomb(0, this.shotType);
      }
    }

    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= dt;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.invulnerabilityTimer = 0;
      }
    }

    // Clamp playfield
    this.position.x = Math.max(this.playfield.minX, Math.min(this.playfield.maxX, this.position.x));
    this.position.y = Math.max(this.playfield.minY, Math.min(this.playfield.maxY, this.position.y));
  }
}
