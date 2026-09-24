/**
 * Register original TH08 bullet (etama) textures from extracted anm atlases.
 * Slices 338 individual bullet sprites and registers them in the asset manager.
 */

import { Texture } from 'pixi.js';
import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import { resolveAssetUrl } from '../../../engine/core/ResourceResolver';
import { TH08_BULLET_SPRITES } from './th08-bullet-sprites';
import { getEtamaSpriteId } from './th08-bullet-types';

async function sliceAtlas(
  atlasUrl: string,
  frames: Array<{ id: number; x: number; y: number; w: number; h: number }>,
): Promise<Map<number, Texture>> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = resolveAssetUrl(atlasUrl);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load ' + atlasUrl));
  });
  const result = new Map<number, Texture>();
  for (const frame of frames) {
    const canvas = document.createElement('canvas');
    canvas.width = frame.w;
    canvas.height = frame.h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
    // Pixel-crisp upscaling: the retail sheets are 1x art, so bilinear turns them to mush.
    const tex = Texture.from(canvas);
    tex.source.style.scaleMode = 'nearest';
    result.set(frame.id, tex);
  }
  return result;
}

/**
 * Register all TH08 etama bullet textures.
 * Returns total number of bullet sprites registered.
 */
export async function registerTH08BulletSprites(renderer: PixiRenderer): Promise<number> {
  let total = 0;

  for (const [sheetKey, data] of Object.entries(TH08_BULLET_SPRITES)) {
    try {
      const textures = await sliceAtlas(data.atlas, data.frames);
      for (const [frameId, texture] of textures) {
        renderer.assets.register('th08:bullet:' + sheetKey + ':' + frameId, texture);
      }
      total += textures.size;
    } catch {
      // Atlas not available
    }
  }

  // Register etama sprites under the palette keys the renderer looks up.
  // This bridges TH08 bullet types to the existing bullet:{shape}:{color} system.
  const SHAPES = ['pellet', 'ball', 'ring', 'rice', 'needle', 'kunai', 'scale', 'large', 'bubble', 'arrow'];
  const COLORS = [
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'cyan',
    'blue',
    'indigo',
    'purple',
    'pink',
    'rose',
    'white',
    'master',
  ];
  for (let type = 0; type < SHAPES.length; type++) {
    for (let col = 0; col < COLORS.length; col++) {
      const spriteId = getEtamaSpriteId(type, col);
      const src = renderer.assets.get('th08:bullet:etama_t0:' + spriteId);
      if (src) {
        renderer.assets.register('bullet:' + SHAPES[type] + ':' + COLORS[col], src);
      }
    }
  }

  return total;
}
