import { Assets, Texture } from 'pixi.js';
import { resolveAssetUrl } from '../core/ResourceResolver';

export type AssetManifest = Record<string, string>;

export class AssetManager {
  private readonly textures = new Map<string, Texture>();

  async load(key: string, url: string): Promise<Texture | null> {
    try {
      const texture = (await Assets.load(resolveAssetUrl(url))) as Texture;
      this.textures.set(key, texture);
      return texture;
    } catch {
      return null;
    }
  }

  async loadManifest(manifest: AssetManifest = {}): Promise<void> {
    await Promise.all(Object.entries(manifest).map(([key, url]) => this.load(key, url)));
  }

  register(key: string, texture: Texture): void {
    this.textures.set(key, texture);
  }

  /**
   * Drop a registered texture.
   *
   * Games use this when real assets replace a procedural placeholder: the
   * renderer already skips a layer whose texture is missing, so unregistering
   * is how the placeholder stops drawing.
   */
  unregister(key: string): boolean {
    return this.textures.delete(key);
  }

  get(key: string): Texture | undefined {
    return this.textures.get(key);
  }

  has(key: string): boolean {
    return this.textures.has(key);
  }

  clear(): void {
    this.textures.clear();
  }
}
