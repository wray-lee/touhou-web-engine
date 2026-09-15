/**
 * The retail player-shot damage pipeline.
 *
 * Two halves of `th08web-ref` describe one frame of a hit, and neither of them
 * looks like "one bullet, one hit point":
 *
 *  - `Player::FUN_00451670` (`Player.cpp:3363-3498`) walks all 128 shot slots for a
 *    single enemy and returns the *sum* of every shot whose box overlaps the
 *    enemy's box, scaled by the youkai side of the meter;
 *  - `EnemyManagerUpdate.cpp:640-721` then caps that sum, pays the damage score,
 *    divides it by seven while a spell card is live, and divides it by nine for a
 *    boss inside an op-160 freeze.
 *
 * Applying `min(cap, shot.damage)` per bullet -- which is what this repo did -- gets
 * both ends wrong at once: a seven-shot volley that lands together is worth seven
 * separate hits instead of one capped frame, and a spell card takes full damage as
 * if nothing were different. The card divisor is the reason retail cards feel like
 * cards.
 */

import type { CollisionStats } from './Collision';

/** `EnemyManagerUpdate.cpp:684-685`: `if (damage >= 70) damage = 70;`. */
export const MAX_FRAME_DAMAGE = 70;

/** `EnemyManagerUpdate.cpp:694-697`: a live spell card divides non-bomb damage by 7. */
export const SPELL_CARD_DAMAGE_DIVISOR = 7;

/** `Player.cpp:3404`: while Sakuya's clock is stopped each shot pays a fifth. */
export const FREEZE_SHOT_DAMAGE_DIVISOR = 5;

/** `Player.cpp:3495-3496`: `damage = damage * 106 / 100` on the extreme youkai side. */
export const EXTREME_YOUKAI_DAMAGE_PERCENT = 106;

/** `EnemyManagerUpdate.cpp:710-716`: op 160 freezes damage to a ninth for a boss. */
export const FREEZE_TIMER_BOSS_DIVISOR = 9;

/**
 * `EnemyManagerUpdate.cpp:660-664`: the secondary hitbox (`setBoundsAlt`, op 78)
 * adds its own hit total back in, heavily damped. The Youmu team damps it harder
 * because her two hitboxes overlap so much that the raw sum would double-count.
 */
export const SECONDARY_HITBOX_DIVISOR = 1.7;
export const SECONDARY_HITBOX_DIVISOR_TEAM_C = 6.5;

/** `Player.cpp:1728-1731`: the damage-to-时符 exchange rate, per ship flavour. */
export const DAMAGE_ORB_THRESHOLD_SOLO_HUMAN = 27;
export const DAMAGE_ORB_THRESHOLD_OTHER = 40;

/** Shot types whose secondary hitbox is damped by 6.5 (`shotType` 3 and 11). */
export const SECONDARY_HITBOX_DAMPED_TEAMS = [3, 11] as const;

/** The ship-side conditions the pipeline reads. */
export interface ShotDamageContext {
  /** `g_Player.bombState.frameStop` -- Sakuya's clock-stop cards. */
  frameStop: boolean;
  /** `GameManager::GaugeIsExtremelyYoukai`. */
  extremelyYoukai: boolean;
  /** `g_Spellcard.IsActive()`. */
  spellActive: boolean;
  /** Raw 0..11 shot type, which picks the secondary-hitbox damping. */
  shotType: number;
  /** Optional out-param: count the pair tests, for the debug overlay. */
  stats?: CollisionStats;
}

/**
 * One live player shot, seen from the sim side.
 *
 * The host owns the shot's real storage -- the presentation `BulletSystem` in the
 * browser, the same thing under replay -- and hands over a view whose `active`
 * setter can retire it. `radius` is optional because retail never writes
 * `PlayerShot::hitboxSize` for a straight shot (`Player.cpp` only touches it for the
 * homing options at `:2940`, `:2994` and `:3063-3067`), so the default is the point
 * test that a zero-size box reduces to.
 */
export interface ShotView {
  readonly x: number;
  readonly y: number;
  readonly damage: number;
  active: boolean;
  radius?: number;
}

/** The enemy-side conditions the pipeline reads. */
export interface ShotDamageTarget {
  /** `EMUF1_BOSS` (`enemy+0x3324` bit 1, owned by op 127). */
  boss: boolean;
  /** `EMUF1_DAMAGEABLE`: HP subtraction is gated separately from the score. */
  damageable: boolean;
  /** `enemy+0x5354`, armed by op 160 and counted down once per frame. */
  freezeFrames: number;
}

export interface ShotDamageResult {
  /** HP actually removed, after every divisor. */
  damage: number;
  /** `AddScore(10 * (damage / 5))`, off the capped pre-card value (`:686`). */
  score: number;
  /** 时符 earned off the damage accumulator this frame. */
  timeOrbs: number;
}

