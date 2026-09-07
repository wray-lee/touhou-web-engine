import { describe, it, expect } from 'vitest';
import { createStage1 } from './Stage1';
import { Enemy } from '../../../touhou-common/enemy/Enemy';

describe('TH08 Stage 1 Timeline', () => {
  it('creates Stage 1 and triggers enemy waves across frames', () => {
    const enemies: Enemy[] = [];
    let bossSpawned = false;

    const stage = createStage1({
      spawnEnemy: (enemy) => enemies.push(enemy),
      spawnBoss: () => {
        bossSpawned = true;
      },
      onClear: () => {},
    });

    expect(stage.name).toBe('Stage 1: 幻視の夜 ~ Ghostly Eyes');

    // Update through frame 60
    stage.update(70);
    expect(enemies.length).toBeGreaterThan(0);

    // Update through frame 2500
    stage.update(2500);
    expect(bossSpawned).toBe(true);
  });
});
