/**
 * Enemy slot pool + timeline driver.
 *
 * Mirrors th08web-ref/src/EnemyManager.cpp: 480 enemy slots, spawn by sub ID,
 * per-frame tick that runs each active slot generator one step.
 */

import { EnemySlot, INT_FIELD_BY_ID, FLOAT_FIELD_BY_ID, type SlotFx, type SpellResult } from './EnemySlot';
import type { SeTick } from './BulletTransform';
import { increaseSubrank, type GameState } from './GameState';
import type { BulletPool } from './BulletPool';
import type { LaserPool } from './LaserPool';
import type { EffectPool } from './EffectPool';
import { ENEMY_DROP_SCHEDULE, ITEM_KIND_BY_TYPE, type ItemKind, type ItemPool } from './ItemPool';
import type { AnmPack } from '../../engine/anm/AnmPack';

export type SubFactory = (id: number) => ((e: EnemySlot) => Generator<number, void, void>) | null;

export const MAX_ENEMIES = 480;

/**
 * One `AsciiManager::CreateTimePopup` request raised during the frame. The retail
 * call passes a packed ARGB *signed* int, so -1 is white and -128 is `0xFFFFFF80`.
 */
export interface TimePopup {
  x: number;
  y: number;
  value: number;
  color: number;
  /** `AsciiManager::SetScale` in force when the popup was created. */
  scale: number;
}

/**
 * The three things the familiar-chain payoff needs from the host that a slot pool
 * cannot reach on its own.
 */
export interface ChainPayoffSink {
  /** `g_AsciiManager.CreateTimePopup`. */
  timePopup(popup: TimePopup): void;
  /** `g_GameManager.AddToYoukaiGauge(amount, 0)` (`EnemyManager.cpp:366`). */
  addToYoukaiGauge(amount: number): void;
  /** `g_GameManager.GetYoukaiGauge()`, which the payoff takes a twelfth of. */
  youkaiGaugeValue(): number;
  /** `g_Spellcard.IsActive()` (`EnemyManager.cpp:323`). */
  spellCardActive(): boolean;
}

/**
 * Spawn parameters a timeline instruction carries beyond position and HP.
 *
 * `EnemyTimeline.cpp:55-61`: the item drop type is stored as `(i8)`, and the score
 * only overrides the template's when it is not negative.
 */
export interface SpawnArgs {
  /** `enemy+0x3304`. */
  dropType?: number;
  /** `enemy+0x2E08`. */
  score?: number;
  /** `enemy+0x3308`, queued `ITEM_POINT` grants (ops 11/12). */
  pointDrops?: number;
  /** `enemy+0x330C`, queued `ITEM_POWER_SMALL` grants (ops 11/12). */
  powerDrops?: number;
  /**
   * The `flags` argument of `SpawnEnemy1`, i.e. `0x3324` bit 18. Ops 1, 4, 5 and 12
   * all set it, and it is what makes the second copy of a wave fly left.
   */
  mirror?: boolean;
}

/**
 * The `ItemType` ids the chain payoff writes (`ItemManager.hpp:8-21`). 8 is
 * `ITEM_POINT_SMALL`, which `EnemyManager.cpp:325` arms a bursting familiar with; 9 is
 * `ITEM_UNK9`, which the decompile leaves undocumented and which is drawn as a small
 * point item, the kind it shares a sheet with.
 */
const ITEM_POINT_SMALL = 8;
const ITEM_UNK9 = 9;

/** The parent's own popup colour, `0xFFF0F00F` (`EnemyManager.cpp:345`). */
const PARENT_POPUP_COLOR = 0xfff0f00f | 0;

