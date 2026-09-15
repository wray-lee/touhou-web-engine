import { describe, expect, it } from 'vitest';
import { ASSET_KEYS, ASSET_MANIFEST } from './asset-manifest';
import { TAISEI_BOSS_BY_SPRITEKEY } from './taisei-assets';
import {
  proceduralFrameCounts,
  proceduralSheet,
  proceduralPlayerFrames,
  proceduralSpriteKeys,
  registerProceduralSheets,
} from './procedural-sheets';
import type { AnimatedSheet, PixiRenderer } from '../../../engine/renderer/PixiRenderer';

/**
 * The art pipeline is a contract between tools/generate-assets.mjs and the
 * client: every character the campaign can show must resolve to real animated
 * art, either a vendored Taisei sheet or one of our own idle loops. These tests
 * fail loudly when the two drift apart, which is how the "still looks like a
 * demo" regressions sneak in.
 */

/** Every boss spriteKey the TH08 campaign and its extra stages can spawn. */
const CAMPAIGN_BOSSES = [
  'rumia',
  'wriggle',
  'mystia',
  'keine',
  'reisen',
  'eirin',
  'tewi',
  'yuuka',
  'kanako',
  'suwako',
  'medicine',
  'cirno',
  'elly',
  'giant',
];

/** Every enemy spriteKey the stage scripts spawn. */
const CAMPAIGN_ENEMIES = ['fairy', 'lumiaFairy', 'rigelFairy', 'cloudFairy', 'sangFairy'];

describe('procedural idle loops', () => {
  it('animates every boss that Taisei has no art for', () => {
    const animated = new Set(proceduralSpriteKeys('boss'));
    const missing = CAMPAIGN_BOSSES.filter((key) => !animated.has(key) && !TAISEI_BOSS_BY_SPRITEKEY[key]);
    expect(missing).toEqual([]);
  });

  it('animates every fairy the stage scripts spawn', () => {
    const animated = new Set(proceduralSpriteKeys('enemy'));
    expect(CAMPAIGN_ENEMIES.filter((key) => !animated.has(key))).toEqual([]);
  });

  it('emits a full frame loop per sprite, not a single still', () => {
    const counts = proceduralFrameCounts();
    expect(counts.size).toBeGreaterThan(0);
    for (const [slot, frames] of counts) {
      expect(frames, slot).toBeGreaterThanOrEqual(2);
    }
  });

  it('resolves every frame key of every loop against the manifest', () => {
    const known = new Set(ASSET_KEYS);
    for (const kind of ['boss', 'enemy'] as const) {
      for (const spriteKey of proceduralSpriteKeys(kind)) {
        const sheet = proceduralSheet(kind, spriteKey);
        const frames = sheet.anim.main.frames;
        expect(frames.length, `${kind}:${spriteKey}`).toBeGreaterThan(1);
        for (const frame of frames) {
          expect(known.has(sheet.frameKey(frame)), sheet.frameKey(frame)).toBe(true);
        }
      }
    }
  });

  it('marks its sheets as fit-sized so 2x art does not render 2x bigger', () => {
    const sheet = proceduralSheet('boss', 'rumia');
    expect(sheet.fit).toBe(true);
    expect(sheet.scale).toBeUndefined();
  });
});

describe('registerProceduralSheets', () => {
  it('fills a boss, enemy and painted-player slot for every animated sprite', () => {
    const slots = new Map<string, AnimatedSheet>();
    const renderer = {
      slots,
      registerSheet(slot: string, sheet: AnimatedSheet) {
        slots.set(slot, sheet);
      },
    };
    const count = registerProceduralSheets(renderer as unknown as PixiRenderer);
    const players = [...proceduralPlayerFrames().values()].filter((n) => n >= 2).length;
    expect(count).toBe(proceduralSpriteKeys('boss').length + proceduralSpriteKeys('enemy').length + players);
    expect(renderer.slots.has('boss:rumia')).toBe(true);
    expect(renderer.slots.has('enemy:fairy')).toBe(true);
    // All eight members get an in-house loop, including the three Taisei covers,
    // so the 统一手绘 skin option never leaves a ship unanimated.
    expect(players).toBe(8);
    expect(renderer.slots.has('player-painted:reimu')).toBe(true);
    expect(renderer.slots.has('player-painted:youmu')).toBe(true);
  });
});

describe('vendored Taisei alpha', () => {
  const splitAlpha = ASSET_KEYS.filter((k) => k.endsWith('.alphamap'));

  it('never ships a raw alphamap as a texture', () => {
    expect(splitAlpha).toEqual([]);
  });

  it('serves the merged PNG for sprites whose alpha lives in a second file', () => {
    // fairy_circle is the slow-mode focus ring; the raw webp is opaque and used to
    // render as a solid grey ball over the player.
    expect(ASSET_MANIFEST['taisei:fx:fairy_circle']).toBe('/assets/taisei/baked/fairy_circle.png');
    expect(ASSET_MANIFEST['taisei:fx:fairy_circle_red']).toBe('/assets/taisei/baked/fairy_circle_red.png');
  });
});
