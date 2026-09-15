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
import type { EffectPool } from './EffectPool';
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
 * (`Player.cpp:3501-3507`), and a straight shot arrives with a zero-size box, which
 * is why `radius` is optional on the view.
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
    const reach = halfWidth + (shot.radius ?? 0);
    const reachY = halfHeight + (shot.radius ?? 0);
    if (Math.abs(shot.x - enemy.posX) >= reach) continue;
    if (Math.abs(shot.y - enemy.posY) >= reachY) continue;
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
      if (resolved.score > 0) this.player.score += resolved.score;
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
      if (slot.scoreValue > 0) this.player.score += slot.scoreValue;
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
      if (card.bonus > 0) this.player.score += card.bonus;
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

  /** Run one game frame. */
  tick(input: PlayerInput): void {
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

    // `Player+0xFDC` as retail defines it: raised by `acceptBomb` (`Player.cpp:1277`)
    // and dropped when the card's own clock runs out (`:1165-1168`), so it is true for
    // the whole of any card. Both `damageEnemiesAt` and the enemy scripts read this
    // byte, and the player sim reads it through `gs` for the stance, the meter and the
    // graze tally. It is published at the top of the frame, which is where retail has
    // it too: `Player::Update` tests the flag before the code that plays a card.
    this.gs.bombRunning = this.activeBomb !== null;
    this.gs.bombForcedFocus = this.activeBomb ? (this.activeBomb.spec.phase & 1) === 1 : false;
    const frameStop = this.gs.bombRunning;
    // Sakuya's stopped clock proper: her cards hang the bullets, the lasers and the
    // sparks in the air for their own window, which is presentation on top of the card
    // flag above and not the same thing.
    const frozen = this.activeBomb?.freeze === true;

    // The card's own clock, which the cut-in uses to time its own slide.
    if (this.gs.spellName && !frozen) this.gs.spellFrames++;

    // 1. Timeline spawns
    this.timeline.tick();

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
    if ((hits.length > 0 || laserHits.hits.length > 0) && !this.player.isInvulnerable) {
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

    // 7. Player shots that live in the sim's own pool. ECL never tags a bullet
    // 'player', so this is the seam a non-ECL host uses; it runs through the same
    // `damageEnemiesAt` as the presentation layer's shots so that there is exactly
    // one damage model in the building.
    this.damageEnemiesAt(simShotViews(this.bullets.bullets));

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
    // Running out of timeline instructions is not the same as finishing a stage.
    // Retail's last instruction is a boss wait, so the clear sequence cannot start
    // while a slot still holds the marker; a script that retires early — a bounds
    // cull, or a spawn nobody waited on — used to read as "thanks for playing" in
    // the middle of a boss fight. A fleeing boss clears its own marker, so this
    // still lets the stage end when the boss walks off alive.
    return !this.enemies.hasBossMarker();
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
