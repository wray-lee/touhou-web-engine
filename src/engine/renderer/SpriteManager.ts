import { Graphics } from 'pixi.js';

/** Procedural sprite draw hook — renders one sprite instance onto shared Graphics. */
export type SpriteDrawFn = (
  g: Graphics,
  x: number,
  y: number,
  opts: { color: number; radius: number; rotation?: number; alpha?: number },
) => void;

export interface BulletTextureOptions {
  /** Logical colour ramp baked into the texture atlas, e.g. { red: 0xff3366 }. */
  palette: Record<string, number>;
  /** Shape suffixes available for every palette entry, e.g. ['ball','ring']. */
  shapes: string[];
  /** Texture key template; `{shape}` and `{color}` are substituted. */
  template?: string;
}

/** Snap an arbitrary RGB int to the nearest baked palette colour name. */
export function nearestPaletteName(color: number, palette: Record<string, number>): string | null {
  let best: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const [name, value] of Object.entries(palette)) {
    const dr = ((value >> 16) & 255) - ((color >> 16) & 255);
    const dg = ((value >> 8) & 255) - ((color >> 8) & 255);
    const db = (value & 255) - (color & 255);
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }
  return best;
}

/**
 * Registry of named, procedurally-drawn sprites (zero external assets).
 * Bullets carry a `sprite` key; the renderer looks it up here so visual style
 * is data-driven (`sprite: 'bullet_ring'`) instead of hardcoded per tag.
 * Unknown keys fall back to `defaultSprite`.
 */
export class SpriteManager {
  private sprites = new Map<string, SpriteDrawFn>();
  private defaultSprite: SpriteDrawFn;
  /** sprite key -> texture shape (e.g. bullet_small -> ball). */
  private shapeByKey = new Map<string, string>();
  /** sprite key -> standalone texture name (player shots, entity sprites). */
  private textureByKey = new Map<string, string>();
  private bulletTexture: BulletTextureOptions | null = null;

  constructor(defaultSprite: SpriteDrawFn = SpriteManager.ball) {
    this.defaultSprite = defaultSprite;
    this.register('bullet_small', SpriteManager.ball);
    this.register('bullet_ring', SpriteManager.ring);
    this.register('bullet_needle', SpriteManager.needle);
    this.register('bullet_star', SpriteManager.star);
    this.register('player_needle', SpriteManager.needle);
    // Texture-backed shapes; the renderer only uses them when the atlas has them.
    this.shapeByKey.set('bullet_small', 'ball');
    this.shapeByKey.set('bullet_ring', 'ring');
    this.shapeByKey.set('bullet_needle', 'needle');
    this.shapeByKey.set('bullet_star', 'star');
    this.shapeByKey.set('bullet_rice', 'rice');
    this.shapeByKey.set('bullet_orb', 'orb');
    this.shapeByKey.set('bullet_eye', 'eye');
    this.shapeByKey.set('bullet_seal', 'seal');
    this.shapeByKey.set('bullet_spark', 'spark');
    this.shapeByKey.set('bullet_koto', 'koto');
    this.shapeByKey.set('bullet_mouth', 'mouth');
    this.shapeByKey.set('bullet_laser', 'laser');
    // Shapes only available from the vendored Taisei danmaku pack.
    this.shapeByKey.set('bullet_droplet', 'droplet');
    this.shapeByKey.set('bullet_crystal', 'crystal');
    this.shapeByKey.set('bullet_diamond', 'diamond');
    this.shapeByKey.set('bullet_pill', 'pill');
    this.shapeByKey.set('bullet_ghost', 'ghost');
    this.shapeByKey.set('bullet_soul', 'soul');
    this.shapeByKey.set('bullet_apple', 'apple');
    this.shapeByKey.set('bullet_homing', 'homing');
  }

  register(key: string, draw: SpriteDrawFn): void {
    this.sprites.set(key, draw);
  }

  /** Enable baked bullet textures (one PNG per shape x palette colour). */
  setBulletTextures(options: BulletTextureOptions | null): void {
    this.bulletTexture = options;
  }

  /** Map a bullet `sprite` key onto a baked texture shape. */
  registerBulletShape(spriteKey: string, shape: string): void {
    this.shapeByKey.set(spriteKey, shape);
  }

  /** Map a sprite key onto a single texture name (no colour ramp). */
  registerTexture(spriteKey: string, textureKey: string): void {
    this.textureByKey.set(spriteKey, textureKey);
  }

  /**
   * Texture name for a bullet, or null when the procedural fallback should draw it.
   * Falls back to the palette's `master` entry so unknown colours still render.
   */
  bulletTextureKey(spriteKey: string, color: number): string | null {
    if (!this.bulletTexture) return null;
    const shape = this.shapeByKey.get(spriteKey);
    if (!shape || !this.bulletTexture.shapes.includes(shape)) return null;
    const name = nearestPaletteName(color, this.bulletTexture.palette) ?? 'master';
    return (this.bulletTexture.template ?? 'bullet:{shape}:{color}')
      .replace('{shape}', shape)
      .replace('{color}', name);
  }

  /** Standalone texture name registered for a sprite key. */
  textureKey(spriteKey: string): string | undefined {
    return this.textureByKey.get(spriteKey);
  }

  has(key: string): boolean {
    return this.sprites.has(key);
  }

  draw(
    g: Graphics,
    key: string,
    x: number,
    y: number,
    opts: { color: number; radius: number; rotation?: number; alpha?: number },
  ): void {
    (this.sprites.get(key) ?? this.defaultSprite)(g, x, y, opts);
  }

  /** Classic glowing orb: white halo + colored core. */
  static ball: SpriteDrawFn = (g, x, y, { color, radius, alpha = 1 }) => {
    g.circle(x, y, radius + 1.5).fill({ color: 0xffffff, alpha: 0.5 * alpha });
    g.circle(x, y, radius).fill({ color, alpha });
  };

  /** Hollow ring danmaku (Demarcation-style boundary bullets). */
  static ring: SpriteDrawFn = (g, x, y, { color, radius, alpha = 1 }) => {
    g.circle(x, y, radius + 1.5).fill({ color: 0xffffff, alpha: 0.6 * alpha });
    g.circle(x, y, radius).fill({ color, alpha });
    g.circle(x, y, Math.max(1, radius * 0.45)).fill({ color: 0x101018, alpha });
  };

  /** Elongated needle, oriented along `rotation` (velocity angle). */
  static needle: SpriteDrawFn = (g, x, y, { color, radius, rotation = 0, alpha = 1 }) => {
    const len = radius * 3;
    const w = Math.max(1.5, radius * 0.6);
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    g.poly([
      { x: x + cos * len - sin * w, y: y + sin * len + cos * w },
      { x: x + cos * len + sin * w, y: y + sin * len - cos * w },
      { x: x - cos * len + sin * w, y: y - sin * len - cos * w },
      { x: x - cos * len - sin * w, y: y - sin * len + cos * w },
    ]).fill({ color, alpha });
  };

  /** 5-point star (fairy / item-flavored bullets). */
  static star: SpriteDrawFn = (g, x, y, { color, radius, alpha = 1 }) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? radius + 1.5 : radius * 0.5;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      points.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r });
    }
    g.poly(points).fill({ color, alpha });
  };
}
