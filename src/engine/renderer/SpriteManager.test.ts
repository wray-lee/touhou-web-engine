import { describe, it, expect, vi } from 'vitest';
import { SpriteManager } from './SpriteManager';

// Graphics is only used as an opaque draw target in these unit tests
const fakeGraphics = (() => {
  const chain = { circle: () => chain, fill: () => chain, poly: () => chain, rect: () => chain };
  return chain as never;
})();

describe('SpriteManager', () => {
  it('registers the built-in procedural sprites', () => {
    const sm = new SpriteManager();
    for (const key of ['bullet_small', 'bullet_ring', 'bullet_needle', 'bullet_star', 'player_needle']) {
      expect(sm.has(key)).toBe(true);
    }
  });

  it('draws a registered sprite by key', () => {
    const sm = new SpriteManager();
    const custom = vi.fn();
    sm.register('custom', custom);
    sm.draw(fakeGraphics, 'custom', 10, 20, { color: 0xff0000, radius: 4 });
    expect(custom).toHaveBeenCalledWith(fakeGraphics, 10, 20, { color: 0xff0000, radius: 4 });
  });

  it('falls back to the default sprite for unknown keys', () => {
    const fallback = vi.fn();
    const sm = new SpriteManager(fallback);
    sm.draw(fakeGraphics, 'nope', 1, 2, { color: 0x00ff00, radius: 3 });
    expect(fallback).toHaveBeenCalledTimes(1);
  });

  it('built-in draw hooks execute without throwing on a chainable Graphics', () => {
    const sm = new SpriteManager();
    for (const key of ['bullet_small', 'bullet_ring', 'bullet_needle', 'bullet_star']) {
      expect(() => sm.draw(fakeGraphics, key, 5, 5, { color: 0x123456, radius: 4, rotation: 0.7 })).not.toThrow();
    }
  });
});
