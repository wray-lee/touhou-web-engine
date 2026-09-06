import { describe, it, expect } from 'vitest';
import { InputSystem } from './InputSystem';

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
});
