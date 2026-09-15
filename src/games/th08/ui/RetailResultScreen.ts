/**
 * The retail settlement screen: layout, interrupt codes, and the eight stat rows.
 *
 * Three files in `th08web-ref` describe this screen and none of them is a
 * stylesheet, which is the point. `AddedCallback:2840` pairs script `i` with VM
 * `i`; `CheckConfirmButton:1956` is the state machine; `DrawFinalStats:2154` is
 * the only place the numbers get positioned, and it does so by adding to the
 * anchor VM's position. So the whole right-hand column of the panel is derived
 * from wherever VM 71 happens to be, and the animation data alone decides that.
 *
 * What is kept here is therefore only what the original hard-codes: the offsets,
 * the row pitch, the printf shapes, and the timing constants.
 */

import type { AnmScreen } from '../../../engine/renderer/AnmScreen';
import { AnmScreen as AnmScreenClass } from '../../../engine/renderer/AnmScreen';
import { anmScriptFromBase64 } from '../../../engine/anm/AnmVm';
import {
  RESULT_BACKDROP,
  RESULT_SCRIPT,
  TH08_RESULT_CELLS,
  TH08_RESULT_PAGES,
  TH08_RESULT_SCRIPTS,
} from '../data/th08-result-anm';

/** `ResultScreen.cpp:60-82`, the interrupt codes the screen scripts branch on. */
export const RESULT_INTERRUPT = {
  HIDE: 1,
  EXITING: 2,
  LISTING_APPEAR: 3,
  LISTING_MOVE_PAGE: 10,
  QUESTION_SAVE_REPLAY: 11,
  REPLAY_APPEAR: 12,
  REPLAY_OVERWRITE: 13,
  CANNOT_SAVE_REPLAY_RETRY: 14,
  SELECT_REPLAY: 16,
  HIDE_REPLAY: 17,
  /** Drives the stats panel in; `CheckConfirmButton` holds it for 30 frames. */
  PLAYER_RESULTS_SHOW: 18,
  CANNOT_SAVE_REPLAY_SLOW_MODE: 19,
  SPRITE_SELECTED: 20,
  SPRITE_NOT_SELECTED: 21,
  SPRITE_APPEAR: 22,
  SPRITE_CHOSEN: 23,
  CHARACTER_DISAPPEAR: 24,
  CHARACTER_APPEAR: 25,
} as const;

/**
 * Frame counts from `CheckConfirmButton` and `OnUpdate`. A panel cannot be
 * confirmed while it is still arriving, which is why the original gates on
 * `frameTimer >= 90` rather than accepting input immediately.
 */
export const RESULT_TIMING = {
  /** Interrupt 18 is re-asserted while `frameTimer <= 30`. */
  showHoldFrames: 30,
  /** First frame on which the confirm button is read. */
  confirmAfterFrames: 90,
  /** `STATS_TO_SAVE_TRANSITION` waits 30 frames before asking about the replay. */
  transitionFrames: 30,
} as const;

/**
 * Where `DrawFinalStats` puts the numbers, relative to VM 71's own position.
 *
 * `strPos = vm->pos` then `x += 210`, `y += 32`, and every row after that is
 * `y += 22`; the score column adds one more `spaceWidth` before the rest.
 */
export const RESULT_STATS_LAYOUT = {
  textOffsetX: 210,
  textOffsetY: 32,
  rowPitch: 22,
  /**
   * Retail `spaceWidth`, the advance of one ASCII cell. `AsciiManager.cpp:275`
   * initialises it to 13 and the settlement screen never changes it, so the four
   * leading spaces of a percentage row are 52 pixels, not a guess.
   */
  spaceWidth: 13,
  /** The score field is `%9d`, so nine cells wide. */
  scoreFieldWidth: 9,
} as const;

/**
 * `g_RightAlignedDifficultyList` (`ResultScreen.cpp:98`), padded to ten columns.
 * The retail list is in difficulty order, so the index is the difficulty.
 */
export const RIGHT_ALIGNED_DIFFICULTY: Readonly<Record<string, string>> = {
  easy: '      Easy',
  normal: '    Normal',
  hard: '      Hard',
  lunatic: '   Lunatic',
  extra: '     Extra',
};

/** Text colours the original sets while drawing the listings (`OnDraw:2484-2506`). */
export const RESULT_TEXT_COLOR = {
  /** `0xffe0e0ef`, the column header. */
  header: '#e0e0ef',
  /** `0xffffc0c0`, a settled row: retail's pale yellow. */
  row: '#ffffc0',
  /** `0xfff0f0ff`, the row the player has just earned. */
  highlight: '#fff0f0',
  /** `0xc0ffc0c0`, every other row while a name is being typed. */
  dimmed: '#ffc0c0',
} as const;

