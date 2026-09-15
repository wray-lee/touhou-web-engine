// @vitest-environment jsdom
/**
 * The ANM-driven screen layer, checked against a synthetic pack.
 *
 * Nothing here imports 永夜抄 data on purpose. The layer's whole claim is that a
 * title can hand it pages, cells, scripts and an interrupt policy and get the
 * original's picture out, so the proof has to come from a pack this file makes
 * up. The instruction shapes are the real ones (`{size<<16|op}`, then
 * `{time<<16|varMask}`, then operands), exactly as the VM reads them.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnmScreen, type AnmScreenCell } from './AnmScreen';

/** URLs whose load should fail, so a test can simulate missing art. */
let failUrls: string[] = [];

/** An image that settles as soon as a src is set, so no network is needed. */
class FakeImage {
  width = 256;
  height = 256;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private srcValue = '';
  set src(value: string) {
    this.srcValue = value;
    queueMicrotask(() => {
      if (failUrls.some((url) => value.startsWith(url))) this.onerror?.();
      else this.onload?.();
    });
  }
  get src(): string {
    return this.srcValue;
  }
}

/** One recorded `drawImage`: which picture it came from, plus its arguments. */
interface DrawCall {
  page: string;
  box: number[];
}

/**
 * A 2D context that records what was asked to be drawn.
 *
 * The nine-argument form is a cell (source rect, then destination rect) and the
 * five-argument form is the backdrop blit, which is why `box` is kept raw here
 * and only split out by `rects` below.
 */
function fakeContext() {
  const calls: DrawCall[] = [];
  const state = {
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    fillStyle: '' as unknown,
    save: () => {},
    restore: () => {},
    drawImage: (...args: unknown[]) => {
      const image = args[0] as { src?: string };
      calls.push({
        page: image.src ?? '',
        box: args.slice(1).map((value) => Number(value)),
      });
    },
    fillRect: () => {},
  };
  return { calls, state: state as unknown as CanvasRenderingContext2D };
}

/** Where one cell landed on the picture, in destination pixels. */
interface DrawnRect {
  page: string;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

function rects(calls: DrawCall[]): DrawnRect[] {
  return calls
    .filter((call) => call.box.length === 8)
    .map((call) => ({
      page: call.page,
      sx: call.box[0],
      sy: call.box[1],
      sw: call.box[2],
      sh: call.box[3],
      x: call.box[4],
      y: call.box[5],
      w: call.box[6],
      h: call.box[7],
    }));
}

const f32 = (value: number): number => {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, true);
  return view.getInt32(0, true);
};

const SPRITE = 3;
const POS = 6;
const SCALE = 7;
const ALPHA = 8;
const STOP = 20;
const INTERRUPT_LABEL = 21;
const ANCHOR_TOP_LEFT = 22;
const POS_MODE = 24;
const VISIBLE = 28;
const RETURN_FROM_INTERRUPT = 89;
const END = -1;

function assemble(...instructions: Array<[number, number, number[]]>): Int32Array {
  const words: number[] = [];
  for (const [op, time, args] of instructions) {
    words.push((((2 + args.length) * 4) << 16) | (op & 0xffff), time << 16, ...args);
  }
  return Int32Array.from(words);
}

const CELLS: AnmScreenCell[] = [
  { id: 0, tex: 0, x: 0, y: 0, w: 32, h: 32 },
  { id: 1, tex: 1, x: 8, y: 16, w: 64, h: 16 },
  { id: 2, tex: 0, x: 40, y: 0, w: 8, h: 8 },
  { id: 3, tex: 9, x: 0, y: 0, w: 16, h: 16 },
];

const PAGE_A = '/fake/a.png';
const PAGE_B = '/fake/b.png';

/**
 * Slot 0 is centre-placed, slot 1 carries a `pos2` displacement under a top-left
 * anchor, slot 2 fades out, slot 3 waits for an interrupt, slot 4 names a page
 * that does not exist, and slot 6 scales its box.
 */
const SCRIPTS: (Int32Array | null)[] = [
  assemble([SPRITE, 0, [0]], [POS, 0, [f32(100), f32(50), 0]], [STOP, 0, []], [END, 0, []]),
  assemble(
    [SPRITE, 0, [1]],
    [POS_MODE, 0, [1]],
    [POS, 0, [f32(20), f32(30), 0]],
    [POS_MODE, 0, [0]],
    [POS, 0, [f32(200), f32(100), 0]],
    [ANCHOR_TOP_LEFT, 0, []],
    [STOP, 0, []],
    [END, 0, []],
  ),
  assemble([SPRITE, 0, [2]], [ALPHA, 0, [0]], [POS, 0, [f32(10), f32(10), 0]], [STOP, 0, []], [END, 0, []]),
  assemble(
    [VISIBLE, 0, [0]],
    [STOP, 0, []],
    [INTERRUPT_LABEL, 0, [1]],
    [SPRITE, 0, [0]],
    [POS, 0, [f32(300), f32(20), 0]],
    [RETURN_FROM_INTERRUPT, 0, []],
    [END, 0, []],
  ),
  assemble([SPRITE, 0, [3]], [POS, 0, [f32(50), f32(50), 0]], [STOP, 0, []], [END, 0, []]),
  null,
  assemble(
    [SPRITE, 0, [0]],
    [SCALE, 0, [f32(2), f32(0.5)]],
    [POS, 0, [f32(60), f32(60), 0]],
    [STOP, 0, []],
    [END, 0, []],
  ),
];

