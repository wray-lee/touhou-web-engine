/**
 * Item (collectible) pool and collection logic.
 *
 * Ported from th08web-ref/src/ItemManager.cpp:
 * - Power items: small (+1, `CollectPowerSmall`), big (+8, `CollectPowerBig`),
 *   full (128 + bullet clear, `ITEM_POWER_FULL`)
 * - Point items: `CollectPoint` / `CollectPointSmall` pay `pointItemValue` above the
 *   collection line and half of it minus `base/1000` per pixel below
 * - Time orbs: `CollectTimeOrb`, whose value climbs with the point items collected
 * - Sweep: the whole field flies to the ship once it climbs above the collection
 *   line, and Full Power Mode does the same anywhere
 * - Fall physics: vy += 0.03/frame, cap at 3.0
 *
 * Every number here is the raw one retail hands `AddScore`, which divides by ten
 * before it reaches the read-out; `popup` is what `CreateScorePopup` prints.
 */

import {
  decreaseSubrank,
  increaseSubrank,
  updatePointItemExtendThreshold,
  type GameState,
} from './GameState';
import { PLAYFIELD_W, PLAYFIELD_H } from './Playfield';
import { MAX_POWER } from './PlayerSim';
import { teamRowForShotType } from '../../touhou-common/player/DeathCycle';

export type ItemKind =
  'powerSmall' | 'powerBig' | 'powerFull' | 'point' | 'pointSmall' | 'life' | 'bomb' | 'extend' | 'timeOrb';

export interface Item {
  active: boolean;
  kind: ItemKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  magnetized: boolean;
  /**
   * The retail `ItemState` values this pool can still tell apart once
   * `magnetized` has taken `ITEM_STATE_AUTOCOLLECT`.
   *
   *  - `none` is `ITEM_STATE_DEFAULT`: a free item, box-collectable, culled and
   *    rank-taxed at the bottom.
   *  - `scatter` is `ITEM_STATE_UNK2`: the death pile, gliding from where the ship
   *    died to a random point in the upper field over 60 frames.
   *  - `hover` is `ITEM_STATE_UNK3`, which every 时符 is forced into. It rises, and
   *    `ItemManager.cpp:315` refuses to let the item box take it while it lasts.
   *  - `hoverDouble` is `ITEM_STATE_UNK5`, the graze drop: same rise but stepped
   *    twice a frame, and collectable the moment it turns over.
   */
  rise: ItemRise;
  /** `item->timer`, which only the `scatter` glide and the sprite animation read. */
  timer: number;
  /** `targetPosition` for a scatter, `startPositionOrVelocity` for its far end. */
  tx: number;
  ty: number;
  sx: number;
  sy: number;
}

/** The four `ItemState` values this pool models; see `Item.rise`. */
export type ItemRise = 'none' | 'scatter' | 'hover' | 'hoverDouble';

/**
 * `SpawnItem`'s third argument, narrowed to the two states any caller other than
 * `Player::Die` actually asks for. A 时符 ignores it either way -- `SpawnItem:61-69`
 * overwrites the state of every `ITEM_TIME` with UNK3 and every `ITEM_TIME2` with
 * UNK5 -- so `orbDouble` is the only way to reach the second one.
 */
export type ItemSpawnVariant = 'normal' | 'scatter' | 'orbDouble';

const GRAVITY = 0.03;
const MAX_FALL = 3.0;
const MAGNET_RADIUS = 24;
const MAGNET_SPEED = 8;
const CULL_Y = PLAYFIELD_H + 48;
/** `CancelAutoCollect` puts a stopped item back on this upward drift (`ItemManager.cpp:691`). */
const CANCEL_DRIFT = -0.9;
/** `AutoCollectAllItems` drift (`:653`), before the homing pass overwrites it. */
const AUTOCOLLECT_DRIFT = -0.5;
/** Drift an item takes while the ship is dying or flying back in (`:287`). */
const OFF_FIELD_DRIFT = -0.7;
/**
 * `ItemManager.cpp:102`: the base upward kick of a free item. Only the 时符 states
 * replace it, and they replace the horizontal jitter too -- a plain P or 点 drops
 * straight up with `vx` of zero, which is why retail's enemy drops fall in a
 * column rather than a fan.
 */
