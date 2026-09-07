import { Stage, StageTimelineEvent } from '../../../engine/core/Stage';
import { Enemy, EnemyConfig } from '../../../touhou-common/enemy/Enemy';
import { AimingPattern } from '../../../touhou-common/bullet-patterns/AimingPattern';
import { LinearPattern } from '../../../touhou-common/bullet-patterns/LinearPattern';
import { CircularPattern } from '../../../touhou-common/bullet-patterns/CircularPattern';
import { BulletFactory } from '../../../touhou-common/bullet-patterns/BulletPattern';
import { Rumia } from '../bosses/Rumia';

export interface Stage1Callbacks {
  spawnEnemy: (enemy: Enemy) => void;
  spawnBoss: (boss: Rumia) => void;
  onClear: () => void;
  showMessage?: (text: string, durationFrames?: number) => void;
  /** Bullet creation hook — lets the game route spawned bullets through its object pool. */
  bulletFactory?: BulletFactory;
}

/** 注入对象池工厂到敌人配置（不动 caller 的配置对象）。 */
function withPooledBullets(callbacks: Stage1Callbacks, config: EnemyConfig): EnemyConfig {
  return callbacks.bulletFactory ? { ...config, bulletFactory: callbacks.bulletFactory } : config;
}

export function createStage1(callbacks: Stage1Callbacks): Stage {
  const timeline: StageTimelineEvent[] = [];

  // Wave 1 (t=0s): Intro fairies in V-formation
  for (let i = 0; i < 5; i++) {
    timeline.push({
      frame: 60 + i * 20,
      action: () => {
        const x = 120 + i * 50;
        const enemy = new Enemy(
          { x, y: -20 },
          { x: 0, y: 2.2 },
          withPooledBullets(callbacks, {
            hp: 20,
            scoreValue: 500,
            color: 0x55ccff,
            shootInterval: 50,
            shootPattern: new AimingPattern({ count: 1, speed: 2.8, color: 0x55ccff, radius: 3 }),
            movementWayPoints: [{ time: 80, velocity: { x: i < 2 ? -1.5 : 1.5, y: 1.0 } }],
          }),
        );
        callbacks.spawnEnemy(enemy);
      },
    });
  }

  // Wave 2 (t=5s = 300帧): 8 fairies in a line, fly from left to right
  timeline.push({
    frame: 300,
    action: () => {
      for (let i = 0; i < 8; i++) {
        const enemy = new Enemy(
          { x: 20 + i * 50, y: -20 },
          { x: 2.2, y: 0.6 },
          withPooledBullets(callbacks, {
            hp: 35,
            scoreValue: 800,
            color: 0xffaa33,
            shootInterval: 60,
            shootPattern: new LinearPattern({
              count: 3,
              speed: 2.5,
              baseAngle: Math.PI / 2,
              spreadAngle: 0.25,
              color: 0xffaa33,
            }),
          }),
        );
        callbacks.spawnEnemy(enemy);
      }
    },
  });

  // Wave 3 (t=10s = 600帧): 3 fairies in zigzag pattern
  timeline.push({
    frame: 600,
    action: () => {
      for (let i = 0; i < 3; i++) {
        const dir = i % 2 === 0 ? 1 : -1;
        const enemy = new Enemy(
          { x: 144 + i * 80, y: -20 },
          { x: dir * 1.6, y: 1.4 },
          withPooledBullets(callbacks, {
            hp: 40,
            scoreValue: 1200,
            color: 0xff33aa,
            shootInterval: 45,
            shootPattern: new CircularPattern({
              count: 8,
              speed: 2.0,
              color: 0xff33aa,
              radius: 4,
            }),
            movementWayPoints: [
              { time: 60, velocity: { x: -dir * 1.6, y: 1.4 } },
              { time: 120, velocity: { x: dir * 1.6, y: 1.4 } },
              { time: 180, velocity: { x: -dir * 1.6, y: 1.4 } },
            ],
          }),
        );
        callbacks.spawnEnemy(enemy);
      }
    },
  });

  // Mid-boss (t=35s = 2100帧): Mini-Rumia — 非符 100HP，走 Stage 上下文队列（票据 08）
  timeline.push({
    frame: 2100,
    action: (stage) => {
      stage.showDialogue('MID-BOSS: Mini-Rumia (小型ルミア)', 120);
      const miniRumia = new Enemy(
        { x: 224, y: -30 },
        { x: 0, y: 1.5 },
        withPooledBullets(callbacks, {
          hp: 100,
          scoreValue: 5000,
          radius: 20,
          color: 0x8833ff,
          shootInterval: 50,
          shootPattern: new CircularPattern({
            count: 16,
            speed: 2.5,
            color: 0x8833ff,
            radius: 4,
          }),
          movementWayPoints: [
            { time: 60, velocity: { x: 0, y: 0 } },
            { time: 480, velocity: { x: 0, y: -0.5 } },
          ],
        }),
      );
      stage.spawnEntity(miniRumia);
    },
  });

  // Wave 4 (t=50s = 3000帧): 10 fairies in circle formation
  timeline.push({
    frame: 3000,
    action: () => {
      // 环形阵：圆心在屏幕上方外，整环向下飘入
      for (let i = 0; i < 10; i++) {
        const angle = (i / 10) * Math.PI * 2;
        const enemy = new Enemy(
          { x: 224 + Math.cos(angle) * 90, y: -160 + Math.sin(angle) * 90 },
          { x: 0, y: 1.5 },
          withPooledBullets(callbacks, {
            hp: 25,
            scoreValue: 600,
            color: 0x33ee99,
            shootInterval: 40,
            shootPattern: new AimingPattern({ count: 2, speed: 3.2, spreadAngle: 0.2, color: 0x33ee99 }),
          }),
        );
        callbacks.spawnEnemy(enemy);
      }
    },
  });

  // Boss Rumia appearance (t=70s = 4200帧)
  timeline.push({
    frame: 4200,
    action: () => {
      callbacks.showMessage?.('BOSS ENCOUNTER: Rumia (露米娅)', 180);
      const rumia = new Rumia();
      rumia.on('defeat', () => {
        callbacks.showMessage?.('STAGE 1 CLEAR!', 300);
        callbacks.onClear();
      });
      callbacks.spawnBoss(rumia);
    },
  });

  return new Stage({
    name: 'Stage 1: 幻視の夜 ~ Ghostly Eyes',
    stageNumber: 1,
    timeline,
  });
}
