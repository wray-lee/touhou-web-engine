/**
 * Death, grace window, and respawn timing, ported straight out of `Player.cpp`.
 *
 * Two classes used to carry their own copy of these numbers -- `Player` for the
 * presentation path and `PlayerSim` for the ECL path -- which is how a 240-frame
 * post-respawn invulnerability with no source in the disassembly survived. Both
 * now read the single model defined here.
 *
 * Retail life cycle (`Player::Die` `:529-616`, `FUN_0044cbf0` `:1309-1415`,
 * `FUN_0044d180` `:1418-1447`):
 *
 *   hit  -> DYING with a *deathbomb window*: the ship sits on the death spot,
 *           white, one 时符 spent per frame, and a card press inside the window
 *           comes out as the partner's deathbomb variant.
 *        -> window empty: the ship squashes flat and fades over 30 frames.
 *        -> SPAWNING for 30 frames: a bright streak unfolds back into the ship.
 *        -> ALIVE with a 60-frame full-screen bullet cancel, and nothing else.
 *
 * There is deliberately **no post-respawn invulnerability** in the reference.
 * Immunity is `playerState != PLAYER_STATE_ALIVE`; the mercy mechanic is the
 * 60-frame bullet-cancel volume that `FUN_0044d2c0:1451-1455` keeps re-inserting
 * through `playerStateSlotCooldown`.
 */

/** Frames of the flat-and-fade death animation (`FUN_0044cbf0:1374-1383`). */
export const DEATH_FRAMES = 30;
/** Frames of the spawn-in streak (`FUN_0044d180:1433`). */
export const SPAWN_FRAMES = 30;
/** Frames the post-respawn bullet-cancel volume stays open (`:1422`, `:1451`). */
export const BULLET_CANCEL_FRAMES = 60;
/** 时符 bled per frame of the grace window (`:1315`). */
export const DEATHBOMB_ORB_DRAIN = -15;
/** Grace frames bought per bomb still held (`Die:553-554`). */
export const GRACE_FRAMES_PER_BOMB = 6;
/** Extra grace when the 时符 counter clears the last-spell threshold (`:555-556`). */
export const GRACE_LAST_SPELL_BONUS = 7;
/** Grace clamp with no enemy spell card out (`:557-558`). */
export const GRACE_MAX = 15;
/** Grace clamp while an enemy spell card is active (`:560-566`). */
export const GRACE_SPELL_MAX = 30;
/** Grace with no bombs left, and the floor `acceptBomb` may still spend from (`:545`, `:610`). */
export const GRACE_WITHOUT_BOMBS = 2;
/**
 * `plyNNa.sht + 0x08`: `acceptBomb` adds 6 back to the grace counter after every
 * card and clamps it to this (`:1290-1296`), and spawn-in refills it (`:1444`).
 * Measured 18 / 10 / 10 / 12 for the four teams.
 */
export const DEATHBOMB_BUDGET_BY_TEAM = [18, 10, 10, 12] as const;

/**
 * Non-duo shot types are the four human characters flying alone, two rows each
 * (`Player.cpp:3104`, `Player.cpp:1353-1354`): 4/5 霊夢, 6/7 魔理沙, 8/9 咲夜,
 * 10/11 妖夢.
 */
export function soloCharacterIndex(shotType: number): number {
  return Math.floor((shotType - 4) / 2);
}

/**
 * Team row a shot type belongs to: 0-3 are the duos, and the solo rows 4..11 fold
 * back onto the pair of the character flying alone.
 */
export function teamRowForShotType(shotType: number): number {
  return shotType < 4 ? shotType : soloCharacterIndex(shotType);
}

/** Reimu's team row and both of her solo rows buy grace 9/5 as fast (`:568-573`). */
export function isReimuShotType(shotType: number): boolean {
  return shotType === 0 || shotType === 4 || shotType === 5;
}

export interface GraceWindowInput {
  /** `GetBombsRemaining()`. */
  bombs: number;
  /** `GetTimeOrbs()`. */
  timeOrbs: number;
  /**
   * `globals->lastSpellTimeOrbThreshold`. Read at `:555` and never assigned in
   * any function we have decompiled, so this stays an input rather than a claim.
   */
  lastSpellTimeOrbThreshold: number;
  /** `g_Spellcard.IsActive()` -- an enemy spell card is on screen. */
  spellCardActive: boolean;
  shotType: number;
}

