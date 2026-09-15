/**
 * The frame-queue behaviour that makes the bank sound like the original.
 *
 * Two rules are the difference between a danmaku that reads and a wall of noise:
 * requests merge per frame, and one index never stacks on itself. Both are here
 * without a browser, together with the two volume laws (`SoundPlayer.cpp:830-839`).
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  seGain,
  seQueuePush,
  sfxVolumeFactor,
  SE_QUEUE_LENGTH,
  SE_RETRY_FRAMES,
  millibelsToGain,
  SeBus,
  type SeRequest,
} from './SeBus';

describe('SE volume laws', () => {
  it('converts millibels the DirectSound way', () => {
    expect(millibelsToGain(0)).toBe(1);
    expect(millibelsToGain(-2000)).toBeCloseTo(0.1, 5);
    expect(millibelsToGain(-600)).toBeCloseTo(0.5011, 3);
  });

  it('tapers the slider cubically, and only falls off a cliff at zero', () => {
    expect(sfxVolumeFactor(1)).toBe(1);
    expect(sfxVolumeFactor(0)).toBe(0);
    expect(sfxVolumeFactor(0.5)).toBeCloseTo(0.875, 5);
    expect(sfxVolumeFactor(2)).toBe(1); // clamped like the 0-100 slider
    expect(sfxVolumeFactor(-1)).toBe(0);
  });

  it('moves the whole bank down together', () => {
    // A -19 dB shot at full slider is the recording as mastered.
    expect(seGain(-1900, 1)).toBeCloseTo(0.1122, 3);
    expect(seGain(-1900, 0)).toBe(0);
    // Half the slider is only ~3.7 dB quieter, which is why the retail slider feels gentle.
    const half = seGain(-1900, 0.5);
    expect(half).toBeLessThan(seGain(-1900, 1));
    expect(millibelsToGain((-1900 + 5000) * sfxVolumeFactor(0.5) - 5000)).toBeCloseTo(half, 4);
    // Loud stays louder than quiet at every setting: the mix does not rearrange.
    expect(seGain(-300, 0.5)).toBeGreaterThan(seGain(-2400, 0.5));
  });
});

describe('SE frame queue', () => {
  it('merges repeat requests for one index and averages their pan', () => {
    const slots: SeRequest[] = [];
    expect(seQueuePush(slots, 15, -1)).toBe(true);
    expect(seQueuePush(slots, 15, 1)).toBe(false);
    expect(seQueuePush(slots, 15, 0)).toBe(false);
    expect(slots).toHaveLength(1);
    expect(slots[0].panSum / slots[0].panCount).toBeCloseTo(0, 6);
  });

  it('keeps different indices apart', () => {
    const slots: SeRequest[] = [];
    seQueuePush(slots, 15, 0);
    seQueuePush(slots, 16, 0);
    expect(slots.map((slot) => slot.idx)).toEqual([15, 16]);
  });

  it('drops what does not fit in twelve slots', () => {
    const slots: SeRequest[] = [];
    for (let i = 0; i < SE_QUEUE_LENGTH; i++) expect(seQueuePush(slots, i, 0)).toBe(true);
    expect(seQueuePush(slots, 99, 0)).toBe(false);
    expect(slots).toHaveLength(SE_QUEUE_LENGTH);
  });
});

/** One node of the fake graph, with its children so a test can follow the chain. */
class FakeNode {
  children: FakeNode[] = [];
  started = false;
  stopped = 0;
  /** Only the nodes that carry one have these. */
  gain?: { value: number };
  pan?: { value: number };
  buffer?: object;
  constructor(readonly kind: string) {}
  connect(node: FakeNode): FakeNode {
    this.children.push(node);
    return node;
  }
  start(): void {
    this.started = true;
  }
  stop(): void {
    this.stopped++;
  }
}

class FakeContext {
  readonly destination = new FakeNode('destination');
  readonly sources: FakeNode[] = [];
  createBufferSource(): FakeNode {
    const node = new FakeNode('source');
    this.sources.push(node);
    return node;
  }
  createGain(): FakeNode {
    const node = new FakeNode('gain');
    node.gain = { value: 0 };
    return node;
  }
  createStereoPanner(): FakeNode {
    const node = new FakeNode('panner');
    node.pan = { value: 0 };
    return node;
  }
  /** The bus fills this through `copyToChannel`, which is all the fake needs to accept. */
  createBuffer(channels: number, length: number, sampleRate: number): object {
    return { channels, length, sampleRate, copyToChannel: () => {} };
  }
}

/** The smallest wav the bus will accept: one 8-bit mono sample. */
function oneSampleWav(): ArrayBuffer {
  const text = (s: string): number[] => [...s].map((c) => c.charCodeAt(0));
  const body = [
    ...text('fmt '),
    16,
    0,
    0,
    0,
    1,
    0,
    1,
    0,
    0x22,
    0x56,
    0,
    0,
    0x22,
    0x56,
    0,
    0,
    1,
    0,
    8,
    0,
    ...text('data'),
    1,
    0,
    0,
    0,
    128,
  ];
  const size = 4 + body.length;
  return new Uint8Array([...text('RIFF'), size & 0xff, 0, 0, 0, ...text('WAVE'), ...body]).buffer;
}