/**
 * One shot's contribution (`Player.cpp:3401-3404`).
 *
 * Under a clock stop a shot still lands, it just lands for a fifth -- and never for
 * zero, which is what keeps Sakuya's own card from becoming a no-op against a
 * low-damage weapon.
 */
export function shotContribution(damage: number, frameStop: boolean): number {
  if (!frameStop) return damage;
  const fifth = Math.trunc(damage / FREEZE_SHOT_DAMAGE_DIVISOR);
  return fifth !== 0 ? fifth : 1;
}

/** `Player.cpp:3495-3496`, applied to the summed hit before the caller caps it. */
export function applyYoukaiDamageBonus(sum: number, extremelyYoukai: boolean): number {
  if (!extremelyYoukai || sum === 0) return sum;
  return Math.trunc((sum * EXTREME_YOUKAI_DAMAGE_PERCENT) / 100);
}

/** The damping applied to a secondary hitbox's own hit total (`:660-664`). */
export function secondaryHitboxDivisor(shotType: number): number {
  return (SECONDARY_HITBOX_DAMPED_TEAMS as readonly number[]).includes(shotType)
    ? SECONDARY_HITBOX_DIVISOR_TEAM_C
    : SECONDARY_HITBOX_DIVISOR;
}

/**
 * Fold a secondary hitbox's hits into the primary total.
 *
 * The division is float, then truncated once at the end -- `(i32)((f32)damage +
 * (f32)extraDamage / 1.7f)` -- so rounding happens on the sum, not per term.
 */
export function addSecondaryHitbox(primary: number, extra: number, shotType: number): number {
  return Math.trunc(primary + extra / secondaryHitboxDivisor(shotType));
}

/**
 * `EnemyManagerUpdate.cpp:684-718` for one enemy and one frame.
 *
 * `rawDamage` is what `FUN_00451670` returned, already youkai-scaled. `bombHit` is
 * the flag `FUN_00451670` raises at `Player.cpp:3490` when the damage came out of a
 * bomb's region while the clock was stopped.
 *
 * A bomb that lands during a live card is written as
 * `FUN_0042DFF0() ? damage / 2.5 : 0`, and `FUN_0042DFF0` reads bit 7 of
 * `g_Spellcard.flags` -- which `StartSpell` clears (`Spellcard.cpp:770`) and nothing
 * in the whole decompile ever sets. So the `/2.5` arm is dead in 永夜抄 and a stopped
 * clock contributes no card damage at all; that is modelled here rather than
 * invented.
 */
export function resolveShotDamage(
  rawDamage: number,
  target: ShotDamageTarget,
  ctx: ShotDamageContext,
  bombHit = false,
): ShotDamageResult {
  let damage = rawDamage;
  if (damage <= 0) return { damage: 0, score: 0, timeOrbs: 0 };
  if (damage >= MAX_FRAME_DAMAGE) damage = MAX_FRAME_DAMAGE;

  const score = 10 * Math.trunc(damage / 5);
  if (!target.damageable) return { damage: 0, score, timeOrbs: 0 };

  if (ctx.spellActive) {
    if (!bombHit) {
      damage = damage > SPELL_CARD_DAMAGE_DIVISOR ? Math.trunc(damage / SPELL_CARD_DAMAGE_DIVISOR) : 1;
    } else {
      damage = 0;
    }
  }

  if (target.freezeFrames > 0) {
    damage = target.boss ? Math.trunc(damage / FREEZE_TIMER_BOSS_DIVISOR) : 0;
  }

  return { damage, score, timeOrbs: 0 };
}

/**
 * `Player.cpp:3406-3414` plus `:1728-1731`.
 *
 * Every hit is added to a per-enemy accumulator (capped at 50 first, `:3435`), and
 * each time it crosses the threshold the accumulator is reduced and -- on the
 * extreme human side only -- three 时符 drop where the shot was. That exchange is
 * the human team's answer to the youkai team's damage bonus, so it has to run off
 * the same numbers the damage does.
 */
export function advanceHitAccumulator(
  accumulator: number,
  damage: number,
  threshold: number,
  extremelyHuman: boolean,
): { accumulator: number; timeOrbs: number } {
  let next = accumulator + (damage > 50 ? 50 : damage);
  let orbs = 0;
  while (next >= threshold) {
    next -= threshold;
    if (extremelyHuman) orbs += 3;
  }
  return { accumulator: next, timeOrbs: orbs };
}

/**
 * `GameManager::IsSoloHuman` (`GameManager.hpp:154-157`): one of the four solo
 * human ships, which is the flavour that gets the tighter exchange rate.
 */
export function isSoloHumanShotType(shotType: number): boolean {
  return shotType >= 4 && (shotType & 1) === 0;
}

/** Which exchange rate the ship in play uses (`Player.cpp:1728-1731`). */
export function damageOrbThreshold(shotType: number): number {
  return isSoloHumanShotType(shotType) ? DAMAGE_ORB_THRESHOLD_SOLO_HUMAN : DAMAGE_ORB_THRESHOLD_OTHER;
}