export class EnemyManager {
  readonly slots: EnemySlot[];
  private gs: GameState;
  private subFactory: SubFactory;
  bulletPool: BulletPool | null = null;
  /** Lasers are spawned by the same scripts, so slots need the same handle. */
  laserPool: LaserPool | null = null;
  itemPool: ItemPool | null = null;
  /** Retail's effect pool, handed to every slot: ECL spawns through it by template id. */
  effectPool: EffectPool | null = null;
  playerRef: { x: number; y: number } | null = null;
  /** True while Sakuya's clock is stopped; the chain payout thirds its popups. */
  clockStopped = false;
  /**
   * `EnemyManager::timer` as `FUN_0042c3b0` (`EnemyManager.cpp:916-931`) uses it: the
   * manager's own frame counter, which is what the stage's rank creep is measured on.
   */
  rankTimer = 0;
  /** Where the host sends `CreateTimePopup` and `AddToYoukaiGauge`. */
  chainSink: ChainPayoffSink | null = null;
  /** `g_EnemyDropCounter` (`EnemyManager.cpp:824`/`:836`), a u16. */
  private dropCounter = 0;
  /** `g_EnemyDropScheduleIndex` (`EnemyManager.cpp:832-834`). */
  private dropScheduleIndex = 0;
  /** ANM bytecode store handed to every slot that asks for a script. */
  anmPack: AnmPack | null = null;
  /** The stage's `stgNNenm.anm`, plus its manifest name for the atlas lookup. */
  anmPackAlt: AnmPack | null = null;
  anmStageName = '';
  /** Collision radius per bullet type, handed to every slot by the host. */
  bulletRadiusFor: ((type: number) => number) | null = null;
  /** Drawn half-size per bullet, which sets the off-field cull margin. */
  bulletSizeFor: ((type: number, color: number) => number) | null = null;
  /** Visual requests made by any slot during the current frame. */
  readonly frameFx: SlotFx[] = [];
  /** ECL sound requests from the current frame, each with the x that pans it. */
  readonly frameSfx: SeTick[] = [];
  /** Spell cards that ended during the current frame, in slot order. */
  readonly frameSpellResults: SpellResult[] = [];
  /** Counts op 179 so the host can start the stage background sequence. */
  stageBgRequests = 0;

  constructor(gs: GameState, subFactory: SubFactory) {
    this.gs = gs;
    this.subFactory = subFactory;
    this.slots = Array.from({ length: MAX_ENEMIES }, () => new EnemySlot(gs));
    for (let i = 0; i < MAX_ENEMIES; i++) this.slots[i].slotIndex = i;
  }

  /** Spawn an enemy running ECL sub `subId` at position (x, y) with given HP. */
  spawn(subId: number, x: number, y: number, hp = 0): EnemySlot | null {
    return this.spawnInternal(subId, x, y, hp);
  }

  /**
   * `EnemyManager::SpawnEnemy1` (`EnemyTimeline.cpp:30-69`) with the fields a
   * timeline instruction carries: `0x3304` gets the drop type through the same
   * `(i8)` cast, `0x2E08` only takes the score when it is not negative, and a
   * negative HP leaves the template value alone (`:44`, `:55-63`).
   */
  spawnFromTimeline(subId: number, x: number, y: number, hp: number, args: SpawnArgs = {}): EnemySlot | null {
    const slot = this.spawnInternal(subId, x, y, hp);
    if (!slot) return null;
    if (args.dropType !== undefined) slot.dropType = (args.dropType << 24) >> 24;
    if (args.score !== undefined && args.score >= 0) slot.scoreValue = args.score;
    slot.pointDrops = args.pointDrops ?? 0;
    slot.powerDrops = args.powerDrops ?? 0;
    slot.mirrorMovement = args.mirror === true;
    return slot;
  }

