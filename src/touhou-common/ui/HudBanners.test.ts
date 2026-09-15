import { describe, it, expect } from 'vitest';
import {
  HudBanners,
  PANEL_BANNER_LIFETIME,
  PANEL_BANNER_REST_X,
  PANEL_BANNER_SLIDE_FRAMES,
  PANEL_BANNER_X,
  SPELL_BONUS_LIFETIME,
  type HudBannerView,
} from './HudBanners';

/** `Gui.cpp:1175-1179` in one line: 312 px crossed in 30 frames, then it rests. */
const slideX = (timer: number) => timer * (-312.0 / PANEL_BANNER_SLIDE_FRAMES) + PANEL_BANNER_X;

const only = (views: HudBannerView[], index: number): HudBannerView => {
  const view = views[index];
  if (!view) throw new Error(`banner ${index} missing`);
  return view;
};

describe('HudBanners', () => {
  it('slides the panel notice left and parks it at the resting column', () => {
    const banners = new HudBanners();
    banners.showPanel('fullPower');
    expect(only(banners.views(), 0).x).toBe(PANEL_BANNER_X);

    banners.tick();
    expect(only(banners.views(), 0).x).toBeCloseTo(slideX(1), 6);

    banners.tick(PANEL_BANNER_SLIDE_FRAMES - 1);
    expect(only(banners.views(), 0).x).toBeCloseTo(slideX(PANEL_BANNER_SLIDE_FRAMES), 6);
    expect(only(banners.views(), 0).x).toBe(PANEL_BANNER_REST_X);

    banners.tick(100);
    expect(only(banners.views(), 0).x).toBe(PANEL_BANNER_REST_X);
  });

  it('keeps the notice for 180 frames and then drops it', () => {
    const banners = new HudBanners();
    banners.showPanel('spellBonusFailed');
    banners.tick(PANEL_BANNER_LIFETIME - 1);
    expect(banners.panelVisible).toBe(true);
    banners.tick(1);
    expect(banners.panelVisible).toBe(false);
    expect(banners.views()).toEqual([]);
  });

  it('restarts the slide when a new notice arrives', () => {
    const banners = new HudBanners();
    banners.showPanel('fullPower');
    banners.tick(60);
    expect(only(banners.views(), 0).x).toBe(PANEL_BANNER_REST_X);
    banners.showPanel('lastSpellFailed');
    expect(only(banners.views(), 0).x).toBe(PANEL_BANNER_X);
    expect(only(banners.views(), 0).text).toBe('Last Spell Failed');
  });

  it('transcribes each retail string, colour and pitch', () => {
    const banners = new HudBanners();
    const panel = (kind: Parameters<HudBanners['showPanel']>[0]): HudBannerView => {
      banners.clear();
      banners.showPanel(kind);
      return only(banners.views(), 0);
    };

    const fullPower = panel('fullPower');
    expect(fullPower.text).toBe('Full Power Mode!');
    expect(fullPower.color).toBe(0xffc0b0ff);
    expect(fullPower.scale).toBe(1);
    expect(fullPower.advance).toBe(13);
    expect(fullPower.y).toBe(168);

    const border = panel('supernaturalBorder');
    expect(border.color).toBe(0xffe0b0ff);
    expect(border.scale).toBe(0.9);
    // `Gui.cpp:2085` narrows the pitch to 11 whenever it shrinks the cell.
    expect(border.advance).toBe(11);

    const failed = panel('spellBonusFailed');
    expect(failed.text).toBe('Spell Bonus Failed');
    expect(panel('lastSpellFailed').text).toBe('Last Spell Failed');
  });

  it('pads the border bonus right-aligned like %7d', () => {
    const banners = new HudBanners();
    banners.showPanel('borderBonus', 1234);
    expect(only(banners.views(), 0).text).toBe('Border Bonus    1234');
  });

  it('centres the reward lines over the playfield and doubles the total', () => {
    const banners = new HudBanners();
    banners.showSpellBonus(1000);
    banners.tick();
    const views = banners.views();
    const title = only(views, 0);
    const total = only(views, 1);

    // (384 - 17 * 14) / 2 + 32 -- retail centres with a 14 pitch.
    expect(title.text).toBe('Spell Card Bonus!');
    expect(title.x).toBe(105);
    expect(title.y).toBe(80);
    expect(title.color).toBe(0xffff0000);
    expect(total.text).toBe('+1000');
    expect(total.x).toBe(154);
    expect(total.y).toBe(96);
    expect(total.scale).toBe(2);
    expect(total.advance).toBe(26);
    expect(total.color).toBe(0xffff8080);
  });

  it('keeps a wider total centred and lives for 280 frames', () => {
    const banners = new HudBanners();
    banners.showSpellBonus(2500000);
    banners.tick();
    const total = only(banners.views(), 1);
    expect(total.text).toBe('+2500000');
    expect(total.x).toBe(112);

    banners.tick(SPELL_BONUS_LIFETIME - 2);
    expect(banners.bonusVisible).toBe(true);
    banners.tick(2);
    expect(banners.bonusVisible).toBe(false);
  });

  it('fades only the last 40 frames so a capture does not end on a cut', () => {
    const banners = new HudBanners();
    banners.showSpellBonus(500);
    banners.tick(SPELL_BONUS_LIFETIME - 40);
    expect(only(banners.views(), 1).alpha).toBe(1);
    banners.tick(20);
    expect(only(banners.views(), 1).alpha).toBeCloseTo(0.5, 6);
    banners.tick(20);
    expect(banners.bonusVisible).toBe(false);
  });

  it('draws the panel notice before the reward line', () => {
    const banners = new HudBanners();
    banners.showPanel('fullPower');
    banners.showSpellBonus(100);
    banners.tick();
    expect(banners.views().map((view) => view.text)).toEqual([
      'Full Power Mode!',
      'Spell Card Bonus!',
      '+100',
    ]);
  });

  it('holds nothing after a clear', () => {
    const banners = new HudBanners();
    banners.showPanel('fullPower');
    banners.showSpellBonus(2000);
    banners.clear();
    expect(banners.views()).toEqual([]);
    banners.tick();
    expect(banners.views()).toEqual([]);
  });
});
