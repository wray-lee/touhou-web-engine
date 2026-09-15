import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { Canvas, loadPngCanvas } from './png.mjs';

/** Directory (relative to the project root) that holds the vendored pack. */
export const TAISEI_BULLET_DIR = 'public/assets/taisei';
/** Square tile the baked art is fitted into. */
export const BULLET_TILE = 44;
/** Fraction of the tile the artwork itself covers. */
export const BULLET_FILL = 34;

const SHADOW_STRENGTH = 0.85;
const SHADOW_BRIGHTNESS = 0.42;

export const TAISEI_BULLET_SHAPES = {
  ball: { src: 'mask/ball', mode: 'mask' },
  ring: { src: 'mask/flea', mode: 'mask' },
  rice: { src: 'mask/rice', mode: 'mask' },
  needle: { src: 'proj/needle', mode: 'tint' },
  star: { src: 'proj/maristar', mode: 'tint' },
  orb: { src: 'mask/bigball', mode: 'mask' },
  eye: { src: 'mask/pointer', mode: 'mask' },
  seal: { src: 'proj/ofuda', mode: 'raw' },
  spark: { src: 'proj/glowball', mode: 'tint' },
  koto: { src: 'mask/card', mode: 'mask' },
  mouth: { src: 'mask/wave', mode: 'mask' },
  laser: { src: 'proj/marisa', mode: 'tint' },
  droplet: { src: 'mask/droplet', mode: 'mask' },
  crystal: { src: 'mask/crystal', mode: 'mask' },
  diamond: { src: 'mask/diamond', mode: 'mask' },
  pill: { src: 'mask/pill', mode: 'mask' },
  ghost: { src: 'mask/hghost', mode: 'mask' },
  soul: { src: 'mask/soul', mode: 'mask' },
  apple: { src: 'proj/apple', mode: 'raw' },
  homing: { src: 'proj/youhoming', mode: 'raw' },
};

export const TAISEI_EXTRA_SHAPE_KEYS = ['droplet', 'crystal', 'diamond', 'pill', 'ghost', 'soul', 'apple', 'homing'];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a || 1));
  return t * t * (3 - 2 * t);
};

const cache = new Map();

/** Absolute path of the vendored Taisei pack for a project root. */
export const taiseiAssetDir = (root) => join(root, TAISEI_BULLET_DIR);

/** Load one upstream texture, or null when the vendored pack is incomplete. */
export function loadTaiseiTexture(dir, src) {
  if (cache.has(src)) return cache.get(src);
  for (const ext of ['.png', '.webp']) {
    const file = join(dir, src + ext);
    if (!existsSync(file)) continue;
    if (ext !== '.png') break;
    try {
      const cv = loadPngCanvas(file);
      cache.set(src, cv);
      return cv;
    } catch {
      break;
    }
  }
  cache.set(src, null);
  return null;
}

/**
 * Taisei's sprite_bullet.frag.glsl: R is a shadow mask, G the body colour,
 * B the bright core. Reproduce it on the CPU so the ramp can ship as PNGs.
 */
function bakeMask(src, color) {
  const out = new Canvas(src.width, src.height);
  const er = color[0];
  const eg = color[1];
  const eb = color[2];
  const core = [
    Math.min(255, er * 0.4 + 155),
    Math.min(255, eg * 0.4 + 155),
    Math.min(255, eb * 0.4 + 155),
  ];
  for (let i = 0; i < src.width * src.height; i++) {
    const a = src.data[i * 4 + 3];
    if (a <= 0.002) continue;
    const shadow = smoothstep(0, 128, src.data[i * 4]) * SHADOW_STRENGTH;
    const edge = src.data[i * 4 + 1] / 255;
    const coreMask = src.data[i * 4 + 2] / 255;
    const lit = 1 - shadow;
    out.data[i * 4] = Math.min(255, er * SHADOW_BRIGHTNESS * shadow + (er * edge + core[0] * coreMask) * lit);
    out.data[i * 4 + 1] = Math.min(255, eg * SHADOW_BRIGHTNESS * shadow + (eg * edge + core[1] * coreMask) * lit);
    out.data[i * 4 + 2] = Math.min(255, eb * SHADOW_BRIGHTNESS * shadow + (eb * edge + core[2] * coreMask) * lit);
    out.data[i * 4 + 3] = a;
  }
  return out;
}

/** Full-colour art multiplied into the bullet colour, with a small lift. */
function bakeTint(src, color) {
  const out = new Canvas(src.width, src.height);
  const er = (color[0] / 255) * 1.22;
  const eg = (color[1] / 255) * 1.22;
  const eb = (color[2] / 255) * 1.22;
  for (let i = 0; i < src.width * src.height; i++) {
    const a = src.data[i * 4 + 3];
    if (a <= 0.002) continue;
    out.data[i * 4] = Math.min(255, src.data[i * 4] * er);
    out.data[i * 4 + 1] = Math.min(255, src.data[i * 4 + 1] * eg);
    out.data[i * 4 + 2] = Math.min(255, src.data[i * 4 + 2] * eb);
    out.data[i * 4 + 3] = a;
  }
  return out;
}

/**
 * Bake one shape/colour tile. The art is trimmed and fitted into a square tile;
 * the renderer scales by `texture.width`, so only the covered fraction matters.
 *
 * @param root project root, i.e. the directory that contains `public/`
 */
export function bakeTaiseiBullet(root, shape, colorHex, tile = BULLET_TILE, fill = BULLET_FILL) {
  const def = TAISEI_BULLET_SHAPES[shape];
  if (!def) return null;
  const src = loadTaiseiTexture(taiseiAssetDir(root), def.src);
  if (!src) return null;
  const color = [(colorHex >> 16) & 255, (colorHex >> 8) & 255, colorHex & 255];
  const baked = def.mode === 'mask' ? bakeMask(src, color) : def.mode === 'raw' ? src.copy() : bakeTint(src, color);
  const trimmed = baked.trimAlpha(0.02, 1);
  if (!trimmed.width || !trimmed.height) return null;
  const s = Math.min(fill / trimmed.width, fill / trimmed.height);
  const w = Math.max(1, Math.round(trimmed.width * s));
  const h = Math.max(1, Math.round(trimmed.height * s));
  const out = new Canvas(tile, tile);
  out.blit(trimmed.resize(w, h), Math.round((tile - w) / 2), Math.round((tile - h) / 2));
  return out;
}

/** True when the vendored pack has everything needed for `shape`. */
export function hasTaiseiBullet(root, shape) {
  const def = TAISEI_BULLET_SHAPES[shape];
  return !!def && !!loadTaiseiTexture(taiseiAssetDir(root), def.src);
}