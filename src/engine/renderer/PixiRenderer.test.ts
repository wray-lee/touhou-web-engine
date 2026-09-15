import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// PixiJS 8 needs WebGL/canvas which the node test env lacks — mock the whole module.
vi.mock('pixi.js', () => {
  class Container {
    public children: unknown[] = [];
    public visible = true;
    public position = new Vec2Mock();
    public scale = new Vec2Mock();
    public alpha = 1;
    addChild(child: unknown) {
      this.children.push(child);
      return child;
    }
  }

  class Graphics {
    /** Recorded so a test can tell "drawn" apart from "constructed". */
    public strokes = 0;
    /** Filled shapes this frame: the hitbox bead is three concentric circles. */
    public fills = 0;
    circle() {
      return this;
    }
    ellipse() {
      return this;
    }
    rect() {
      return this;
    }
    poly() {
      return this;
    }
    roundRect() {
      return this;
    }
    moveTo() {
      return this;
    }
    lineTo() {
      return this;
    }
    closePath() {
      return this;
    }
    fill() {
      this.fills++;
      return this;
    }
    stroke() {
      this.strokes++;
      return this;
    }
    clear() {
      this.strokes = 0;
      this.fills = 0;
      return this;
    }
  }

  class Vec2Mock {
    x = 0;
    y = 0;
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }

  class Text {
    public text = '';
    public visible = true;
    public alpha = 1;
    public anchor = { set: () => {} };
    public position = new Vec2Mock();
    public scale = new Vec2Mock();
    public style: unknown = {};
    constructor(opts?: { text?: string; style?: unknown }) {
      this.text = opts?.text ?? '';
      this.style = opts?.style ?? {};
    }
  }

  class TextStyle {
    constructor(opts?: unknown) {
      Object.assign(this, opts);
    }
  }

  class Sprite {
    public texture: unknown;
    public visible = true;
    public alpha = 1;
    public anchor = { set: () => {} };
    public position = new Vec2Mock();
    public scale = new Vec2Mock();
    public destroyed = false;
    destroy() {
      this.destroyed = true;
    }
  }

  class Application {
    public canvas = { width: 640, height: 480 };
    public stage = new Container();
    async init() {
      /* no-op */
    }
    destroy() {
      /* no-op */
    }
  }

  return { Application, Container, Graphics, Sprite, Text, TextStyle };
});

import { PixiRenderer } from './PixiRenderer';
import { Player } from '../../touhou-common/player/Player';
import { Enemy } from '../../touhou-common/enemy/Enemy';
import { Bullet } from '../core/Bullet';
import { HUD } from '../../touhou-common/ui/HUD';
import { PerformanceMonitor } from '../debug/PerformanceMonitor';
import { InputSystem } from '../core/InputSystem';
import { Boss } from '../../touhou-common/boss/Boss';
import { HUD_ART_PROBE, HUD_ROWS, HUD_TEXT_ADVANCE } from '../core/HudLayout';

const makeContainer = () => ({ appendChild: vi.fn() }) as unknown as HTMLElement;

