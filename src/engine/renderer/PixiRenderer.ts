import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { SpriteManager } from './SpriteManager';
import { Bullet } from '../core/Bullet';
import { Player } from '../../touhou-common/player/Player';
import { Boss } from '../../touhou-common/boss/Boss';
import { Enemy } from '../../touhou-common/enemy/Enemy';
import { HUD } from '../../touhou-common/ui/HUD';
import { PerformanceMonitor } from '../debug/PerformanceMonitor';
import { InputSystem } from '../core/InputSystem';

export interface PixiRendererConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
}

export class PixiRenderer {
  public app: Application;
  public gameContainer: Container;
  public hudContainer: Container;
  public debugContainer: Container;

  private bulletGraphics: Graphics;
  private entityGraphics: Graphics;
  /** Named procedural sprites; renderer draws bullets by `Bullet.sprite` key. */
  public readonly sprites = new SpriteManager();
  private hudGraphics: Graphics;
  private debugGraphics: Graphics;

  private scoreText: Text;
  private livesText: Text;
  private bombsText: Text;
  private powerText: Text;
  private grazeText: Text;
  private spellNameText: Text;
  private spellTimerText: Text;
  private centerBannerText: Text;
  private debugText: Text;

  private width: number;
  private height: number;
  private pauseOverlay: Graphics;
  private pauseText: Text;

  /** HUD.showSpellCard 默认展示窗口（帧）—— 前 DISPLAY_ANIM_FRAMES 帧为弹出动画。 */
  private static readonly DISPLAY_WINDOW = 90;
  private static readonly DISPLAY_ANIM_FRAMES = 30;