  /**
   * `Enemy::FUN_0042bea0` (`EnemyManager.cpp:809-868`): what actually falls out of a
   * dead enemy. A non-negative `0x3304` names exactly one item; -1 walks the global
   * 32-entry drop schedule and pays one entry every third such death; -2 (what ops
   * 90..92 arm on a familiar) drops nothing. The two queued counts then scatter their
   * own grants over a 128x128 box around the body.
   *
   * The stage data asks for a power item out of 541 enemies, a point item out of 663,
   * a big power out of 85 and a bomb out of 12. Handing a point *and* a power item to
   * the player from every kill is what made a fresh run hit full power in wave one.
   */
  dropOnDeath(slot: EnemySlot): void {
    const items = this.itemPool;
    const rng = this.gs.rng;
    if (items) {
      if (slot.dropType >= 0) {
        items.spawn(ITEM_KIND_BY_TYPE[slot.dropType] ?? 'point', slot.posX, slot.posY);
      } else if (slot.dropType === -1) {
        if (this.dropCounter % 3 === 0) {
          const type = ENEMY_DROP_SCHEDULE[this.dropScheduleIndex];
          items.spawn(ITEM_KIND_BY_TYPE[type] ?? 'point', slot.posX, slot.posY);
          this.dropScheduleIndex = (this.dropScheduleIndex + 1) % ENEMY_DROP_SCHEDULE.length;
        }
        this.dropCounter = (this.dropCounter + 1) & 0xffff;
      }
      // `enemy+0x330C` pays power while the ship can still use it (`:846-849`).
      const powerKind: ItemKind = this.gs.power >= 128 ? 'point' : 'powerSmall';
      for (let i = 0; i < slot.powerDrops; i++) {
        items.spawn(
          powerKind,
          slot.posX + rng.randomF32() * 128.0 - 64.0,
          slot.posY + rng.randomF32() * 128.0 - 64.0,
        );
      }
      for (let i = 0; i < slot.pointDrops; i++) {
        items.spawn(
          'point',
          slot.posX + rng.randomF32() * 128.0 - 64.0,
          slot.posY + rng.randomF32() * 128.0 - 64.0,
        );
      }
    }
    slot.powerDrops = 0;
    slot.pointDrops = 0;
  }

  /**
   * Launch a linked familiar (ECL ops 90..92). The child is an ordinary slot with
   * its own ECL script, plus the three things retail marks on it: a parent link,
   * no player collision, and — for op 92 only — a position that composites onto
   * the parent every frame.
   */
  spawnLinkedChild(spec: {
    subId: number;
    x: number;
    y: number;
    hp: number;
    dropType: number;
    score: number;
    parentIndex: number;
    followParent: boolean;
  }): EnemySlot | null {
    const parent = this.slotAt(spec.parentIndex);
    const slot = this.spawnInternal(spec.subId, spec.x, spec.y, spec.hp, parent);
    if (!slot) return null;
    slot.linkedChild = true;
    slot.parentSlotIndex = spec.parentIndex;
    slot.followParentPosition = spec.followParent;
    slot.dropType = spec.dropType;
    slot.scoreValue = spec.score;
    // Retail also clears `EMUF1_COLLISION` (bit 2) so the familiar cannot be
    // crashed into; the sim has no player-vs-body collision yet, so there is no
    // bit to clear. Shots still land on it, which is the point: the familiar is
    // the damage path into its parent.
    return slot;
  }

  /** Slot by index, or null when the index is out of range. */
  slotAt(index: number): EnemySlot | null {
    if (index < 0 || index >= this.slots.length) return null;
    return this.slots[index];
  }

  /**
   * `EnemyManager::SpawnEnemy2` (`EnemyTimeline.cpp:91-127`): the new slot is
   * filled from the template, `CallEclSub` installs the script, and only then is
   * the summoner's register block copied in. The first `RunEcl` therefore already
   * sees the inherited `f0`/`f1`, which is what lets a launcher steer its
   * familiars; running the script before the copy would freeze them in place.
   */
  private spawnInternal(
    subId: number,
    x: number,
    y: number,
    hp: number,
    inheritFrom?: EnemySlot | null,
  ): EnemySlot | null {
    const slot = this.slots.find((s) => !s.active);
    if (!slot) return null;
    slot.reset(x, y, hp, this.gs);
    slot.bulletPool = this.bulletPool;
    slot.laserPool = this.laserPool;
    slot.itemPool = this.itemPool;
    slot.effectPool = this.effectPool;
    slot.playerRef = this.playerRef;
    slot.anmPack = this.anmPack;
    slot.anmPackAlt = this.anmPackAlt;
    slot.anmStageName = this.anmStageName;
    slot.bulletRadiusFor = this.bulletRadiusFor;
    slot.bulletSizeFor = this.bulletSizeFor;
    slot.enemyManager = this;
    slot.subId = subId;
    const factory = this.subFactory(subId);
    if (factory) {
      slot.generator = factory(slot);
      if (inheritFrom && inheritFrom !== slot) slot.inheritRegistersFrom(inheritFrom);
      // Run the first frame immediately (like RunEcl on spawn).
      if (slot.generator) {
        const result = slot.generator.next();
        if (result.done) {
          slot.active = false;
          return slot;
        }
        slot.waitFrames = Math.max(0, (result.value ?? 0) - 1);
      }
    }
    return slot;
  }

