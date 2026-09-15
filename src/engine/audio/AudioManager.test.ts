import { describe, it, expect, vi } from 'vitest';
import { AudioManager } from './AudioManager';

interface BrowserEnv {
  audioCtor: ReturnType<typeof vi.fn>;
  /** Live (not cleared) interval callbacks, keyed by fake handle. */
  intervals: Map<number, () => void>;
}

/** Install fake browser globals (window + Audio) for the duration of `fn`. */
function withBrowserGlobals(fn: (env: BrowserEnv) => void): void {
  const g = globalThis as { window?: unknown; Audio?: unknown };
  const hadWindow = 'window' in g;
  const hadAudio = 'Audio' in g;
  const originalWindow = g.window;
  const originalAudio = g.Audio;
  const audioCtor = vi.fn();
  const intervals = new Map<number, () => void>();
  let nextHandle = 1;
  g.window = {
    setInterval: (cb: () => void) => {
      const handle = nextHandle++;
      intervals.set(handle, cb);
      return handle;
    },
    clearInterval: (handle: number) => {
      intervals.delete(handle);
    },
    AudioContext: undefined,
  } as unknown as Window & typeof globalThis;
  g.Audio = audioCtor;
  try {
    fn({ audioCtor, intervals });
  } finally {
    if (hadWindow) g.window = originalWindow;
    else delete g.window;
    if (hadAudio) g.Audio = originalAudio;
    else delete g.Audio;
  }
}

