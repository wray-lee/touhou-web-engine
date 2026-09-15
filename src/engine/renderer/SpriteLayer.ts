import { Container, Sprite } from 'pixi.js';

export interface SpritePlacement {
  texture: Sprite['texture'];
  x: number;
  y: number;
  /** Drawn width/height in game pixels; omit to use the texture's natural size. */
  width?: number;
  height?: number;
  rotation?: number;
  alpha?: number;
  tint?: number;
  anchorX?: number;
  anchorY?: number;
}

/**
 * A pooled layer of Pixi sprites.
 *
 * Every frame the renderer `begin()`s, issues `draw()` calls, then `end()`s;
 * sprites beyond the frame's usage are hidden rather than destroyed, so a
 * 2000-bullet screen reuses the same objects instead of churning the GC.
 */
export class SpriteLayer {
  public readonly container: Container;
  private readonly pool: Sprite[] = [];
  private cursor = 0;

  constructor(parent: Container, name = 'layer') {
    this.container = new Container();
    this.container.label = name;
    parent.addChild(this.container);
  }

  begin(): void {
    this.cursor = 0;
  }

  /** Returns the sprite used for this slot, or null when nothing can be drawn. */
  draw(placement: SpritePlacement): Sprite | null {
    if (!placement.texture) return null;
    const sprite = this.acquire();
    sprite.texture = placement.texture;
    sprite.anchor.set(placement.anchorX ?? 0.5, placement.anchorY ?? 0.5);
    sprite.position.set(placement.x, placement.y);
    sprite.rotation = placement.rotation ?? 0;
    sprite.alpha = placement.alpha ?? 1;
    sprite.visible = true;
    if (placement.tint !== undefined) sprite.tint = placement.tint;
    if (placement.width !== undefined && placement.height !== undefined) {
      sprite.scale.set(placement.width / sprite.texture.width, placement.height / sprite.texture.height);
    } else if (placement.width !== undefined) {
      const ratio = placement.width / sprite.texture.width;
      sprite.scale.set(ratio);
    } else {
      sprite.scale.set(1);
    }
    return sprite;
  }

  acquire(): Sprite {
    let sprite = this.pool[this.cursor];
    if (!sprite) {
      sprite = new Sprite();
      sprite.anchor.set(0.5);
      this.pool.push(sprite);
      this.container.addChild(sprite);
    }
    this.cursor++;
    return sprite;
  }

  /** Hide pooled sprites this frame did not touch. */
  end(): void {
    for (let i = this.cursor; i < this.pool.length; i++) {
      if (this.pool[i].visible) this.pool[i].visible = false;
    }
  }

  get activeCount(): number {
    return this.cursor;
  }

  destroy(): void {
    this.pool.length = 0;
  }
}
