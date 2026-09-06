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
});
