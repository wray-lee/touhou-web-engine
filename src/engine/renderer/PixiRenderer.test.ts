import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// PixiJS 8 needs WebGL/canvas which the node test env lacks — mock the whole module.
vi.mock('pixi.js', () => {
  class Container {
    public children: unknown[] = [];
    public visible = true;
    addChild(child: unknown) {
      this.children.push(child);
      return child;
    }
  }

  class Graphics {
    circle() { return this; }
    ellipse() { return this; }
    rect() { return this; }
    poly() { return this; }
    fill() { return this; }
    stroke() { return this; }
    clear() { return this; }
  }

  class Text {
    public text = '';
    public visible = true;
    public alpha = 1;
    public anchor = { set: () => {} };
    public position = { set: () => {} };
    public scale = { set: () => {} };
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

  class Application {
    public canvas = { width: 640, height: 480 };
    public stage = new Container();
    async init() { /* no-op */ }
    destroy() { /* no-op */ }
  }

  return { Application, Container, Graphics, Text, TextStyle };
});

import { PixiRenderer } from './PixiRenderer';
import { Player } from '../../touhou-common/player/Player';
import { Enemy } from '../../touhou-common/enemy/Enemy';
import { Bullet } from '../core/Bullet';
import { HUD } from '../../touhou-common/ui/HUD';
import { PerformanceMonitor } from '../debug/PerformanceMonitor';
import { InputSystem } from '../core/InputSystem';

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
      new Bullet({ position: { x: 100, y: 200 }, velocity: { x: 0, y: 5 }, radius: 4, color: 0xff3366, sprite: 'bullet_small' }),
      new Bullet({ position: { x: 150, y: 250 }, velocity: { x: 2, y: 3 }, radius: 6, color: 0xffffff, sprite: 'bullet_ring' }),
    ];
    const hud = new HUD();
    const monitor = new PerformanceMonitor();

    expect(() => renderer.render(player, null, enemies, bullets, hud, monitor)).not.toThrow();
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
});
