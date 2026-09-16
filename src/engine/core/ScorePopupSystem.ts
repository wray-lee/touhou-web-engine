/**
 * Floating score numbers, the way the Windows-era games draw them.
 *
 * `AsciiManager::CreateScorePopup` stores a pickup as a run of digit cells, and
 * `AsciiManager::DrawPopups` walks them at an 8-pixel advance while
 * `AsciiManager.cpp:173-177` lifts the whole run half a pixel a frame for 60 frames.
 * Two details make it read as original rather than as generic floating text:
 *
 * - The digits live in three banks of eleven cells (`AsciiManager.cpp:1637-1651`).
 *   A popup spends frames 0..51 in bank A, 52..55 in bank B, and the rest in bank C,
 *   which is the little flicker every number does before it dies.
 * - Opacity is driven by the distance to the *ship*, not by age: a popup that is still
 *   next to the player stays at 80/255 and only brightens to 208/255 as it drifts
 *   away, so a pile of pickups never washes out the hitbox.
 */
import {
  HUD_POPUP_ALPHA_FAR,
  HUD_POPUP_ALPHA_NEAR,
  HUD_POPUP_LIFETIME,
  HUD_POPUP_RISE,
  HUD_POPUP_STAR_CELL,
} from './HudLayout';

/** `0xAARRGGBB`, the form the decompilation hands around. */
export const POPUP_COLOR_MAX = 0xffffff00;
export const POPUP_COLOR_NORMAL = 0xffffffff;
/**
 * A 时符 collected once the Last Spell threshold is met (`ItemManager.cpp:630` picks this
 * one over white). Retail's literal is `0xdfffef80` -- amber with the `0xDF` alpha most of
 * its in-stage floats carry -- and the alpha is dropped here for the same reason every
 * other popup colour drops it.
 */
export const POPUP_COLOR_TIME_PAID = 0xffef80;
export const POPUP_COLOR_POWER_UP = 0xffffc0a0;

export interface ScorePopup {
  inUse: boolean;
  /** Playfield-space anchor, before the per-frame rise. */
  x: number;
  y: number;
  /** Most significant digit last, i.e. the order `CreateScorePopup` fills. */
  digits: number[];
  color: number;
  timer: number;
  /** `AsciiManager::SetScale` in force at creation; 1 is an ordinary pickup. */
  scale: number;
}

/** One drawable popup in canvas space, handed to the renderer each frame. */
export interface ScorePopupView {
  x: number;
  y: number;
  digits: number[];
  color: number;
  bank: number;
  alpha: number;
  scale: number;
}

/** `ASCII_MAX_SCORE_POPUPS` is small in the original; 48 keeps a bullet-hell sweep legible. */
export const MAX_SCORE_POPUPS = 48;

const BANK_OFFSETS = [0, 11, 21] as const;
/** `AsciiManager.cpp:1637-1651`: the frame boundaries between the three banks. */
const BANK_B_FRAME = 52;
const BANK_C_FRAME = 56;
/** Squared distance breakpoints from `AsciiManager.cpp:1618-1629`. */
const NEAR_SQ = 1024;
const FAR_SQ = 4096;

export class ScorePopupSystem {
  private readonly pool: ScorePopup[] = Array.from({ length: MAX_SCORE_POPUPS }, () => ({
    inUse: false,
    x: 0,
    y: 0,
    digits: [],
    color: POPUP_COLOR_NORMAL,
    timer: 0,
    scale: 1,
  }));
  private cursor = 0;

  /**
   * Float `value` over (x, y). A negative value is the shot-level-up star rather than
   * a number, which is exactly how `Item::CollectPowerSmall` asks for it.
   *
   * `scale` doubles the whole run, which is how the card-capture totals read bigger
   * than a pickup (`AsciiManager::SetScale` before `CreateTimePopup`).
   */
  spawn(x: number, y: number, value: number, color = POPUP_COLOR_NORMAL, scale = 1): void {
    const popup = this.pool[this.cursor];
    this.cursor = (this.cursor + 1) % MAX_SCORE_POPUPS;
    popup.inUse = true;
    popup.x = x;
    popup.y = y;
    popup.color = color;
    popup.timer = 0;
    popup.scale = scale > 0 ? scale : 1;
    popup.digits =
      value < 0
        ? [HUD_POPUP_STAR_CELL]
        : value === 0
          ? [0]
          : (() => {
              const digits: number[] = [];
              let n = value;
              while (n > 0) {
                digits.push(n % 10);
                n = Math.floor(n / 10);
              }
              return digits;
            })();
  }

  /** Rise every live popup and retire the ones that have run out their 60 frames. */
  update(): void {
    for (const popup of this.pool) {
      if (!popup.inUse) continue;
      popup.y -= HUD_POPUP_RISE;
      popup.timer++;
      if (popup.timer > HUD_POPUP_LIFETIME) popup.inUse = false;
    }
  }

  /** Bank index for a popup age, matching the three sprite ranges in `DrawPopups`. */
  static bankFor(timer: number): number {
    return timer < BANK_B_FRAME ? 0 : timer < BANK_C_FRAME ? 1 : 2;
  }

  /**
   * `AsciiManager.cpp:1615-1629`: distance from the ship sets opacity, so a popup that
   * spawns on top of the player is deliberately faint and brightens as it drifts away.
   */
  static alphaFor(popupX: number, popupY: number, playerX: number, playerY: number): number {
    const dx = playerX - popupX;
    const dy = playerY - popupY;
    const d2 = dx * dx + dy * dy;
    if (d2 > FAR_SQ) return HUD_POPUP_ALPHA_FAR;
    if (d2 > NEAR_SQ) return (((d2 - NEAR_SQ) << 7) / (FAR_SQ - NEAR_SQ) + HUD_POPUP_ALPHA_NEAR) | 0;
    return HUD_POPUP_ALPHA_NEAR;
  }

  /** Canvas-space views for this frame; (offsetX, offsetY) maps playfield to canvas. */
  view(playerX: number, playerY: number, offsetX: number, offsetY: number): ScorePopupView[] {
    const out: ScorePopupView[] = [];
    for (const popup of this.pool) {
      if (!popup.inUse) continue;
      out.push({
        x: popup.x + offsetX,
        y: popup.y + offsetY,
        digits: popup.digits,
        color: popup.color,
        bank: ScorePopupSystem.bankFor(popup.timer),
        alpha: ScorePopupSystem.alphaFor(popup.x, popup.y, playerX, playerY) / 255,
        scale: popup.scale,
      });
    }
    return out;
  }

  get activeCount(): number {
    let n = 0;
    for (const popup of this.pool) if (popup.inUse) n++;
    return n;
  }

  reset(): void {
    for (const popup of this.pool) popup.inUse = false;
    this.cursor = 0;
  }
}

/** `ascii.anm` cell id for one digit of one bank; the star only exists in bank A. */
export const popupCell = (digit: number, bank: number): number =>
  digit === HUD_POPUP_STAR_CELL && bank > 0 ? digit : digit + BANK_OFFSETS[bank];
