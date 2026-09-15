import { SeBus, type SeBusSource } from './SeBus';

/**
 * Every sound the shipped game can ask for. The first seven are gameplay;
 * the rest are the menu blips, whose `SoundIdx` names come from
 * `SoundPlayer.hpp:17-66` and whose files are in `th08.dat`.
 */
export type SoundEffectType =
  | 'shoot'
  | 'enemy-hit'
  | 'bomb'
  | 'spellcard'
  | 'pldead'
  | 'graze'
  | 'item'
  | 'select'
  | 'ok'
  | 'cancel'
  | 'pause'
  | 'bonus'
  | 'cardget'
  | 'border'
  | 'timeout'
  | 'powerup'
  | 'extend';

export interface BgmOptions {
  loop?: boolean;
  volume?: number;
  /** Fade-in duration in ms (boolean `true` = 1000ms). */
  fadeIn?: boolean | number;
  /** Alias for `fadeIn` as a plain number (ticket 13 API). */
  fadeInMs?: number;
  /**
   * Where a looping track rewinds to, in seconds from the start of the file.
   *
   * 永夜抄 ships one recording per song with the fanfare baked on the front:
   * `thbgm.fmt` gives an intro length and a separate loop length, and the file is
   * the two concatenated. `HTMLAudioElement.loop` only ever rewinds to 0, so
   * leaving it on replays the fanfare once a minute -- the single most obvious
   * "this is not the real game" tell in the whole soundtrack. Pass the track's
   * `introSeconds` here and the player winds back there instead.
   */
  loopFromSeconds?: number;
}

export interface SeOptions {
  /**
   * Per-play volume (0-1), multiplied on top of the global SE volume.
   *
   * Only the synthesised fallback can honour this: a configured bank takes its level
   * from the table, which is how the shipped game does it.
   */
  volume?: number;
  /** -1..1, for banks that pan by playfield position. */
  pan?: number;
}

/** 东方风格合成 BGM 回退：无外部素材时用 Web Audio 琶音循环（Phase 1 程序生成）。 */
const SYNTH_BGM_NOTES = [220, 261.63, 329.63, 440, 329.63, 261.63, 440, 523.25]; // A3 C4 E4 A4 E4 C4 A4 C5
const SYNTH_BGM_STEP = 0.35; // 每音符时长（秒）

/**
 * A game's sound bank, injected: the recordings, the per-index levels, and which
 * index answers to each of the engine's `SoundEffectType` names.
 */
export interface SeSource extends SeBusSource {
  names?: Partial<Record<SoundEffectType, number>>;
}

export class AudioManager {
  public bgmVolume = 0.7;
  public seVolume = 1.0;
  public isMuted = false;
  /** True while BGM is playing (tracked even in non-browser/Node tests). */
  public isBgmPlaying = false;
  /** Last requested BGM fade-in duration (ms). */
  public fadeInMs = 0;
  private audioCtx?: AudioContext;
  private bgmAudio?: HTMLAudioElement;
  private bgmGainNode?: GainNode;
  private bgmScheduler?: number;
  private bgmFadeInterval?: number;
  /** Rewind-to-intro-end watcher, and the point it rewinds to. See `BgmOptions`. */
  private bgmLoopWatcher?: number;
  private bgmLoopFrom?: number;
  private lastBgmUrl?: string;
  private lastBgmOptions: BgmOptions = {};
  private preloaded = new Set<HTMLAudioElement>();
  private seSource?: SeSource;
  private seBus?: SeBus;

