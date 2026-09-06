import { describe, it, expect } from 'vitest';
import { AudioManager } from './AudioManager';

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
  });
});
