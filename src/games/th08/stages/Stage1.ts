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

  // Wave 1: Intro fairies in V-formation
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

  // Wave 2: Left & Right stream fairies
  for (let i = 0; i < 6; i++) {
    timeline.push({
      frame: 300 + i * 25,
      action: () => {
        const fromLeft = i % 2 === 0;
        const enemy = new Enemy(
          { x: fromLeft ? 0 : 440, y: 80 + i * 20 },
          { x: fromLeft ? 2.5 : -2.5, y: 0.8 },
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
      },
    });
  }

  // Wave 3: Elite Fairy
  timeline.push({
    frame: 650,
    action: () => {
      callbacks.showMessage?.('WARNING: Elite Enemy Approaching', 120);
      const elite = new Enemy(
        { x: 224, y: -30 },
        { x: 0, y: 1.5 },
        withPooledBullets(callbacks, {
          hp: 120,
          scoreValue: 5000,
          radius: 20,
          color: 0xff33aa,
          shootInterval: 45,
          shootPattern: new CircularPattern({
            count: 12,
            speed: 2.0,
            color: 0xff33aa,
            radius: 4,
          }),
          movementWayPoints: [
            { time: 60, velocity: { x: 0, y: 0 } },
            { time: 240, velocity: { x: 0, y: -1.5 } },
          ],
        }),
      );
      callbacks.spawnEnemy(elite);
    },
  });

  // Wave 4: Dense cross-fire fairies
  for (let i = 0; i < 8; i++) {
    timeline.push({
      frame: 1000 + i * 20,
      action: () => {
        const enemy = new Enemy(
          { x: 80 + (i % 4) * 80, y: -20 },
          { x: (i % 2 === 0 ? 1 : -1) * 0.8, y: 2.8 },
          withPooledBullets(callbacks, {
            hp: 25,
            scoreValue: 600,
            color: 0x33ee99,
            shootInterval: 40,
            shootPattern: new AimingPattern({ count: 2, speed: 3.2, spreadAngle: 0.2, color: 0x33ee99 }),
          }),
        );
        callbacks.spawnEnemy(enemy);
      },
    });
  }

  // Boss Rumia appearance
  timeline.push({
    frame: 1500,
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
