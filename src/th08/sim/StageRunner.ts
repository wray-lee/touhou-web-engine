/**
 * Main simulation orchestrator: one frame = one call to tick().
 *
 * Wires together: TimelineRunner, EnemyManager, BulletPool, PlayerSim,
 * ItemPool, and Collision. This is the core game loop, deterministic
 * given the same Rng seed and input sequence.
 */

import { addTimeOrbs, type GameState } from './GameState';
import type { EclFile } from '../format/EclFile';
import { EnemyManager, type SubFactory } from './EnemyManager';
import type { TimePopup } from './EnemyManager';
import { TimelineRunner } from './TimelineRunner';
import { BulletPool } from './BulletPool';
import type { Bullet } from './BulletPool';
import type { BulletWorld, SeTick } from './BulletTransform';
import { LaserPool } from './LaserPool';
import type { EffectHandle, EffectPool } from './EffectPool';
import type { Laser } from './LaserPool';
import { PlayerSim, type PlayerInput } from './PlayerSim';
import {
  addSecondaryHitbox,
  advanceHitAccumulator,
  applyYoukaiDamageBonus,
  damageOrbThreshold,
  resolveShotDamage,
  shotContribution,
  type ShotDamageContext,
  type ShotView,
} from './ShotDamage';
import { ItemPool, type CollectResult } from './ItemPool';
import { checkPlayerCollisions, checkLaserCollisions, type CollisionStats } from './Collision';
import {
  OPTION_SLOTS,
  OptionSystem,
  TRAIL_SPARK,
  type OptionCandidate,
  type OptionWorld,
} from './PlayerOptions';
import {
  PlayerShotPool,
  SHOT_FREE,
  SHOT_LIVE,
  SHOT_SPENT,
  UNTRACKED_AIM,
  trackedAimPoint,
  type PlayerShotWorld,
} from './PlayerShots';
import {
  PLAYER_ANM_TEAM_BY_SHOT_TYPE,
  playerAnmRuntime,
  weaponTablesFor,
  type PlayerAnmRuntime,
  type PlayerWeaponTables,
} from '../data/playerWeaponData';
import { PLAYFIELD_H, PLAYFIELD_W } from './Playfield';
import {
  selectBomb,
  tickBomb,
  type BombBackdrop,
  type BombState,
  type BombTarget,
  type BombZone,
} from './BombSystem';
import type { EnemySlot, GaugeSlice, SlotFx, SpellResult } from './EnemySlot';
import type { AnmPack } from '../../engine/anm/AnmPack';

/**
 * Reach of the post-respawn bullet-cancel volume. `FUN_0044d2c0:1454` inserts a
 * 768x896 box centred on the ship, which covers the whole 384x448 field from any
 * position, so the sim models it as one generous radius instead of a rectangle.
 */
const FULL_FIELD_CANCEL = 896;

export interface StageRunnerConfig {
  gs: GameState;
  ecl: EclFile;
  subFactory: SubFactory;
  timelineIndex?: number;
  pointItemValueLine?: number;
  /** Half of the item box, `plyNNa.sht + 0x18 / 2`. */
  itemPickupHalfExtent?: number;
  /** Half of the hit box, `plyNNa.sht + 0x0C / 2`. */
  hitboxHalfExtent?: number;
  /** Half of the graze box, `plyNNa.sht + 0x10 / 2`. */
  grazeHalfExtent?: number;
  /** Unfocused axis speed, `plyNNa.sht + 0x24`. */
  fastSpeed?: number;
  /** Per-axis diagonal speed while unfocused, `plyNNa.sht + 0x2C`. */
  fastDiagonalSpeed?: number;
  /** Focused axis speed, read from the partner's `plyNNas.sht + 0x28`. */
  slowSpeed?: number;
  /** Per-axis diagonal speed while focused, `plyNNas.sht + 0x30`. */
  slowDiagonalSpeed?: number;
  /** `plyNNa.sht + 0x14`: how fast grabbed items home in. */
  itemGrabSpeed?: number;
  /** `plyNNa.sht + 0x34`: clock on freely falling items, unfocused. */
  itemTimeScale?: number;
  /** `plyNNas.sht + 0x34`: the same clock while the partner is flown. */
  itemTimeScaleFocused?: number;
  /**
   * `enemy.anm` bytecode, so the scripts the ECL selects actually run. Without
   * it enemies still move (that is the ECL) but keep the approximated sprite
   * cycle instead of the retail spin, scale and fade.
   */
  anmPack?: AnmPack;
  /**
   * The stage's own `stgNNenm.anm`, which ops 58-61 address against, and the
   * manifest name the renderer uses to find its atlas page.
   */
  anmPackAlt?: AnmPack;
  /**
   * The host's retail effect pool, built where the ANM tables are known. Slots spawn into
   * it through ECL 128/139/140/174; the runner only ticks and drains it.
   */
  effectPool?: EffectPool | null;
  anmStageName?: string;
  /**
   * Collision radius in pixels for an ECL bullet type. The host owns that table
   * because it is derived from the `etama.anm` sprite heights; without it every
   * type collides at the same middle-of-the-range circle.
   */
  bulletRadiusFor?: (type: number) => number;
  /** Drawn half-size per bullet, which sets the off-field cull margin. */
  bulletSizeFor?: (type: number, color: number) => number;
}

/** Everything the HUD needs to draw the life bar an ECL script declared. */
export interface EclBossGauge {
  /** Current HP of the bar on screen. */
  hp: number;
  maxHp: number;
  /** Extra bars still held in reserve (op 148). */
  pips: number;
  /** Coloured segments from op 158, indexed by slice. */
  slices: GaugeSlice[];
  /** Frames left on the spell-card countdown; 0 = untimed. */
  timerFrames: number;
  x: number;
  y: number;
}

/**
 * One `FUN_00451670` pass: walk the shots for one enemy's box, sum what overlaps,
 * and retire each hit the way retail sets `bullet->state = 2`.
 *
 * The box is axis-aligned and centred, exactly like `PlayerBuildAabb` builds it
 * (`Player.cpp:3501-3507`): the enemy's own half size plus the shot's, which for a
 * `.sht` shot comes from `entry+0x0C`/`entry+0x10` and is why 霊夢's shots reach a
 * fairy four times wider than they are tall.
 */
function sumShotHits(
  shots: ReadonlyArray<ShotView>,
  enemy: EnemySlot,
  ctx: ShotDamageContext,
  halfWidth: number,
  halfHeight: number,
): { raw: number; x: number; y: number; bombHit: boolean } {
  let raw = 0;
  let x = enemy.posX;
  let y = enemy.posY;
  for (const shot of shots) {
    if (!shot.active) continue;
    if (ctx.stats) ctx.stats.checks++;
    const reachX = halfWidth + (shot.halfWidth ?? shot.radius ?? 0);
    const reachY = halfHeight + (shot.halfHeight ?? shot.radius ?? 0);
    // `:3392` rejects with `>`, so two boxes that only touch do overlap; the earlier
    // `<` here cost a shot its hit on exactly-aligned frames.
    if (Math.abs(shot.x - enemy.posX) > reachX) continue;
    if (Math.abs(shot.y - enemy.posY) > reachY) continue;
    raw += shotContribution(shot.damage, ctx.frameStop);
    x = shot.x;
    y = shot.y;
    shot.active = false;
  }
  if (raw > 0) raw = applyYoukaiDamageBonus(raw, ctx.extremelyYoukai);
  // `Player.cpp:3490` only raises the flag from a region hit while the clock is
  // stopped, and regions are the bomb's own damage volumes, not these shots.
  return { raw, x, y, bombHit: false };
}

