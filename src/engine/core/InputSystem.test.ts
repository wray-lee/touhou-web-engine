import { describe, it, expect } from 'vitest';
import { InputSystem } from './InputSystem';

/** Fake standard-layout gamepad with the given pressed button indices & axes. */
const pad = (buttons: number[], axes: number[] = [0, 0, 0, 0]) => ({
  buttons: Array.from({ length: 16 }, (_, i) => ({ pressed: buttons.includes(i) })),
  axes,
});

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

    it('merges gamepad with keyboard state', () => {
      const input = new InputSystem();
      input.enableGamepad(() => [pad([9])]); // Start = pause

      input.simulateKeyDown('KeyZ'); // keyboard shoot
      input.update();
      expect(input.isKeyDown('shoot')).toBe(true);
      expect(input.wasKeyPressed('pause')).toBe(true);
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
});
