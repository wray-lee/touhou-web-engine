import { Graphics } from 'pixi.js';

/** Procedural sprite draw hook — renders one sprite instance onto shared Graphics. */
export type SpriteDrawFn = (
  g: Graphics,
  x: number,
  y: number,
  opts: { color: number; radius: number; rotation?: number },
) => void;

/**
 * Registry of named, procedurally-drawn sprites (zero external assets).
 * Bullets carry a `sprite` key; the renderer looks it up here so visual style
 * is data-driven (`sprite: 'bullet_ring'`) instead of hardcoded per tag.
 * Unknown keys fall back to `defaultSprite`.
 */
export class SpriteManager {
  private sprites = new Map<string, SpriteDrawFn>();
  private defaultSprite: SpriteDrawFn;

  constructor(defaultSprite: SpriteDrawFn = SpriteManager.ball) {
    this.defaultSprite = defaultSprite;
    this.register('bullet_small', SpriteManager.ball);
    this.register('bullet_ring', SpriteManager.ring);
    this.register('bullet_needle', SpriteManager.needle);
    this.register('bullet_star', SpriteManager.star);
    this.register('player_needle', SpriteManager.needle);
  }

  register(key: string, draw: SpriteDrawFn): void {
    this.sprites.set(key, draw);
  }

  has(key: string): boolean {
    return this.sprites.has(key);
  }

  draw(
    g: Graphics,
    key: string,
    x: number,
    y: number,
    opts: { color: number; radius: number; rotation?: number },
  ): void {
    (this.sprites.get(key) ?? this.defaultSprite)(g, x, y, opts);
  }

  /** Classic glowing orb: white halo + colored core. */
  static ball: SpriteDrawFn = (g, x, y, { color, radius }) => {
    g.circle(x, y, radius + 1.5).fill({ color: 0xffffff, alpha: 0.5 });
    g.circle(x, y, radius).fill({ color });
  };

  /** Hollow ring danmaku (Demarcation-style boundary bullets). */
  static ring: SpriteDrawFn = (g, x, y, { color, radius }) => {
    g.circle(x, y, radius + 1.5).fill({ color: 0xffffff, alpha: 0.6 });
    g.circle(x, y, radius).fill({ color });
    g.circle(x, y, Math.max(1, radius * 0.45)).fill({ color: 0x101018 });
  };

  /** Elongated needle, oriented along `rotation` (velocity angle). */
  static needle: SpriteDrawFn = (g, x, y, { color, radius, rotation = 0 }) => {
    const len = radius * 3;
    const w = Math.max(1.5, radius * 0.6);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    g.poly([
      { x: x + cos * len - sin * w, y: y + sin * len + cos * w },
      { x: x + cos * len + sin * w, y: y + sin * len - cos * w },
      { x: x - cos * len + sin * w, y: y - sin * len - cos * w },
      { x: x - cos * len - sin * w, y: y - sin * len + cos * w },
    ]).fill({ color });
  };

  /** 5-point star (fairy / item-flavored bullets). */
  static star: SpriteDrawFn = (g, x, y, { color, radius }) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? radius + 1.5 : radius * 0.5;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      points.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
    }
    g.poly(points).fill({ color });
  };
}