/** Adapt the sim's own player-tagged pool entries to the shot view. */
function simShotViews(bullets: Bullet[]): ShotView[] {
  const views: ShotView[] = [];
  for (const b of bullets) {
    if (!b.active || b.tag !== 'player') continue;
    views.push({
      get x() {
        return b.x;
      },
      get y() {
        return b.y;
      },
      damage: b.damage,
      get active() {
        return b.active;
      },
      set active(value: boolean) {
        b.active = value;
      },
    });
  }
  return views;
}

/**
 * `Player.cpp:707` hands `FUN_00425870` the id `22`, and `g_EffectTemplates[22]` (read out
 * of the shipped `th08.exe`, and mirrored by `effect-templates.ref.json`) is script 54 of
 * `etama.anm`: cell 218, alpha 0 → 255 over 20 frames, spinning at a random angular
 * velocity, parked on `STOP` until the release edge sends interrupt 1 and fades it out
 * over 30. This is the retail 判定点光环, and it is the only art focus mode draws.
 */
export const HITBOX_GLOW_TEMPLATE = 22;

/**
 * The third argument of that same call: record 2 of the retail pool's named bank. The
 * glow is not allocated from the rotating 512, it owns a record of its own
 * (`EffectManager.cpp:269-280`), which is what lets a second Shift press overwrite a ring
 * that is still fading out instead of drawing two.
 */
export const HITBOX_GLOW_SLOT = 2;

/**
 * `Player.cpp:696-703` and `:760-767`: the two rings that mark a pair changing weapon.
 *
 * Taking focus spawns template 29 - `etama.anm` script 58, cell 193 with z-write off and
 * additive blend, alpha 0 → 255 while the scale runs 5 → 0.4 - which reads as a ring
 * collapsing onto the ship. Letting go spawns template 28 (script 57: the same cell, alpha
 * → 0 while the scale runs 0.5 → 5), which reads as it bursting back out. Both sit inside
 * the `shotType < 4` guard, so a solo - which never changes weapon - never gets one, and
 * both are gated on `Player+8 >= 4`, the frames since the last edge, so flicking the key
 * cannot spam them.
 */
export const STYLE_SWITCH_ON_TEMPLATE = 29;
export const STYLE_SWITCH_OFF_TEMPLATE = 28;

/** Retail's spawn colours, `0x80FF8080` on the press and `0x808080FF` on the release. */
export const STYLE_SWITCH_ON_COLOR = 0x80ff8080 | 0;
export const STYLE_SWITCH_OFF_COLOR = 0x808080ff | 0;

/** `Player+8 >= 4` at `:701` and `:765` - frames the other state had to last first. */
export const STYLE_SWITCH_EDGE_GATE = 4;

export class StageRunner {
  readonly gs: GameState;
  readonly enemies: EnemyManager;
  readonly bullets: BulletPool;
  /** ECL 114/115 beams, kept beside the bullets the way retail keeps them. */
  readonly lasers: LaserPool;
  readonly player: PlayerSim;
  readonly items: ItemPool;
  readonly timeline: TimelineRunner;
  /** Retail's `EffectManager`, one per stage the way retail registers one per stage. */
  readonly effectPool: EffectPool | null;
  /**
   * Pair tests the last frame really ran, for the debug overlay. Every pass --
   * ship vs bullets, ship vs beams, shots vs enemies -- adds to it, and it resets
   * with the frame, so the number is a per-frame cost and not a running total.
   */
  readonly collisionStats: CollisionStats = { checks: 0 };
  /**
   * `Player.optionStates[4]`: the 式神, blades and familiars the partner flies.
   *
   * They are the origins half of the weapon lives at (`entry+0x20` picks which of
   * the four slots a shot starts from), so the firing layer below cannot exist
   * without them, and 紫's homing 式神 - the effect the Shift key is famous for -
   * is exactly one armed slot plus the ten `.sht` entries that read it.
   */
  readonly options: OptionSystem;
  /** `Player.shots[128]`, fired from the retail `.sht` chains. */
  readonly shots: PlayerShotPool;
  /** The two `.sht` files `g_GameManager.shotType` loads, per `g_Player1ShtFiles`. */
  readonly weapon: PlayerWeaponTables;
  /** The `playerNN.anm` pack whose scripts the shot VMs run. */
  readonly anm: PlayerAnmRuntime | null;
  /** `Player.tailPosition0`, the point 霊夢's charms bend toward (`FUN_00450320`). */
  tailPosition = { ...UNTRACKED_AIM };
  /** Shot sounds the firing layer asked for this frame, in `entry+0x28` order. */
  lastShotSounds: Array<{ index: number; x: number }> = [];

  private pointItemValueLine: number;
  private itemPickupHalfExtent: number;

  /** Collected items this frame (for rendering / HUD). */
  lastCollected: CollectResult[] = [];
  /** Graze count this frame. */
  lastGraze = 0;
  /**
   * The enemy bullets whose box overlapped the ship this frame, and the same for
   * lasers. Published before the landed shots are retired, so a host can measure
   * how deep the overlap was. The retail collision size is not readable from the
   * recompile (it lives in an unnamed blob), so this is the seam the calibration
   * against ZUN's own recordings reads.
   */
  lastHits: Bullet[] = [];
  lastLaserHits: Laser[] = [];
  activeBomb: BombState | null = null;
  /** Zones the running card wants drawn this frame. */
  lastBombZones: BombZone[] = [];
  /** The card's expanding bullet-cancel ring, or null while none is live. */
  bombCancel: { x: number; y: number; radius: number; alpha: number } | null = null;
  /**
   * `g_EclScriptedGlobalUpdateFreeze` (`EclGlobals.cpp:116`), retail's own
   * cutscene channel: the ECL `ex 26` raises it, and while it stands the bullets
   * stop integrating (`BulletManager.cpp:853-854`) and enemy scripts lose their
   * clock (`EnemyManagerUpdate.cpp:980-981`). The field hangs in the air.
   *
   * The host raises it for a conversation. Retail never needs to say so — its
   * stage-opening talk scenes are scripted onto an empty field, and the same call
   * already takes the shot and bomb keys out of the player's hands
   * (`Gui::IsDialogPresent`, `Player.cpp:921`, `:1204`) — but a port whose script
   * pacing differs needs the pause to be real, or a line of dialogue becomes a
   * death sentence.
   */
  worldFreeze = false;
  /**
   * What the running card paints over the backdrop this frame: the plate behind the
   * sprites, and any full-screen square in front of them. `null` on both once the
   * card comes down, which is when retail's draw callback stops running.
   */
  bombBackdrop: BombBackdrop = { plate: null, flash: null };
  /** Set on the frame a card's zones actually connected. */
  bombConnected = false;
  /**
   * Set for the one frame the ship reaches max power, with the number of P items
   * that turned into point items on the way (`ItemManager.cpp:662-676`). The host
   * spends it on the "Full Power Mode!" banner and one sparkle each.
   */
  fullPowerTriggered = false;
  fullPowerSparkles = 0;
  /** Host hooks for the bullet transform machine. */
  private bulletRadiusFor: ((type: number) => number) | null = null;
  private bulletSizeFor: ((type: number, color: number) => number) | null = null;
  private bulletWorldCache: BulletWorld | null = null;
  /** Enemy slots destroyed during the current frame. */
  lastDeaths: EnemySlot[] = [];

