/**
 * 永夜抄's human/youkai meter (妖率计), ported from `Player.cpp:924-967` with the
 * bounds table at `Player.cpp:1666-1697`.
 *
 * The gauge is signed: negative is the human side, positive the youkai side, and
 * `add()` clamps it to the team's bounds exactly like `AddToYoukaiGauge`
 * (`GameManager.cpp:1404-1415`). Firing pushes the meter *toward whichever form
 * is flying*, and the longer the trigger is held the harder it pushes; letting go
 * relaxes it back to neutral. Reaching an extreme is what unlocks the retail
 * graze and score bonuses and paints the aura behind the ship.
 *
 * Reference names: `timerE2AC4` (shoot window, 20-frame cycle), `timerE2AE8`
 * (`charge`, continuous firing frames), `timerE2AD0` (`idle`).
 */

/** One team's six gauge bounds, in retail units. */
export interface GaugeBounds {
  /** Most negative value the meter can reach (humanLimit, bounds[0]). */
  humanLimit: number;
  /** Most positive value the meter can reach (youkaiLimit, bounds[1]). */
  youkaiLimit: number;
  /** bounds[2] — at or below this is "extremely human". */
  extremeHuman: number;
  /** bounds[3] — at or above this is "extremely youkai". */
  extremeYoukai: number;
  /** bounds[4] — at or below this is "moderately human". */
  moderateHuman: number;
  /** bounds[5] — at or above this is "moderately youkai". */
  moderateYoukai: number;
}

/** The paired-team default: ±10000 limits, ±8000 extreme, ±2000 moderate. */
export const PAIRED_BOUNDS: GaugeBounds = {
  humanLimit: -10000,
  youkaiLimit: 10000,
  extremeHuman: -8000,
  extremeYoukai: 8000,
  moderateHuman: -2000,
  moderateYoukai: 2000,
};

/**
 * shotType 3 is the Youmu/Yuyuko pair and 10 is Youmu alone; both compress the
 * human side so her cards stay reachable. Solos lose access to the far half of
 * the meter entirely, which is what makes a solo team never flash the opposite
 * aura.
 */
export function gaugeBoundsFor(shotType: number): GaugeBounds {
  const b: GaugeBounds = { ...PAIRED_BOUNDS };
  if (shotType === 3) {
    b.humanLimit = -5000;
    b.extremeHuman = -3000;
    b.moderateHuman = -2000;
  } else if (shotType === 10) {
    b.humanLimit = -5000;
    b.extremeHuman = -3000;
    b.moderateHuman = -2000;
    b.youkaiLimit = 5000;
    b.extremeYoukai = 3000;
    b.moderateYoukai = 2000;
  } else if (shotType >= 4) {
    // Paired teams above are handled above; the rest are the solo members.
    const soloHuman = shotType % 2 === 0;
    if (soloHuman) {
      b.youkaiLimit = 2000;
      b.extremeYoukai = 8000;
      b.moderateYoukai = 2001;
    } else {
      b.humanLimit = -2000;
      b.extremeHuman = -8000;
      b.moderateHuman = -2001;
    }
  }
  return b;
}

/** `GaugeIsExtremelyHuman` — the meter is pinned deep on the human side. */
export function isExtremelyHuman(value: number, b: GaugeBounds): boolean {
  return value <= b.extremeHuman;
}

/** `GaugeIsModeratelyHuman`. */
export function isModeratelyHuman(value: number, b: GaugeBounds): boolean {
  return value <= b.moderateHuman;
}

/** `GaugeIsModeratelyYoukai`. */
export function isModeratelyYoukai(value: number, b: GaugeBounds): boolean {
  return value >= b.moderateYoukai;
}

/** `GaugeIsExtremelyYoukai`. */
export function isExtremelyYoukai(value: number, b: GaugeBounds): boolean {
  return value >= b.extremeYoukai;
}

/** Frames of held fire before the push maxes out (`Player.cpp:934`). */
const CHARGE_CAP = 300;
/** Per-frame push once the charge is full. */
const CHARGE_MAX_DELTA = 21;
/** Frames of held fire that keep the shoot window open (`Player.cpp:3326`). */
const SHOOT_WINDOW = 20;
/** Firing gaps shorter than this do not bleed off the charge. */
const CHARGE_HOLD = 4;
/** Only after this many idle frames does the meter start relaxing. */
const RELAX_DELAY = 30;
/** `Player.cpp:949` — anything this close to neutral snaps to zero. */
const NEUTRAL_SNAP = 9;

export interface GaugeTick {
  /** Fire button held (retail cycles a 20-frame window while this is true). */
  shooting: boolean;
  /** True while the youkai half of the team is flying. */
  isYoukai: boolean;
  /** `g_EclGameTimeScale`; slows the meter down with the rest of the stage. */
  timeScale?: number;
}

export class YoukaiGauge {
  /** Signed meter value in retail units. */
  value = 0;
  /**
   * `g_Player.bombState.frameStop`, mirrored in by the stage runner. Retail refuses
   * every unfunded push while a spell card is playing
   * (`GameManager.cpp:1406-1407`), so a graze or a 时符 cannot move the meter under
   * a bomb -- only the card's own forced swing can.
   */
  frameStop = false;
  /** Frames the fire button has been held, saturating at `CHARGE_CAP`. */
  charge = 0;
  /** Frames since the fire button was released. */
  idle = 0;
  /** Position in the retail 20-frame shoot window; -1 when the window is shut. */
  private shootTimer = -1;

