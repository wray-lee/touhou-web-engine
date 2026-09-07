import { describe, it, expect } from 'vitest';
import { Stage, StageTimelineEvent } from './Stage';
import { Entity } from './Entity';

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

  describe('StageContext API (spawnEntity / startBossPhase / showDialogue)', () => {
    it('spawnEntity queues entities for the host game to consume', () => {
      const stage = new Stage({ timeline: [] });
      const enemy = new Entity({ x: 10, y: 20 }, {}, {}, 'enemy');

      stage.spawnEntity(enemy);

      expect(stage.spawnedEntities).toHaveLength(1);
      expect(stage.spawnedEntities[0]).toBe(enemy);
    });

    it('timeline actions can enqueue entities via the stage context', () => {
      const stage = new Stage({
        timeline: [{ frame: 3, action: (ctx) => ctx.spawnEntity(new Entity()) }],
      });

      stage.update(2);
      expect(stage.spawnedEntities).toHaveLength(0);
      stage.update(1);
      expect(stage.spawnedEntities).toHaveLength(1);
    });

    it('startBossPhase records boss + phase index', () => {
      const stage = new Stage({ timeline: [] });
      const boss = new Entity({ x: 0, y: 0 }, {}, {}, 'boss');

      stage.startBossPhase(boss, 2);

      expect(stage.bossPhaseRequests).toHaveLength(1);
      expect(stage.bossPhaseRequests[0]).toEqual({ boss, index: 2 });
    });

    it('showDialogue queues text with default and explicit durations', () => {
      const stage = new Stage({ timeline: [] });

      stage.showDialogue('Hello');
      stage.showDialogue('Stage 1', 90);

      expect(stage.dialogueQueue).toEqual([
        { text: 'Hello', frames: 180 },
        { text: 'Stage 1', frames: 90 },
      ]);
    });

    it('reset clears all context queues', () => {
      const stage = new Stage({
        timeline: [{ frame: 1, action: (ctx) => ctx.showDialogue('x') }],
      });
      stage.update(1);
      stage.spawnEntity(new Entity());
      expect(stage.dialogueQueue.length + stage.spawnedEntities.length).toBeGreaterThan(0);

      stage.reset();

      expect(stage.spawnedEntities).toHaveLength(0);
      expect(stage.bossPhaseRequests).toHaveLength(0);
      expect(stage.dialogueQueue).toHaveLength(0);
    });
  });
});
