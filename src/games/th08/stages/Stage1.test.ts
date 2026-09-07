import { describe, it, expect } from 'vitest';
import { createStage1 } from './Stage1';
import { Enemy } from '../../../touhou-common/enemy/Enemy';
import { Rumia } from '../bosses/Rumia';

describe('TH08 Stage 1 Timeline', () => {
  function setup() {
    const enemies: Enemy[] = [];
    let bossSpawned: Rumia | null = null;
    let cleared = false;
    const messages: string[] = [];

    const stage = createStage1({
      spawnEnemy: (enemy) => enemies.push(enemy),
      spawnBoss: (boss) => {
        bossSpawned = boss;
      },
      onClear: () => {
        cleared = true;
      },
      showMessage: (text) => messages.push(text),
    });

    return { stage, enemies, getBoss: () => bossSpawned, getCleared: () => cleared, messages };
  }

  it('creates Stage 1 and triggers wave 1 (5 V-formation fairies) in the first ~140 frames', () => {
    const { stage, enemies } = setup();

    stage.update(59);
    expect(enemies).toHaveLength(0);
    stage.update(1); // frame 60
    expect(enemies).toHaveLength(1);
    stage.update(80); // frame 140
    expect(enemies).toHaveLength(5);
  });

  it('wave 2 at t=5s (frame 300): 8 fairies in a horizontal line, left to right', () => {
    const { stage, enemies } = setup();

    stage.update(299);
    expect(enemies).toHaveLength(5);
    stage.update(1); // frame 300
    expect(enemies).toHaveLength(13);

    const wave2 = enemies.slice(5);
    expect(wave2).toHaveLength(8);
    // 横排：同一 y，x 从左到右递增
    expect(new Set(wave2.map((e) => e.position.y)).size).toBe(1);
    for (let i = 1; i < wave2.length; i++) {
      expect(wave2[i].position.x).toBeGreaterThan(wave2[i - 1].position.x);
    }
    // 从左到右飞行
    expect(wave2[0].velocity.x).toBeGreaterThan(0);
  });

  it('wave 3 at t=10s (frame 600): 3 zigzag fairies', () => {
    const { stage, enemies } = setup();

    stage.update(599);
    expect(enemies).toHaveLength(13);
    stage.update(1); // frame 600
    expect(enemies).toHaveLength(16);

    const wave3 = enemies.slice(13);
    // zigzag：左右交替的水平速度 + 折返航点
    expect(wave3[0].velocity.x).toBeGreaterThan(0);
    expect(wave3[1].velocity.x).toBeLessThan(0);
    expect(wave3[2].velocity.x).toBeGreaterThan(0);
    for (const e of wave3) {
      expect(e.waypoints.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('mid-boss at t=35s (frame 2100): Mini-Rumia via stage.spawnEntity queue + dialogue', () => {
    const { stage, enemies, messages } = setup();

    stage.update(2099);
    expect(stage.spawnedEntities).toHaveLength(0);
    stage.update(1); // frame 2100

    expect(stage.spawnedEntities).toHaveLength(1);
    const miniRumia = stage.spawnedEntities[0] as Enemy;
    expect(miniRumia).toBeInstanceOf(Enemy);
    expect(miniRumia.hp).toBe(100); // 非符 100HP
    expect(stage.dialogueQueue).toHaveLength(1);
    expect(stage.dialogueQueue[0].text).toContain('Mini-Rumia');

    // 宿主消费队列后进入敌人列表
    for (const e of stage.spawnedEntities.splice(0)) {
      enemies.push(e as Enemy);
    }
    expect(enemies).toHaveLength(17);
    expect(messages).toHaveLength(0); // mid-boss 走 showDialogue 队列，不走 showMessage
  });

  it('wave 4 at t=50s (frame 3000): 10 fairies in a circle formation', () => {
    const { stage, enemies } = setup();

    stage.update(2999);
    expect(enemies).toHaveLength(16);
    stage.update(1); // frame 3000
    expect(enemies).toHaveLength(26);

    const wave4 = enemies.slice(16);
    // 环形阵：到圆心 (224, -160) 距离一致
    const radii = wave4.map(
      (e) => Math.hypot(e.position.x - 224, e.position.y - -160),
    );
    for (const r of radii) {
      expect(r).toBeCloseTo(90, 5);
    }
  });

  it('boss at t=70s (frame 4200): Rumia spawns with encounter message', () => {
    const { stage, getBoss, messages } = setup();

    stage.update(4199);
    expect(getBoss()).toBeNull();
    stage.update(1); // frame 4200

    expect(getBoss()).not.toBeNull();
    expect(messages).toContain('BOSS ENCOUNTER: Rumia (露米娅)');
    // 入场起点：屏幕顶外
    expect(getBoss()!.position.y).toBeLessThan(0);
  });

  it('defeating all boss phases triggers onClear', () => {
    const { stage, getBoss, getCleared } = setup();
    stage.update(4200);
    const boss = getBoss()!;

    boss.takeDamage(150);
    boss.takeDamage(250);
    boss.takeDamage(320);

    expect(boss.isDefeated).toBe(true);
    expect(getCleared()).toBe(true);
  });
});