  /**
   * What the transform handlers read: the ship, for the records that re-aim or
   * split, the rng for the random aim modes, and the manager's own
   * sound queue, so a record that arms mid-flight is audible like it is in the game.
   */
  bulletWorld(): BulletWorld {
    if (this.bulletWorldCache) return this.bulletWorldCache;
    const self = this;
    this.bulletWorldCache = {
      get playerX() {
        return self.player.x;
      },
      get playerY() {
        return self.player.y;
      },
      rng: { randomF32InRange: (range: number) => self.gs.rng.randomF32InRange(range) },
      radiusFor: (type: number) => (self.bulletRadiusFor ? self.bulletRadiusFor(type) : 4),
      sizeFor: (type: number, color: number) => (self.bulletSizeFor ? self.bulletSizeFor(type, color) : 8),
      onSound: (id: number, x: number) => {
        self.enemies.frameSfx.push({ id, x });
      },
      get timeScale() {
        return self.gs.timeScale;
      },
    };
    return this.bulletWorldCache;
  }
  /** Spell cards that ended during the current frame, for the host's HUD. */
  lastSpellResults: SpellResult[] = [];
  /**
   * `CreateTimePopup` requests raised during the frame, which the host floats as digit
   * strips. The card-capture chain payoff is the only author.
   */
  lastPopups: TimePopup[] = [];

  /**
   * QA-only: swallow the hit that would take a life.
   *
   * An automation context cannot dodge, so every deep link into a boss fight ends
   * in a game over before the thing worth screenshotting appears. This keeps the
   * collision, graze and bullet-erase passes running and only declines the life
   * loss. Never set outside `?nofail`.
   */
  public debugNoFail = false;

  /**
   * Apply the ship's live shots for one frame, following the retail order exactly.
   *
   * `Player::FUN_00451670` is written *enemy-first*: for each enemy it walks all 128
   * shot slots, sums every overlapping shot, and only then does the caller cap the
   * frame, pay the damage score, and divide by seven if a spell card is live. The
   * previous shape here -- one shot looking for one enemy, each hit capped on its
   * own -- could not express either half of that, so a volley that landed together
   * scored seven separate hits and a card took plain-damage.
   */
  damageEnemiesAt(shots: ReadonlyArray<ShotView>): void {
    const frameStop = this.gs.bombRunning;
    const ctx: ShotDamageContext = {
      frameStop,
      extremelyYoukai: this.player.gauge.isExtremelyYoukai(),
      // `g_Spellcard.IsActive()` is the live-card flag, which the banner ops 122/123
      // own -- a boss with a life bar but no card up takes full damage, which is the
      // whole reason 永夜抄 distinguishes 符卡 from 非符.
      spellActive: this.gs.spellName !== null,
      shotType: this.gs.shotType,
      stats: this.collisionStats,
    };
    const extremelyHuman = this.player.gauge.isExtremelyHuman();
    const threshold = damageOrbThreshold(this.gs.shotType);

    for (const enemy of this.enemies.getActive()) {
      if (!enemy.active || enemy.invulnerable || !enemy.damageEnabled) continue;
      // `EnemyManagerUpdate.cpp:614-617`: the combat pass is skipped outright for a
      // slot that opted out of damage while the clock is stopped.
      if (frameStop && enemy.noDamageDuringStop) continue;

      const primary = sumShotHits(shots, enemy, ctx, enemy.hitboxHalfWidth, enemy.hitboxHalfHeight);
      let raw = primary.raw;
      // `:654-666`: the op-78 box gets its own pass over whatever is still alive,
      // damped back into the total. A stopped clock contributes nothing here.
      if (raw > 0 && enemy.hasSecondaryHitbox && !primary.bombHit) {
        const extra = sumShotHits(
          shots,
          enemy,
          ctx,
          enemy.secondaryHitboxHalfWidth,
          enemy.secondaryHitboxHalfHeight,
        );
        if (extra.raw > 0) raw = addSecondaryHitbox(raw, extra.raw, ctx.shotType);
      }
      if (raw <= 0) continue;

      const acc = advanceHitAccumulator(enemy.hitAccumulator, raw, threshold, extremelyHuman);
      enemy.hitAccumulator = acc.accumulator;
      if (acc.timeOrbs > 0) {
        // `Player.cpp:3411`: three 时符 drop where the shot that crossed the
        // threshold was, and only on the extreme human side of the meter.
        for (let orb = 0; orb < acc.timeOrbs; orb++) {
          this.items.spawn('timeOrb', primary.x, primary.y);
        }
      }

      const resolved = resolveShotDamage(
        raw,
        {
          boss: enemy.isBoss,
          damageable: enemy.damageEnabled,
          freezeFrames: enemy.freezeFrames,
        },
        ctx,
        primary.bombHit,
      );
      // `EnemyManagerUpdate.cpp:686` hands the capped pre-card figure to `AddScore`,
      // which is where the ten comes off.
      if (resolved.score > 0) this.player.addScore(resolved.score);
      if (resolved.damage <= 0) continue;
      enemy.lastFrameDamage = resolved.damage;
      enemy.applyDamage(resolved.damage);
    }
    this.settleDeaths();
  }

  /**
   * Turn the slots the damage passes just killed into drops exactly once, and
   * remember them so the host can play the death burst / score popup.
   */
  private settleDeaths(): void {
    for (const slot of this.enemies.collectDeaths()) {
      // `EnemyManagerUpdate.cpp:793-800`: the death pass pays the familiar chain
      // first, so a summoner that dies with familiars still on screen bursts them
      // into time orbs before anything else falls out of it.
      this.enemies.familiarChainPayoff(slot, 1);
      // Then the drop table proper (`Enemy::FUN_0042bea0`), which is what decides
      // that most fairies give exactly one item rather than a pair.
      this.enemies.dropOnDeath(slot);
      this.lastDeaths.push(slot);
      // `EnemyManagerUpdate.cpp:837/845`: both ordinary death modes pay the
      // enemy's own score field, which is 100 unless a spawn overrode it.
      if (slot.scoreValue > 0) this.player.addScore(slot.scoreValue);
      // `EnemyManager.cpp:363-369`: a boss death drags the meter toward neutral.
      if (slot.bossLives > 0) this.player.onEnemyKilled();
    }
  }

