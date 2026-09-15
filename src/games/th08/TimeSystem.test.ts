import { describe, expect, it } from 'vitest';
import { TimeSystem } from './TimeSystem';

describe('TimeSystem', () => {
  it('cycles through daylight phases and exposes a stable snapshot', () => {
    const time = new TimeSystem(100);
    expect(time.phase).toBe('dawn');
    time.advance(25);
    expect(time.phase).toBe('day');
    time.advance(30);
    expect(time.phase).toBe('dusk');
    time.advance(20);
    expect(time.phase).toBe('night');
    expect(time.isNight).toBe(true);
    expect(time.snapshot()).toMatchObject({ frame: 75, phase: 'night', isNight: true });
  });

  it('wraps progress without losing the absolute frame counter', () => {
    const time = new TimeSystem(60);
    time.advance(75);
    expect(time.frame).toBe(75);
    expect(time.progress).toBeCloseTo(0.25);
    time.reset();
    expect(time.frame).toBe(0);
  });
});
