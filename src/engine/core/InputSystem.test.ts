import { describe, it, expect, vi } from 'vitest';
import { InputSystem } from './InputSystem';

/** Fake standard-layout gamepad with the given pressed button indices & axes. */
const pad = (buttons: number[], axes: number[] = [0, 0, 0, 0]) => ({
  buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: buttons.includes(i) })),
  axes,
});

/** Minimal event-capturing element + window pair for pointer wiring tests. */
function makePointerEnv(rect: { left: number; top: number; width: number; height: number }) {
  const elHandlers: Record<string, ((e: unknown) => void)[]> = {};
  const winHandlers: Record<string, ((e: unknown) => void)[]> = {};
  const element = {
    getBoundingClientRect: () => rect,
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      (elHandlers[type] ??= []).push(fn);
    },
    removeEventListener: () => undefined,
  } as unknown as HTMLElement;
  const fakeWindow = {
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      (winHandlers[type] ??= []).push(fn);
    },
    removeEventListener: () => undefined,
  } as unknown as Window & typeof globalThis;
  const emit = (handlers: Record<string, ((e: unknown) => void)[]>, type: string, e: unknown) => {
    for (const fn of handlers[type] ?? []) fn(e);
  };
  return {
    element,
    fakeWindow,
    emitOnElement: (type: string, e: unknown) => emit(elHandlers, type, e),
    emitOnWindow: (type: string, e: unknown) => emit(winHandlers, type, e),
  };
}