const RISE_OFF = -2.2;
/** `:118-120`: a 时符 rises at `-2 - rand(0.2)` with `±rand(0.6)` of sideways lean. */
const ORB_RISE = -2.0;
const ORB_RISE_JITTER = 0.2;
const ORB_LEAN = 0.6;
/** `:123-127` and `:240-246`: dying turns a hovering orb into a plain drifting one. */
const DYING_RISE = -0.9;
/** `:233` and `:251`: how much of the rise the hover eats back per frame. */
const HOVER_DECEL = 0.05;
/** `:109-121`: the scatter glide lasts one second, then the item hangs and falls. */
const SCATTER_FRAMES = 60;
/** `:112-114`: the scatter target is anywhere in `x in [48, 336], y in [-64, 128]`. */
const SCATTER_X_OFF = 48;
const SCATTER_X_SPAN = 288;
const SCATTER_Y_OFF = -64;
const SCATTER_Y_SPAN = 192;
/** `:53-56`: a spawn asked for outside `x in [-64, 448]` is refused outright. */
const SPAWN_X_MARGIN = 64;

/**
 * `g_PowerUpThresholds` (`ItemManager.cpp:21`). The trailing 999 is the sentinel that
 * stops the level walk once power is maxed, so there are six levels, 0..5.
 */
export const POWER_THRESHOLDS = [8, 24, 48, 80, 128, 999] as const;

/** Shot level for a power value, i.e. the `while (power >= thresholds[l]) l++` walk. */
export const powerLevel = (power: number): number => {
  let level = 0;
  while (level < POWER_THRESHOLDS.length && power >= POWER_THRESHOLDS[level]) level++;
  return level;
};

export const MAX_ITEMS = 512;

/**
 * `g_EnemyDropSchedule` (`EnemyManager.cpp:33-38`): the rotation an enemy with
 * `dropType == -1` walks, taking one entry every third death.
 */
export const ENEMY_DROP_SCHEDULE: readonly number[] = [
  0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0,
];

/**
 * `ItemType` (`ItemManager.hpp:8-21`) translated to the kinds this pool draws.
 * The stage data only ever asks for 0, 1, 2, 3, 7 and 8; 6 (`ITEM_POINT_STAR`) and
 * 9 (`ITEM_UNK9`) are undocumented in the decompile and folded into their nearest
 * known sibling.
 */
export const ITEM_KIND_BY_TYPE: Record<number, ItemKind> = {
  0: 'powerSmall',
  1: 'point',
  2: 'powerBig',
  3: 'bomb',
  4: 'powerFull',
  5: 'extend',
  6: 'point',
  7: 'timeOrb',
  8: 'pointSmall',
  9: 'pointSmall',
  10: 'timeOrb',
};

export class ItemPool {
  readonly items: Item[];
  private readonly gs: GameState;
  /**
   * `g_Player.playerState == PLAYER_STATE_DYING`, which `SpawnItem:122` and
   * `:133` read on every 时符. The pool cannot reach the ship, so the runner pushes
   * it in once a frame -- retail reads the same global from inside the spawner.
   */
  shipDying = false;

  constructor(gs: GameState) {
    this.gs = gs;
    this.items = Array.from({ length: MAX_ITEMS }, () => ({
      active: false,
      kind: 'powerSmall' as ItemKind,
      x: 0,
      y: 0,
      vx: 0,
      vy: -2,
      magnetized: false,
      rise: 'none' as ItemRise,
      timer: 0,
      tx: 0,
      ty: 0,
      sx: 0,
      sy: 0,
    }));
  }

