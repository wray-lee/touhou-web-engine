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

  constructor(options: TH08GameOptions = {}) {
    this.headless = options.headless ?? false;
    this.player = new Player({ x: 224, y: 380 });
    this.bulletSystem = new BulletSystem();
    this.collisionSystem = new CollisionSystem(48);
    this.input = new InputSystem();
    this.audio = new AudioManager();
    this.monitor = new PerformanceMonitor();
    this.hud = new HUD();

    this.stage = createStage1({
      spawnEnemy: (enemy) => this.enemies.push(enemy),
      spawnBoss: (boss) => {
        this.boss = boss;
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
    this.input.attach(window);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

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
    this.input.detach(window);
  }

  stepFrame(dtFrames = 1): void {
    this.monitor.updateFrame();
    this.input.update();

    if (this.input.wasKeyPressed('debug')) {
      this.monitor.toggle();
    }

    if (this.input.wasKeyPressed('bomb')) {
      this.player.useBomb();
    }

    // 1. Update Player Input & Movement
    this.player.handleInput(this.input);
    this.player.update(dtFrames);

    // Player Shooting
    if (this.input.isKeyDown('shoot')) {
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

    // 6. Collision Resolution
    const allEntities = [
      ...(this.player.isAlive ? [this.player] : []),
      ...this.enemies,
      ...(this.boss && this.boss.isAlive ? [this.boss] : []),
      ...this.bulletSystem.getBullets(),
    ];
    this.collisionSystem.update(allEntities);

    // Check Player bullets hitting enemies/boss
    for (const b of this.bulletSystem.getBullets()) {
      if (!b.isAlive || b.tag !== 'player-bullet') continue;

      // Check Boss hit
      if (this.boss && this.boss.isAlive) {
        const dist = b.distanceTo(this.boss);
        if (dist <= b.hitbox.radius + this.boss.hitbox.radius) {
          this.boss.takeDamage(b.damage);
          b.destroy();
          this.player.score += 200;
          this.audio.playSE('enemy-hit');
          continue;
        }
      }

      // Check Enemies hit
      for (const enemy of this.enemies) {
        if (!enemy.isAlive) continue;
        const dist = b.distanceTo(enemy);
        if (dist <= b.hitbox.radius + enemy.hitbox.radius) {
          const killed = enemy.takeDamage(b.damage);
          b.destroy();
          this.audio.playSE('enemy-hit');
          this.player.score += killed ? enemy.scoreValue : 100;
          break;
        }
      }
    }

    // Check Enemy bullets hitting Player & Graze
    if (this.player.isAlive && !this.player.isInvulnerable) {
      const hits = this.collisionSystem.checkCollision(this.player);
      for (const hit of hits) {
        if (hit.tag === 'enemy-bullet') {
          this.player.hit();
          hit.destroy();
          break;
        }
      }

      // Graze detection (within 16px of player)
      for (const b of this.bulletSystem.getBullets()) {
        if (b.isAlive && b.tag === 'enemy-bullet' && !b.grazed) {
          if (b.distanceTo(this.player) <= 16) {
            b.grazed = true;
            this.player.graze++;
            this.player.score += 500;
            this.audio.playSE('graze');
          }
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
        this.monitor
      );
    }
  }

  destroy(): void {
    this.stop();
    this.renderer?.destroy();
  }
}