/**
 * How many frames the ship waits on the death spot before it actually dies, which
 * is also how long a deathbomb press stays legal. `Player::Die` `:551-573`.
 */
export function graceWindowFrames(input: GraceWindowInput): number {
  if (input.bombs < 1) return GRACE_WITHOUT_BOMBS;

  let frames = input.bombs * GRACE_FRAMES_PER_BOMB;
  if (input.timeOrbs >= input.lastSpellTimeOrbThreshold) frames += GRACE_LAST_SPELL_BONUS;
  frames = Math.min(frames, GRACE_MAX);
  if (input.spellCardActive) frames = Math.min(frames * 2, GRACE_SPELL_MAX);
  if (isReimuShotType(input.shotType)) frames = Math.floor((frames * 9) / 5);
  return frames;
}

/**
 * Total frames spent in `dying`: the grace window, then the 30-frame dissolve.
 * The window runs first and the animation only starts once it is empty
 * (`FUN_0044cbf0:1313` takes the countdown branch, `:1372` the animation).
 */
export function dyingFrames(window: number): number {
  return window + DEATH_FRAMES;
}

/** `plyNNa.sht + 0x08`: the grace counter spawn-in arms, and the ceiling `acceptBomb` clamps to. */
export function deathbombBudget(shotType: number): number {
  return DEATHBOMB_BUDGET_BY_TEAM[teamRowForShotType(shotType) & 3] ?? 10;
}

/** Bombs spent by a card (`acceptBomb:1244-1271`). */
export function bombCost(deathbomb: boolean, bombs: number): number {
  if (!deathbomb) return 1;
  return bombs < 2 ? Math.max(0, bombs) : 2;
}

/** Grace counter after a card (`:1290-1296`), clamped by the team's `.sht` budget. */
export function graceAfterBomb(window: number, shotType: number): number {
  return Math.min(window + 6, deathbombBudget(shotType));
}

export interface ShipTransform {
  scaleX: number;
  scaleY: number;
  /** 0..1 opacity. */
  alpha: number;
  /** Retail swaps to additive blending for both of these animations. */
  additive: boolean;
  /** Held white while the deathbomb window runs out (`Die:577-582`). */
  whiteout: boolean;
}

const IDENTITY: ShipTransform = {
  scaleX: 1,
  scaleY: 1,
  alpha: 1,
  additive: false,
  whiteout: false,
};

/** A frame of the 30-frame death dissolve: `timer` counts up from 0. */
export function deathScale(timer: number): ShipTransform {
  if (timer >= DEATH_FRAMES) return IDENTITY;
  const v = Math.max(0, timer) / DEATH_FRAMES;
  return {
    scaleX: 3 * v + 1,
    scaleY: 1 - v,
    alpha: 1 - v,
    additive: true,
    whiteout: false,
  };
}

/** A frame of the 30-frame spawn-in: `timer` counts up from 0. */
export function spawnScale(timer: number): ShipTransform {
  if (timer >= SPAWN_FRAMES) return IDENTITY;
  const t = Math.max(0, timer);
  const value = 1 - t / 60;
  return {
    scaleX: 2 * value + 1,
    scaleY: 1 - value,
    alpha: Math.min(1, (t * 255) / 30 / 255),
    additive: true,
    whiteout: false,
  };
}

/** Where the ship is in its life cycle right now, for the renderer. */
export function shipTransform(
  state: 'alive' | 'dying' | 'respawning' | 'dead',
  stateTimer: number,
  windowLeft = 0,
): ShipTransform {
  if (state === 'dying') {
    // The grace window holds the ship still and white on the death spot; the
    // dissolve only starts after it runs out (`FUN_0044cbf0:1313` vs `:1372`).
    if (windowLeft > 0) return { ...IDENTITY, whiteout: true };
    return deathScale(DEATH_FRAMES - stateTimer);
  }
  if (state === 'respawning') return spawnScale(SPAWN_FRAMES - stateTimer);
  return IDENTITY;
}
