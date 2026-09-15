/**
 * A full-screen picture driven entirely by ANM bytecode.
 *
 * Several of these games use the same animation VM for their menu furniture that
 * they use for gameplay: 永夜抄's settlement screen is one JPEG blitted to the
 * backbuffer plus seventy-two VMs, one per script index, and every label, panel
 * and slide on it is placed by the bytecode rather than by the host
 * (`ResultScreen::AddedCallback:2840`, `OnDraw:2461-2471`). Reimplementing that
 * layout by hand is how ports end up with a screen that merely has the same words
 * on it, so this layer runs the real scripts and draws whatever they ask for.
 *
 * It is deliberately title-agnostic: a game supplies pages, cells, scripts and an
 * interrupt policy, and this file knows nothing about what any of them mean. The
 * rasteriser is a 2D canvas rather than the WebGL scene graph, because these
 * screens replace the playfield instead of compositing over it.
 */

import { AnmVm, type AnmRng } from '../anm/AnmVm';

/** Quiet RNG: interface scripts do not randomise. */
const stillRng: AnmRng = {
  randomU32InRange: () => 0,
  randomF32InRange: () => 0,
};

/** One atlas rect, addressed by the ANM sprite id a script selects. */
export interface AnmScreenCell {
  id: number;
  /** Index into `AnmScreenOptions.pages`. */
  tex: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AnmScreenOptions {
  /** VM count; the retail settlement screen keeps seventy-two. */
  slots: number;
  /** Image URLs, indexed by a cell's `tex`. */
  pages: readonly string[];
  cells: readonly AnmScreenCell[];
  /** Words for one script index, or null when the index is unused. */
  scriptFor: (index: number) => Int32Array | null;
  /** Logical picture size, which is what the bytecode's coordinates assume. */
  width: number;
  height: number;
  /** Full-frame art drawn before any VM, like `CopySurfaceToBackbuffer`. */
  backdrop?: string;
}

/** One script slot: its VM plus the cell currently bound to it. */
interface AnmScreenSlot {
  vm: AnmVm;
  /** Sprite id the slot last resolved, so a late page load retries on its own. */
  bound: number;
}

/** Load an image, resolving null instead of rejecting when it is missing. */
function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/**
 * An ANM-driven screen, drawn into a caller-owned 2D context.
 *
 * Lifecycle mirrors the original: `start()` is `AddedCallback` (every VM takes its
 * own script index and resets), `interrupt()` is a write to `pendingInterrupt`,
 * `step()` is the calc chain, and `draw()` is the draw chain.
 */
export class AnmScreen {
  private readonly options: AnmScreenOptions;
  private readonly slots: AnmScreenSlot[] = [];
  private pages: (HTMLImageElement | null)[] = [];
  private backdropImage: HTMLImageElement | null = null;
  private bySprite = new Map<number, AnmScreenCell>();
  /** Colourised cells, keyed by `sprite:color`; a label keeps its tint all screen. */
  private readonly tintCache = new Map<string, HTMLCanvasElement>();
  private loaded = false;
  private started = false;

  constructor(options: AnmScreenOptions) {
    this.options = options;
    for (const cell of options.cells) this.bySprite.set(cell.id, cell);
    for (let i = 0; i < options.slots; i++) {
      this.slots.push({ vm: new AnmVm(stillRng), bound: -1 });
    }
  }

  /**
   * Fetch every page plus the backdrop.
   *
   * Retail art is extracted locally and stays out of the repository, so a missing
   * page is a normal state: the screen then draws whatever did land, which is how
   * the original behaves when a surface fails to load.
   */
  async load(): Promise<boolean> {
    const [backdrop, ...pages] = await Promise.all([
      this.options.backdrop ? loadImage(this.options.backdrop) : Promise.resolve(null),
      ...this.options.pages.map((url) => loadImage(url)),
    ]);
    this.backdropImage = backdrop;
    this.pages = pages;
    this.loaded = Boolean(backdrop || pages.some(Boolean));
    return this.loaded;
  }

  /** True once at least one picture is on screen. */
  get ready(): boolean {
    return this.loaded;
  }

  /** `AddedCallback`: hand script `i` to VM `i` and let the bytecode place it. */
  start(): void {
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const words = this.options.scriptFor(i);
      slot.bound = -1;
      if (words) {
        slot.vm.attach(words);
      } else {
        slot.vm.reset();
      }
    }
    this.started = true;
  }

  /**
   * Queue an interrupt on one slot, the original's `pendingInterrupt` write.
   *
   * The retail screens re-assert the code every frame for a while
   * (`CheckConfirmButton` holds interrupt 18 for thirty frames), so callers are
   * expected to drive this from their own state rather than fire it once.
   */
  interrupt(slot: number, code: number): void {
    this.slots[slot]?.vm.setInterrupt(code);
  }

