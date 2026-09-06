export type SoundEffectType = 'shoot' | 'enemy-hit' | 'bomb' | 'spellcard' | 'pldead' | 'graze' | 'item';

export interface BgmOptions {
  loop?: boolean;
  volume?: number;
  /** Fade-in duration in ms (boolean `true` = 1000ms). */
  fadeIn?: boolean | number;
}

/** 东方风格合成 BGM 回退：无外部素材时用 Web Audio 琶音循环（Phase 1 程序生成）。 */
const SYNTH_BGM_NOTES = [220, 261.63, 329.63, 440, 329.63, 261.63, 440, 523.25]; // A3 C4 E4 A4 E4 C4 A4 C5
const SYNTH_BGM_STEP = 0.35; // 每音符时长（秒）

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
  private lastBgmUrl?: string;
  private lastBgmOptions: BgmOptions = {};
  private preloaded = new Set<HTMLAudioElement>();

  private getContext(): AudioContext | undefined {
    if (typeof window === 'undefined') return undefined;
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  }

  playSE(type: SoundEffectType): void {
    if (this.isMuted || this.seVolume <= 0) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const vol = this.seVolume * 0.2;

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
   * 播放 BGM。
   * - `url` 给出时用 HTMLAudio 播放（支持 loop/volume/fadeIn）。
   * - 无 `url`（或资源缺失）时回退到内置 Web Audio 合成琶音循环，
   *   保证任何环境立即有声（Phase 1 无需外部素材）。
   */
  playBGM(url?: string, options: BgmOptions = {}): void {
    this.stopBGM();
    this.lastBgmUrl = url;
    this.lastBgmOptions = { ...options };
    const { loop = true, volume, fadeIn = false } = options;
    // 记录最后请求的 fade-in 配置（stop 后保留以供查询）
    this.fadeInMs = typeof fadeIn === 'number' ? Math.max(0, fadeIn) : fadeIn ? 1000 : 0;
    const targetVolume = Math.max(0, Math.min(1, volume ?? this.bgmVolume));
    this.isBgmPlaying = true;

    // Non-browser environment (Node tests): track state only
    if (typeof window === 'undefined') {
      return;
    }

    if (url) {
      this.bgmAudio = new Audio(url);
      this.bgmAudio.loop = loop;
      this.bgmAudio.muted = this.isMuted;
      this.bgmAudio.volume = this.isMuted ? 0 : targetVolume;
      if (this.fadeInMs > 0 && !this.isMuted) {
        this.bgmAudio.volume = 0;
        const steps = 20;
        let step = 0;
        const interval = window.setInterval(() => {
          step++;
          if (this.bgmAudio && step <= steps) {
            this.bgmAudio.volume = targetVolume * (step / steps);
          } else {
            clearInterval(interval);
          }
        }, this.fadeInMs / steps);
      }
      this.bgmAudio.play().catch(() => {
        // Autoplay policy — will be handled on user gesture
      });
    } else {
      this.playSynthesizedBgm(targetVolume);
    }
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
}
