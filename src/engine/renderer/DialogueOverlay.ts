/**
 * The retail dialogue box, as a reusable engine layer.
 *
 * This is the presenter behind `Gui::DrawDialogue` (`Gui.cpp:942-1025`): a
 * translucent box that grows up from the bottom of the arcade region over its
 * first second, four character slots whose motion is driven by real ANM
 * virtual machines, and two left-aligned text lines.
 *
 * Nothing here knows about 永夜抄. The game hands in the arcade rect, the line
 * anchors, and two callbacks that resolve an ANM name plus an index into a
 * script and a texture; everything else - when a face enters, where it stands,
 * how it dims while its partner is talking - comes out of the animation data.
 */

import { Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { AnmVm, type AnmRng } from '../anm/AnmVm';
import type { AnmVec3 } from '../anm/AnmVm';

/** Quiet RNG for the scripts that never randomise, which is every face ANM. */
const stillRng: AnmRng = {
  randomU32InRange: () => 0,
  randomF32InRange: () => 0,
};

/** Resolve `pack`/`index` to animation words, or null when unavailable. */
export type ScriptResolver = (pack: string, index: number) => Int32Array | null;

/** Resolve `pack`/`sprite` to a texture plus its pixel width, or null. */
export type FaceResolver = (
  pack: string,
  sprite: number,
) => Promise<{ texture: SpriteTexture; width: number } | null>;

/** The subset of a Pixi texture the overlay needs. */
export interface SpriteTexture {
  width: number;
  height: number;
}

/** Where one dialogue line sits, in canvas pixels, top-left anchored. */
export interface DialogueLineAnchor {
  x: number;
  y: number;
}

export interface DialogueOverlayOptions {
  /** Arcade (playfield) rect, so the box tracks the field like the original. */
  arcade: AnmVec3;
  /** Arcade-region width; the box insets 16 px from each side. */
  arcadeWidth: number;
  /** Anchors for the two text lines, normally read out of `text.anm`. */
  lines: DialogueLineAnchor[];
  /** Point size used for the dialogue text. Retail `fontSize` is 15. */
  fontSize?: number;
  /** Font stack for the dialogue text. Retail bakes a Shift-JIS semi-bold. */
  fontFamily?: string;
  /** Slot count, four in the original (`portraits[4]`). */
  slots?: number;
  /** Resolve ANM scripts, one VM per slot. */
  scriptFor?: ScriptResolver;
  /** Resolve the bitmap a slot should show. */
  faceFor?: FaceResolver;
}

/** One character slot: an ANM VM plus the sprite it drives. */
interface FaceSlot {
  vm: AnmVm;
  sprite: Sprite;
  pack: string | null;
  /** `Gui.cpp:533-537`: a full-body page shifts left by 112 px. */
  offsetX: number;
  /**
   * `AnmVm::pos2.y`, the vertical half of the same channel. Op 2 writes it for
   * art wide enough to need lifting (`Gui.cpp:571-574`), and unlike `offsetX`
   * op 2's narrower branches deliberately leave it alone.
   */
  offsetY: number;
  pendingSprite: number;
}

/** Box height in pixels, and the frames it takes to reach it. */
const BOX_HEIGHT = 48;
const BOX_REVEAL_FRAMES = 60;
/** `Gui.cpp:957` insets the box from both sides of the arcade region. */
const BOX_INSET = 16;
/** `Gui.cpp:968-969`, top and bottom vertex alpha of the box gradient. */
const BOX_ALPHA_TOP = 0xd0 / 255;
const BOX_ALPHA_BOTTOM = 0x90 / 255;
/** Bands used to approximate that gradient; 8 is smooth across 48 pixels. */
const BOX_BANDS = 8;
/**
 * The `pos2` numbers live in `core/PortraitOffsets`, which keeps the two ops'
 * thresholds straight: op 1 has one branch at 128 px (`Gui.cpp:527-537`) and
 * op 2 has three (`Gui.cpp:566-590`).
 */
import { portraitScriptOffset, portraitSpriteOffset } from '../core/PortraitOffsets';
/**
 * Where the box starts, measured from the arcade top. `Gui.cpp:958` draws it at
 * backbuffer y=384 and the arcade region begins at y=16
 * (`GameManager.cpp:441-442`), which leaves 368.
 */
const BOX_TOP_IN_FIELD = 368;

export class DialogueOverlay {
  private readonly root = new Container();
  private readonly box = new Graphics();
  private readonly slots: FaceSlot[] = [];
  private readonly texts: Text[] = [];
  private readonly options: DialogueOverlayOptions;
  private reveal = 0;
  private active = false;

  constructor(options: DialogueOverlayOptions) {
    this.options = options;
    this.root.addChild(this.box);
    const slotCount = options.slots ?? 4;
    for (let slot = 0; slot < slotCount; slot++) {
      const face = new Sprite();
      face.visible = false;
      face.anchor.set(0, 0);
      this.root.addChild(face);
      this.slots.push({
        vm: new AnmVm(stillRng),
        sprite: face,
        pack: null,
        offsetX: 0,
        offsetY: 0,
        pendingSprite: -1,
      });
    }
    const style = new TextStyle({
      fontFamily: options.fontFamily ?? "'MS PGothic', 'Hiragino Kaku Gothic ProN', sans-serif",
      fontSize: options.fontSize ?? 15,
      fontWeight: '600',
      fill: 0xffffff,
    });
    for (const anchor of options.lines) {
      const text = new Text({ text: '', style });
      text.anchor.set(0, 0);
      text.position.set(anchor.x, anchor.y);
      this.root.addChild(text);
      this.texts.push(text);
    }
    this.root.visible = false;
  }

  /** Attach this layer above the gameplay, below the debug readout. */
  mount(parent: Container): this {
    parent.addChild(this.root);
    return this;
  }

  /** The message box is on screen; used by the caller to gate the timeline. */
  get showing(): boolean {
    return this.active;
  }

  /** `:949-953` the box grows with the message timer over its first second. */
  set revealed(frames: number) {
    this.reveal = Math.max(0, Math.min(1, frames / BOX_REVEAL_FRAMES));
  }

  /** Bind a slot to an ANM pack without running anything yet. */
  bind(slot: number, pack: string): void {
    const target = this.slots[slot];
    if (!target || target.pack === pack) return;
    target.pack = pack;
  }

  /**
   * `SetAndExecuteScriptIdx` plus the width test at `Gui.cpp:527-537`.
   *
   * Retail compares the slot's current sprite against 128 and writes the whole
   * of `pos2.x` from that one test — a single branch, so a 254 px full-body
   * page and a 510 px one both move by the same 112 px.
   */
  executeScript(slot: number, script: number): void {
    const target = this.slots[slot];
    const words = target?.pack ? (this.options.scriptFor?.(target.pack, script) ?? null) : null;
    if (!target || !words) return;
    target.vm.attach(words);
    this.applyScriptOffset(slot, target.sprite.texture.width || 0);
    this.sync(slot);
  }

  /**
   * `Gui.cpp:527-537`: op 1 parks a slot's `pos2.x` at -112 once its sprite is
   * wider than 128 px, and back at 0 below that. Split out so a test can pin the
   * threshold without a texture manager.
   */
  private applyScriptOffset(slot: number, width: number): void {
    const target = this.slots[slot];
    if (!target) return;
    target.offsetX = portraitScriptOffset(width).x;
  }

  /**
   * `Gui.cpp:566-590`: op 2 re-pins `pos2` from the sprite it has just loaded,
   * with its own three branches. The 256 px break is what separates the 254 px
   * full-body pages, which only shift by 80 px, from the 382 px and 510 px
   * spreads used by the late-stage bosses, which also get lifted by 50 px.
   *
   * Both narrower branches write `pos2.x` only, so a slot that once held
   * extra-wide art keeps its vertical lift after swapping to a bust — that is
   * retail's behaviour, and the fall-through below reproduces it.
   */
  private applySpriteOffset(slot: number, width: number): void {
    const target = this.slots[slot];
    if (!target) return;
    const offset = portraitSpriteOffset(width);
    target.offsetX = offset.x;
    // A `null` is retail not writing `pos2.y` on that branch, so the previous
    // lift survives a swap to narrower art.
    if (offset.y !== null) target.offsetY = offset.y;
  }

  /** `AnmManager::SetSprite`: swap the bitmap, keep the motion. */
  setSprite(slot: number, sprite: number): void {
    const target = this.slots[slot];
    if (!target || !target.pack) return;
    target.pendingSprite = sprite;
    const resolver = this.options.faceFor;
    const pack = target.pack;
    if (!resolver) return;
    void resolver(pack, sprite).then((face) => {
      if (!face || target.pendingSprite !== sprite) return;
      target.sprite.texture = face.texture as never;
      this.applySpriteOffset(slot, face.width);
      target.sprite.visible = target.vm.visible;
      this.sync(slot);
    });
  }

  /**
   * `AnmVm::SetInterrupt` (`AnmManager.hpp:309-312`). The message VM sends 3 to
   * bring a face in, 4 to send it away, and 6 for the cross-side exit.
   */
  interrupt(slot: number, code: number): void {
    if (code === 0) return;
    this.slots[slot]?.vm.setInterrupt(code);
  }

  /** `AnmManager::DrawTextLeft` on one line. */
  setLine(line: number, color: number, text: string): void {
    const target = this.texts[line];
    if (!target) return;
    target.text = text;
    target.style.fill = color;
    target.visible = text !== '';
  }

  /** The `" "` draw that retail uses to wipe a line. */
  clearLine(line: number): void {
    const target = this.texts[line];
    if (!target) return;
    target.text = '';
    target.visible = false;
  }

  /** Tear the whole box down, as `case 0` does at `Gui.cpp:392`. */
  hide(): void {
    this.active = false;
    this.root.visible = false;
    for (let slot = 0; slot < this.slots.length; slot++) {
      this.slots[slot].vm.reset();
      this.slots[slot].sprite.visible = false;
    }
    for (const text of this.texts) this.clearLine(this.texts.indexOf(text));
  }

  /** Show the box and start its reveal from zero. */
  show(): void {
    this.active = true;
    this.root.visible = true;
    this.reveal = 0;
  }

  /**
   * One readable line per slot: which face ANM it holds, the expression it is
   * showing, where it stands and how bright. `pos` is the animation VM's own
   * position and `off` is the width-tier pin from `core/PortraitOffsets` that
   * `sync` adds on top of it, so a browser pass can tell the two channels apart
   * instead of reading one as the other. `w` is the bitmap width that chose the
   * tier: without it a zero offset is ambiguous between "narrow art" and "the
   * tier never ran". Nothing in the game reads this; it exists so a pass can
   * tell "the script said enter" from "a texture never arrived", which look
   * identical on screen.
   */
  faceDebug(): string[] {
    return this.slots.map((slot) => {
      if (!slot.pack) return '-';
      const vm = slot.vm;
      return (
        slot.pack +
        '#' +
        slot.pendingSprite +
        (vm.visible ? '' : ' hidden') +
        ' pos ' +
        Math.round(vm.pos.x) +
        ',' +
        Math.round(vm.pos.y) +
        ' off ' +
        Math.round(slot.offsetX) +
        ',' +
        Math.round(slot.offsetY) +
        ' w' +
        (slot.sprite.texture.width || 0) +
        ' ' +
        'a' +
        Math.round(vm.color1.a)
      );
    });
  }

  /** One frame: step every slot VM, then redraw the box. */
  step(frames = 1): void {
    if (!this.active) return;
    for (let slot = 0; slot < this.slots.length; slot++) {
      for (let f = 0; f < frames; f++) this.slots[slot].vm.step();
      this.sync(slot);
    }
    this.drawBox();
  }

  /** Copy one VM onto its sprite. */
  private sync(slot: number): void {
    const target = this.slots[slot];
    if (!target) return;
    const vm = target.vm;
    target.sprite.visible = vm.visible;
    target.sprite.x = vm.pos.x + target.offsetX;
    target.sprite.y = vm.pos.y + target.offsetY;
    target.sprite.alpha = vm.color1.a / 255;
    target.sprite.tint = ((vm.color1.r & 0xff) << 16) | ((vm.color1.g & 0xff) << 8) | (vm.color1.b & 0xff);
  }

  /**
   * `Gui.cpp:957-979`: a black quad across the arcade region whose vertex alpha
   * runs from 0xd0 at the top to 0x90 at the bottom. Pixi fills are flat, so the
   * gradient is rebuilt from bands; a partial box still fades like the full one.
   */
  private drawBox(): void {
    const arcade = this.options.arcade;
    const height = BOX_HEIGHT * this.reveal;
    const left = arcade.x + BOX_INSET;
    const right = arcade.x + this.options.arcadeWidth - BOX_INSET;
    const top = arcade.y + BOX_TOP_IN_FIELD;
    this.box.clear();
    if (height <= 0) return;
    const bands = Math.max(1, Math.min(BOX_BANDS, Math.ceil(height)));
    const bandHeight = height / bands;
    for (let band = 0; band < bands; band++) {
      const at = (band + 0.5) / bands;
      const alpha = BOX_ALPHA_TOP + (BOX_ALPHA_BOTTOM - BOX_ALPHA_TOP) * at;
      this.box
        .beginFill(0x000000, alpha)
        .drawRect(left, top + band * bandHeight, right - left, bandHeight + 0.5)
        .endFill();
    }
  }

  destroy(): void {
    this.root.destroy({ children: true });
  }
}
