import { describe, it, expect } from 'vitest';
import { Stage, StageTimelineEvent } from './Stage';

describe('Stage System & Timeline', () => {
  it('executes timeline events at correct frame timestamps', () => {
    let firedA = false;
    let firedB = false;

    const timeline: StageTimelineEvent[] = [
      {
        frame: 10,
        action: () => {
          firedA = true;
        },
      },
      {
        frame: 20,
        action: () => {
          firedB = true;
        },
      },
    ];

    const stage = new Stage({ timeline });

    stage.update(9);
    expect(firedA).toBe(false);
    expect(firedB).toBe(false);

    stage.update(1); // frame 10
    expect(firedA).toBe(true);
    expect(firedB).toBe(false);

    stage.update(10); // frame 20
    expect(firedB).toBe(true);
  });

  it('handles stage pause and resume', () => {
    let count = 0;
    const stage = new Stage({
      timeline: [{ frame: 5, action: () => count++ }],
    });

    stage.isPaused = true;
    stage.update(10);
    expect(count).toBe(0);

    stage.isPaused = false;
    stage.update(5);
    expect(count).toBe(1);
  });
});