  constructor() {
    this.app = new Application();
    this.gameContainer = new Container();
    this.hudContainer = new Container();
    this.debugContainer = new Container();

    this.bulletGraphics = new Graphics();
    this.entityGraphics = new Graphics();
    this.hudGraphics = new Graphics();
    this.debugGraphics = new Graphics();

    const titleStyle = new TextStyle({
      fontFamily: 'Consolas, monospace',
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: {
        alpha: 0.8,
        angle: 45,
        blur: 2,
        color: 0x000000,
        distance: 2,
      },
    });

    this.scoreText = new Text({ text: 'Score: 0000000000', style: titleStyle });
    this.livesText = new Text({ text: 'Player: ★★★', style: titleStyle });
    this.bombsText = new Text({ text: 'Spell:  ★★★', style: titleStyle });
    this.powerText = new Text({ text: 'Power:  128 / 128', style: titleStyle });
    this.grazeText = new Text({ text: 'Graze:  0', style: titleStyle });

    this.spellNameText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'serif, sans-serif',
        fontSize: 18,
        fill: 0xffd700,
        fontWeight: 'bold',
        stroke: { color: 0x220000, width: 3 },
      }),
    });

    this.spellTimerText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace',
        fontSize: 22,
        fill: 0xff4444,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 },
      }),
    });

    this.centerBannerText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'sans-serif',
        fontSize: 24,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0xc41e3a, width: 4 },
      }),
    });

    this.debugText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace',
        fontSize: 12,
        fill: 0x00ff88,
      }),
    });

    this.pauseOverlay = new Graphics();
    this.pauseText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      }),
    });

    this.width = 640;
    this.height = 480;
  }

  async init(config: PixiRendererConfig): Promise<void> {
    this.width = config.width ?? 640;
    this.height = config.height ?? 480;

    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundColor: 0x0d0d16,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    config.container.appendChild(this.app.canvas);

    // Setup containers
    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.hudContainer);
    this.app.stage.addChild(this.debugContainer);

    this.gameContainer.addChild(this.entityGraphics);
    this.gameContainer.addChild(this.bulletGraphics);

    this.hudContainer.addChild(this.hudGraphics);
    this.hudContainer.addChild(this.scoreText);
    this.hudContainer.addChild(this.livesText);
    this.hudContainer.addChild(this.bombsText);
    this.hudContainer.addChild(this.powerText);
    this.hudContainer.addChild(this.grazeText);
    this.hudContainer.addChild(this.spellNameText);
    this.hudContainer.addChild(this.spellTimerText);
    this.hudContainer.addChild(this.centerBannerText);

    this.debugContainer.addChild(this.debugGraphics);
    this.debugContainer.addChild(this.debugText);

    // Pause overlay (top-most, above HUD)
    this.pauseOverlay.visible = false;
    this.pauseText.visible = false;
    this.pauseText.anchor.set(0.5, 0.5);
    this.app.stage.addChild(this.pauseOverlay);
    this.app.stage.addChild(this.pauseText);

    // Layout HUD (Right panel: x >= 448)
    const rightPanelX = 460;
    this.scoreText.position.set(rightPanelX, 40);
    this.livesText.position.set(rightPanelX, 70);
    this.bombsText.position.set(rightPanelX, 95);
    this.powerText.position.set(rightPanelX, 125);
    this.grazeText.position.set(rightPanelX, 150);

    // Spellcard Banner — centered pop-in (US#6)
    this.spellNameText.anchor.set(0.5);
    this.spellNameText.position.set(this.width / 2, this.height / 2);

    this.spellTimerText.position.set(this.width / 2 + 260, this.height / 2 - 10);
    this.spellTimerText.anchor.set(1, 0);

    // Center warning banner
    this.centerBannerText.position.set(224, 240);
    this.centerBannerText.anchor.set(0.5, 0.5);

    // Debug text (top left)
    this.debugText.position.set(10, 10);
  }

  render(
    player: Player,
    boss: Boss | null,
    enemies: Enemy[],
    bullets: Bullet[],
    hud: HUD,
    monitor: PerformanceMonitor,
    isPaused = false,
    input: InputSystem | null = null,
  ): void {
    // 1. Clear dynamic graphics
    this.entityGraphics.clear();
    this.bulletGraphics.clear();
    this.hudGraphics.clear();
    this.debugGraphics.clear();

    // 2. Draw Playfield Frame (Left side 32..416, 32..448)
    this.hudGraphics.rect(32, 32, 384, 416).stroke({ width: 2, color: 0x5bb8b3 });
    this.hudGraphics.rect(440, 32, 180, 416).stroke({ width: 2, color: 0xc41e3a });

    // 3. Render Player
    if (player.isAlive) {
      const px = player.position.x;
      const py = player.position.y;

      // Invulnerability blink
      if (!player.isInvulnerable || Math.floor(player.invulnerabilityTimer / 6) % 2 === 0) {
        // Body (Reimu Red/White Shrine Maiden dress)
        this.entityGraphics.circle(px, py - 4, 8).fill({ color: 0xfff0e6 }); // head
        this.entityGraphics
          .poly([
            { x: px, y: py - 4 },
            { x: px - 12, y: py + 14 },
            { x: px + 12, y: py + 14 },
          ])
          .fill({ color: 0xc41e3a }); // red skirt
        this.entityGraphics.rect(px - 10, py - 10, 20, 6).fill({ color: 0xff3344 }); // red ribbon

        // Hitbox dot (visible in slow mode)
        if (player.isSlowMode) {
          this.entityGraphics.circle(px, py, 6).fill({ color: 0xffffff, alpha: 0.4 });
          this.entityGraphics.circle(px, py, 2).fill({ color: 0xff0044 });
        }
      }
    }

    // 4. Render Enemies
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      const ex = enemy.position.x;
      const ey = enemy.position.y;

      // Fairy wings
      this.entityGraphics.ellipse(ex - 8, ey - 4, 10, 5).fill({ color: 0xffffff, alpha: 0.6 });
      this.entityGraphics.ellipse(ex + 8, ey - 4, 10, 5).fill({ color: 0xffffff, alpha: 0.6 });

      // Fairy body
      this.entityGraphics.circle(ex, ey, enemy.hitbox.radius).fill({ color: enemy.color });
    }

    // 5. Render Boss
    if (boss && boss.isAlive && !boss.isDefeated) {
      const bx = boss.position.x;
      const by = boss.position.y;

      // Boss aura
      const auraAlpha = 0.2 + 0.1 * Math.sin(boss.timer * 0.1);
      this.entityGraphics.circle(bx, by, 32).fill({
        color: boss.isSpellCardActive ? 0xff2255 : 0x4488ff,
        alpha: auraAlpha,
      });

      // Rumia character silhouette (Black dress + yellow hair + red ribbon)
      this.entityGraphics.circle(bx, by - 6, 12).fill({ color: 0xffe066 }); // yellow hair
      this.entityGraphics
        .poly([
          { x: bx, y: by },
          { x: bx - 14, y: by + 20 },
          { x: bx + 14, y: by + 20 },
        ])
        .fill({ color: 0x1a1a24 }); // black dress
      this.entityGraphics.rect(bx - 12, by - 14, 8, 8).fill({ color: 0xcc1122 }); // red side ribbon

      // Boss Health Bar (top of playfield)
      const maxHp = boss.currentPhase?.maxHp ?? 1;
      const hpRatio = Math.max(0, Math.min(1, boss.currentHp / maxHp));
      this.hudGraphics.rect(40, 36, 368, 6).fill({ color: 0x222222 });
      this.hudGraphics
        .rect(40, 36, 368 * hpRatio, 6)
        .fill({ color: boss.isSpellCardActive ? 0xff3366 : 0x33cc88 });
    }

    // 6. Batch Render Bullets — style resolved from Bullet.sprite via SpriteManager
    for (const b of bullets) {
      if (!b.isAlive) continue;
      const rotation = Math.atan2(b.velocity.y, b.velocity.x);
      this.sprites.draw(this.bulletGraphics, b.sprite, b.position.x, b.position.y, {
        color: b.color,
        radius: b.hitbox.radius,
        rotation,
      });
    }

    // 7. Update HUD Texts
    this.scoreText.text = `Score:  ${hud.formattedScore}`;
    this.livesText.text = `Player: ${'★'.repeat(Math.max(0, hud.lives))}`;
    this.bombsText.text = `Spell:  ${'★'.repeat(Math.max(0, hud.bombs))}`;
    this.powerText.text = `Power:  ${hud.power} / 128`;
    this.grazeText.text = `Graze:  ${hud.graze}`;

    if (hud.spellCardName) {
      this.spellNameText.text = hud.spellCardName;
      this.spellTimerText.text = Math.ceil(hud.spellCardTime).toString();
      this.spellNameText.visible = true;
      this.spellTimerText.visible = true;

      // 居中弹出动画：前 30 帧 scale 1.6 -> 1.0 + 淡入，其余时间保持
      const elapsedFrames = PixiRenderer.DISPLAY_WINDOW - Math.max(0, hud.spellCardDisplayTimer);
      const progress = Math.min(1, elapsedFrames / PixiRenderer.DISPLAY_ANIM_FRAMES);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      this.spellNameText.alpha = Math.min(1, 0.2 + eased * 0.8);
      this.spellNameText.scale.set(1.6 - 0.6 * eased);
      this.spellNameText.position.set(this.width / 2, this.height / 2 - 14);
    } else {
      this.spellNameText.visible = false;
      this.spellTimerText.visible = false;
      this.spellNameText.scale.set(1);
      this.spellNameText.alpha = 1;
    }

    if (hud.centerMessage) {
      this.centerBannerText.text = hud.centerMessage;
      this.centerBannerText.visible = true;
    } else {
      this.centerBannerText.visible = false;
    }

    // 8. Update Debug Overlay (metrics + real-time input state)
    if (monitor.isVisible) {
      this.debugContainer.visible = true;
      const lines = monitor.getMetricsText();
      if (input) {
        const active = input.getActiveActions();
        lines.push(`Input: ${active.length > 0 ? active.join(' ') : '—'}`);
      }
      this.debugText.text = lines.join('\n');
      this.debugGraphics.rect(5, 5, 170, 75 + (input ? 16 : 0)).fill({ color: 0x000000, alpha: 0.7 });
    } else {
      this.debugContainer.visible = false;
    }

    // 9. Pause menu overlay
    if (isPaused) {
      this.pauseOverlay.clear();
      this.pauseOverlay.rect(0, 0, this.width, this.height).fill({ color: 0x000000, alpha: 0.55 });
      this.pauseText.text = 'PAUSED — 按 ESC 继续';
      this.pauseText.position.set(this.width / 2, this.height / 2);
      this.pauseOverlay.visible = true;
      this.pauseText.visible = true;
    } else {
      this.pauseOverlay.visible = false;
      this.pauseText.visible = false;
    }
  }

  destroy(): void {
    this.app.destroy(true, { children: true, texture: true });
  }
}