  spawn(kind: ItemKind, x: number, y: number, variant: ItemSpawnVariant = 'normal'): Item | null {
    // `SpawnItem:53-56`: a spawn asked for outside the arcaded band is refused
    // outright, so a burst that strays off the side simply loses those items.
    if (x < -SPAWN_X_MARGIN || x > PLAYFIELD_W + SPAWN_X_MARGIN) return null;
    const item = this.items.find((i) => !i.active);
    if (!item) return null;
    item.active = true;
    // `ItemManager::SpawnItem:57-60`: once the ship is capped, power items fall out
    // of the world as point items instead, so a maxed farm still pays score.
    item.kind =
      this.gs.power >= MAX_POWER && (kind === 'powerSmall' || kind === 'powerBig') ? 'pointSmall' : kind;
    item.x = x;
    item.y = y;
    item.timer = 0;
    item.magnetized = false;
    // `:61-69`: the state a caller asked for is thrown away for both 时符 kinds, so
    // the orb branch is decided by the item type and nothing else.
    const orb = item.kind === 'timeOrb';
    item.rise = orb
      ? variant === 'orbDouble'
        ? 'hoverDouble'
        : 'hover'
      : variant === 'scatter'
        ? 'scatter'
        : 'none';
    if (item.rise === 'scatter') {
      // `:109-116`: the glide runs from the birth point to a random spot up-field,
      // so `startPositionOrVelocity` is repurposed as the near end and velocity is
      // meaningless until the handover at frame 60.
      item.sx = x;
      item.sy = y;
      item.tx = this.gs.rng.randomF32InRange(SCATTER_X_SPAN) + SCATTER_X_OFF;
      item.ty = this.gs.rng.randomF32InRange(SCATTER_Y_SPAN) + SCATTER_Y_OFF;
      item.vx = 0;
      item.vy = 0;
    } else if (orb && !this.shipDying) {
      item.vy = ORB_RISE - this.gs.rng.randomF32InRange(ORB_RISE_JITTER);
      item.vx = this.gs.rng.randomF32SignedInRange(ORB_LEAN);
    } else if (orb) {
      // `:122-127`: a 时符 dropped while the ship is dying is not a hovering one --
      // it becomes a plain item, and the death pile is collectable right away.
      item.rise = 'none';
      item.vx = 0;
      item.vy = DYING_RISE;
    } else {
      item.vx = 0;
      item.vy = RISE_OFF;
    }
    return item;
  }

