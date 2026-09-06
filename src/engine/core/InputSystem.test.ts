import { describe, it, expect } from 'vitest';
import { InputSystem } from './InputSystem';

describe('InputSystem', () => {
  it('tracks key states properly', () => {
    const input = new InputSystem();

    expect(input.isKeyDown('shoot')).toBe(false);

    input.simulateKeyDown('KeyZ');
    expect(input.isKeyDown('shoot')).toBe(true);
    expect(input.wasKeyPressed('shoot')).toBe(true);

    input.update(); // next frame
    expect(input.isKeyDown('shoot')).toBe(true);
    expect(input.wasKeyPressed('shoot')).toBe(false); // only first frame

    input.simulateKeyUp('KeyZ');
    expect(input.isKeyDown('shoot')).toBe(false);
    expect(input.wasKeyReleased('shoot')).toBe(true);
  });

  it('calculates direction vector for movement', () => {
    const input = new InputSystem();
    input.simulateKeyDown('ArrowRight');
    input.simulateKeyDown('ArrowDown');

    const dir = input.getMovementVector();
    expect(dir.x).toBeCloseTo(Math.SQRT1_2);
    expect(dir.y).toBeCloseTo(Math.SQRT1_2);
  });
});
