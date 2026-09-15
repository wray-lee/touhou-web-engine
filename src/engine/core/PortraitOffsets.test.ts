import { describe, it, expect } from 'vitest';
import {
  portraitScriptOffset,
  portraitSpriteOffset,
  PORTRAIT_SCRIPT_WIDTH,
  PORTRAIT_TALL_SPRITE_WIDTH,
} from './PortraitOffsets';

describe('portrait offsets', () => {
  it('pins a slot by 112 px once its art is wider than the standard bust', () => {
    expect(portraitScriptOffset(PORTRAIT_SCRIPT_WIDTH)).toEqual({ x: 0, y: null });
    expect(portraitScriptOffset(PORTRAIT_SCRIPT_WIDTH + 1)).toEqual({ x: -112, y: null });
    expect(portraitScriptOffset(510)).toEqual({ x: -112, y: null });
  });

  it('leaves a bust exactly where its script put it', () => {
    expect(portraitScriptOffset(126)).toEqual({ x: 0, y: null });
    expect(portraitSpriteOffset(126)).toEqual({ x: 0, y: null });
  });

  it('gives op 2 its own three tiers instead of op 1 one-branch rule', () => {
    expect(portraitSpriteOffset(254)).toEqual({ x: -80, y: null });
    expect(portraitSpriteOffset(PORTRAIT_TALL_SPRITE_WIDTH)).toEqual({ x: -80, y: null });
    expect(portraitSpriteOffset(PORTRAIT_TALL_SPRITE_WIDTH + 1)).toEqual({
      x: -208,
      y: -50,
    });
    expect(portraitSpriteOffset(510)).toEqual({ x: -208, y: -50 });
  });

  it('does not invent a vertical shift where retail writes only pos2.x', () => {
    for (const width of [0, 126, 128, 200, 254, 256]) {
      expect(portraitSpriteOffset(width).y).toBeNull();
    }
  });

  it('keeps the two ops apart on the art the real packs actually contain', () => {
    // Every face pack ships 126 px busts and 254/256 px full bodies; only the
    // two late-stage boss packs go past 256 (382 and 510 px). So the middle
    // tier is the one that matters for most of the game, and the widest tier is
    // what the final two conversations exercise.
    for (const width of [254, 256]) {
      expect(portraitSpriteOffset(width).x).not.toBe(portraitScriptOffset(width).x);
    }
  });
});