  /**
   * Advance all items one frame and return what the player picked up.
   *
   * The sweep rule is `ItemManager.cpp:272-289`. A grabbed flag (`state ==
   * ITEM_STATE_AUTOCOLLECT`, set by `AutoCollectAllItems` on a bomb or a dialogue
   * page and by the collection line) pulls everything homing; otherwise items only
   * come in when the ship climbs above `pointItemValueLine`, which is the
   * "fly to the top and bank the whole field" mechanic. Full Power Mode is the
   * 永夜抄 flag that holds the line open everywhere.
   *
   * The retail condition also ORs in the focus flag and shot types 1 and 6, but they
   * sit behind `GetPower() >= 0.0`, which is true for every legal power value, so the
   * whole clause collapses to the position test. That is why this file has no focus
   * argument: the shortcut is provable, not assumed.
   */
  tick(
    playerX: number,
    playerY: number,
    itemBoxHalfExtent: number,
    pointItemValueLine: number,
    fullPowerMode: boolean,
    /** `GaugeIsExtremelyHuman` — doubles every point item's payout. */
    extremeHuman = false,
    /**
     * `g_Player.playerState != DYING && != SPAWNING` (`:278`). While the ship is out
     * of the fight, homing stops and items drift upward instead.
     */
    shipOnField = true,
    /** `plyNNa.sht + 0x14`: how fast a grabbed item flies, 10 or 12. */
    grabSpeed = MAGNET_SPEED,
    /**
     * `plyNNa.sht + 0x34`: the time scale retail puts on free-falling items, both
     * on the position step and on the gravity term (`ItemManager.cpp:207-209`,
     * `:301`, `:313-316`). It is only half of the step: `:210` multiplies it by
     * `g_EclGameTimeScale` before anything reads it, so the two times sit in
     * separate arguments rather than being folded into one number.
     */
    timeScale = 1,
    /**
     * `g_EclGameTimeScale` (`EclGlobals.cpp:117`). It reaches items in three
     * distinct places, and they do not share a multiplier: it scales the team's
     * `+0x34` figure to make the fall/step speed (`:210`), it scales the hover's
     * own `0.05` gravity on its own (`:234`, `:251`), and a grabbed item is
     * integrated by this alone with no `+0x34` in sight (`:284`).
     */
    gameTimeScale = 1,
    /**
     * `g_Player.timerE2AC4 >= 0` (`Player.cpp:3289-3352`, read back at
     * `ItemManager.cpp:236`). The window stays open for twenty frames and then shuts,
     * and the only thing that re-opens it is the fire button. A hovering 时符 that
     * finds it shut comes home without waiting to fall over, which is retail's
     * "stop firing and the orbs come to you".
     */
    shotWindowOpen = true,
  ): CollectResult[] {
    const collected: CollectResult[] = [];
    const sweeping = fullPowerMode || playerY <= pointItemValueLine;
    // `ItemManager.cpp:207-210`: the fall clock is the team's `+0x34` figure with
    // `g_EclGameTimeScale` already multiplied in, and `moveItem` and the gravity
    // term both read that product.
    const speed = timeScale * gameTimeScale;

    for (const item of this.items) {
      if (!item.active) continue;

      // The four `ItemState` branches run before anything else, because in retail
      // they are what decides whether the frame goes on to `moveItem`, straight to
      // `pickup`, or straight out through `executeOnly`.
      let gliding = false;
      let grabbedNow = false;
      if (item.rise === 'scatter') {
        if (item.timer < SCATTER_FRAMES) {
          // `:216-228`: a one-second linear ride from the death point to the target,
          // then `goto pickup` -- no gravity, no bottom cull, no integration.
          const interp = item.timer / SCATTER_FRAMES;
          item.x = item.tx * interp + item.sx * (1 - interp);
          item.y = item.ty * interp + item.sy * (1 - interp);
          gliding = true;
        } else {
          item.vx = 0;
          item.vy = 0;
          item.rise = 'none';
        }
      } else if (item.rise === 'hover') {
        // `:232-246`: the rise burns off at 0.05 a frame, and the orb hands itself to
        // the magnet either when it turns over or when the fire window shuts. The
        // grab is armed rather than applied so this frame still moves on the hover
        // velocity, which is what `moveItem` does in retail.
        // `:234`: the hover's own gravity takes `g_EclGameTimeScale` alone, with
        // no `+0x34` in it.
        item.vy += HOVER_DECEL * gameTimeScale;
        if (item.vy > 0 || !shotWindowOpen) grabbedNow = true;
      } else if (item.rise === 'hoverDouble') {
        // `:249-265`: the graze drop integrates its own motion on top of `moveItem`,
        // so it covers twice the distance while it rises, and while it is still
        // rising nothing else on the frame touches it -- not gravity, not the cull,
        // not the item box.
        item.vy += HOVER_DECEL * gameTimeScale;
        item.x += item.vx * speed;
        item.y += item.vy * speed;
        if (item.vy > 0) grabbedNow = true;
        else {
          item.timer++;
          continue;
        }
      }

      if (!item.magnetized && !grabbedNow && item.rise === 'none' && sweeping) {
        item.magnetized = true;
      }
      if (item.magnetized && !grabbedNow && !shipOnField && item.rise === 'none') {
        // `:287-288`: the grab is dropped and the item resumes its own drift.
        item.magnetized = false;
        item.vy = OFF_FIELD_DRIFT;
      }

      // Magnet pull
      if (item.magnetized && !grabbedNow) {
        const dx = playerX - item.x;
        const dy = playerY - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          item.vx = (dx / dist) * grabSpeed;
          item.vy = (dy / dist) * grabSpeed;
        }
      } else {
        // Proximity magnet
        const dx = playerX - item.x;
        const dy = playerY - item.y;
        if (dx * dx + dy * dy < MAGNET_RADIUS * MAGNET_RADIUS && item.rise !== 'hover') {
          item.magnetized = true;
        }
        // Gravity
        if (item.vy < MAX_FALL) item.vy += GRAVITY * speed;
        else item.vy = MAX_FALL;
      }

      // Free items move on the combined `+0x34 × g_EclGameTimeScale` clock
      // (`:301`); a grabbed one was integrated by `g_EclGameTimeScale` alone the
      // moment the magnet took it (`:284`), and nothing else touches it.
      if (!gliding) {
        const step = item.magnetized && !grabbedNow ? gameTimeScale : speed;
        item.x += item.vx * step;
        item.y += item.vy * step;

        // Cull
        if (item.y > CULL_Y || item.x < -32 || item.x > PLAYFIELD_W + 32) {
          // `ItemManager.cpp:301-304`: letting a free item walk off the bottom of the
          // field costs rank. A grabbed one is not in that state, and a side exit is not
          // the bottom, so neither pays.
          if (item.y > CULL_Y && !item.magnetized && item.rise === 'none') decreaseSubrank(this.gs, 3);
          item.active = false;
          continue;
        }
      }

      if (grabbedNow) {
        item.magnetized = true;
        item.rise = 'none';
      }

      // Pickup. `Player::CalcItemBoxCollision` (`Player.cpp:400-417`) is a
      // square-on-square test, and the item box is the same `plyNNa.sht + 0x18`
      // value the ship got (`ItemManager.cpp:203`), so each axis reaches twice the
      // half-extent.
      //
      // A `hover` (UNK3) item is exempt (`ItemManager.cpp:315`): the box passes
      // straight through a rising 时符, so the only way to bank one is to wait for
      // it to turn over or to let the fire window close.
      const dx = playerX - item.x;
      const dy = playerY - item.y;
      const reach = itemBoxHalfExtent * 2;
      if (item.rise !== 'hover' && Math.abs(dx) < reach && Math.abs(dy) < reach) {
        collected.push(this.collect(item, pointItemValueLine, extremeHuman));
        item.active = false;
        continue;
      }
      item.timer++;
    }