  /**
   * Pay out the cards the two drivers just ended. Only a captured card pays:
   * `Spellcard::EndSpell` hands over the bonus that is still standing
   * (`bonusProgress`) and turns the time left on the plate into time orbs,
   * where a full-speed capture is worth 1000 and a last-second one 100
   * (`Spellcard.cpp:1073-1093`). A card that ran its clock out pays nothing and
   * has already lost its bullets in the driver itself.
   */
  private bankSpellResults(): void {
    for (const card of this.enemies.frameSpellResults) {
      this.lastSpellResults.push(card);
      if (!card.captured) continue;
      if (card.bonus > 0) this.player.addScore(card.bonus);
      const span = card.timerFrames - Math.trunc(card.timerFrames / 7);
      let orbs = 100;
      if (card.noTimeoutPenalty) orbs = 700;
      else if (span <= 0 || card.remainingFrames >= span) orbs = 1000;
      else if (card.remainingFrames >= 180) {
        orbs = Math.trunc((900 * (card.remainingFrames - 180)) / (span - 180)) + 100;
      }
      addTimeOrbs(this.gs, orbs);
    }
  }

  /** Visual requests the scripts made during the current frame. */
  get frameFx(): readonly SlotFx[] {
    return this.enemies.frameFx;
  }

  /** Sound requests from the frame just ticked, with the x that pans each one. */
  get frameSfx(): readonly SeTick[] {
    return this.enemies.frameSfx;
  }

  /** Boss life bar declared by the running script, or null while none is live. */
  get bossGauge(): EclBossGauge | null {
    const owner = this.enemies.gaugeOwner();
    if (!owner || !this.gs.isBossPresent) return null;
    return {
      // A hit that lands after the bar is already spent still subtracts, so the
      // stored value can dip below zero for the frame before the script hands
      // over. The plate never shows that.
      hp: Math.max(0, owner.hp),
      maxHp: owner.maxHp,
      pips: owner.gaugePips,
      slices: owner.gaugeSlices,
      timerFrames: owner.gaugeTimerFrames,
      x: owner.posX,
      y: owner.posY,
    };
  }

  constructor(config: StageRunnerConfig) {
    this.gs = config.gs;
    this.enemies = new EnemyManager(config.gs, config.subFactory);
    this.bullets = new BulletPool();
    this.lasers = new LaserPool();
    this.player = new PlayerSim(config.gs);
    this.items = new ItemPool(config.gs);
    const shotType = Math.max(0, Math.min(11, config.gs.shotType | 0));
    this.weapon = weaponTablesFor(shotType);
    this.anm = playerAnmRuntime(PLAYER_ANM_TEAM_BY_SHOT_TYPE[shotType]);
    this.shots = new PlayerShotPool(config.gs.rng);
    // `Player.cpp:1705-1727`: a solo's options are installed once here and never
    // leave; a pair's wait for the focus edge in `setFocus`.
    this.options = new OptionSystem(config.gs.rng);
    this.options.initShotType(shotType);
    this.timeline = new TimelineRunner(
      config.ecl.timelines[config.timelineIndex ?? 0],
      config.gs,
      this.enemies,
    );
    this.enemies.bulletPool = this.bullets;
    this.enemies.laserPool = this.lasers;
    this.enemies.itemPool = this.items;
    this.enemies.playerRef = this.player;
    this.enemies.anmPack = config.anmPack ?? null;
    this.enemies.anmPackAlt = config.anmPackAlt ?? null;
    // The pool is the host's, because only the host knows which ANM tables it lifted; the
    // runner owns when it moves.
    this.effectPool = config.effectPool ?? null;
    this.enemies.effectPool = this.effectPool;
    this.enemies.anmStageName = config.anmStageName ?? '';
    this.enemies.bulletRadiusFor = config.bulletRadiusFor ?? null;
    this.enemies.bulletSizeFor = config.bulletSizeFor ?? null;
    this.bulletSizeFor = config.bulletSizeFor ?? null;
    this.bulletRadiusFor = config.bulletRadiusFor ?? null;
    // The chain payoff reaches for two things the manager does not own: the floating
    // time numbers, and the 妖率 meter the player sim drives.
    this.enemies.chainSink = {
      timePopup: (popup) => this.lastPopups.push(popup),
      addToYoukaiGauge: (amount) => this.player.gauge.add(amount),
      youkaiGaugeValue: () => this.player.gauge.value,
      spellCardActive: () => this.gs.spellName !== null,
    };
    this.pointItemValueLine = config.pointItemValueLine ?? 128;
    this.itemPickupHalfExtent = config.itemPickupHalfExtent ?? this.player.itemPickupHalfExtent;
    this.player.itemPickupHalfExtent = this.itemPickupHalfExtent;
    this.player.hitboxHalfExtent = config.hitboxHalfExtent ?? this.player.hitboxHalfExtent;
    this.player.grazeHalfExtent = config.grazeHalfExtent ?? this.player.grazeHalfExtent;
    this.player.fastSpeed = config.fastSpeed ?? this.player.fastSpeed;
    this.player.slowSpeed = config.slowSpeed ?? this.player.slowSpeed;
    // The diagonal figures travel with the axis ones: retail reads all four out of
    // the same .sht, and a run that only ever presses one key at a time would hide
    // a wrong diagonal until the first cornered dodge.
    this.player.fastDiagonalSpeed = config.fastDiagonalSpeed ?? this.player.fastDiagonalSpeed;
    this.player.slowDiagonalSpeed = config.slowDiagonalSpeed ?? this.player.slowDiagonalSpeed;
    this.player.itemGrabSpeed = config.itemGrabSpeed ?? this.player.itemGrabSpeed;
    // The item clock is the last pair in the same block, and it swaps with the
    // focus flag just like the move speeds do.
    this.player.itemTimeScale = config.itemTimeScale ?? this.player.itemTimeScale;
    this.player.itemTimeScaleFocused = config.itemTimeScaleFocused ?? this.player.itemTimeScaleFocused;
  }

  /** Live enemy slots, as the damage sinks a card can lock onto. */
  private bombTargets(): BombTarget[] {
    return this.enemies.slots.filter((slot) => slot.active);
  }