  private getContext(): AudioContext | undefined {
    if (typeof window === 'undefined') return undefined;
    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = muted;
    }
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
  }

  setSeVolume(volume: number): void {
    this.seVolume = Math.max(0, Math.min(1, volume));
    this.seBus?.setVolume(this.seVolume);
  }

  /**
   * Hand the manager the game's sound bank, and start fetching it.
   *
   * Until this is called - and in any environment where the recordings cannot be
   * loaded - `playSE` falls back to synthesised blips, which keeps every test
   * environment and every machine without the assets audible.
   */
  configureSe(source: SeSource): void {
    this.seSource = source;
    this.seBus = new SeBus(source, () => this.getContext());
    this.seBus.setVolume(this.seVolume);
    this.seBus.preload();
  }

  /** Waiting requests, and how many recordings are in hand. Debug aid. */
  get sePending(): number {
    return this.seBus?.pending ?? 0;
  }

  get seLoaded(): number {
    return this.seBus?.loaded ?? 0;
  }

  /**
   * Ask for a bank sound by its index, panned by `pan`.
   *
   * This is the call sites' replacement for naming files: the ECL scripts, the
   * message VM, and the player all already speak in `SoundIdx` numbers.
   */
  queueSe(idx: number, pan = 0): void {
    if (this.isMuted || this.seVolume <= 0 || !this.seBus) return;
    this.seBus.queue(idx, pan);
  }

  playSE(type: SoundEffectType, options: SeOptions = {}): void {
    if (this.isMuted || this.seVolume <= 0) return;
    const idx = this.seSource?.names?.[type];
    if (idx !== undefined && this.seBus) {
      this.queueSe(idx, options.pan ?? 0);
      return;
    }
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const perPlayVolume = Math.max(0, Math.min(1, options.volume ?? 1));
      const vol = this.seVolume * perPlayVolume * 0.2;

      switch (type) {
        case 'shoot': {
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
          gain.gain.setValueAtTime(vol * 0.4, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }
        case 'enemy-hit': {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.linearRampToValueAtTime(100, now + 0.05);
          gain.gain.setValueAtTime(vol * 0.5, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'graze': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1760, now);
          osc.frequency.setValueAtTime(2200, now + 0.02);
          gain.gain.setValueAtTime(vol * 0.6, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'spellcard': {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(1320, now + 0.4);
          gain.gain.setValueAtTime(vol * 0.8, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        }
        case 'bomb': {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.linearRampToValueAtTime(40, now + 0.8);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.8);
          osc.start(now);
          osc.stop(now + 0.8);
          break;
        }
        case 'item': {
          // TH08 pickup blip: a bright two-tone chirp.
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046, now);
          osc.frequency.setValueAtTime(1568, now + 0.045);
          gain.gain.setValueAtTime(vol * 0.45, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }
        case 'pldead': {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
          gain.gain.setValueAtTime(vol, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        }
      }
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * 当前音轨的实际文件名（如 `th08_00.ogg`）。
   * 未播放时 `null`；用内置合成器占位时 `'synth'`。
   * 供 QA 读取，以区分关卡开场曲与 op 7 触发的 BOSS 曲。
   */
  get bgmName(): string | null {
    if (!this.isBgmPlaying) return null;
    if (!this.lastBgmUrl) return 'synth';
    return this.lastBgmUrl.split('/').pop() ?? this.lastBgmUrl;
  }

  /**
   * 播放 BGM。
   * - `url` 给出时用 HTMLAudio 播放（支持 loop/volume/fadeIn）。
   * - 无 `url`（或资源缺失）时回退到内置 Web Audio 合成琶音循环，
   *   保证任何环境立即有声（Phase 1 无需外部素材）。
   */
  playBGM(url?: string, options: BgmOptions = {}): void {
    this.stopBGM();
    this.lastBgmUrl = url;
    this.lastBgmOptions = { ...options };
    const { loop = true, volume, fadeIn = false, fadeInMs } = options;
    // 记录最后请求的 fade-in 配置（stop 后保留以供查询）
    const fadeInRequested = fadeInMs ?? fadeIn;
    this.fadeInMs =
      typeof fadeInRequested === 'number' ? Math.max(0, fadeInRequested) : fadeInRequested ? 1000 : 0;
    const targetVolume = Math.max(0, Math.min(1, volume ?? this.bgmVolume));
    this.isBgmPlaying = true;

    // Non-browser environment (Node tests): track state only
    if (typeof window === 'undefined') {
      return;
    }

    if (url) {
      this.bgmAudio = new Audio(url);
      /*
       * A shipped recording with the fanfare baked on cannot use the element's own
       * loop, which only ever rewinds to 0. Hand the rewinding to `startLoopWatch`
       * instead so the intro plays once and the body repeats.
       */
      this.bgmLoopFrom =
        loop && options.loopFromSeconds !== undefined && options.loopFromSeconds > 0
          ? options.loopFromSeconds
          : undefined;
      this.bgmAudio.loop = loop && this.bgmLoopFrom === undefined;
      this.bgmAudio.muted = this.isMuted;
      this.bgmAudio.volume = this.isMuted ? 0 : targetVolume;
      if (this.fadeInMs > 0 && !this.isMuted) {
        this.bgmAudio.volume = 0;
        const steps = 20;
        let step = 0;
        this.bgmFadeInterval = window.setInterval(() => {
          step++;
          if (this.bgmAudio && step <= steps) {
            this.bgmAudio.volume = targetVolume * (step / steps);
          } else {
            this.stopFadeIn();
          }
        }, this.fadeInMs / steps);
      }
      this.bgmAudio.play().catch(() => {
        // Autoplay policy — will be handled on user gesture
      });
      if (this.bgmLoopFrom !== undefined) this.startLoopWatch();
    } else {
      this.playSynthesizedBgm(targetVolume);
    }
  }

  /**
   * Wind a looping track back to its loop point rather than to the start.
   *
   * HTML has no loop-range primitive for `<audio>`, so this polls the playhead.
   * The look-ahead is deliberately small: at 25 ms a tick is 40x finer than a
   * 140-second track, and the `ended` listener catches the case where a
   * backgrounded tab was throttled straight past the window.
   */
  private startLoopWatch(): void {
    const audio = this.bgmAudio;
    if (!audio) return;
    audio.addEventListener('ended', () => {
      const live = this.bgmAudio;
      const start = this.bgmLoopFrom;
      if (!live || start === undefined) return;
      live.currentTime = start;
      void live.play().catch(() => {
        // Same autoplay gate as the first start; the unlock handler retries.
      });
    });
    this.bgmLoopWatcher = window.setInterval(() => {
      const live = this.bgmAudio;
      const start = this.bgmLoopFrom;
      // A paused track must stay where the player left it: rewinding here would
      // put the fanfare back on resume.
      if (!live || live.paused || start === undefined) return;
      const end = live.duration;
      if (Number.isFinite(end) && end > start && live.currentTime >= end - 0.06) {
        live.currentTime = start;
      }
    }, 25);
  }

  /** Cancel the loop-point watcher (the element itself is dropped by `stopBGM`). */
  private stopLoopWatch(): void {
    if (this.bgmLoopWatcher !== undefined) {
      window.clearInterval(this.bgmLoopWatcher);
      this.bgmLoopWatcher = undefined;
    }
    this.bgmLoopFrom = undefined;
  }

  /** 内置合成 BGM：三角波琶音循环（东方风格小调），无外部素材。 */
  private playSynthesizedBgm(volume: number): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.value = volume * 0.25;
    master.connect(ctx.destination);
    this.bgmGainNode = master;

    const step = SYNTH_BGM_STEP;
    const notes = SYNTH_BGM_NOTES;
    let t = ctx.currentTime + 0.05;

    const scheduleBar = () => {
      for (let i = 0; i < 16; i++) {
        const freq = notes[i % notes.length] * (i % 2 === 0 ? 1 : 0.5);
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(volume * 0.12, t + 0.02);
        g.gain.linearRampToValueAtTime(0.0001, t + step * 0.95);
        osc.connect(g);
        g.connect(master);
        osc.start(t);
        osc.stop(t + step);
        t += step;
      }
    };

    // 保持 ~2 秒排程余量，持续循环
    const scheduler = window.setInterval(() => {
      if (!this.isBgmPlaying) {
        clearInterval(scheduler);
        return;
      }
      // AudioContext 被浏览器挂起时（autoplay 限制）不补排程，避免 resume 时爆音
      if (ctx.state !== 'running') return;
      while (t < ctx.currentTime + 2) {
        scheduleBar();
      }
    }, 500);
    this.bgmScheduler = scheduler;
    scheduleBar();
  }

  /** Cancel a running fade-in ramp (interval handle is kept for cleanup). */
  private stopFadeIn(): void {
    if (this.bgmFadeInterval !== undefined) {
      clearInterval(this.bgmFadeInterval);
      this.bgmFadeInterval = undefined;
    }
  }

  /**
   * Ramp the BGM to silence over `seconds` and stop it there.
   *
   * This is retail `Supervisor::FadeOutMusic(float)` (`Supervisor.cpp:1695`), which
   * the message VM asks for with 4.0 seconds at a stage's last line
   * (`Gui.cpp:873-874`, `op 12`). Abruptly stopping instead would be heard.
   */
  fadeBGM(seconds = 4): void {
    this.stopFadeIn();
    const duration = Math.max(0.05, seconds);
    // Non-browser environment (Node tests): the track is state-only, so stop.
    if (typeof window === 'undefined' || !this.bgmAudio) {
      this.stopBGM();
      return;
    }
    const start = this.bgmAudio.volume;
    const steps = 20;
    let step = 0;
    this.bgmFadeInterval = window.setInterval(
      () => {
        step++;
        if (this.bgmAudio && step < steps) {
          this.bgmAudio.volume = Math.max(0, start * (1 - step / steps));
        } else {
          this.stopFadeIn();
          this.stopBGM();
        }
      },
      (duration * 1000) / steps,
    );
  }

  /** 预加载音频资源（Ticket 13）。非浏览器环境为 noop。 */
  preload(urls: string[]): void {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
    for (const url of urls) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.load();
      this.preloaded.add(audio);
    }
  }

  /** 预加载单首 BGM（Ticket 13）：`new Audio(url).load()`，非浏览器环境为 noop。 */
  preloadBGM(url: string): void {
    this.preload([url]);
  }

  /** 暂停 BGM（保留位置，resume 时续播）。 */
  pauseBGM(): void {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
    this.isBgmPlaying = false;
  }

  /** 恢复暂停的 BGM；若底噪被用户关闭过则重新 play。 */
  resumeBGM(): void {
    if (this.bgmAudio && this.lastBgmUrl) {
      this.bgmAudio.play().catch(() => {
        // autoplay restriction
      });
    } else if (this.lastBgmUrl === undefined) {
      // synthesized track — restart from the top
      this.playBGM(undefined, this.lastBgmOptions);
      return;
    }
    this.isBgmPlaying = true;
  }

  stopBGM(): void {
    this.isBgmPlaying = false;
    this.lastBgmUrl = undefined;
    this.lastBgmOptions = {};
    this.stopFadeIn();
    this.stopLoopWatch();
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
      this.bgmAudio = undefined;
    }
    if (this.bgmScheduler !== undefined) {
      clearInterval(this.bgmScheduler);
      this.bgmScheduler = undefined;
    }
    if (this.bgmGainNode) {
      try {
        const ctx = this.audioCtx;
        if (ctx) {
          this.bgmGainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
        }
      } catch {
        // context may be closed
      }
      this.bgmGainNode = undefined;
    }
  }

  /** Release all audio resources (close AudioContext, drop preloads). */
  destroy(): void {
    this.stopBGM();
    this.seBus?.stopAll();
    this.preloaded.clear();
    if (this.audioCtx) {
      try {
        void this.audioCtx.close();
      } catch {
        // already closed
      }
      this.audioCtx = undefined;
    }
  }
}