/**
 * Frame count behind `completion = g_GameManager.unk3de04 / 195559.0f`.
 *
 * `unk3de04` is the accumulated stage play time the original keeps in the score
 * file; `DrawFinalStats` divides it by a constant that stands for "every stage,
 * once". We only have the frames this run actually simulated, so the ratio is
 * honest but lower than a retail file would show after unlocking everything.
 */
export const RESULT_COMPLETION_FRAMES = 195559;

/** What the eight stat rows need. */
export interface ResultStats {
  /** `displayScore`, the score as shown, not the raw counter. */
  score: number;
  /** Continues spent; `%9d` on its own row and the tenth column of the score row. */
  retries: number;
  difficulty: string;
  /** Frames simulated across the run, before the completion divisor. */
  playFrames: number;
  /** `GetDeaths()`. */
  deaths: number;
  /** `GetBombsUsed()`. */
  bombsUsed: number;
  /** `spellcardsCaptured`. */
  cardsCaptured: number;
  /** `lagNumerator / lagDenominator`, the fraction of frames that ran slow. */
  lagFraction: number;
  /** True when the run finished the campaign, which forces 100 %. */
  fullCompletion?: boolean;
}

/** `%9d`: retail's right-aligned score/death columns. */
export function pad9(value: number): string {
  const text = String(Math.max(0, Math.floor(value)));
  return text.length >= 9 ? text.slice(-9) : text.padStart(9, ' ');
}

/** `"%3.2f%%"` with retail's four leading spaces, as used by the two percentage rows. */
export function padPercent(value: number): string {
  return '    ' + value.toFixed(2) + '%';
}

/**
 * `completion`, exactly as `DrawFinalStats:2172-2216` computes it.
 *
 * The divisor is the same below Extra; the cap at 0.99 is real, so a full clear
 * still reads 99.00 % unless the campaign flag forces the 100 branch.
 */
export function completionPercent(stats: ResultStats): number {
  if (stats.fullCompletion) return 100;
  const raw = stats.playFrames / RESULT_COMPLETION_FRAMES;
  return Math.min(raw, 0.99) * 100;
}

/**
 * The slow rate the panel prints, from the fraction of frames that overran.
 *
 * `DrawFinalStats:2240-2254` maps the raw ratio through
 * `((lag - 0.5) * 2)` before inverting it, so a run that only dipped a little
 * over budget still reports a perfect 100 %.
 */
export function slowdownPercent(lagFraction: number): number {
  let rate = (lagFraction - 0.5) * 2;
  if (rate < 0) rate = 0;
  else if (rate >= 1) rate = 1;
  return (1 - rate) * 100;
}

/**
 * The eight rows in on-screen order.
 *
 * `DrawFinalStats` emits them top to bottom with a 22-frame pitch, and each is
 * right-aligned in a nine-column field except the two percentages, which carry
 * their own padding inside the string.
 */
export function resultStatRows(stats: ResultStats): string[] {
  const retryDigit = String(Math.min(9, Math.max(0, Math.floor(stats.retries))));
  /*
   * The full-clear branch is a different format string in the original:
   * `"      100%%"`, six spaces and no decimals, not a rounded percentage.
   */
  const completion = stats.fullCompletion ? '      100%' : padPercent(completionPercent(stats));
  return [
    pad9(stats.score) + retryDigit,
    RIGHT_ALIGNED_DIFFICULTY[stats.difficulty] ?? RIGHT_ALIGNED_DIFFICULTY.normal,
    completion,
    pad9(stats.retries),
    pad9(stats.deaths),
    pad9(stats.bombsUsed),
    pad9(stats.cardsCaptured),
    padPercent(slowdownPercent(stats.lagFraction)),
  ];
}

/** Decoded words per script index, built once; the screen re-runs them often. */
const wordCache = new Map<number, Int32Array | null>();

/** The ANM words for one settlement script, or null when the index is unused. */
export function resultScriptWords(index: number): Int32Array | null {
  if (wordCache.has(index)) return wordCache.get(index) ?? null;
  const script = TH08_RESULT_SCRIPTS[index];
  let words: Int32Array | null = null;
  if (script) {
    try {
      words = anmScriptFromBase64(script.base64);
    } catch {
      words = null;
    }
  }
  wordCache.set(index, words);
  return words;
}

