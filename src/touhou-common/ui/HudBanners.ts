/**
 * The panel banners the original raises over the side panel.
 *
 * `Gui.cpp` keeps three independent text slots, each with its own lifetime and
 * its own way of being laid out, and every one of them is worth transcribing
 * literally because the feel of the game is tied to when they appear:
 *
 *  - `formatted1` (Gui.cpp:1771-1778, drawn at :2075-2122) is a six-way switch
 *    over an id. It starts at the left edge of the panel, x = 416, slides left
 *    to x = 104 over its first thirty frames, sits there until frame 180 and
 *    then vanishes. The slide is why 永夜抄 feels loud when the ship maxes its
 *    power: the words physically cross the playfield.
 *  - `formatted2` (:1781-1788, drawn at :2127-2138) is the spell-card bonus. It
 *    centres itself over the 384-pixel playfield with a pitch of 14 while the
 *    font advances at 13, so the line sits a few pixels right of true centre.
 *    That offset is retail's, and it is kept.
 *
 * The colours are the raw `D3DCOLOR`s handed to `AsciiManager::SetColor`, i.e.
 * 0xAARRGGBB, so the renderer can take them apart the same way it does the rest
 * of the upstream art.
 */

import { HUD_TEXT_ADVANCE } from '../../engine/core/HudLayout';

/** One line a host has to blit, in the 640x480 canvas space retail draws in. */
export interface HudBannerView {
  text: string;
  x: number;
  y: number;
  /** Cell scale; 1 is the 16x16 font, 2 is the bonus total. */
  scale: number;
  /** Letter pitch, which retail narrows to 11 for its 0.9-scaled lines. */
  advance: number;
  /** `D3DCOLOR` as written in the decompile: 0xAARRGGBB. */
  color: number;
  /** Fades the last quarter of the slide so a banner never pops out. */
  alpha: number;
}

/** `formatted1.isShown`, the six arms of the switch at `Gui.cpp:2075`. */
export type PanelBannerKind =
  | 'fullPower'
  | 'supernaturalBorder'
  | 'cherryPointMax'
  | 'borderBonus'
  | 'spellBonusFailed'
  | 'lastSpellFailed';

interface PanelBanner {
  /** The literal the original hands to `AddFormatText`, `%d` and all. */
  text: (value: number) => string;
  color: number;
  scale: number;
  advance: number;
}

const PANEL_BANNERS: Record<PanelBannerKind, PanelBanner> = {
  fullPower: { text: () => 'Full Power Mode!', color: 0xffc0b0ff, scale: 1, advance: HUD_TEXT_ADVANCE },
  supernaturalBorder: {
    text: () => 'Supernatural Border!!',
    color: 0xffe0b0ff,
    scale: 0.9,
    advance: 11,
  },
  cherryPointMax: { text: () => 'CherryPoint Max!', color: 0xffc0b0ff, scale: 1, advance: HUD_TEXT_ADVANCE },
  borderBonus: {
    text: (value) => `Border Bonus ${pad(value, 7)}`,
    color: 0xffe0b0ff,
    scale: 0.9,
    advance: 11,
  },
  spellBonusFailed: {
    text: () => 'Spell Bonus Failed',
    color: 0xffe0b0ff,
    scale: 0.9,
    advance: 11,
  },
  lastSpellFailed: {
    text: () => 'Last Spell Failed',
    color: 0xffe0b0ff,
    scale: 0.9,
    advance: 11,
  },
};

/** `AsciiManager` pads with leading spaces, so `%7d` is right-aligned. */
function pad(value: number, width: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(width, ' ');
}

/** `Gui.cpp:1773` / `:1783`. */
export const PANEL_BANNER_X = 416;
export const PANEL_BANNER_REST_X = 104;
export const PANEL_BANNER_Y = 168;
/** `:1175-1181`: thirty frames of slide, then hold until 180 and clear. */
export const PANEL_BANNER_SLIDE_FRAMES = 30;
export const PANEL_BANNER_LIFETIME = 180;
/** `:1187`: the bonus line lives 280 frames. */
export const SPELL_BONUS_LIFETIME = 280;
/** The playfield's left edge and width, which is what the bonus centres on. */
const PLAYFIELD_LEFT = 32;
const PLAYFIELD_WIDTH = 384;
/** `:2130` centres with 14 while the font advances at 13; `:2135` doubles the cell. */
const BONUS_CENTRE_PITCH = 14;
const BONUS_SCALE = 2;
const BONUS_TEXT = 'Spell Card Bonus!';