  /** The cached `PlayerShotWorld`: every field is a getter onto live sim state. */
  private shipWorldValue: PlayerShotWorld | null = null;
  /** The cached `OptionWorld`, same shape. */
  private optionWorldValue: OptionWorld | null = null;
  /** Reused views so the aim/homing passes allocate nothing on a firing frame. */
  private aimViews: Array<{ x: number; y: number; boss: boolean }> = [];
  private candidateViews: OptionCandidate[] = [];
  private optionPositionsView: Array<{ x: number; y: number } | null> = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];
  /** `g_GuiMessageInputCurrent & 1`, kept for the option chase test. */
  private shootHeld = false;
  /** `g_Player.bombState.frameStop`, the strict stopped-clock flag. */
  private frameStopClock = false;

  /**
   * The ship's own weapon for one frame: aim tracking, the partner's options, the
   * `.sht` firing walk, and the integrator that moves the result.
   *
   * The order is retail's own calc chain, read off the four functions rather than
   * guessed: `Player::Update` resolves the focus byte and arms or releases the
   * options (`Player.cpp:665-781`), the option pass walks them, `FUN_00451500`
   * decides whether this frame is a firing frame and hands the chain to
   * `FUN_00450f60`, and `FUN_00451150` then moves what is live. Damage is a later
   * pass, and the two passes disagree by design: retail asks the enemies, not the
   * shots, whether anything was hit.
   */
  private tickShipWeapon(): void {
    const shotType = this.gs.shotType;
    // `EnemyManagerUpdate.cpp:724-746` refills `tailPosition0` from the enemies that
    // were just walked, and `:747-758` picks `optionHomingTarget` in the same pass.
    const active = this.enemies.getActive();
    const aim = this.aimViews;
    const candidates = this.candidateViews;
    for (let i = 0; i < active.length; i++) {
      const slot = active[i];
      let view = aim[i];
      if (!view) view = aim[i] = { x: 0, y: 0, boss: false };
      view.x = slot.posX;
      view.y = slot.posY;
      view.boss = slot.isBoss;
      let candidate = candidates[i];
      if (!candidate) candidate = candidates[i] = { x: 0, y: 0, hasAttached: false, skipsCombat: false };
      candidate.x = slot.posX;
      candidate.y = slot.posY;
      // The pass that chooses the target is nested inside the combat gate
      // (`EnemyManagerUpdate.cpp:614-617`, `:641`), so an enemy the damage pass refuses
      // to walk is not walkable here either. Same conditions, same frame, as the damage
      // loop in `damageEnemiesAt`.
      candidate.skipsCombat =
        slot.noSprite ||
        slot.invulnerable ||
        !slot.damageEnabled ||
        (this.gs.bombRunning && slot.noDamageDuringStop);
      // `HasAttachedEnemy()` is the launcher pointer at `enemy+0x2DA4`, not a child
      // count: the pass excludes the familiars that ops 90..92 launched and keeps the
      // bodies that launched them. Reading it the other way round sent every 式神
      // after a limb instead of the body, which is how it ended up parked at the top
      // edge of the screen chasing something that had already left the field.
      candidate.hasAttached = slot.linkedChild;
      candidate.id = slot.slotIndex;
    }
    aim.length = active.length;
    candidates.length = active.length;
    // `Player::Update` wipes the aim point at `:1100` — `FUN_0044d420` (`:1493-1497`)
    // writes `-999` into both vectors and clears the valid bit — and that reset runs
    // *after* the firing chain at `:1099`. So the point the charms steer to is rebuilt
    // from this frame's enemies every frame, and a lock never survives the enemy that
    // earned it. Carrying it forward instead — which is what this line used to do — leaves
    // 霊夢's charms bending toward wherever the last boss stood for the rest of the stage,
    // and it is why the tracking reads as broken once a phase ends.
    this.tailPosition = trackedAimPoint(UNTRACKED_AIM, this.player.x, aim);

    // `Player.cpp:1101-1116`, twelve lines further down the same common path and behind
    // the same dialogue gate as the 妖率計: with the meter pinned at either extreme the
    // game pays `AddScore(100)` every frame, which after the funnel is ten points a
    // frame and 600 a second for as long as it stays pinned. Both extremes pay the same
    // amount and count into different pairs of frame counters, and those four counters
    // (`0x3DE18`..`0x3DE24`) are result-screen statistics rather than mechanics, so they
    // are not modelled; the score drip, which is what a player can actually feel, is.
    if (!this.worldFreeze) {
      const gauge = this.player.gauge;
      if (gauge.isExtremelyHuman() || gauge.isExtremelyYoukai()) this.player.addScore(100);
    }

    // The options first: a shot's origin is whichever slot the partner is riding.
    const optionWorld = this.optionWorld();
    this.options.setFocus(this.player.isSlow, shotType);
    this.options.tick(optionWorld);
    this.tickFocusEdgeEffects(this.player.isSlow);

    const world = this.shipWorld();
    // `Player::Update` runs these two at `:1098`/`:1099` in the order below: move
    // what is already flying, then ask the firing chain for more. A shot therefore
    // spends one frame at the muzzle before it travels.
    this.shots.update(world);
    this.shots.fire(world);
  }

  /** `Player+0xBE834`: the one live 判定点光环 the ship holds a pointer to. */
  private hitboxGlow: EffectHandle | null = null;
  /** The latch the focus edges are taken from - retail reads `Player+3`, we read focus. */
  private glowFocused = false;
  /** `Player+8`: frames since the last focus edge, counting in whichever state we are in. */
  private focusEdgeFrames = 0;

  /**
   * The whole of retail's focus-edge block: `Player.cpp:696-708` on the press and
   * `:760-772` on the release.
   *
   * The press spawns template 22 once - retail only spawns when its own pointer is NULL,
   * and the spawn goes to a named record rather than to the rotating pool, so a second
   * press takes the record back from a glow that is still fading. The release does not
   * delete the effect: it sends interrupt 1, which is the branch of script 54 that fades
   * alpha to 0 over 30 frames and then `DELETE`s. That is why letting go of Shift fades
   * the ring instead of cutting it, and why the pointer is cleared on the same frame - the
   * ship is free to light a new one.
   *
   * The two style-switch rings are the other half of the same block, and they are the
   * whole of what a pair *looks* like when it changes weapon: the press collapses one in
   * (`:701-702`, and only once the ship has been unfocused for four frames), the release
   * throws it back out (`:765-766`). The glow has no such gate and no such shot-type guard,
   * which is why a solo still gets a 判定点光环 when it slows down but never a ring.
   */
  private tickFocusEdgeEffects(focus: boolean): void {
    const rising = focus && !this.glowFocused;
    const falling = !focus && this.glowFocused;
    const edged = rising || falling;
    const gated = this.gs.shotType < 4 && this.focusEdgeFrames >= STYLE_SWITCH_EDGE_GATE;
    if (edged && gated) {
      const ring = rising ? STYLE_SWITCH_ON_TEMPLATE : STYLE_SWITCH_OFF_TEMPLATE;
      const color = rising ? STYLE_SWITCH_ON_COLOR : STYLE_SWITCH_OFF_COLOR;
      this.effectPool?.spawn(ring, this.player.x, this.player.y, { count: 1, color });
    }
    if (rising) {
      this.hitboxGlow =
        this.effectPool?.spawn(HITBOX_GLOW_TEMPLATE, this.player.x, this.player.y, {
          count: 1,
          color: -1,
          slotIndex: HITBOX_GLOW_SLOT,
          ownerPos: () => ({ x: this.player.x, y: this.player.y }),
        }) ?? null;
      this.focusEdgeFrames = 0;
    } else if (falling) {
      // `:768-769`: the release only interrupts a glow the ship still holds a pointer to.
      this.hitboxGlow?.interrupt(1);
      this.hitboxGlow = null;
      this.focusEdgeFrames = 0;
    } else {
      // `:714` / `:776`: the counter only runs on frames that are not an edge.
      this.focusEdgeFrames++;
    }
    this.glowFocused = focus;
  }

  /** The four option positions, nulled out for slots retail leaves inactive. */
  private optionPositions(): ReadonlyArray<{ x: number; y: number } | null> {
    for (let i = 0; i < OPTION_SLOTS; i++) {
      const o = this.options.options[i];
      const slot = this.optionPositionsView[i];
      if (o.state === 0) {
        this.optionPositionsView[i] = null;
        continue;
      }
      if (!slot) {
        this.optionPositionsView[i] = { x: o.x, y: o.y };
      } else {
        slot.x = o.x;
        slot.y = o.y;
      }
    }
    return this.optionPositionsView;
  }

  private optionWorld(): OptionWorld {
    const self = this;
    if (!this.optionWorldValue) {
      this.optionWorldValue = {
        get playerX() {
          return self.player.x;
        },
        get playerY() {
          return self.player.y;
        },
        get shotWindowOpen() {
          return self.player.shotWindowOpen;
        },
        get fireHeld() {
          return self.shootHeld;
        },
        get frameStop() {
          return self.frameStopClock;
        },
        // `Player+3`. The same byte the firing chain reads as `focusByte`, read here by
        // the routes that change colour with it.
        get modeFlag() {
          return self.player.isSlow ? 1 : 0;
        },
        get movementDirection() {
          return self.player.movementDirection;
        },
        get moving() {
          return self.player.moving;
        },
        homingCandidates: () => self.candidateViews,
        onTrail: (x: number, y: number, color: number) => {
          self.effectPool?.spawn(TRAIL_SPARK, x, y, { count: 1, color });
        },
        get anmPack() {
          return self.anm ? self.anm.pack : null;
        },
        get timeScale() {
          return self.gs.timeScale;
        },
      };
    }
    return this.optionWorldValue;
  }

  private shipWorld(): PlayerShotWorld {
    const self = this;
    if (!this.shipWorldValue) {
      this.shipWorldValue = {
        get primary() {
          return self.weapon.primary;
        },
        get secondary() {
          return self.weapon.secondary;
        },
        // `Player+3`: the focus byte, not the settled 妖怪 flag. The table swap it
        // performs is the whole of what Shift does to a pair's weapon.
        get focusByte() {
          return self.player.isSlow ? 1 : 0;
        },
        get power() {
          return self.player.power;
        },
        get shotType() {
          return self.gs.shotType;
        },
        get cardRunning() {
          return self.gs.bombRunning;
        },
        get cardPhase() {
          return self.gs.bombStatePhase;
        },
        get cardFrames() {
          return self.gs.spellFrames;
        },
        get shotWindow() {
          return self.player.shotWindowTimer;
        },
        // The pool re-derives this by comparing the window against last frame's
        // value, which is what `ZunTimer::FUN_0040d3d0` reports.
        shotWindowAdvanced: true,
        get shootHeld() {
          return self.shootHeld;
        },
        get dialogPresent() {
          return self.worldFreeze;
        },
        get frameStop() {
          return self.frameStopClock;
        },
        get extremelyYoukai() {
          return self.player.gauge.isExtremelyYoukai();
        },
        get aimX() {
          return self.player.x;
        },
        get aimY() {
          return self.player.y;
        },
        optionPositions: () => self.optionPositions(),
        get homingTarget() {
          const target = self.options.homingTarget;
          return target ? { x: target.x, y: target.y } : null;
        },
        get tailX() {
          return self.tailPosition.x;
        },
        get tailY() {
          return self.tailPosition.y;
        },
        get bladeAngle() {
          return self.options.options[2].facingAngle;
        },
        bounds: { left: 0, right: PLAYFIELD_W, top: 0, bottom: PLAYFIELD_H },
        get timeScale() {
          return self.gs.timeScale;
        },
        get anmPack() {
          return self.anm ? self.anm.pack : null;
        },
        spriteSize: (sprite: number) => (self.anm ? self.anm.spriteSize(sprite) : null),
        onSound: (index: number, x: number) => {
          self.lastShotSounds.push({ index, x });
        },
        get rng() {
          return self.gs.rng;
        },
      };
    }
    return this.shipWorldValue;
  }

  /**
   * The live shots as the damage pass wants them, one view per slot that can still
   * land a hit (`FUN_00451670:3388`) with the shot's own `.sht` box.
   */
  shotViews(): ShotView[] {
    const self = this;
    const views: ShotView[] = [];
    for (const shot of this.shots.shots) {
      if (shot.state === SHOT_FREE) continue;
      const type = shot.type;
      views.push({
        get x() {
          return shot.x;
        },
        get y() {
          return shot.y;
        },
        damage: shot.damage,
        get active() {
          // `:3388`: a spent slot only still scores for the one type that pierces.
          if (shot.state !== SHOT_LIVE) return type === 3 && shot.state === SHOT_SPENT;
          // `:3396`: the blade and beam types test every other frame of their clock.
          if ((type === 4 || type === 5) && shot.timer % 2 !== 0) return false;
          return true;
        },
        set active(value: boolean) {
          if (value) return;
          if (self.shots.markHit(shot, self.shipWorld())) {
            self.effectPool?.spawn(5, shot.x, shot.y, { count: 1, color: -1 });
          }
        },
        get halfWidth() {
          return shot.hitboxWidth / 2;
        },
        get halfHeight() {
          return shot.hitboxHeight / 2;
        },
      });
    }
    return views;
  }

  /** Run one game frame. */
  tick(input: PlayerInput): void {
    // A frozen field is a cutscene: the shot clock never starts (`Player.cpp:921`),
    // a bomb press is not accepted (`:1204`), and the 妖率計 holds its breath
    // (`:924`). All three retail gates on the conversation itself, so they ride on
    // the same flag here.
    const freeze = this.worldFreeze;
    if (freeze) input = { ...input, shoot: false, bomb: false };
    // `g_GuiMessageInputCurrent & 1`: the option chase reads the button itself, not
    // the conversation-masked version the shot clock is gated on (`:3332`).
    this.shootHeld = input.shoot;

    this.gs.frame++;
    this.lastCollected = [];
    // `SpawnItem:122` and `:133` read the ship's state out of the global player, so
    // the pool gets the same fact pushed into it once a frame, before anything can
    // ask it for an item.
    this.items.shipDying = this.player.state === 'dying';
    this.lastGraze = 0;
    this.lastDeaths = [];
    this.lastSpellResults.length = 0;
    this.lastPopups.length = 0;
    this.bombConnected = false;
    this.fullPowerTriggered = false;
    this.fullPowerSparkles = 0;
    this.collisionStats.checks = 0;
    this.lastShotSounds.length = 0;

    // `Player+0xFDC` as retail defines it: raised by `acceptBomb` (`Player.cpp:1277`)
    // and dropped when the card's own clock runs out (`:1165-1168`), so it is true for
    // the whole of any card. Both `damageEnemiesAt` and the enemy scripts read this
    // byte, and the player sim reads it through `gs` for the stance, the meter and the
    // graze tally. It is published at the top of the frame, which is where retail has
    // it too: `Player::Update` tests the flag before the code that plays a card.
    this.gs.bombRunning = this.activeBomb !== null;
    this.gs.bombForcedFocus = this.activeBomb ? (this.activeBomb.spec.phase & 1) === 1 : false;
    // The whole variant word, because two firing-layer rules compare it instead of
    // masking a bit out of it (`FUN_00451d50`, `FUN_00450f60:3103-3112`).
    this.gs.bombStatePhase = this.activeBomb?.spec.phase ?? 0;
    const frameStop = this.gs.bombRunning;
    // Sakuya's stopped clock proper: her cards hang the bullets, the lasers and the
    // sparks in the air for their own window, which is presentation on top of the card
    // flag above and not the same thing. `ex 26` reaches the same state by a different
    // route, and so does a conversation — one channel, two producers, because retail
    // hangs the same three consumers off it (`BulletManager.cpp:853`,
    // `EnemyManagerUpdate.cpp:980`, and the effect chain at `EffectManager.cpp:1063`).
    const frozen = this.activeBomb?.freeze === true || freeze;
    this.frameStopClock = frozen;

    // The card's own clock, which the cut-in uses to time its own slide.
    if (this.gs.spellName && !frozen) this.gs.spellFrames++;

    // `ex 18` can drop the global time scale mid-frame, and the pools that have no
    // `BulletWorld` of their own read it off the runner instead. Retail threads the
    // same global through every consumer (`EclGlobals.cpp:117`).
    this.bullets.timeScale = this.gs.timeScale;
    this.lasers.timeScale = this.gs.timeScale;

    // 1. Timeline spawns. Nothing new reaches a field that is standing still.
    if (!freeze) this.timeline.tick();

    // 2. Enemy AI (run generators). A card holds the scripts of the enemies that asked
    // for it (op 173, `EnemyManagerUpdate.cpp:466-472`); Sakuya's clock additionally
    // holds the whole field.
    this.enemies.tick(frameStop, frozen);

    // 3. Bullet physics
    this.bullets.tick(frozen, this.bulletWorld());

    // Lasers grow along their own heading, so they need a tick of their own
    // right after the bullets that share their anchor points.
    this.lasers.tick(frozen);

    // Effects are their own calc chain in retail, and a frozen clock freezes them with the
    // bullets: Sakuya's stop leaves every spark hanging in the air (`EffectManager.cpp:1063-1160`).
    if (this.effectPool && !frozen) this.effectPool.update();

    // 4. Player input + state machine
    this.player.holdGauge = freeze;
    this.player.tick(input);
    // Stage scripts read the 妖化 state through ECL operand 0x2771.
    this.gs.playerIsYoukai = this.player.isYoukai;

    // `acceptBomb` picks the row from the flying member and whether the press came
    // out of a deathbomb window, both of which the player sim already tracks.
    if (this.player.bombTriggered) {
      const spec = selectBomb(this.gs.shotType, this.player.isSlow, this.player.deathbomb);
      this.activeBomb = spec.create(this.player, this.gs, this.bombTargets());
      // `FUN_0040be30` arms the card and the ship's post-card state with one call,
      // and the state clock is the longer of the two.
      this.player.bombStateTimer = spec.stateTimer;
      // `Player.cpp:1288`, inside the same `acceptBomb` that just spent the bomb: the
      // card that is on screen loses its capture bonus to this press.
      this.enemies.voidLiveCardBonus();
      // `PlayerBomb.cpp:178`: dropping a card banks every item on the field, which
      // is why a bomb in the middle of a cutscene still collects the screen.
      this.items.autoCollectAll();
    }
    this.lastBombZones = this.activeBomb
      ? tickBomb(this.activeBomb, this.player, this.bullets, this.bombTargets())
      : [];
    if (this.activeBomb) {
      // A card sweeps the human/youkai meter while it plays, and it is the only thing
      // allowed to move the meter while it is up (`Player.cpp:1197/1199` pass
      // `forceUpdate = 1` to `AddToYoukaiGauge`).
      this.player.gauge.add(this.activeBomb.gaugeDrift, true);
      this.bombConnected = this.activeBomb.connected;
      this.bombCancel =
        this.activeBomb.cancelRadius > 0
          ? {
              x: this.player.x,
              y: this.player.y,
              radius: this.activeBomb.cancelRadius,
              alpha: 1 - this.activeBomb.cancelRadius / Math.max(1, this.activeBomb.spec.cancelRadius),
            }
          : null;
      this.bombBackdrop = this.activeBomb.backdrop;
    } else {
      this.bombCancel = null;
      this.bombBackdrop = { plate: null, flash: null };
    }

    // 5. Mercy cancel: `FUN_0044d2c0:1451-1455` re-inserts a 768x896 cancel box on
    //    the ship every frame of `playerStateSlotCooldown`, which swamps the whole
    //    384x448 field from any position. It is the only protection a respawned ship
    //    gets -- there is no post-respawn invulnerability in the reference.
    if (this.player.cancelTimer > 0) {
      this.bullets.clearInRadius(this.player.x, this.player.y, FULL_FIELD_CANCEL);
    }

    // 5b. The ship's weapon: focus arming, the partner's options, the `.sht` firing
    //     chain, and the integrator. It sits here because the two things it reads -
    //     `Player+3` and the twenty-frame shot window - are both resolved by the
    //     player tick above, and the damage pass below is a separate retail function
    //     that only ever looks at what this one left alive.
    this.tickShipWeapon();

    // 6. Player vs enemy bullets
    const { hits, grazes } = checkPlayerCollisions(
      this.bullets.bullets,
      this.player,
      this.player.hitboxHalfExtent,
      this.player.grazeHalfExtent,
      this.collisionStats,
    );
    // Lasers use the *hit* box for both the lethal and the graze pass
    // (`Player::CalcLaserHitbox`, `Player.cpp:421-477`).
    const laserHits = checkLaserCollisions(
      this.lasers.getActive(),
      this.player,
      this.player.hitboxHalfExtent,
      this.collisionStats,
    );
    // Retail pays per graze off the meter: the human side counts more grazes and
    // the youkai side pays more score (`Player.cpp:487-508`). On the youkai side it
    // also prints 时符 at the bullet that was grazed (`:510-521`) -- that drop is
    // where the 妖側 score comes from, and it is why the meter has somewhere to go.
    this.lastGraze = 0;
    for (let gi = 0; gi < grazes.length; gi++) {
      this.lastGraze += this.player.grazeReward().grazeGain;
      const grazed = grazes[gi];
      const orbs = this.player.grazeTimeOrbs(this.gs.isBossPresent, this.enemies.hasGaugeOwner(), false);
      // `Player.cpp:512` asks for ITEM_TIME2, which `SpawnItem:65-68` turns into the
      // doubled hover rather than the ordinary rising orb.
      for (let oi = 0; oi < orbs; oi++) this.items.spawn('timeOrb', grazed.x, grazed.y, 'orbDouble');
    }
    // A laser pays a graze on each of its 20-frame pulses, which is retail: the
    // beam never remembers having been grazed before. Retail also suppresses the
    // extra 时符 on that pass (`Player.cpp:466` passes `suppressExtraItems = 1`) and
    // drops whatever survives at the ship rather than along the beam.
    for (let gi = 0; gi < laserHits.grazes.length; gi++) {
      this.lastGraze += this.player.grazeReward().grazeGain;
      const orbs = this.player.grazeTimeOrbs(this.gs.isBossPresent, this.enemies.hasGaugeOwner(), true);
      for (let oi = 0; oi < orbs; oi++) {
        this.items.spawn('timeOrb', this.player.x, this.player.y, 'orbDouble');
      }
    }

    this.lastHits = hits;
    this.lastLaserHits = laserHits.hits;
    if ((hits.length > 0 || laserHits.hits.length > 0) && !this.player.isInvulnerable && !freeze) {
      // The bullets that landed are consumed either way, so a QA run that cannot
      // dodge does not end up re-colliding with the same shot every frame.
      for (const b of hits) b.active = false;
      const didHit = this.debugNoFail ? false : this.player.hit();
      if (didHit) {
        // Clear enemy bullets on death
        this.bullets.clearByTag('enemy');
        // `Player.cpp:615`: the hit itself already pulls every homing item loose.
        this.items.cancelAutoCollect();
      }
    }

    // 6b. The frame the death stops being cancellable: 时符 cost, drop pile, and the
    // grab cancel that follows it (`Player.cpp:1337-1357`). A ship that spent a
    // deathbomb never reaches this branch.
    if (this.player.deathSettled) {
      this.player.deathSettled = false;
      // `Player.cpp:1334`, one line before the 时符 bill below: the card the ship was
      // standing under when it died is no longer a capture.
      this.enemies.voidLiveCardBonus();
      // `Player.cpp:1337-1339`: dying costs 500 时符 once the bank is deep, and a
      // tenth of it otherwise. `addTimeOrbs` clamps at zero rather than going negative.
      addTimeOrbs(this.gs, this.gs.timeOrbs > 5000 ? -500 : -Math.trunc(this.gs.timeOrbs / 10));
      // Drop items
      this.items.spawnDeathDrops(
        this.player.x,
        this.player.y,
        this.gs.shotType,
        this.player.bombs > 0,
        // `Player.cpp:1341` branches on the lives still banked, which the dying
        // ship has not spent yet -- the debit lands in `respawn()`.
        this.player.lives <= 0,
      );
      // `Player.cpp:1357`: the drop pile is cancelled too, so it stays where it fell
      // instead of flying in with the ship that is about to come back.
      this.items.cancelAutoCollect();
      this.player.powerLost = 0;
    }

    // 7. Damage. The `.sht` shots are the ship's weapon proper; the sim's own
    //    player-tagged pool entries are the seam a non-ECL host still uses, and both
    //    run through the same `damageEnemiesAt` so that there is exactly one damage
    //    model in the building.
    this.damageEnemiesAt([...this.shotViews(), ...simShotViews(this.bullets.bullets)]);

    // Card damage is resolved inside `tickBomb`, on each zone's own clock.
    if (this.activeBomb?.finished) this.activeBomb = null;

    // Enemies destroyed by this frame's ECL-side damage.
    this.settleDeaths();
    // The card clock belongs to the slot that declared it, so the drivers, the
    // plate and the ECL's own `0x2774` read cannot drift apart.
    this.bankSpellResults();

    // 8. Items: physics + collection. Full Power Mode sweeps from anywhere;
    // otherwise only the collection line does, exactly like retail.
    this.lastCollected = this.items.tick(
      this.player.x,
      this.player.y,
      this.itemPickupHalfExtent,
      this.pointItemValueLine,
      this.player.power >= this.player.maxPower,
      this.player.gauge.isExtremelyHuman(),
      // Nothing homes in while the ship is dying or on its way back in
      // (`ItemManager.cpp:278`).
      this.player.state === 'alive',
      this.player.itemGrabSpeed,
      this.player.isSlow ? this.player.itemTimeScaleFocused : this.player.itemTimeScale,
      // `g_EclGameTimeScale`, which `:210` folds into the team's `+0x34` figure
      // and which also reaches the hover gravity and the grabbed step on its own.
      this.gs.timeScale,
      // `ItemManager.cpp:236`: a hovering 时符 releases the field the moment the
      // twenty-frame fire window shuts, even if it has not finished rising.
      this.player.shotWindowOpen,
    );

    // Apply collected items
    this.applyCollected(this.lastCollected);

    this.player.syncToGameState();
  }

  /**
   * Stage-end sweep: everything still on the field flies to the player and is
   * counted at full value, exactly like the retail clear bonus.
   */
  sweepItems(): void {
    this.applyCollected(this.items.collectAll(-1, this.player.gauge.isExtremelyHuman()));
  }

  /**
   * `ItemManager.cpp:425-434`: cap the power, cancel the bullets, convert every P
   * item on the field, and let the host know the banner is due.
   */
  private raiseFullPower(): void {
    this.player.power = Math.min(this.player.maxPower, this.player.power);
    this.fullPowerSparkles += this.items.convertPowerItemsToPointSmall(undefined, (x, y) => {
      this.effectPool?.spawn(0, x, y);
    });
    this.fullPowerTriggered = true;
  }

  private applyCollected(list: CollectResult[]): void {
    for (const c of list) {
      if (c.fillsPower) {
        this.player.power = this.player.maxPower;
        this.bullets.clearByTag('enemy');
        this.raiseFullPower();
      } else if (c.power > 0) {
        const before = this.player.power;
        this.player.addPower(c.power);
        if (before < 128 && this.player.power >= 128) {
          this.bullets.clearByTag('enemy');
          this.raiseFullPower();
        }
      }
      if (c.life) this.player.lives = Math.min(8, this.player.lives + 1);
      if (c.bomb) this.player.bombs = Math.min(8, this.player.bombs + 1);
      // `CollectExtend` hands the bonus to a life first and only then to a bomb.
      if (c.extend) {
        if (this.player.lives < 8) this.player.lives++;
        else if (this.player.bombs < 8) this.player.bombs++;
      }
      this.player.score += c.score;
      if (c.timeOrb) {
        addTimeOrbs(this.gs, 1);
        this.player.onTimeOrbCollected();
      }
    }
  }

  get isFinished(): boolean {
    if (!this.timeline.finished) return false;
    // Running out of timeline instructions is not the same as finishing a stage. Retail's
    // last instruction is a boss wait, so the clear sequence cannot start while the marker
    // the script waits on is still claimed; a script that retires early — a bounds cull, or
    // a spawn nobody waited on — used to read as "thanks for playing" in the middle of a
    // boss fight. A fleeing boss clears its own marker, so this still lets the stage end
    // when the boss walks off alive. The watch is on marker 0, not on "any boss":
    // `SetBossPresent` is one global flag raised by the marker 0 claim and dropped by any
    // boss death (`EclRunHigh.inl:641-645`, `EnemyManagerUpdate.cpp:857-861`), and 五面的
    // sub49 是只占 1 号位的隐形弹道层（60000 血，停在画外）， retail 从来不等它，
    // 拿"场上还有 boss"当关卡通关条件就会把五面永远卡住。
    return !this.gs.isBossPresent;
  }

  /** 0 = pinned human, 0.5 = neutral, 1 = pinned youkai. Drives the HUD meter. */
  get youkaiMeter(): number {
    return this.player.gauge.normalized();
  }

  /** True while the meter sits at either extreme, which is what paints the aura. */
  get youkaiExtreme(): boolean {
    return this.player.gauge.isExtreme();
  }
}