/** The VM index that anchors the stats column. */
export const RESULT_STATS_VM = RESULT_SCRIPT.PLAYER_RESULTS;

/**
 * Build the settlement screen over a caller-supplied 2D context.
 *
 * The picture is 640x480 because that is the viewport `OnDraw` sets before it
 * blits the backdrop; the host scales the canvas with CSS the same way it scales
 * the playfield.
 */
export function createRetailResultScreen(): AnmScreen {
  return new AnmScreenClass({
    slots: TH08_RESULT_SCRIPTS.length,
    pages: TH08_RESULT_PAGES,
    cells: TH08_RESULT_CELLS,
    scriptFor: resultScriptWords,
    width: 640,
    height: 480,
    backdrop: RESULT_BACKDROP,
  });
}

/** Where the stats column starts, in picture coordinates. */
export interface ResultAnchor {
  x: number;
  y: number;
  /** Picture size the coordinates assume, so a host can map them to CSS. */
  width: number;
  height: number;
}

/**
 * A live settlement screen over one canvas.
 *
 * The host owns the frame clock; this only reproduces what `OnUpdate` and
 * `OnDraw` do with it, which keeps the panel's animation, the confirmation gate,
 * and the position of every number on one timeline.
 */
export class RetailResultScreen {
  private readonly screen: AnmScreen;
  private readonly ctx: CanvasRenderingContext2D;
  /** `ResultScreen::frameTimer`. */
  private frameTimer = 0;
  private showing = false;

  private constructor(
    readonly canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
  ) {
    this.ctx = ctx;
    this.screen = createRetailResultScreen();
  }

  /** Build the screen and fetch its art; false when the extracted art is absent. */
  static async mount(canvas: HTMLCanvasElement): Promise<RetailResultScreen | null> {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const screen = new RetailResultScreen(canvas, ctx);
    if (!(await screen.screen.load())) return null;
    screen.screen.start();
    return screen;
  }

  /**
   * Enter the stats state.
   *
   * `CheckConfirmButton:1962` re-asserts interrupt 18 on VM 71 for thirty frames
   * rather than firing it once, so the panel restarts its arrival every time the
   * screen is entered.
   */
  show(): void {
    this.showing = true;
    this.frameTimer = 0;
  }

  /** Queue the exit interrupt on every slot, the original's `RESULT_INTERRUPT_EXITING`. */
  exit(): void {
    this.showing = false;
    this.screen.interruptAll(RESULT_INTERRUPT.EXITING);
    this.frameTimer = 0;
  }

  /** True once the panel has run long enough to accept a confirm. */
  get confirmable(): boolean {
    return this.frameTimer >= RESULT_TIMING.confirmAfterFrames;
  }

  get framesSinceShown(): number {
    return this.frameTimer;
  }

  /** `OnUpdate`'s ExecuteScript loop plus `OnDraw`. */
  frame(): void {
    if (this.showing && this.frameTimer <= RESULT_TIMING.showHoldFrames) {
      this.screen.interrupt(RESULT_STATS_VM, RESULT_INTERRUPT.PLAYER_RESULTS_SHOW);
    }
    this.screen.step();
    this.screen.draw(this.ctx);
    this.frameTimer++;
  }

  /**
   * Where `DrawFinalStats` would put the first number, read from the live VM.
   *
   * The offsets are the original's, but the base position is whatever the bytecode
   * settled on, so relifting the pack moves the text with the art.
   */
  statsAnchor(): ResultAnchor | null {
    const vm = this.screen.vmAt(RESULT_STATS_VM);
    if (!vm) return null;
    return {
      x: vm.pos.x + vm.pos2.x + RESULT_STATS_LAYOUT.textOffsetX,
      y: vm.pos.y + vm.pos2.y + RESULT_STATS_LAYOUT.textOffsetY,
      width: 640,
      height: 480,
    };
  }

  /** Where a listing row starts, which `OnDraw:2481` offsets by 24/18 from VM 40. */
  listingAnchor(): ResultAnchor | null {
    const vm = this.screen.vmAt(RESULT_SCRIPT.LISTING);
    if (!vm) return null;
    return {
      x: vm.pos.x + vm.pos2.x + 24,
      y: vm.pos.y + vm.pos2.y + 18,
      width: 640,
      height: 480,
    };
  }

  /** Per-slot readout, so a browser pass can tell "no art" from "no script". */
  debugLines(): string[] {
    return this.screen.debugLines().filter((line) => !line.includes(' off'));
  }

  destroy(): void {
    this.showing = false;
    this.screen.destroy();
  }
}