  /**
   * Advance every active enemy by one frame.
   *
   * `frameStop` is retail's `Player+0xFDC`, which is raised for the whole of any
   * player card. It does not stop the enemy loop: it stops the scripts of the slots
   * that asked to be stopped (`EMUF1_PAUSE_TIMER`, op 173 —
   * `EnemyManagerUpdate.cpp:466-472`), which is how a boss holds its pattern intact
   * across your bomb while the rest of the field keeps moving.
   *
   * `clockFrozen` is Sakuya's stopped clock proper, which holds every script.
   */
  tick(frameStop = false, clockFrozen = false): void {
    this.frameFx.length = 0;
    this.frameSfx.length = 0;
    this.frameSpellResults.length = 0;
    this.clockStopped = frameStop || clockFrozen;
    // `EnemyManager.cpp:919-931`: every `2400 - lives*4*60` frames the stage buys one
    // rank step, so a long fight -- or one fought with lives still in hand -- ends up
    // denser than a short one. Lives make the interval *shorter*, which is retail's way
    // of punishing a run that has not needed them yet.
    const interval = 2400 - this.gs.lives * 4 * 60;
    if (interval > 0) {
      this.rankTimer++;
      if (this.rankTimer % interval === 0) increaseSubrank(this.gs, 100);
    }
    if (clockFrozen) return;
    for (const slot of this.slots) {
      if (frameStop && slot.pauseTimer) continue;
      slot.tick();
      slot.drainFx(this.frameFx);
      slot.drainSfx(this.frameSfx);
      slot.drainSpellResults(this.frameSpellResults);
    }
    // A boss that leaves the playfield is culled by its bounds check, which
    // would otherwise leave the timeline waiting for a boss that no longer
    // exists. The marker is the single source of truth for "boss up".
    if (this.gs.isBossPresent && !this.hasBossMarker()) this.gs.isBossPresent = false;
    this.recountLinkedChildren();
  }

  /**
   * Rebuild `enemy+0x3380`, the live familiar count. Retail decrements it as each
   * child retires (`EnemyManagerUpdate.cpp:793-798`); deriving it from the parent
   * links every frame gives the same number without a second bookkeeping path that
   * can drift when a child goes away through bounds, a card wipe or its own script
   * instead of through damage.
   */
  private recountLinkedChildren(): void {
    for (const slot of this.slots) slot.childCount = 0;
    for (const slot of this.slots) {
      if (!slot.active || !slot.linkedChild) continue;
      const parent = this.slotAt(slot.parentSlotIndex);
      if (parent && parent.active) parent.childCount++;
    }
  }

