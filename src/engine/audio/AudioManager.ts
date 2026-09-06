export type SoundEffectType = 'shoot' | 'enemy-hit' | 'bomb' | 'spellcard' | 'pldead' | 'graze' | 'item';

export class AudioManager {
  public bgmVolume = 0.7;
  public seVolume = 1.0;
  public isMuted = false;
  private audioCtx?: AudioContext;
  private bgmAudio?: HTMLAudioElement;

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

  playBGM(url: string, loop = true): void {
    if (typeof window === 'undefined') return;
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.bgmAudio = new Audio(url);
    this.bgmAudio.loop = loop;
    this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    this.bgmAudio.play().catch(() => {
      // Autoplay policy handled
    });
  }

  stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }
}