    return collected;
  }

  /**
   * Process one item collection, returning what it pays.
   *
   * The point value keys off the *item's* height, not the ship's: `CollectPoint`
   * reads `item->currentPosition.y` against `pointItemValueLine`, so an item that
   * spawned above the line still pays full even if the ship dives for it.
   */
  private collect(item: Item, line: number, extremeHuman: boolean): CollectResult {
    const base = this.gs.pointItemValue;
    switch (item.kind) {
      case 'powerSmall':
        // `CollectPowerSmall` ends on the shared `increaseSubrank:` label
        // (`ItemManager.cpp:454-455`). `CollectPowerBig` has no such tail, which is why
        // a big P does not creep the ladder and five small ones do.
        return this.subrank(this.result(item, { power: 1, popup: 10 }), 1);
      case 'powerBig':
        return this.result(item, { power: 8, popup: 10 });
      case 'powerFull':
        return this.result(item, { power: MAX_POWER, popup: 1000, fillsPower: true });
      case 'point':
        return this.point(item, line, extremeHuman, base, false);
      case 'pointSmall':
        return this.point(item, line, extremeHuman, base, true);
      case 'life':
        return this.result(item, { life: true });
      case 'bomb':
        // `ItemManager.cpp:332-338`: the B item's own case is the only collect branch
        // that pays five rank points.
        return this.subrank(this.result(item, { bomb: true }), 5);
      case 'extend':
        return this.result(item, { extend: true });
      case 'timeOrb': {
        // `CollectTimeOrb`: 10000 once the stage has handed out 2000 point items,
        // otherwise ten per every two items collected so far, floored at 100.
        const popup =
          this.gs.pointItemsCollectedInStage >= 2000
            ? 10000
            : Math.max(100, Math.trunc(this.gs.pointItemsCollected / 2) * 10);
        return this.result(item, { popup, timeOrb: true });
      }
    }
  }

  /**
   * The 点 branch: value first, then the rank the collect is worth.
   *
   * Split from the value maths below because retail keeps them in different places --
   * `CollectPoint` (`ItemManager.cpp:460-517`) pays rank at `:493-500` while
   * `CollectPointSmall` (`:518-549`) never does.
   */
  private point(
    item: Item,
    line: number,
    extremeHuman: boolean,
    base: number,
    small: boolean,
  ): CollectResult {
    const pay = this.pointValue(item, line, extremeHuman, base, small);
    const out = this.result(item, pay);
    // `CollectPoint` pays its rank after the score: ten for an item that still came
    // down at full value, three for one the ship let drift below the value line
    // (`ItemManager.cpp:493-500`). `CollectPointSmall` (`:518-549`) has neither arm, so
    // a small point item is score only and never moves the ladder.
    if (!small && out.maxValue) increaseSubrank(this.gs, 10);
    else if (!small) increaseSubrank(this.gs, 3);
    return out;
  }

  /** Shared tail: bank a rank payment for one collect branch. */
  private subrank(out: CollectResult, amount: number): CollectResult {
    increaseSubrank(this.gs, amount);
    return out;
  }

  /** `Item::CollectPoint` / `Item::CollectPointSmall` value maths. */
  private pointValue(
    item: Item,
    line: number,
    extremeHuman: boolean,
    base: number,
    small: boolean,
  ): Partial<CollectResult> {
    const below = Math.trunc(item.y - line);
    let raw = item.y < line ? base : Math.trunc(base / 2) - below * Math.trunc(base / 1000);
    let limit = base;
    if (small) {
      limit = Math.trunc(limit / 10);
      limit -= limit % 10;
      raw = Math.trunc(raw / 10);
    }
    raw -= raw % 10;
    const popup = extremeHuman ? raw + raw : raw;
    return { popup, maxValue: popup >= limit, pointItem: true };
  }

  /** Shared tail: turn a raw popup into a result, and roll the extend threshold. */
  private result(item: Item, pay: Partial<CollectResult>): CollectResult {
    const gs = this.gs;
    const popup = pay.popup ?? 0;
    const out: CollectResult = {
      x: item.x,
      y: item.y,
      kind: item.kind,
      power: pay.power ?? 0,
      score: Math.trunc(popup / 10),
      popup,
      maxValue: pay.maxValue ?? false,
    };
    if (pay.fillsPower) out.fillsPower = true;
    if (pay.life) out.life = true;
    if (pay.bomb) out.bomb = true;
    if (pay.extend) out.extend = true;
    if (pay.timeOrb) out.timeOrb = true;
    if (pay.pointItem) {
      gs.pointItemsCollected++;
      gs.pointItemsCollectedInStage++;
      if (out.maxValue) gs.maxValuePointItemsCollected++;
      // `CollectPoint` re-reads the threshold until the count falls behind it again.
      while (gs.pointItemsCollected >= gs.nextPointItemExtendThreshold) {
        gs.pointItemExtendsSoFar++;
        updatePointItemExtendThreshold(gs);
        out.extend = true;
      }
    }
    return out;
  }

  /** Force-collect all active items (stage clear, etc.). */
  collectAll(line: number, extremeHuman = false): CollectResult[] {
    const results: CollectResult[] = [];
    for (const item of this.items) {
      if (!item.active) continue;
      results.push(this.collect(item, line, extremeHuman));
      item.active = false;
    }
    return results;
  }

  /**
   * `ItemManager::ConvertAllPowerItemsToTimeOrbs` (`:659-679`).
   *
   * The name is a lie that has survived in the decompile: the loop assigns
   * `ITEM_POINT_SMALL`, not `ITEM_TIME`, and re-points the sprite at script
   * `ITEM_POINT_SMALL + 61`. So a maxed ship turns every P item still in the air
   * into a small point item that drifts up at 0.5 px/frame, and each conversion
   * pops effect 0. `skip` is the item the player just collected, which retail
   * leaves alone because it is deleted right after.
   *
   * Returns how many were converted, which is how many sparkles the host draws.
   */
  convertPowerItemsToPointSmall(skip?: Item, onConvert?: (x: number, y: number) => void): number {
    let converted = 0;
    for (const item of this.items) {
      if (!item.active || item === skip) continue;
      if (item.kind !== 'powerSmall' && item.kind !== 'powerBig') continue;
      // `:666-671`: only an item that is not already rising gets the drift.
      if (item.vy > -0.5) {
        item.vx = 0;
        item.vy = -0.5;
      }
      item.kind = 'pointSmall';
      // `:673` pops one `SpawnEffect(0, ...)` per converted item, right where
      // it floats, so the sweep reads as a field of sparkles and not just a swap of
      // sprites. The hook keeps the effect pool out of this class.
      onConvert?.(item.x, item.y);
      converted++;
    }
    return converted;
  }

  /**
   * The drop set a death leaves behind, from `Player.cpp:1341-1368`.
   *
   * A death with lives left pays one big P and five small P, plus a bomb item for
   * the sakuya-remilia row -- `shotType` 2, and both of Sakuya's solo rows 8 and 9.
   * Out of lives, retail drops five full-power items instead and takes the whole
   * power bar rather than a 16-point slice.
   *
   * Every one of those spawns asks for `ITEM_STATE_UNK2`, the scatter state: the
   * pile rides out from the wreck to a random point in the upper field over one
   * second and only then hangs. That is the whole reason a death costs more than
   * the power bar -- retail makes you go and get it back piece by piece, so the
   * row this function used to lay out at the ship itself was strictly easier than
   * the original, and read nothing like it.
   */
  spawnDeathDrops(x: number, y: number, shotType: number, hasBombs: boolean, outOfLives: boolean): void {
    if (outOfLives) {
      for (let i = 0; i < 5; i++) {
        this.spawn('powerFull', x, y, 'scatter');
      }
      return;
    }
    this.spawn('powerBig', x, y, 'scatter');
    for (let i = 0; i < 5; i++) {
      this.spawn('powerSmall', x, y, 'scatter');
    }
    if (teamRowForShotType(shotType) === 2 && hasBombs) {
      this.spawn('bomb', x, y, 'scatter');
    }
  }

  /**
   * `ItemManager::AutoCollectAllItems` (`:647-656`): every item on the field starts
   * homing. A bomb and each page of a dialogue both call it, which is why dropping a
   * card in the middle of a cutscene banks the whole screen.
   */
  autoCollectAll(): void {
    for (const item of this.items) {
      if (!item.active) continue;
      item.magnetized = true;
      // `:650-653` overwrites the state unconditionally, so a hovering 时符 is
      // released by a bomb too and a death pile stops gliding.
      item.rise = 'none';
      item.vx = 0;
      item.vy = AUTOCOLLECT_DRIFT;
    }
  }

  /**
   * `ItemManager::CancelAutoCollect` (`:682-693`): drop the grab on anything that had
   * it and hand it back to its own upward drift. `Player::Die` calls it on the hit
   * and again once the drop pile has spawned, so a death never flies the player's own
   * P items off into the past.
   */
  cancelAutoCollect(): void {
    for (const item of this.items) {
      if (!item.active || !item.magnetized) continue;
      item.magnetized = false;
      // `:687-692` writes ITEM_STATE_DEFAULT, so anything still on its own rise
      // is put back on the same footing.
      item.rise = 'none';
      item.vx = 0;
      item.vy = CANCEL_DRIFT;
    }
  }

  get activeCount(): number {
    let n = 0;
    for (const i of this.items) if (i.active) n++;
    return n;
  }

  /**
   * `ItemManager::GetTimeOrbCount` (`ItemManager.cpp:758`): the 时符 still lying
   * on the field, unwon. ECL register 0x2772 adds it to the collected count, so
   * a boss reads it to decide whether the last spell is still payable.
   */
  get timeOrbCount(): number {
    let n = 0;
    for (const i of this.items) if (i.active && i.kind === 'timeOrb') n++;
    return n;
  }
}

export interface CollectResult {
  kind: ItemKind;
  /** Power points granted (`ITEM_POWER_*`). */
  power: number;
  /** Score added to the read-out: `GameManager::AddScore(popup)` = popup / 10. */
  score: number;
  /** The raw number retail floats over the pickup (`AsciiManager::CreateScorePopup`). */
  popup: number;
  /** Where the float anchors: retail uses the item's own position. */
  x: number;
  y: number;
  /** Gold popup: the item paid its maximum value. */
  maxValue: boolean;
  fillsPower?: boolean;
  life?: boolean;
  bomb?: boolean;
  /** An 延长 item, or a point item that just crossed the extend threshold. */
  extend?: boolean;
  timeOrb?: boolean;
  /** Internal: this pickup is a 点 item, so it counts and can extend. */
  pointItem?: boolean;
}