function fakeFrame(): { run: () => void } {
  const g = globalThis as unknown as { requestAnimationFrame?: (cb: () => void) => number };
  let pending: (() => void) | null = null;
  g.requestAnimationFrame = (cb: () => void) => {
    pending = cb;
    return 1;
  };
  return {
    run: () => {
      const cb = pending;
      pending = null;
      cb?.();
    },
  };
}

afterEach(() => {
  delete (globalThis as unknown as { requestAnimationFrame?: unknown }).requestAnimationFrame;
  vi.restoreAllMocks();
});

const SOURCE = {
  files: ['/se_tan00.wav', '/se_enep00.wav'],
  entries: [
    { buffer: 0, mb: -1100 },
    { buffer: 1, mb: -1200 },
    { buffer: 0, mb: -300 },
  ],
};

// The chain the bus builds is source -> gain -> panner -> destination.
const gainOf = (node: FakeNode): number => node.children[0].gain?.value ?? Number.NaN;
const panOf = (node: FakeNode): number => node.children[0].children[0].pan?.value ?? Number.NaN;

/** Let queued loads resolve, then land a frame. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('SeBus', () => {
  it('plays one voice per index once the frame lands', async () => {
    const frame = fakeFrame();
    const ctx = new FakeContext();
    const loads = vi.fn(async (_path: string) => oneSampleWav());
    const bus = new SeBus(SOURCE, () => ctx as unknown as AudioContext, loads);
    bus.preload();
    await settle();
    // Two indices over one recording fetch it once.
    expect(loads.mock.calls.map((call) => call[0])).toEqual(['/se_tan00.wav', '/se_enep00.wav']);

    bus.queue(0, -0.5);
    bus.queue(0, 0.5); // the same sound again in the same frame
    bus.queue(2); // a different index, same recording
    expect(ctx.sources).toHaveLength(0); // nothing has played yet - that is the point

    frame.run();
    const started = ctx.sources.filter((node) => node.started);
    expect(started).toHaveLength(2);
    const [first, second] = started;
    // -11 dB, which is a fifth of the loudness a naive port would use.
    expect(gainOf(first!)).toBeCloseTo(0.2818, 3);
    // The two pan requests merged into their average rather than two voices.
    expect(panOf(first!)).toBeCloseTo(0, 6);
    // Index 2 is -3 dB, louder than index 0's -11 dB, from the same file.
    expect(gainOf(second!)).toBeGreaterThan(gainOf(first!));
  });

  it('cuts the previous voice when the same index retriggers', async () => {
    const frame = fakeFrame();
    const ctx = new FakeContext();
    const bus = new SeBus(
      SOURCE,
      () => ctx as unknown as AudioContext,
      async () => oneSampleWav(),
    );
    bus.preload();
    await settle();
    bus.queue(0);
    frame.run();
    const first = ctx.sources.find((node) => node.started);
    expect(first).toBeTruthy();
    bus.queue(0);
    frame.run();
    expect(first!.stopped).toBe(1);
    expect(ctx.sources.filter((node) => node.started)).toHaveLength(2);
  });

  it('holds a request whose recording has not landed yet', async () => {
    const frame = fakeFrame();
    const ctx = new FakeContext();
    let release: () => void = () => {};
    const gating = new Promise<void>((resolve) => {
      release = resolve;
    });
    const bus = new SeBus(
      SOURCE,
      () => ctx as unknown as AudioContext,
      async () => {
        await gating;
        return oneSampleWav();
      },
    );
    bus.queue(0);
    frame.run();
    expect(ctx.sources.filter((node) => node.started)).toHaveLength(0);
    release();
    await settle();
    // The request is still waiting, so the next frame's flush is what plays it.
    expect(bus.pending).toBe(1);
    bus.flush();
    expect(ctx.sources.filter((node) => node.started)).toHaveLength(1);
  });

  it('gives up on a recording that never arrives', async () => {
    const frame = fakeFrame();
    const ctx = new FakeContext();
    const bus = new SeBus(
      SOURCE,
      () => ctx as unknown as AudioContext,
      async () => {
        throw new Error('404');
      },
    );
    bus.queue(0);
    for (let i = 0; i < SE_RETRY_FRAMES + 2; i++) {
      await settle();
      frame.run();
    }
    expect(bus.pending).toBe(0);
    expect(ctx.sources.filter((node) => node.started)).toHaveLength(0);
  });

  it('says nothing at all with the slider down', async () => {
    const frame = fakeFrame();
    const ctx = new FakeContext();
    const bus = new SeBus(
      SOURCE,
      () => ctx as unknown as AudioContext,
      async () => oneSampleWav(),
    );
    bus.preload();
    await settle();
    bus.setVolume(0);
    bus.queue(0);
    frame.run();
    expect(ctx.sources.filter((node) => node.started)).toHaveLength(0);
  });

  it('ignores an index the bank does not have', () => {
    const frame = fakeFrame();
    const ctx = new FakeContext();
    const bus = new SeBus(
      SOURCE,
      () => ctx as unknown as AudioContext,
      async () => oneSampleWav(),
    );
    expect(() => bus.queue(999)).not.toThrow();
    frame.run();
    expect(ctx.sources).toHaveLength(0);
    expect(bus.pending).toBe(0);
  });
});