  constructor(public bounds: GaugeBounds = PAIRED_BOUNDS) {}

  /**
   * `AddToYoukaiGauge(amount, forceUpdate)`: apply a signed push and clamp to the
   * team's bounds. `force` is retail's second argument, which buys the push past a
   * live card's freeze.
   */
  add(amount: number, force = false): void {
    if (!Number.isFinite(amount) || amount === 0) return;
    if (this.frameStop && !force) return;
    const next = this.value + amount;
    this.value = Math.max(this.bounds.humanLimit, Math.min(this.bounds.youkaiLimit, next));
  }

  /** `SetYoukaiGauge`. */
  set(value: number): void {
    this.value = Math.max(this.bounds.humanLimit, Math.min(this.bounds.youkaiLimit, value));
  }

  /** One frame of `Player.cpp:924-967`. */
  tick({ shooting, isYoukai, timeScale = 1 }: GaugeTick): void {
    if (shooting && this.shootTimer < 0) this.shootTimer = 0;
    if (this.shootTimer >= 0) {
      this.shootTimer++;
      if (this.shootTimer >= SHOOT_WINDOW) this.shootTimer = -1;
    }

    if (this.shootTimer >= 0) {
      // A hold-off left over from a form switch or an enemy death delays the push.
      if (this.idle > 0) {
        this.idle--;
      } else {
        const magnitude = this.charge > CHARGE_CAP ? CHARGE_MAX_DELTA : Math.floor(this.charge / 15);
        this.add(magnitude * timeScale * (isYoukai ? 1 : -1));
        this.charge++;
      }
      return;
    }

    if (this.idle >= CHARGE_HOLD) this.charge = 0;
    if (this.idle >= RELAX_DELAY) {
      if (Math.abs(this.value) <= NEUTRAL_SNAP) {
        this.value = 0;
      } else {
        this.add(this.relaxDelta() * timeScale);
      }
    } else {
      this.idle++;
    }
  }

  /** The relaxation step, whose size grows with how extreme the meter is. */
  private relaxDelta(): number {
    const b = this.bounds;
    if (isExtremelyYoukai(this.value, b)) return -5;
    if (isModeratelyYoukai(this.value, b)) return -3;
    if (this.value > 0) return -2;
    if (!isModeratelyHuman(this.value, b)) return 2;
    if (!isExtremelyHuman(this.value, b)) return 3;
    return 5;
  }

  /**
   * `EnemyManager.cpp:363-369` — killing a boss-attached enemy drags the meter a
   * twelfth of the way back to neutral and forces the relaxation branch.
   */
  onEnemyDeath(): void {
    this.add(-this.value / 12);
    this.charge = 0;
    this.idle = RELAX_DELAY;
  }

  /**
   * `ItemManager.cpp:638-643` — a 时符 pushes the meter toward whichever form is
   * flying, but only while the post-kill hold-off has run out.
   */
  onTimeOrb(isYoukai: boolean, holdoffFrames: number): void {
    if (holdoffFrames !== 0) return;
    this.add(isYoukai ? 111 : -111);
  }

  /**
   * `Player.cpp:487-508` — a graze is worth more on the human side and scores
   * more on the youkai side, and grazing in youkai form feeds the meter.
   */
  onGraze(): { grazeGain: number; score: number; gaugeGain: number } {
    const b = this.bounds;
    const grazeGain = isExtremelyHuman(this.value, b) ? 3 : isModeratelyHuman(this.value, b) ? 2 : 1;
    const score = isModeratelyYoukai(this.value, b) ? 4000 : 2000;
    return { grazeGain, score, gaugeGain: 100 };
  }

  /** `Player.cpp:550` — dying always resets the meter to neutral. */
  onDeath(): void {
    this.value = 0;
    this.charge = 0;
    this.idle = 0;
    this.shootTimer = -1;
  }

  /** 0 = pinned human, 0.5 = neutral, 1 = pinned youkai. For the HUD. */
  normalized(): number {
    const span = this.bounds.youkaiLimit - this.bounds.humanLimit;
    if (span <= 0) return 0.5;
    return (this.value - this.bounds.humanLimit) / span;
  }

  /** True while retail paints the extreme aura behind the ship (`Player.cpp:969`). */
  isExtreme(): boolean {
    const b = this.bounds;
    return isExtremelyHuman(this.value, b) || isExtremelyYoukai(this.value, b);
  }

  /**
   * `GameManager::GaugeIsExtremelyHuman` — the meter is pinned deep enough on the
   * human side that every 点 item pays double (`ItemManager.cpp:476,537`).
   */
  isExtremelyHuman(): boolean {
    return isExtremelyHuman(this.value, this.bounds);
  }

  /**
   * `GameManager::GaugeIsExtremelyYoukai` (`GameManager.hpp:180-183`). The youkai
   * mirror of the row above: it doubles nothing, but it is where the +6 % shot
   * damage comes from (`Player.cpp:3495-3496`).
   */
  isExtremelyYoukai(): boolean {
    return isExtremelyYoukai(this.value, this.bounds);
  }
}