  /** Queue an interrupt on every slot, which is how a screen hides or exits as one. */
  interruptAll(code: number): void {
    for (const slot of this.slots) slot.vm.setInterrupt(code);
  }

  /** Advance every VM, the draw chain's `ExecuteScript` loop. */
  step(frames = 1): void {
    if (!this.started) return;
    for (const slot of this.slots) {
      for (let f = 0; f < frames; f++) slot.vm.step();
    }
  }

  /**
   * `ResultScreen::OnDraw:2463-2471`.
   *
   * Position is `pos + pos2` for the frame only: the original adds the offset,
   * draws, and puts `pos` back, so `pos2` behaves as a constant displacement
   * rather than a velocity.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { width, height } = this.options;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (this.backdropImage) {
      ctx.globalAlpha = 1;
      ctx.drawImage(this.backdropImage, 0, 0, width, height);
    }
    for (const slot of this.slots) {
      const vm = slot.vm;
      if (vm.deleted || !vm.visible || vm.color1.a === 0) continue;
      const cell = this.bySprite.get(vm.sprite);
      const page = cell ? this.pages[cell.tex] : null;
      if (!cell || !page || cell.w <= 0 || cell.h <= 0) continue;
      const alpha = Math.max(0, Math.min(1, vm.color1.a / 255));
      const x = vm.pos.x + vm.pos2.x;
      const y = vm.pos.y + vm.pos2.y;
      const w = cell.w * vm.scale.x;
      const h = cell.h * vm.scale.y;
      // ANM anchor 3 is top-left; otherwise `POS` names the centre.
      const left = vm.anchor === 3 ? x : x - w / 2;
      const top = vm.anchor === 3 ? y : y - h / 2;
      ctx.globalAlpha = alpha;
      if (vm.blendMode === 1) ctx.globalCompositeOperation = 'lighter';
      const tinted = this.tintOf(vm.color1.r, vm.color1.g, vm.color1.b);
      if (tinted) {
        ctx.drawImage(
          this.tint(page, cell, tinted),
          0,
          0,
          cell.w,
          cell.h,
          Math.round(left),
          Math.round(top),
          Math.round(w),
          Math.round(h),
        );
      } else {
        ctx.drawImage(
          page,
          cell.x,
          cell.y,
          cell.w,
          cell.h,
          Math.round(left),
          Math.round(top),
          Math.round(w),
          Math.round(h),
        );
      }
      if (vm.blendMode === 1) ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  /** One readable line per slot, so a browser pass can tell "no art" from "no script". */
  debugLines(): string[] {
    return this.slots.map((slot, index) => {
      const vm = slot.vm;
      return (
        '#' +
        index +
        ' sp' +
        vm.sprite +
        (vm.deleted ? ' done' : vm.visible ? '' : ' off') +
        ' ' +
        Math.round(vm.pos.x + vm.pos2.x) +
        ',' +
        Math.round(vm.pos.y + vm.pos2.y) +
        ' a' +
        Math.round(vm.color1.a)
      );
    });
  }

  /** The VM of one slot, for hosts that need its live position to place text. */
  vmAt(slot: number): AnmVm | null {
    return this.slots[slot]?.vm ?? null;
  }

  destroy(): void {
    this.slots.length = 0;
    this.pages = [];
    this.backdropImage = null;
    this.tintCache.clear();
    this.started = false;
  }

  /** Null when the colour is plain white, which is the common case. */
  private tintOf(r: number, g: number, b: number): number | null {
    if (r === 255 && g === 255 && b === 255) return null;
    return ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
  }

  /**
   * Multiply one cell by a VM colour.
   *
   * A 2D canvas has no vertex colour, so the cheap equivalent is a source-in
   * pass over a scratch buffer. Results are cached per cell and colour because a
   * label keeps its tint for the whole screen.
   */
  private tint(page: HTMLImageElement, cell: AnmScreenCell, color: number): HTMLCanvasElement {
    const key = `${cell.id}:${color}`;
    const hit = this.tintCache.get(key);
    if (hit) return hit;
    const out = document.createElement('canvas');
    out.width = cell.w;
    out.height = cell.h;
    const c = out.getContext('2d');
    if (c) {
      c.drawImage(page, cell.x, cell.y, cell.w, cell.h, 0, 0, cell.w, cell.h);
      c.globalCompositeOperation = 'multiply';
      c.fillStyle =
        '#' +
        (((color >> 16) & 0xff).toString(16).padStart(2, '0') +
          ((color >> 8) & 0xff).toString(16).padStart(2, '0') +
          (color & 0xff).toString(16).padStart(2, '0'));
      c.fillRect(0, 0, cell.w, cell.h);
      c.globalCompositeOperation = 'destination-in';
      c.drawImage(page, cell.x, cell.y, cell.w, cell.h, 0, 0, cell.w, cell.h);
    }
    this.tintCache.set(key, out);
    return out;
  }
}