/**
 * The two live slots, advanced once per game frame.
 *
 * Retail owns these timers inside `Gui`, which is a calc-chain object; keeping
 * them here means a host can raise a banner from the sim and never has to know
 * how long it lives.
 */
export class HudBanners {
  private kind: PanelBannerKind | null = null;
  private timer = 0;
  private value = 0;
  private bonusTimer = 0;
  private bonus = 0;

  /** `Gui::FUN_00437e5d`. A new banner restarts the slide. */
  showPanel(kind: PanelBannerKind, value = 0): void {
    this.kind = kind;
    this.value = value;
    this.timer = 0;
  }

  /** `Gui::gui_fun_00437edc`. */
  showSpellBonus(bonus: number): void {
    this.bonus = bonus;
    this.bonusTimer = 0;
  }

  clear(): void {
    this.kind = null;
    this.timer = 0;
    this.bonusTimer = 0;
    this.bonus = 0;
  }

  /** Advance both slots; `frames` is 1 for a normal tick. */
  tick(frames = 1): void {
    for (let i = 0; i < frames; i++) {
      if (this.kind !== null) {
        this.timer++;
        if (this.timer >= PANEL_BANNER_LIFETIME) this.kind = null;
      }
      if (this.bonus !== 0) {
        this.bonusTimer++;
        // Same shape as the panel slot: 280 drawn frames, counting from the one on
        // which it was raised, then nothing.
        if (this.bonusTimer >= SPELL_BONUS_LIFETIME) {
          this.bonus = 0;
          this.bonusTimer = 0;
        }
      }
    }
  }

  get panelVisible(): boolean {
    return this.kind !== null;
  }

  get bonusVisible(): boolean {
    return this.bonus !== 0;
  }

  /** Where the panel banner currently is (`:1175-1179`). */
  get panelX(): number {
    if (this.timer < PANEL_BANNER_SLIDE_FRAMES) {
      return this.timer * (-312.0 / PANEL_BANNER_SLIDE_FRAMES) + PANEL_BANNER_X;
    }
    return PANEL_BANNER_REST_X;
  }

  /** What the draw chain should blit this frame, panel banner first. */
  views(): HudBannerView[] {
    const out: HudBannerView[] = [];
    if (this.kind !== null) {
      const banner = PANEL_BANNERS[this.kind];
      out.push({
        text: banner.text(this.value),
        x: this.panelX,
        y: PANEL_BANNER_Y,
        scale: banner.scale,
        advance: banner.advance,
        color: banner.color,
        alpha: 1,
      });
    }
    if (this.bonusVisible) {
      const total = `+${this.bonus}`;
      out.push({
        text: BONUS_TEXT,
        x: (PLAYFIELD_WIDTH - BONUS_TEXT.length * BONUS_CENTRE_PITCH) / 2 + PLAYFIELD_LEFT,
        y: 80,
        scale: 1,
        advance: HUD_TEXT_ADVANCE,
        color: 0xffff0000,
        alpha: this.bonusAlpha(),
      });
      out.push({
        text: total,
        x: (PLAYFIELD_WIDTH - total.length * BONUS_CENTRE_PITCH * BONUS_SCALE) / 2 + PLAYFIELD_LEFT,
        y: 96,
        scale: BONUS_SCALE,
        advance: HUD_TEXT_ADVANCE * BONUS_SCALE,
        color: 0xffff8080,
        alpha: this.bonusAlpha(),
      });
    }
    return out;
  }

  /**
   * Retail never fades this line, but it does have to leave; the last 40 frames
   * of the 280 are a linear fade so a capture does not end on a hard cut.
   */
  private bonusAlpha(): number {
    const left = SPELL_BONUS_LIFETIME - this.bonusTimer;
    return left >= 40 ? 1 : Math.max(0, left / 40);
  }
}