function makeScreen(): AnmScreen {
  return new AnmScreen({
    slots: SCRIPTS.length,
    pages: [PAGE_A, PAGE_B],
    cells: CELLS,
    scriptFor: (index) => SCRIPTS[index] ?? null,
    width: 640,
    height: 480,
    backdrop: '/fake/backdrop.png',
  });
}

/** Load, start and draw one frame, returning what the context was asked to do. */
async function firstFrame(screen: AnmScreen) {
  await screen.load();
  screen.start();
  screen.step();
  const frame = fakeContext();
  screen.draw(frame.state);
  return frame;
}

beforeEach(() => {
  failUrls = [];
  vi.stubGlobal('Image', FakeImage);
});

describe('AnmScreen', () => {
  it('blits the backdrop as one unscaled quad before any slot draws', async () => {
    const { calls } = await firstFrame(makeScreen());
    expect(calls[0]).toEqual({ page: '/fake/backdrop.png', box: [0, 0, 640, 480] });
  });

  it('pairs script i with VM i, the way AddedCallback does', async () => {
    const { calls } = await firstFrame(makeScreen());
    // Slot 0 selects sprite 0 and places it at (100,50); the default anchor is
    // the centre, so a 32x32 cell lands at (84,34).
    const slot0 = rects(calls).find((rect) => rect.page === PAGE_A && rect.w === 32);
    expect(slot0).toMatchObject({ sx: 0, sy: 0, x: 84, y: 34, w: 32, h: 32 });
  });

  it('adds pos2 as a displacement and honours a top-left anchor', async () => {
    const { calls } = await firstFrame(makeScreen());
    // Slot 1: pos (200,100) plus pos2 (20,30), anchored top-left.
    const slot1 = rects(calls).find((rect) => rect.page === PAGE_B);
    expect(slot1).toMatchObject({ sx: 8, sy: 16, x: 220, y: 130, w: 64, h: 16 });
  });

  it('does not accumulate pos2 across frames', async () => {
    const screen = makeScreen();
    const before = await firstFrame(screen);
    const first = rects(before.calls).find((rect) => rect.page === PAGE_B);
    for (let f = 0; f < 30; f++) screen.step();
    const later = fakeContext();
    screen.draw(later.state);
    expect(rects(later.calls).find((rect) => rect.page === PAGE_B)).toEqual(first);
  });

  it('skips a slot whose alpha fell to zero', async () => {
    const { calls } = await firstFrame(makeScreen());
    // Sprite 2 is the cell at source (40,0); it must never reach the context.
    expect(rects(calls).some((rect) => rect.sx === 40)).toBe(false);
  });

  it('keeps a slot hidden until the screen queues its interrupt code', async () => {
    const screen = makeScreen();
    // The unscaled copy of sprite 0 is slot 0's; slot 3 has no picture yet.
    const before = await firstFrame(screen);
    const placed = (calls: DrawCall[]) =>
      rects(calls).filter((rect) => rect.page === PAGE_A && rect.w === 32);
    const hidden = placed(before.calls).length;
    screen.interrupt(3, 1);
    screen.step();
    const after = fakeContext();
    screen.draw(after.state);
    const shown = placed(after.calls);
    expect(shown.length).toBe(hidden + 1);
    // It arrives at (300,20) centre-placed, so 284,4.
    expect(shown.some((rect) => rect.x === 284 && rect.y === 4)).toBe(true);
  });

  it('skips a cell whose page never loaded instead of throwing', async () => {
    failUrls = ['/fake/absent.png'];
    const screen = new AnmScreen({
      slots: SCRIPTS.length,
      pages: [PAGE_A, '/fake/absent.png'],
      cells: CELLS,
      scriptFor: (index) => SCRIPTS[index] ?? null,
      width: 640,
      height: 480,
      backdrop: '/fake/backdrop.png',
    });
    const { calls } = await firstFrame(screen);
    // Sprite 1 lives on page 1, so losing that page loses exactly that draw.
    expect(rects(calls).some((rect) => rect.page === '/fake/absent.png')).toBe(false);
    // The page-0 slots are unaffected.
    expect(rects(calls).some((rect) => rect.page === PAGE_A)).toBe(true);
  });

  it('scales the destination box the way the VM scales the sprite', async () => {
    const { calls } = await firstFrame(makeScreen());
    // Slot 6: a 32x32 cell at scale (2, 0.5), centre-placed at (60,60).
    const scaled = rects(calls).find((rect) => rect.page === PAGE_A && rect.w === 64 && rect.h === 16);
    expect(scaled).toMatchObject({ sx: 0, sy: 0, x: 28, y: 52, w: 64, h: 16 });
  });

  it('draws pixel-crisp, because this art is authored at 1x', async () => {
    const screen = makeScreen();
    await screen.load();
    screen.start();
    const frame = fakeContext();
    frame.state.imageSmoothingEnabled = true;
    screen.step();
    screen.draw(frame.state);
    expect(frame.state.imageSmoothingEnabled).toBe(false);
  });

  it('reports one readable line per slot', async () => {
    const screen = makeScreen();
    await firstFrame(screen);
    const lines = screen.debugLines();
    expect(lines).toHaveLength(SCRIPTS.length);
    expect(lines[0]).toContain('sp0');
    expect(lines[3]).toContain('off');
  });

  it('survives a pack with no art at all', async () => {
    failUrls = ['/fake/'];
    const screen = makeScreen();
    expect(await screen.load()).toBe(false);
    expect(screen.ready).toBe(false);
    screen.start();
    screen.step();
    const frame = fakeContext();
    screen.draw(frame.state);
    expect(frame.calls).toEqual([]);
  });
});