describe('PixiRenderer', () => {
  beforeEach(() => {
    // init() reads window.devicePixelRatio — stub the minimal browser global.
    (globalThis as { window?: unknown }).window = { devicePixelRatio: 1 };
  });

  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  it('init() mounts the layer containers on stage and appends the canvas', async () => {
    const renderer = new PixiRenderer();
    const container = makeContainer();

    await renderer.init({ container, width: 640, height: 480 });

    expect(container.appendChild).toHaveBeenCalledWith(renderer.app.canvas);
    expect(renderer.app.stage.children).toContain(renderer.gameContainer);
    expect(renderer.app.stage.children).toContain(renderer.hudContainer);
    expect(renderer.app.stage.children).toContain(renderer.debugContainer);
  });

  it('render() draws a full frame without throwing', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });

    const player = new Player({ x: 224, y: 400 });
    const enemies = [new Enemy({ x: 200, y: 120 })];
    const bullets = [
      new Bullet({
        position: { x: 100, y: 200 },
        velocity: { x: 0, y: 5 },
        radius: 4,
        color: 0xff3366,
        sprite: 'bullet_small',
      }),
      new Bullet({
        position: { x: 150, y: 250 },
        velocity: { x: 2, y: 3 },
        radius: 6,
        color: 0xffffff,
        sprite: 'bullet_ring',
      }),
    ];
    const hud = new HUD();
    const monitor = new PerformanceMonitor();

    expect(() => renderer.render(player, null, enemies, bullets, hud, monitor)).not.toThrow();
  });

  /**
   * The retail 判定点 marker is a 24x29 red coil, several times the area of the
   * bead, and it is additive. Parented after `hitboxGraphics` it covers the bead
   * and slow mode reads as a red haze with no point in it -- which is what the
   * scene graph did before this test existed.
   */
  it('parents the hitbox dot above the marker coil, not under it', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const { hitboxMarker, hitboxGraphics } = renderer as unknown as {
      hitboxMarker: object;
      hitboxGraphics: object;
    };
    // Read as plain values: Pixi types `children` as ContainerChild, and the two
    // nodes here are only ever compared by identity.
    const order: readonly unknown[] = renderer.gameContainer.children;
    expect(order.indexOf(hitboxMarker)).toBeGreaterThan(-1);
    expect(order.indexOf(hitboxGraphics)).toBeGreaterThan(order.indexOf(hitboxMarker));
  });

  it('renders the bead with a dark bezel so it survives the red coil', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const player = new Player({ x: 224, y: 400 });
    // Slow mode is what makes the hitbox visible at all.
    player.hitboxVisible = true;
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    const bead = renderer as unknown as { hitboxGraphics: { fills: number } };
    renderer.render(player, null, [], [], hud, monitor);
    // Three concentric fills: bezel, red body, white core. `clear()` runs first
    // every frame, so a painted bead is the only way this can be non-zero.
    expect(bead.hitboxGraphics.fills).toBeGreaterThanOrEqual(3);
  });

  it('toggles debugContainer.visible from monitor.isVisible', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });

    const player = new Player();
    const hud = new HUD();

    const hidden = new PerformanceMonitor();
    hidden.isVisible = false;
    renderer.render(player, null, [], [], hud, hidden);
    expect(renderer.debugContainer.visible).toBe(false);

    const shown = new PerformanceMonitor();
    shown.isVisible = true;
    renderer.render(player, null, [], [], hud, shown);
    expect(renderer.debugContainer.visible).toBe(true);
  });

  it('renders an Input: debug line when an InputSystem is supplied', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });

    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    monitor.isVisible = true;

    const input = new InputSystem();
    input.simulateKeyDown('KeyZ');
    input.update();

    renderer.render(player, null, [], [], hud, monitor, false, input);

    const debugText = (renderer as unknown as { debugText: { text: string } }).debugText;
    expect(debugText.text).toContain('Input:');
    expect(debugText.text).toContain('shoot');
  });

  it('shows the PAUSED overlay only while isPaused', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const internals = renderer as unknown as {
      pauseOverlay: { visible: boolean };
      pauseText: { visible: boolean; text: string };
    };

    renderer.render(new Player(), null, [], [], new HUD(), new PerformanceMonitor(), true);
    expect(internals.pauseOverlay.visible).toBe(true);
    expect(internals.pauseText.visible).toBe(true);
    expect(internals.pauseText.text).toContain('PAUSED');
    expect(internals.pauseText.text).toContain('ESC');

    renderer.render(new Player(), null, [], [], new HUD(), new PerformanceMonitor(), false);
    expect(internals.pauseOverlay.visible).toBe(false);
    expect(internals.pauseText.visible).toBe(false);
  });

  it('keeps a defeated boss visible during its alpha fade-out', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const rumia = new Boss({ name: 'Rumia', phases: [] });
    rumia.isAlive = false;
    rumia.isDefeated = true;
    rumia.alpha = 0.5;
    const entityGraphics = (renderer as unknown as { entityGraphics: { circle: () => unknown } })
      .entityGraphics;
    const circle = vi.spyOn(entityGraphics, 'circle');

    renderer.render(rumia as unknown as Player, rumia, [], [], new HUD(), new PerformanceMonitor());

    expect(circle).toHaveBeenCalled();
  });

  it('washes the screen to white over the frames a stage message asked for', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const internals = renderer as unknown as {
      screenFade: { visible: boolean; fill: (opts: { alpha: number }) => unknown };
    };
    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();

    // Read what actually gets painted, not the counter one tick later.
    const painted: number[] = [];
    vi.spyOn(internals.screenFade, 'fill').mockImplementation((opts: { alpha: number }) => {
      painted.push(Number(opts.alpha.toFixed(4)));
      return internals.screenFade as unknown;
    });

    renderer.startScreenFade(4, 0xffffff);
    for (let frame = 0; frame < 6; frame++) renderer.render(player, null, [], [], hud, monitor);

    // The countdown is inclusive at both ends, so a four-frame chain is painted five
    // times and the ramp really does reach solid white before the layer retires.
    expect(painted, 'the painted coverage per frame').toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(internals.screenFade.visible, 'gone once it has covered the picture').toBe(false);
    expect(renderer.screenFadeRemaining).toBe(0);

    renderer.startScreenFade(10);
    renderer.clearScreenFade();
    expect(renderer.screenFadeAlpha).toBe(0);
  });

  it('slides the spellcard banner in from the right and settles centered', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer(), width: 640, height: 480 });
    const spellName = (
      renderer as unknown as {
        spellNameText: { visible: boolean; position: { x: number }; scale: { x: number } };
      }
    ).spellNameText;
    const player = new Player();
    const monitor = new PerformanceMonitor();

    const hud = new HUD();
    hud.showSpellCard('夜符「Night Bird」', 40); // 90-frame display window
    // Frame 0 of the animation: off to the right, enlarged
    renderer.render(player, null, [], [], hud, monitor);
    expect(spellName.visible).toBe(true);
    expect(spellName.position.x).toBeGreaterThan(400);
    expect(spellName.scale.x).toBeGreaterThan(1.5);

    // After the 30-frame pop-in: centered, scale 1
    hud.update(30);
    renderer.render(player, null, [], [], hud, monitor);
    expect(spellName.position.x).toBeCloseTo(320, 1);
    expect(spellName.scale.x).toBeCloseTo(1, 2);

    // No active card: hidden
    hud.hideSpellCard();
    renderer.render(player, null, [], [], hud, monitor);
    expect(spellName.visible).toBe(false);
  });

  it('tints the bomb flash with the card colour it was handed', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });

    expect(renderer.bombFlashColor).toBeNull();
    renderer.triggerBombFlash(0xffd8ec);
    expect(renderer.bombFlashColor).toBe(0xffd8ec);
    // Every card looks the same if the no-argument form forgets to reset.
    renderer.triggerBombFlash();
    expect(renderer.bombFlashColor).toBe(0xffffff);
  });

  it('decays the flash so the next card starts from a clean colour', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    renderer.triggerBombFlash(0x9be8ff);
    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    for (let i = 0; i < 18; i++) {
      renderer.render(player, null, [], [], hud, monitor);
    }
    expect(renderer.bombFlashColor).toBeNull();
  });

  it('paints the night clock dial and hands the clock the game set', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    const clock = renderer as unknown as {
      nightClockFace: { strokes: number };
      nightClockHand: { strokes: number };
    };

    // Nothing on the panel until a frame runs, then twelve hour marks plus the
    // rim, and exactly one hand.
    hud.clockTime = 5;
    renderer.render(player, null, [], [], hud, monitor);
    expect(clock.nightClockFace.strokes).toBe(13);
    expect(clock.nightClockHand.strokes).toBe(1);

    // The hand moves with the clock instead of being a static decal: the night
    // read-out is the only way a player can see how much bonus is left.
    hud.clockTime = 12;
    renderer.render(player, null, [], [], hud, monitor);
    expect(clock.nightClockFace.strokes).toBe(13);
    expect(clock.nightClockHand.strokes).toBe(1);
  });

  it('retracts an enemy sprite the frame the enemy stops being alive', async () => {
    // The pool hands `Enemy` objects back out, and `enemySprites` is keyed by
    // object identity, so an enemy that dies without being dropped from the
    // array used to leave its fairy frozen on screen at its last position.
    // That is the "贴图卡住" report, and only a destroy() proves it is gone.
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    const sprites = renderer as unknown as { enemySprites: Map<Enemy, { destroyed: boolean }> };

    const fairy = new Enemy({ x: 200, y: 120 });
    renderer.render(player, null, [fairy], [], hud, monitor);
    expect(sprites.enemySprites.size).toBe(1);
    const sprite = sprites.enemySprites.get(fairy);
    expect(sprite?.destroyed).toBe(false);

    fairy.isAlive = false;
    renderer.render(player, null, [fairy], [], hud, monitor);
    expect(sprites.enemySprites.size).toBe(0);
    expect(sprite?.destroyed).toBe(true);
  });

  it('retracts the sprite of an enemy the list dropped without a death at all', async () => {
    // Off-field culling takes an enemy out of the array entirely, which has to
    // release the sprite on the same path.
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    const sprites = renderer as unknown as { enemySprites: Map<Enemy, { destroyed: boolean }> };

    const fairy = new Enemy({ x: 200, y: 120 });
    renderer.render(player, null, [fairy], [], hud, monitor);
    expect(sprites.enemySprites.size).toBe(1);

    renderer.render(player, null, [], [], hud, monitor);
    expect(sprites.enemySprites.size).toBe(0);
  });

  it('reuses a pooled enemy object with a fresh sprite, not the old one', async () => {
    const renderer = new PixiRenderer();
    await renderer.init({ container: makeContainer() });
    const player = new Player();
    const hud = new HUD();
    const monitor = new PerformanceMonitor();
    const sprites = renderer as unknown as { enemySprites: Map<Enemy, { destroyed: boolean }> };

    const fairy = new Enemy({ x: 200, y: 120 });
    renderer.render(player, null, [fairy], [], hud, monitor);
    const first = sprites.enemySprites.get(fairy);

    fairy.isAlive = false;
    renderer.render(player, null, [fairy], [], hud, monitor);
    // The pool refills the same object for the next wave.
    fairy.isAlive = true;
    fairy.position.x = 300;
    fairy.position.y = 90;
    renderer.render(player, null, [fairy], [], hud, monitor);
    const second = sprites.enemySprites.get(fairy);

    expect(first?.destroyed).toBe(true);
    expect(second).toBeDefined();
    expect(second).not.toBe(first);
  });
  /*
   * `Gui.cpp:1512-1519` prints the power read-out as `%d` below 128 and the word MAX at
   * 128, both at (488, 136). An earlier reading of that branch dropped the else arm, so a
   * maxed run simply lost its power row. The Time row comes from the same function: retail
   * warms all three of its cells to 0xfffff0c0 (`:1462-1471`) once the orbs on hand can
   * pay for a Last Spell, which is the only on-field tell that the boss can.
   */
  describe('panel value rows', () => {
    type RowCall = { text: string; x: number; y: number; tint?: number };

    const renderRows = async (setup: (hud: HUD) => void): Promise<RowCall[]> => {
      const renderer = new PixiRenderer();
      await renderer.init({ container: makeContainer() });
      // The panel only switches to the bitmap rows once a glyph is live.
      renderer.assets.register(HUD_ART_PROBE, {} as never);
      const player = new Player();
      const hud = new HUD();
      const monitor = new PerformanceMonitor();
      const calls: RowCall[] = [];
      const target = renderer as unknown as {
        drawHudText(
          text: string,
          x: number,
          y: number,
          scale?: number,
          align?: 'left' | 'right',
          options?: { tint?: number },
        ): number;
      };
      target.drawHudText = (text, x, y, _scale, _align, options) => {
        calls.push({ text, x, y, tint: options?.tint });
        return text.length * HUD_TEXT_ADVANCE;
      };
      setup(hud);
      renderer.render(player, null, [], [], hud, monitor);
      return calls;
    };

    const rowAt = (calls: RowCall[], y: number) => calls.filter((c) => c.y === y);

    it('prints the number below full power and MAX at it', async () => {
      const some = await renderRows((hud) => {
        hud.power = 64;
        hud.maxPower = 128;
      });
      expect(rowAt(some, HUD_ROWS.power).map((c) => c.text)).toEqual(['64']);

      const full = await renderRows((hud) => {
        hud.power = 128;
        hud.maxPower = 128;
      });
      expect(rowAt(full, HUD_ROWS.power).map((c) => c.text)).toEqual(['MAX']);
    });

    /**
     * Retail's Time row is `currentTimeOrbs / lastSpellTimeOrbThreshold`, and the whole
     * row goes warm white when the left term reaches the right one (`Gui.cpp:1462-1471`).
     * This port cannot source the threshold, so the right column carries the run-lifetime
     * orb count instead and the highlight stays off -- asserting both pins the substitution
     * down so it cannot quietly start reading as retail behaviour.
     */
    it('prints the Time row from the substitute and leaves it untinted', async () => {
      const calls = await renderRows((hud) => {
        hud.timeOrbs = 208;
        hud.timeOrbTotal = 208;
      });
      expect(rowAt(calls, HUD_ROWS.time).map((c) => c.text)).toEqual(['208', '208']);
      expect(rowAt(calls, HUD_ROWS.time).map((c) => c.tint)).toEqual([undefined, undefined]);
    });
  });
});
