/**
 * Retail `.anm` metadata, read at runtime instead of being re-typed by hand.
 *
 * `npm run assets:th08` walks every ANM archive in `th08.dat` and records, per
 * pack, its texture pages, sprite rects and script bytecode in
 * `public/assets/th08/manifest.json`. That is exactly the table
 * `AnmManager::PreloadAnm` builds in the original
 * (`AnmManager.hpp:242-300`), so the dialogue presenter can drive real retail
 * animation bytecode through the engine VM instead of approximating it.
 *
 * Two lookups matter for dialogue:
 *
 * - script id -> words, which is what `SetAndExecuteScriptIdx` needs;
 * - sprite id -> (page, rect), which is what `SetSprite` needs. The manifest
 *   carries the page index directly (`textures` is 0-based and `sprite.tex`
 *   indexes it), so no arithmetic on entry order is involved.
 */

import { Rectangle, Texture } from 'pixi.js';
import { loadAnmPage } from './anm-atlas';
import { anmScriptFromBase64 } from '../../../engine/anm/AnmVm';
import { ANM_OPCODE } from '../../../engine/anm/AnmOpcode';
import { resolveAssetUrl } from '../../../engine/core/ResourceResolver';
import { FACE_ASSET_DIR } from './th08-face-art';

/** Where `extract.mjs` publishes the per-pack metadata. */
export const TH08_MANIFEST_URL = '/assets/th08/manifest.json';

interface ManifestTexture {
  file: string;
  width: number;
  height: number;
}

interface ManifestSprite {
  tex: number;
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ManifestScript {
  base64: string;
}

interface ManifestPack {
  textures: ManifestTexture[];
  sprites: ManifestSprite[];
  scripts: ManifestScript[];
}

interface Manifest {
  anm: Record<string, ManifestPack>;
}

/** One resolved sprite: which page to read, and the rect to cut out of it. */
export interface AnmSpriteRect {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class RetailAnmCatalog {
  private readonly pages = new Map<string, Texture | null>();

  private constructor(private readonly anm: Record<string, ManifestPack>) {}

  /** Fetch and parse the manifest. Resolves to an empty catalog without one. */
  static async load(url: string = TH08_MANIFEST_URL): Promise<RetailAnmCatalog> {
    try {
      const response = await fetch(resolveAssetUrl(url));
      if (!response.ok) return new RetailAnmCatalog({});
      const manifest = (await response.json()) as Manifest;
      return new RetailAnmCatalog(manifest.anm ?? {});
    } catch {
      return new RetailAnmCatalog({});
    }
  }

  /** True when this pack was extracted, so callers can fall back quietly. */
  has(anm: string): boolean {
    return anm in this.anm;
  }

  /** Script count in `anm`, 0 when the pack is absent. */
  scriptCount(anm: string): number {
    return this.anm[anm]?.scripts.length ?? 0;
  }

  /** Retail `SetAndExecuteScriptIdx` operand: the word stream of one script. */
  scriptWords(anm: string, index: number): Int32Array | null {
    const pack = this.anm[anm];
    const script = pack?.scripts[index];
    return script ? anmScriptFromBase64(script.base64) : null;
  }

  /**
   * Retail `SetSprite` operand: sprite ids are a flat numbering across a pack,
   * so the manifest record for `id` is the answer rather than an entry walk.
   * `Gui.cpp:463-497` passes the message's operand straight to it, which is why
   * ops 15 and 17 can ask for sprite 6 and land on Reimu's angry bust.
   */
  sprite(anm: string, id: number): AnmSpriteRect | null {
    const found = this.anm[anm]?.sprites.find((entry) => entry.id === id);
    if (!found) return null;
    return {
      page: found.tex,
      x: found.x,
      y: found.y,
      width: found.w,
      height: found.h,
    };
  }

  /** Page file name for `anm`, or undefined when the pack ships no such page. */
  pageFile(anm: string, page: number): string | undefined {
    return this.anm[anm]?.textures[page]?.file;
  }

  /**
   * The position written by the first `Pos` of one script, in backbuffer pixels.
   *
   * This is how the dialogue lines find themselves on screen: `text.anm` script 0
   * and script 1 each begin with a `Pos`, and `AnmManager::DrawTextLeft`
   * (`AnmManager.cpp:2720-2737`) draws at the VM position. Reading it out here
   * keeps the layout in the shipped animation instead of in a code constant.
   */
  firstPos(anm: string, index: number): { x: number; y: number } | null {
    const words = this.scriptWords(anm, index);
    if (!words) return null;
    const floats = new Float32Array(words.buffer, words.byteOffset, words.length);
    for (let pc = 0; pc + 4 < words.length;) {
      const head = words[pc];
      const opcode = (head << 16) >> 16;
      const sizeBytes = (head >>> 16) & 0xffff;
      if (opcode === ANM_OPCODE.END_OF_SCRIPT || opcode === ANM_OPCODE.DELETE) return null;
      if (opcode === ANM_OPCODE.POS) return { x: floats[pc + 2], y: floats[pc + 3] };
      pc += Math.max(2, sizeBytes / 4);
    }
    return null;
  }

  /**
   * Resolve one sprite to a Pixi texture, cut straight out of its page so a
   * pack costs one GPU upload however many expressions it holds.
   */
  async texture(anm: string, id: number): Promise<Texture | null> {
    const rect = this.sprite(anm, id);
    if (!rect) return null;
    const file = this.pageFile(anm, rect.page);
    if (!file) return null;
    const page = await this.page(FACE_ASSET_DIR + '/' + file);
    if (!page) return null;
    return new Texture({
      source: page.source,
      frame: new Rectangle(rect.x, rect.y, rect.width, rect.height),
    });
  }

  /** Load a page once and share it, nearest-filtered like all retail art. */
  private async page(file: string): Promise<Texture | null> {
    const existing = this.pages.get(file);
    if (existing !== undefined) return existing;
    const loaded = await loadAnmPage(file);
    this.pages.set(file, loaded);
    return loaded;
  }
}