/** Minimal HTMLAudioElement stand-in. */
class FakeAudioElement {
  loop = false;
  muted = false;
  volume = 1;
  paused = true;
  currentTime = 0;
  preload = '';
  loadCalls = 0;
  duration = Number.NaN;
  /** Registered listeners by type, so tests can fire `ended` by hand. */
  handlers = new Map<string, Array<() => void>>();
  constructor(public src: string) {}
  addEventListener(type: string, cb: () => void): void {
    const list = this.handlers.get(type) ?? [];
    list.push(cb);
    this.handlers.set(type, list);
  }
  emit(type: string): void {
    for (const cb of this.handlers.get(type) ?? []) cb();
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {
    this.loadCalls++;
  }
}

describe('AudioManager', () => {
  it('instantiates and manages volume settings', () => {
    const audio = new AudioManager();
    expect(audio.isMuted).toBe(false);
    expect(audio.bgmVolume).toBe(0.7);
    expect(audio.seVolume).toBe(1.0);

    audio.setMuted(true);
    expect(audio.isMuted).toBe(true);

    audio.setBgmVolume(0.5);
    expect(audio.bgmVolume).toBe(0.5);
  });

  describe('BGM', () => {
    it('tracks state without a browser (noop in Node)', () => {
      const audio = new AudioManager();
      expect(() => audio.playBGM()).not.toThrow();
      expect(() => audio.playBGM('assets/bgm/stage1.mp3')).not.toThrow();
      expect(() => audio.stopBGM()).not.toThrow();
    });

    it('tracks active BGM even in Node (synthesized fallback)', () => {
      const audio = new AudioManager();
      audio.playBGM(); // no URL -> synthesized fallback
      expect(audio.isBgmPlaying).toBe(true);
      audio.stopBGM();
      expect(audio.isBgmPlaying).toBe(false);
    });

    it('keeps the current BGM across fade-in restarts', () => {
      const audio = new AudioManager();
      audio.playBGM('path/to/bgm.mp3', { fadeIn: 1000 });
      expect(audio.fadeInMs).toBe(1000);
      audio.stopBGM();
      expect(() => audio.playBGM()).not.toThrow();
    });

    it('plumbs loop/volume onto the HTMLAudioElement (browser env)', () => {
      withBrowserGlobals(({ audioCtor }) => {
        audioCtor.mockImplementation((src: string) => new FakeAudioElement(src));
        const audio = new AudioManager();
        audio.playBGM('bgm/stage1.wav', { loop: false, volume: 0.5 });
        expect(audioCtor).toHaveBeenCalledWith('bgm/stage1.wav');
        const el = audioCtor.mock.results[0].value as FakeAudioElement;
        expect(el.loop).toBe(false);
        expect(el.volume).toBe(0.5);
        expect(el.paused).toBe(false); // play() was called
        expect(audio.isBgmPlaying).toBe(true);
      });
    });

    it('defaults to looping at the global BGM volume', () => {
      withBrowserGlobals(({ audioCtor }) => {
        audioCtor.mockImplementation((src: string) => new FakeAudioElement(src));
        const audio = new AudioManager();
        audio.setBgmVolume(0.3);
        audio.playBGM('bgm/stage1.wav');
        const el = audioCtor.mock.results[0].value as FakeAudioElement;
        expect(el.loop).toBe(true);
        expect(el.volume).toBe(0.3);
      });
    });

    it('ramps volume from 0 to target over fadeInMs', () => {
      withBrowserGlobals(({ audioCtor, intervals }) => {
        audioCtor.mockImplementation((src: string) => new FakeAudioElement(src));
        const audio = new AudioManager();
        audio.playBGM('bgm/stage1.wav', { fadeInMs: 800, volume: 0.5 });
        expect(audio.fadeInMs).toBe(800); // numeric alias accepted
        const el = audioCtor.mock.results[0].value as FakeAudioElement;
        expect(el.volume).toBe(0); // starts silent

        const ramp = [...intervals.values()][0];
        expect(ramp).toBeDefined();
        for (let i = 0; i < 10; i++) ramp();
        expect(el.volume).toBeCloseTo(0.25, 5); // halfway through 20 steps
        for (let i = 0; i < 10; i++) ramp();
        expect(el.volume).toBeCloseTo(0.5, 5); // full target
      });
    });

    describe('loop point', () => {
      /**
       * Play a 100 s track whose first 20 s (`loopFromSeconds`) is a baked-on
       * fanfare, and hand back the element plus its playhead state.
       */
      function playLooped(env: BrowserEnv, loopFromSeconds?: number): FakeAudioElement {
        env.audioCtor.mockImplementation((src: string) => new FakeAudioElement(src));
        const audio = new AudioManager();
        audio.playBGM('bgm/stage1.ogg', { loop: true, loopFromSeconds });
        const el = env.audioCtor.mock.results[0].value as FakeAudioElement;
        el.duration = 100;
        return el;
      }

      it('takes over the rewind instead of looping to 0', () => {
        withBrowserGlobals((env) => {
          const el = playLooped(env, 20);
          // The element's own loop would restart the fanfare, so it stays off.
          expect(el.loop).toBe(false);
          const watch = [...env.intervals.values()][env.intervals.size - 1];
          expect(watch).toBeDefined();

          el.currentTime = 99.99;
          watch();
          expect(el.currentTime).toBe(20);
        });
      });

      it('rewinds on `ended` as well, for a throttled tab', () => {
        withBrowserGlobals((env) => {
          const el = playLooped(env, 20);
          el.currentTime = 100;
          el.emit('ended');
          expect(el.currentTime).toBe(20);
          expect(el.paused).toBe(false);
        });
      });

      it('leaves a paused track where the player left it', () => {
        withBrowserGlobals((env) => {
          const el = playLooped(env, 20);
          const watch = [...env.intervals.values()][env.intervals.size - 1];
          el.paused = true;
          el.currentTime = 99.99;
          watch();
          expect(el.currentTime).toBe(99.99);
        });
      });

      it('keeps the native loop when no loop point is given', () => {
        withBrowserGlobals((env) => {
          const el = playLooped(env);
          expect(el.loop).toBe(true);
          expect(env.intervals.size).toBe(0);
        });
      });

      it('drops the watcher with the track', () => {
        withBrowserGlobals((env) => {
          env.audioCtor.mockImplementation((src: string) => new FakeAudioElement(src));
          const audio = new AudioManager();
          audio.playBGM('bgm/stage1.ogg', { loop: true, loopFromSeconds: 20 });
          expect(env.intervals.size).toBe(1);
          audio.stopBGM();
          expect(env.intervals.size).toBe(0);
        });
      });
    });

    it('preloadBGM(url) creates an Audio and calls load()', () => {
      withBrowserGlobals(({ audioCtor }) => {
        audioCtor.mockImplementation((src: string) => new FakeAudioElement(src));
        const audio = new AudioManager();
        audio.preloadBGM('bgm/stage1.wav');
        expect(audioCtor).toHaveBeenCalledWith('bgm/stage1.wav');
        const el = audioCtor.mock.results[0].value as FakeAudioElement;
        expect(el.preload).toBe('auto');
        expect(el.loadCalls).toBe(1);
      });
    });

    it('preloadBGM is a noop without browser globals (Node)', () => {
      const audio = new AudioManager();
      expect(() => audio.preloadBGM('bgm/stage1.wav')).not.toThrow();
    });
  });

  describe('playSE options', () => {
    /** Fake Web Audio API so the per-play volume path executes in Node. */
    class FakeParam {
      value = 1;
      /** Values passed to setValueAtTime (the attack gain of each SE). */
      setValues: number[] = [];
      setValueAtTime(v: number) {
        this.value = v;
        this.setValues.push(v);
      }
      linearRampToValueAtTime(v: number) {
        this.value = v;
      }
      exponentialRampToValueAtTime(v: number) {
        this.value = v;
      }
    }
    class FakeNode {
      type = '';
      frequency = new FakeParam();
      gain = new FakeParam();
      connect() {}
      start() {}
      stop() {}
    }
    class FakeAudioContext {
      destination = new FakeNode();
      currentTime = 1;
      state = 'running' as const;
      createdGains: FakeNode[] = [];
      createOscillator() {
        return new FakeNode();
      }
      createGain() {
        const node = new FakeNode();
        this.createdGains.push(node);
        return node;
      }
      resume() {}
      close() {}
    }

    it('keeps working without an AudioContext (noop fallback)', () => {
      const audio = new AudioManager();
      expect(() => audio.playSE('shoot', { volume: 0.5 })).not.toThrow();
    });

    it('applies the per-play volume on top of the global SE volume', () => {
      const contexts: FakeAudioContext[] = [];
      const fakeWindow: { AudioContext?: new () => FakeAudioContext } = {};
      fakeWindow.AudioContext = class extends FakeAudioContext {
        constructor() {
          super();
          contexts.push(this);
        }
      };
      const g = globalThis as { window?: unknown };
      const hadWindow = 'window' in g;
      const originalWindow = g.window;
      g.window = fakeWindow as unknown as Window & typeof globalThis;
      try {
        const audio = new AudioManager();
        audio.setSeVolume(0.8);
        // per-play volume 0.5 -> effective gain 0.8 * 0.5 * 0.2 = 0.08
        audio.playSE('bomb', { volume: 0.5 });
        // existing call shape (no options) -> per-play volume 1
        audio.playSE('bomb');
        const gains = contexts[0].createdGains;
        expect(gains).toHaveLength(2);
        // attack gain set by setValueAtTime: 0.8 * 0.5 * 0.2
        expect(gains[0].gain.setValues[0]).toBeCloseTo(0.08, 5);
        // existing call shape (no options) -> per-play volume 1
        expect(gains[1].gain.setValues[0]).toBeCloseTo(0.8 * 0.2, 5);
      } finally {
        if (hadWindow) {
          g.window = originalWindow;
        } else {
          delete g.window;
        }
      }
    });

    it('clamps the per-play volume to [0, 1]', () => {
      const contexts: FakeAudioContext[] = [];
      const fakeWindow: { AudioContext?: new () => FakeAudioContext } = {};
      fakeWindow.AudioContext = class extends FakeAudioContext {
        constructor() {
          super();
          contexts.push(this);
        }
      };
      const g = globalThis as { window?: unknown };
      const hadWindow = 'window' in g;
      const originalWindow = g.window;
      g.window = fakeWindow as unknown as Window & typeof globalThis;
      try {
        const audio = new AudioManager();
        audio.setSeVolume(1);
        audio.playSE('bomb', { volume: 5 }); // clamped to 1
        audio.playSE('bomb', { volume: -2 }); // clamped to 0
        const gains = contexts[0].createdGains;
        expect(gains[0].gain.setValues[0]).toBeCloseTo(0.2, 5);
        expect(gains[1].gain.setValues[0]).toBeCloseTo(0, 5);
      } finally {
        if (hadWindow) {
          g.window = originalWindow;
        } else {
          delete g.window;
        }
      }
    });
  });
});
