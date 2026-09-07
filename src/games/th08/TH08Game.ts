import { Player } from '../../touhou-common/player/Player';
import { BulletSystem } from '../../engine/core/BulletSystem';
import { CollisionSystem } from '../../engine/core/CollisionSystem';
import { InputSystem } from '../../engine/core/InputSystem';
import { PixiRenderer } from '../../engine/renderer/PixiRenderer';
import { AudioManager } from '../../engine/audio/AudioManager';
import { PerformanceMonitor } from '../../engine/debug/PerformanceMonitor';
import { HUD } from '../../touhou-common/ui/HUD';
import { Stage } from '../../engine/core/Stage';
import { createStage1 } from './stages/Stage1';
import { Rumia } from './bosses/Rumia';
import { Enemy } from '../../touhou-common/enemy/Enemy';
import { Bullet } from '../../engine/core/Bullet';
import { BulletFactory } from '../../touhou-common/bullet-patterns/BulletPattern';

export interface TH08GameOptions {
  container?: HTMLElement;
  headless?: boolean;
}

export class TH08Game {
  public player: Player;
  public bulletSystem: BulletSystem;
  public collisionSystem: CollisionSystem;
  public input: InputSystem;
  public audio: AudioManager;
  public monitor: PerformanceMonitor;
  public hud: HUD;
  public stage: Stage;
  public boss: Rumia | null = null;
  public enemies: Enemy[] = [];
  public renderer?: PixiRenderer;

  private isRunning = false;
  private animFrameId?: number;
  private headless: boolean;
  private bulletFactory: BulletFactory;
  /** Paused via ESC — freezes all gameplay logic while remaining renderable. */
  public isPaused = false;
  private audioUnlocked = false;
  private audioUnlockHandler?: () => void;

  constructor(options: TH08GameOptions = {}) {
    this.headless = options.headless ?? false;
    this.bulletSystem = new BulletSystem();
    // Route every bullet creation through the object pool
    this.bulletFactory = (config) => this.bulletSystem.createBullet(config);
    this.player = new Player({ x: 224, y: 380 }, { bulletFactory: this.bulletFactory });
    this.collisionSystem = new CollisionSystem(48);
    this.input = new InputSystem();
    this.audio = new AudioManager();
    this.monitor = new PerformanceMonitor();
    this.hud = new HUD();

    this.stage = createStage1({
      spawnEnemy: (enemy) => this.enemies.push(enemy),
      spawnBoss: (boss) => {
        this.boss = boss;
        boss.withBulletFactory(this.bulletFactory);
        boss.on('spellcard-start', (spell) => {
          this.audio.playSE('spellcard');
          this.hud.showSpellCard(spell.name, spell.durationSeconds, spell.bonusScore);
        });
        boss.on('phase-clear', () => {
          this.audio.playSE('enemy-hit');
          this.hud.hideSpellCard();
          this.bulletSystem.clearAll('enemy-bullet');
        });
        boss.on('defeat', () => {
          this.audio.playSE('enemy-hit');
          this.player.score += 500000;
        });
      },
      onClear: () => {
        this.hud.showMessage('STAGE CLEAR! THANKS FOR PLAYING!', 600);
      },
      showMessage: (text, frames) => {
        this.hud.showMessage(text, frames);
      },
      bulletFactory: this.bulletFactory,
    });

    this.setupListeners();
  }

  private setupListeners(): void {
    this.player.on('hit', () => {
      this.audio.playSE('pldead');
      this.bulletSystem.clearAll('enemy-bullet');
      if (this.boss?.isSpellCardActive) {
        this.boss.currentSpellCard?.failCapture();
      }
    });

    this.player.on('bomb', () => {
      this.audio.playSE('bomb');
      this.bulletSystem.clearAll('enemy-bullet');
      if (this.boss?.isSpellCardActive) {
        this.boss.currentSpellCard?.failCapture();
      }
      if (this.boss && this.boss.isAlive) {
        this.boss.takeDamage(150);
      }
      for (const e of this.enemies) {
        e.takeDamage(80);
      }
    });
  }