  /**
   * `EnemyOverlay::FUN_0042adb0` (`EnemyManager.cpp:262-382`).
   *
   * Two halves share one function, and which runs depends on who is talking:
   *
   * - A summoner whose card just ended (`mode 1`) pays out its live chain. Every
   *   familiar detaches, loses its own drop, and throws `itemCount` time orbs in a
   *   disc, while the parent itself throws twice its cumulative spawn count. The
   *   card driver's field wipe then kills the detached children *after* they have
   *   paid, which is why the payoff sets the suppress-death bit and `-2` first.
   * - A familiar dying on its own is not a chain head — `CountParentChain` requires
   *   a null `0x2DA4` — so only the tail branch runs: one orb, a `1` popup, and a
   *   twelfth of the meter drained.
   *
   * `mode 0` is the timeout and stage-clear path: the chain is detached silently.
   */
  familiarChainPayoff(slot: EnemySlot, mode: number): void {
    const kids = this.slots.filter(
      (child) => child.active && child.linkedChild && child.parentSlotIndex === slot.slotIndex,
    );
    const count = kids.length;
    if (count > 0) {
      // `popupColor` (`EnemyManager.cpp:278`): the more familiars are left, the more
      // the blue channel drops, so a fat chain reads as a colder number.
      const popupColor = count < 2 ? -1 : count < 6 ? -48 : count < 10 ? -80 : -128;
      const parentBoss = slot.isBoss;
      // `EnemyManager.cpp:294`: the per-familiar cancel zone mints time orbs when the
      // summoner is a boss, and `ITEM_UNK9` otherwise — which has no art and no
      // documented effect, so it is drawn as the small point item it shares a sprite
      // sheet with.
      const cancelItem: ItemKind = parentBoss ? 'timeOrb' : ITEM_KIND_BY_TYPE[ITEM_UNK9];
      // `EnemyManager.cpp:295-300`, keyed on the ship's shot type: `IsSoloYoukai` and
      // `IsSoloHuman` are the two odd/even halves of the >= 4 solo shot types
      // (`GameManager.hpp:154-161`), the else arm is a paired ship.
      const shotType = this.gs.shotType;
      const solo = shotType >= 4;
      const itemCount = solo
        ? (shotType & 1) !== 0
          ? count >= 10
            ? 26
            : count * 2 + 6
          : count >= 4
            ? 40
            : count * 6 + 16
        : count >= 8
          ? 26
          : count * 2 + 10;
      // `EnemyManager.cpp:302-303` sits inside the chain walk, so a stopped clock
      // divides the same local again for every familiar: third, ninth, twenty-seventh.
      let popupCount = count;
      kids.forEach((child) => {
        child.detachFromParent(slot.posX, slot.posY);
        if (mode === 0) return;
        // `EnemyManager.cpp:302-303`: a stopped clock reads the chain as a third of
        // its size — but only after the drop count was already fixed.
        if (this.clockStopped) popupCount = Math.trunc(popupCount / 3);
        this.popup(child, popupCount, popupColor);
        // `g_Player.FUN_0044df00(pos, 32, 2.0, 8, itemType)` (`:310-311`): an 8-frame
        // bullet-cancel zone, radius 32 growing 2 per frame, that turns whatever it
        // swallows into the item type above. Resolved as one pass at its final 48.
        const swallowed = this.bulletPool?.clearInRadius(child.posX, child.posY, 48) ?? 0;
        for (let i = 0; i < swallowed; i++) this.itemPool?.spawn(cancelItem, child.posX, child.posY);
        for (let i = 0; i < itemCount; i++) {
          const angle = this.gs.rng.randomF32SignedInRange(Math.PI);
          const radius = this.gs.rng.randomF32InRange(itemCount * 2.0);
          this.itemPool?.spawn(
            'timeOrb',
            child.posX + Math.cos(angle) * radius,
            child.posY + Math.sin(angle) * radius,
          );
        }
        // `EnemyManager.cpp:323-327`: when nothing is left in the draw list, or a card
        // is still up, the bursting familiar is armed with an `ITEM_POINT_SMALL` drop
        // and `FUN_0042bea0(0)` runs on the spot...
        if (!this.bucketsHoldEnemies() || (this.chainSink?.spellCardActive() ?? false)) {
          child.dropType = ITEM_POINT_SMALL;
          this.dropOnDeath(child);
        }
        // ...and it is disarmed right after (`:333-335`), so the field wipe that
        // follows the phase break cannot pay the same familiar out a second time.
        child.dropType = -2;
      });
      if (mode !== 0) {
        // The parent's own total, at double scale and in `0xFFF0F00F`.
        this.popup(slot, slot.childCount, PARENT_POPUP_COLOR, 2);
        const total = 2 * slot.childCount;
        for (let i = 0; i < total; i++) {
          const angle = this.gs.rng.randomF32SignedInRange(Math.PI);
          const radius = this.gs.rng.randomF32InRange(128.0);
          this.itemPool?.spawn(
            'timeOrb',
            slot.posX + Math.cos(angle) * radius,
            slot.posY + Math.sin(angle) * radius,
          );
        }
        this.bulletPool?.clearInRadius(slot.posX, slot.posY, 48);
      }
    }

    // The tail branch (`EnemyManager.cpp:363-379`): a familiar that died on its own.
    if (slot.linkedChild && mode !== 0) {
      this.chainSink?.addToYoukaiGauge(-Math.trunc(this.gaugeValue() / 12));
      this.popup(slot, 1, 0xffffffff);
      this.itemPool?.spawn('timeOrb', slot.posX, slot.posY);
      slot.dropType = -2;
      slot.powerDrops = 0;
      slot.pointDrops = 0;
    }
  }

  /** The live meter value, which the host owns. */
  private gaugeValue(): number {
    return this.chainSink?.youkaiGaugeValue() ?? 0;
  }