describe('InputSystem', () => {
  it('tracks key states properly', () => {
    const input = new InputSystem();

    input.update(); // baseline frame: nothing down
    expect(input.isKeyDown('shoot')).toBe(false);

    input.simulateKeyDown('KeyZ');
    input.update(); // next frame samples the key down
    expect(input.isKeyDown('shoot')).toBe(true);

    input.simulateKeyUp('KeyZ');
    input.update();
    expect(input.isKeyDown('shoot')).toBe(false);
  });

  it('detects edge key presses (wasKeyPressed)', () => {
    const input = new InputSystem();
    input.update(); // establish baseline frame

    input.simulateKeyDown('KeyX');
    input.update();
    expect(input.wasKeyPressed('bomb')).toBe(true);

    input.update();
    expect(input.wasKeyPressed('bomb')).toBe(false);
  });

  describe('Touch / Pointer drag', () => {
    it('tracks dragging pointer position', () => {
      const input = new InputSystem();

      expect(input.isDragging).toBe(false);

      input.pointerDown(100, 200);
      expect(input.isDragging).toBe(true);
      expect(input.pointerPos).toEqual({ x: 100, y: 200 });

      input.pointerMove(150, 250);
      expect(input.pointerPos).toEqual({ x: 150, y: 250 });

      input.pointerUp();
      expect(input.isDragging).toBe(false);
    });

    it('maps pointer coords to the attached element (canvas-local)', () => {
      const input = new InputSystem();
      const fakeCanvas = {
        getBoundingClientRect: () => ({ left: 40, top: 30, width: 400, height: 480 }),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      } as unknown as HTMLElement;
      input.attach(fakeCanvas);

      input.pointerDown(140, 130); // viewport coords
      expect(input.pointerPos).toEqual({ x: 100, y: 100 });

      input.pointerMove(290, 130);
      expect(input.pointerPos).toEqual({ x: 250, y: 100 });

      input.pointerUp();
      expect(input.isDragging).toBe(false);
    });

    it('undoes CSS scaling when a game resolution is provided (mobile, US#9)', () => {
      const input = new InputSystem();
      const fakeCanvas = {
        // CSS box is 320x240 but the game renders at 640x480 -> 2x scale
        getBoundingClientRect: () => ({ left: 10, top: 5, width: 320, height: 240 }),
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      } as unknown as HTMLElement;
      input.attach(fakeCanvas, { width: 640, height: 480 });

      input.pointerDown(170, 125); // viewport coords
      // local (160, 120) * (640/320, 480/240) = (320, 240)
      expect(input.pointerPos).toEqual({ x: 320, y: 240 });
      expect(input.getPointerTarget()).toEqual({ x: 320, y: 240 });
      input.pointerUp();
      expect(input.getPointerTarget()).toBeNull();
    });

    it('getPointerTarget returns a copy, not the live position', () => {
      const input = new InputSystem();
      input.pointerDown(100, 200);
      const target = input.getPointerTarget()!;
      target.x = 999;
      expect(input.pointerPos.x).toBe(100);
    });

    it('wires pointerdown/move/up events on attach (simulated pointer events)', () => {
      const env = makePointerEnv({ left: 0, top: 0, width: 640, height: 480 });
      const g = globalThis as { window?: unknown };
      const hadWindow = 'window' in g;
      const originalWindow = g.window;
      g.window = env.fakeWindow;
      try {
        const input = new InputSystem();
        input.attach(env.element, { width: 640, height: 480 });

        // Touch pointerdown on the game element starts a drag
        env.emitOnElement('pointerdown', { pointerType: 'touch', button: 0, clientX: 120, clientY: 300 });
        expect(input.isDragging).toBe(true);
        expect(input.getPointerTarget()).toEqual({ x: 120, y: 300 });

        // pointermove on the window keeps tracking (finger leaves the canvas)
        env.emitOnWindow('pointermove', { pointerType: 'touch', clientX: 200, clientY: 150 });
        expect(input.getPointerTarget()).toEqual({ x: 200, y: 150 });

        env.emitOnWindow('pointerup', { pointerType: 'touch' });
        expect(input.isDragging).toBe(false);
        expect(input.getPointerTarget()).toBeNull();
      } finally {
        if (hadWindow) g.window = originalWindow;
        else delete g.window;
      }
    });
  });

  describe('Input buffering', () => {
    it('catches a quick press released between two samples', () => {
      const input = new InputSystem();
      input.update(); // baseline

      // Tap entirely between frames: down+up before the next sample.
      input.simulateKeyDown('KeyX');
      input.simulateKeyUp('KeyX');
      input.update();

      expect(input.isKeyDown('bomb')).toBe(false); // not held
      expect(input.wasKeyPressed('bomb')).toBe(true); // but the tap is caught
      input.update();
      expect(input.wasKeyPressed('bomb')).toBe(false); // consumed once
    });

    it('does not re-report a held key via the buffer', () => {
      const input = new InputSystem();
      input.update();

      input.simulateKeyDown('KeyX');
      input.update();
      expect(input.wasKeyPressed('bomb')).toBe(true);

      input.update(); // still held — edge only, no buffered duplicate
      expect(input.wasKeyPressed('bomb')).toBe(false);
    });

    it('ignores unmapped keys in the buffer', () => {
      const input = new InputSystem();
      input.update();

      input.simulateKeyDown('KeyQ'); // bound to no action
      input.simulateKeyUp('KeyQ');
      input.update();
      expect(input.wasKeyPressed('bomb')).toBe(false);
      expect(input.isKeyDown('shoot')).toBe(false);
    });
  });

  describe('Gamepad', () => {
    it('maps standard buttons to actions', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [pad([0])]); // A = shoot

      input.update();
      expect(input.isKeyDown('shoot')).toBe(true);
      expect(input.wasKeyPressed('shoot')).toBe(true);

      input.update();
      expect(input.wasKeyPressed('shoot')).toBe(false); // edge, not held
    });

    it('maps left stick axes to movement', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [pad([], [1, -1, 0, 0])]); // stick right + up

      input.update();
      expect(input.isKeyDown('right')).toBe(true);
      expect(input.isKeyDown('up')).toBe(true);
      expect(input.isKeyDown('left')).toBe(false);

      const v = input.getMovementVector();
      expect(v.x).toBeGreaterThan(0);
      expect(v.y).toBeLessThan(0);
    });

    it('ignores disconnected pads and deadzones', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [null, pad([1], [0.2, 0, 0, 0])]); // B = bomb; stick below threshold

      input.update();
      expect(input.isKeyDown('bomb')).toBe(true);
      expect(input.isKeyDown('right')).toBe(false); // 0.2 < 0.5 threshold
    });

    it('exposes held actions for real-time input display', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [pad([0])]); // A = shoot held via gamepad
      input.simulateKeyDown('ArrowLeft');
      input.update();
      expect(input.getActiveActions().sort()).toEqual(['left', 'shoot']);

      input.simulateKeyUp('ArrowLeft');
      input.enableGamepad(() => []);
      input.update();
      expect(input.getActiveActions()).toEqual([]);
    });

    it('merges gamepad with keyboard state', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [pad([9])]); // Start = pause

      input.simulateKeyDown('KeyZ'); // keyboard shoot
      input.update();
      expect(input.isKeyDown('shoot')).toBe(true);
      expect(input.wasKeyPressed('pause')).toBe(true);
    });

    it('pollGamepad() samples pads without a full update() and is safe without a provider', () => {
      const input = new InputSystem();
      // No provider: must not throw
      expect(() => input.pollGamepad()).not.toThrow();

      input.enableGamepad(() => [pad([4])]); // LB = focus/slow
      input.pollGamepad();
      expect(input.isKeyDown('slow')).toBe(true);
    });

    it('reads navigator.getGamepads() by default when available', () => {
      // Node >= 21 exposes a getter-only `navigator` — stub it via vi.
      vi.stubGlobal('navigator', { getGamepads: () => [pad([2])] }); // X = bomb
      try {
        const input = new InputSystem();
        input.enableGamepad();
        input.update();
        expect(input.isKeyDown('bomb')).toBe(true);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe('Key rebinding', () => {
    it('rebinds a keyboard action at runtime', () => {
      const input = new InputSystem();
      input.setKeyBinding('shoot', ['KeyJ']);

      input.simulateKeyDown('KeyZ'); // old binding no longer active
      input.update();
      expect(input.isKeyDown('shoot')).toBe(false);

      input.simulateKeyUp('KeyZ');
      input.simulateKeyDown('KeyJ');
      input.update();
      expect(input.isKeyDown('shoot')).toBe(true);
    });

    it('rebinds a gamepad action at runtime', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [pad([3])]); // Y button
      input.setGamepadBinding('shoot', { buttons: [3] });

      input.update();
      expect(input.isKeyDown('shoot')).toBe(true);
    });

    it('exposes current bindings for a settings screen', () => {
      const input = new InputSystem();
      input.setKeyBinding('bomb', ['KeyC']);
      expect(input.getBindings().bomb).toEqual(['KeyC']);
      // mutating the returned copy must not affect live bindings
      input.getBindings().bomb.push('Nope');
      expect(input.getBindings().bomb).toEqual(['KeyC']);
    });
  });
  describe('Mouse steering (opt-in)', () => {
    /** Attach to a fake canvas at the unscaled 640x480 size the port renders at. */
    function steerEnv(): {
      env: ReturnType<typeof makePointerEnv>;
      input: InputSystem;
      restore: () => void;
    } {
      const env = makePointerEnv({ left: 0, top: 0, width: 640, height: 480 });
      const g = globalThis as { window?: unknown };
      const had = 'window' in g;
      const previous = g.window;
      g.window = env.fakeWindow;
      const input = new InputSystem();
      input.attach(env.element, { width: 640, height: 480 });
      return {
        env,
        input,
        restore: () => {
          if (had) g.window = previous;
          else delete g.window;
        },
      };
    }

    it('leaves desktop keyboard play alone while the option is off', () => {
      const { env, input, restore } = steerEnv();
      try {
        expect(input.mouseControl).toBe(false);
        env.emitOnElement('pointerenter', { clientX: 200, clientY: 300 });
        env.emitOnWindow('pointermove', { clientX: 220, clientY: 320 });
        expect(input.isSteering).toBe(false);
        expect(input.getPointerTarget()).toBeNull();
        expect(input.pointerPos).toEqual({ x: 0, y: 0 });
      } finally {
        restore();
      }
    });

    it('tracks the cursor without holding a button once the option is on', () => {
      const { env, input, restore } = steerEnv();
      try {
        input.setMouseControl(true);
        env.emitOnElement('pointerenter', { clientX: 200, clientY: 300 });
        expect(input.isSteering).toBe(true);
        expect(input.getPointerTarget()).toEqual({ x: 200, y: 300 });

        // A plain move — no button anywhere in the sequence — keeps steering.
        env.emitOnWindow('pointermove', { clientX: 140, clientY: 300 });
        expect(input.getPointerTarget()).toEqual({ x: 140, y: 300 });

        // Walking off the canvas hands control back, mid-option, no toggle needed.
        env.emitOnElement('pointerleave', {});
        expect(input.isSteering).toBe(false);
        expect(input.getPointerTarget()).toBeNull();
      } finally {
        restore();
      }
    });

    it('drops a hovering cursor the moment the option is turned back off', () => {
      const { env, input, restore } = steerEnv();
      try {
        input.setMouseControl(true);
        env.emitOnElement('pointerenter', { clientX: 200, clientY: 300 });
        expect(input.isSteering).toBe(true);
        input.setMouseControl(false);
        expect(input.isSteering).toBe(false);
        expect(input.getPointerTarget()).toBeNull();
      } finally {
        restore();
      }
    });

    it('undoes the CSS scale so a letterboxed canvas still aims at the ship', () => {
      const env = makePointerEnv({ left: 100, top: 20, width: 320, height: 240 });
      const g = globalThis as { window?: unknown };
      const previous = g.window;
      g.window = env.fakeWindow;
      try {
        const input = new InputSystem();
        input.attach(env.element, { width: 640, height: 480 });
        input.setMouseControl(true);
        // Halfway across a 320px-wide box for a 640px game = game x 320.
        env.emitOnElement('pointerenter', { clientX: 260, clientY: 140 });
        expect(input.getPointerTarget()).toEqual({ x: 320, y: 240 });
      } finally {
        g.window = previous;
      }
    });
  });
});