  async init(container: HTMLElement): Promise<void> {
    if (this.headless) return;
    this.renderer = new PixiRenderer();
    await this.renderer.init({ container });
    // Attach to the container so pointer/touch coords map to canvas-local space
    this.input.attach(container);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Stage 1 BGM — 内置合成回退保证任何环境立即有声；
    // 若浏览器因 autoplay 限制静默，会在首次交互时解锁（见 setupAudioUnlock）。
    this.audio.playBGM(undefined, { loop: true, volume: 0.7, fadeIn: 1000 });
    this.setupAudioUnlock();

    if (!this.headless) {
      const loop = () => {
        if (!this.isRunning) return;
        this.stepFrame(1);
        this.renderFrame();
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.input.detach();
  }

  /** Freeze gameplay (ESC pause menu state). */
  pause(): void {
    this.isPaused = true;
    this.audio.pauseBGM();
  }

  resume(): void {
    this.isPaused = false;
    this.audio.resumeBGM();
  }

  /** Toggle pause (ESC edge). */
  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /** Browsers block audio until the first user gesture — unlock then. */
  private setupAudioUnlock(): void {
    if (typeof window === 'undefined' || this.audioUnlocked) return;
    this.audioUnlockHandler = () => {
      this.audioUnlocked = true;
      this.audio.resumeBGM();
      this.removeAudioUnlockListeners();
    };
    window.addEventListener('pointerdown', this.audioUnlockHandler);
    window.addEventListener('keydown', this.audioUnlockHandler);
  }

  private removeAudioUnlockListeners(): void {
    if (typeof window === 'undefined' || !this.audioUnlockHandler) return;
    window.removeEventListener('pointerdown', this.audioUnlockHandler);
    window.removeEventListener('keydown', this.audioUnlockHandler);
    this.audioUnlockHandler = undefined;
  }

  /**
   * Full teardown: stop the loop, detach input, release audio + renderer.
   * Call from framework hosts (e.g. React `useEffect` cleanup).
   */
  destroy(): void {
    this.stop();
    this.removeAudioUnlockListeners();
    this.audio.destroy();
    this.renderer?.destroy();
    this.renderer = undefined;
  }

  stepFrame(dtFrames = 1): void {
    this.monitor.updateFrame();
    this.input.update();

    if (this.input.wasKeyPressed('debug')) {
      this.monitor.toggle();
    }

    // ESC toggles pause; no other gameplay when paused
    if (this.input.wasKeyPressed('pause')) {
      this.togglePause();
    }
    if (this.isPaused) return;

    if (this.input.wasKeyPressed('bomb')) {
      this.player.useBomb();
    }

    // 1. Update Player Input & Movement
    this.player.handleInput(this.input);
    this.player.update(dtFrames);

    // Player Shooting (auto-fire while touch-dragging on mobile)
    if (this.input.isKeyDown('shoot') || this.input.isDragging) {
      const newShots = this.player.shoot(this.stage.currentFrame);
      if (newShots.length > 0) {
        this.audio.playSE('shoot');
        this.bulletSystem.add(...newShots);
      }
    }

    // 2. Update Stage Timeline
    this.stage.update(dtFrames);

    // 3. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.isAlive) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(dtFrames);
      const enemyBullets = enemy.updateAI(dtFrames, this.player);
      if (enemyBullets.length > 0) {
        this.bulletSystem.add(...enemyBullets);
      }

      // Offscreen culling
      if (enemy.position.y > 550 || enemy.position.x < -60 || enemy.position.x > 500) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // 4. Update Boss AI
    if (this.boss && this.boss.isAlive) {
      this.boss.update(dtFrames);
      const bossBullets = this.boss.updateAI(dtFrames, this.player);
      if (bossBullets.length > 0) {
        this.bulletSystem.add(...bossBullets);
      }
      if (this.boss.isDefeated) {
        this.boss = null;
      }
    }

    // 5. Update Bullets
    this.bulletSystem.update(dtFrames);

    // 6. Collision Resolution (all through the spatial hash grid)
    const allEntities = [
      ...(this.player.isAlive ? [this.player] : []),
      ...this.enemies,
      ...(this.boss && this.boss.isAlive ? [this.boss] : []),
      ...this.bulletSystem.getBullets(),
    ];
    this.collisionSystem.update(allEntities);

    // Player bullets vs enemies/boss — spatial hash neighbourhood queries
    const bullets = this.bulletSystem.getBullets();
    for (const b of bullets) {
      if (!b.isAlive || b.tag !== 'player-bullet') continue;

      const hits = this.collisionSystem.checkCollisions(b, ['enemy', 'boss']);
      for (const hit of hits) {
        const target = hit.entity;
        if (target.tag === 'boss') {
          (target as Rumia).takeDamage(b.damage);
          b.destroy();
          this.player.score += 200;
          this.audio.playSE('enemy-hit');
          break;
        }
        // enemy
        if (target.isAlive) {
          const killed = (target as Enemy).takeDamage(b.damage);
          b.destroy();
          this.audio.playSE('enemy-hit');
          this.player.score += killed ? (target as Enemy).scoreValue : 100;
          break;
        }
      }
    }

    // Enemy bullets vs player (hit + graze within 16px)
    if (this.player.isAlive) {
      if (!this.player.isInvulnerable) {
        const hits = this.collisionSystem.checkCollisions(this.player, 'enemy-bullet');
        for (const hit of hits) {
          if (hit.entity.isAlive) {
            this.player.hit();
            hit.entity.destroy();
            break;
          }
        }
      }

      const grazes = this.collisionSystem.queryNearby(this.player, 16, 'enemy-bullet');
      for (const g of grazes) {
        const bullet = g.entity as Bullet;
        if (bullet.isAlive && !bullet.grazed) {
          bullet.grazed = true;
          this.player.graze++;
          this.player.score += 500;
          this.audio.playSE('graze');
        }
      }
    }

    // 7. Update HUD & Monitor
    this.hud.updateFromPlayer(this.player);
    this.hud.update(dtFrames);
    if (this.boss?.isSpellCardActive && this.boss.currentSpellCard) {
      this.hud.spellCardTime = this.boss.currentSpellCard.timeRemaining;
    }

    this.monitor.updateMetrics(allEntities.length, this.collisionSystem.totalChecks);
  }

  renderFrame(): void {
    if (this.renderer) {
      this.renderer.render(
        this.player,
        this.boss,
        this.enemies,
        this.bulletSystem.getBullets(),
        this.hud,
        this.monitor,
        this.isPaused,
      );
    }
  }
}