  private popup(slot: EnemySlot, value: number, color: number, scale = 1): void {
    const popup: TimePopup = { x: slot.posX, y: slot.posY, value, color, scale };
    this.chainSink?.timePopup(popup);
  }

  /**
   * `g_EnemyManager.FUN_0042f1f0()` (`EnemyManager.cpp:1561-1570`): true while any of
   * the eight draw-list heads is occupied. The sim keeps no draw list — the host
   * buckets enemies at render time — so the live slot count stands in for it.
   */
  private bucketsHoldEnemies(): boolean {
    return this.activeCount > 0;
  }

  /**
   * Take the slots that just died, queueing a death burst for each. Called
   * after damage has landed, so the host can turn these into particles,
   * explosions and score events exactly once.
   */
  collectDeaths(): EnemySlot[] {
    const dead: EnemySlot[] = [];
    for (const slot of this.slots) {
      if (!slot.deathPending) continue;
      slot.deathPending = false;
      dead.push(slot);
      this.frameFx.push({
        kind: 'burst',
        x: slot.posX,
        y: slot.posY,
        angle: 0,
        color: -1,
        scale: 3,
        script: 40,
      });
    }
    if (dead.some((slot) => slot.hasGauge) && !this.gaugeOwner()) {
      this.gs.isBossPresent = false;
    }
    return dead;
  }

  /**
   * The live slot that owns the boss life bar. Lowest slot index wins so the
   * gauge stays stable when a boss hands off to a second script.
   */
  gaugeOwner(): EnemySlot | null {
    let best: EnemySlot | null = null;
    for (const slot of this.slots) {
      if (!slot.active || !slot.hasGauge) continue;
      if (!best || slot.slotIndex < best.slotIndex) best = slot;
    }
    return best;
  }

  hasGaugeOwner(): boolean {
    return this.gaugeOwner() !== null;
  }

  /** True while an active slot still holds a boss marker (op 127). */
  hasBossMarker(): boolean {
    for (const slot of this.slots) if (slot.active && slot.isBoss) return true;
    return false;
  }

  /**
   * Both card drivers zero every plain enemy on the field before the new phase
   * script starts (`EnemyManager.cpp:517-533` and `:701-716`), so the plate
   * always goes up over a clear field. The boss itself — the slot that owns a
   * life bar — is left alone.
   */
  wipeNonBossEnemies(exceptSlot: number): void {
    for (const slot of this.slots) {
      if (!slot.active || slot.slotIndex === exceptSlot || slot.isBoss) continue;
      slot.forcePhaseWipeDeath();
    }
  }

  /** Hand ECL sub `subId` to an existing slot (op 88 remote calls). */
  runSubOnSlot(slotIndex: number, subId: number): EnemySlot | null {
    const slot = this.slots[slotIndex];
    if (!slot || !slot.active) return null;
    const factory = this.subFactory(subId);
    if (!factory) return null;
    slot.generator = factory(slot);
    slot.waitFrames = 0;
    return slot;
  }

  /** Build a coroutine for ECL sub `subId` bound to `slot` (op 135 lanes). */
  makeSub(subId: number, slot: EnemySlot): Generator<number, void, void> | null {
    const factory = this.subFactory(subId);
    if (!factory) return null;
    // The lane's first instruction runs on the next tick, like a fresh VM.
    return factory(slot);
  }

  /** Remote int register read (op 86). */
  readIntSlot(slotIndex: number, field: number): number {
    const slot = this.slots[slotIndex];
    if (!slot || !slot.active) return 0;
    return slot.readField(field, INT_FIELD_BY_ID);
  }

  /** Remote float register read (op 87). */
  readFloatSlot(slotIndex: number, field: number): number {
    const slot = this.slots[slotIndex];
    if (!slot || !slot.active) return 0;
    return slot.readField(field, FLOAT_FIELD_BY_ID);
  }

  /** Called by op 179; the host reads `stageBgRequests` to advance the stage art. */
  notifyStageBg(): void {
    this.stageBgRequests++;
  }

  /** Count of currently active enemies. */
  get activeCount(): number {
    let n = 0;
    for (const s of this.slots) if (s.active) n++;
    return n;
  }

  /** Get all active slots (for rendering / collision). */
  getActive(): EnemySlot[] {
    return this.slots.filter((s) => s.active);
  }
}
