/**
 * The retail stage-title card, as a reusable engine layer.
 *
 * `Gui.cpp:2281` preloads one `stgNNtxt.anm` per stage and `:2307` runs scripts
 * 0..3 on four ANM VMs the moment that stage takes the screen: the stage number,
 * the stage name, the poem, and the boss line. `:766-770` re-runs script 3 with an
 * explicit sprite whenever a stage message announces the next boss, which is how
 * one timeline names two different fights.
 *
 * Nothing here knows about 永夜抄. The game supplies the pack name and two
 * resolvers, and every position, fade and slide comes out of the animation data.
 */

import { Container, Sprite } from 'pixi.js';
import { AnmVm, type AnmRng } from '../anm/AnmVm';

/** Quiet RNG: the title scripts never randomise. */
const stillRng: AnmRng = {
  randomU32InRange: () => 0,
  randomF32InRange: () => 0,
};

/** The part of a Pixi texture this layer touches. */
export interface TitleCell {
  texture: unknown;
}

/** Resolve `pack`/`index` to ANM words, or null when the script is unavailable. */
export type TitleScriptResolver = (pack: string, index: number) => Int32Array | null;

/** Resolve `pack`/`sprite` to a bitmap, or null while the art has not landed. */
export type TitleCellResolver = (pack: string, sprite: number) => TitleCell | null;

export interface StageTitleOptions {
  scriptFor: TitleScriptResolver;
  cellFor: TitleCellResolver;
  /** VM count; retail keeps four (`Gui::Impl::vm2a44[0..3]`). */
  slots?: number;
}

/** One card element: an ANM VM plus the sprite it drives. */
interface TitleSlot {
  vm: AnmVm;
  sprite: Sprite;
  /** The cell currently bound, so a late texture retries without a churn. */
  cell: number;
}

export class StageTitleOverlay {
  private readonly root = new Container();
  private readonly slots: TitleSlot[] = [];
  private readonly options: StageTitleOptions;
  private pack: string | null = null;

  constructor(options: StageTitleOptions) {
    this.options = options;
    const count = options.slots ?? 4;
    for (let i = 0; i < count; i++) {
      const sprite = new Sprite();
      sprite.visible = false;
      // ANM `POS` names the sprite centre unless a script runs op 22, and none of
      // the four title scripts do.
      sprite.anchor.set(0.5, 0.5);
      this.root.addChild(sprite);
      this.slots.push({ vm: new AnmVm(stillRng), sprite, cell: -1 });
    }
    this.root.visible = false;
  }

  /** Attach above the gameplay, below the debug readout. */
  mount(parent: Container): this {
    parent.addChild(this.root);
    return this;
  }

  /** Name the art pack to read, without starting anything. */
  bind(pack: string | null): void {
    if (this.pack === pack) return;
    this.pack = pack;
    for (const slot of this.slots) {
      slot.cell = -1;
      slot.vm.reset();
      slot.sprite.visible = false;
    }
    this.root.visible = false;
  }

  /** `Gui.cpp:2307`: `ExecuteAnmIdxArray(vm2a44, 0, 4)`. */
  start(): void {
    for (let i = 0; i < this.slots.length; i++) this.executeScript(i, i);
  }

  /** `AnmManager::SetAndExecuteScriptIdx`: restart one slot on its own script. */
  executeScript(slot: number, script: number): void {
    const target = this.slots[slot];
    if (!target || !this.pack) return;
    const words = this.options.scriptFor(this.pack, script);
    if (!words) return;
    target.vm.attach(words);
    target.cell = -1;
    this.root.visible = true;
  }

  /**
   * `Gui.cpp:767-770`: `SetSprite` on one slot, keeping its motion.
   *
   * The boss line is script 3 with the sprite pushed by the announcement index, so
   * the same slide-in can name the second boss without a second script.
   */
  setSprite(slot: number, sprite: number): void {
    const target = this.slots[slot];
    if (!target) return;
    target.vm.sprite = sprite;
    target.cell = -1;
  }

  /**
   * `Gui.cpp:1113`: the card advances every frame, deleted or not.
   *
   * Each script ends in `Delete` (`op 1`) at its own time, so the layer only hides
   * once every slot has retired or faded.
   */
  step(frames = 1): void {
    if (!this.pack) return;
    let alive = false;
    for (const slot of this.slots) {
      for (let f = 0; f < frames; f++) slot.vm.step();
      this.sync(slot);
      if (!slot.vm.deleted && slot.sprite.visible) alive = true;
    }
    this.root.visible = alive;
  }

  /** True while any element still has art on screen. */
  get showing(): boolean {
    return this.root.visible;
  }

  /** Tear the card down, e.g. when a run leaves the stage. */
  hide(): void {
    for (const slot of this.slots) {
      slot.vm.reset();
      slot.sprite.visible = false;
      slot.cell = -1;
    }
    this.root.visible = false;
  }

  /** One readable line per slot, for a browser pass to tell "no art" from "no script". */
  debugLines(): string[] {
    return this.slots.map((slot) => {
      const vm = slot.vm;
      return (
        (this.pack ?? '-') +
        '#' +
        vm.sprite +
        (vm.deleted ? ' done' : vm.visible ? '' : ' off') +
        ' ' +
        Math.round(vm.pos.x) +
        ',' +
        Math.round(vm.pos.y) +
        ' a' +
        Math.round(vm.color1.a)
      );
    });
  }

  /** Copy one VM onto its sprite, binding the cell the script is asking for. */
  private sync(slot: TitleSlot): void {
    const { vm, sprite } = slot;
    if (!this.pack || vm.deleted || !vm.visible || vm.color1.a === 0) {
      sprite.visible = false;
      return;
    }
    if (slot.cell !== vm.sprite) {
      const cell = this.options.cellFor(this.pack, vm.sprite);
      if (!cell) {
        sprite.visible = false;
        return;
      }
      sprite.texture = cell.texture as never;
      slot.cell = vm.sprite;
    }
    sprite.visible = true;
    sprite.x = vm.pos.x;
    sprite.y = vm.pos.y;
    sprite.alpha = vm.color1.a / 255;
    sprite.tint = ((vm.color1.r & 0xff) << 16) | ((vm.color1.g & 0xff) << 8) | (vm.color1.b & 0xff);
    sprite.rotation = vm.rotation.z;
    sprite.scale.set(vm.scale.x * (vm.flip & 1 ? -1 : 1), vm.scale.y * (vm.flip & 2 ? -1 : 1));
  }

  destroy(): void {
    this.root.destroy({ children: true });
  }
}
