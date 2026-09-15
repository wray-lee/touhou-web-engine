import { describe, expect, it } from 'vitest';
import { ReplayPlayer, ReplayRecorder } from './ReplaySystem';

describe('ReplaySystem', () => {
  it('records, serializes, and replays input snapshots', () => {
    const recorder = new ReplayRecorder();
    recorder.start({ stage: 1, difficulty: 'normal', character: 'reimu-yukari' });
    recorder.capture(0, { actions: ['shoot'], pointerPos: { x: 10, y: 20 }, isDragging: false });
    recorder.capture(1, { actions: ['left'], pointerPos: { x: 10, y: 20 }, isDragging: false });

    const data = ReplayRecorder.decode(ReplayRecorder.encode(recorder.stop()));
    const player = new ReplayPlayer(data);
    expect(player.next()?.snapshot.actions).toEqual(['shoot']);
    expect(player.next()?.frame).toBe(1);
    expect(player.isFinished).toBe(true);
  });
});
