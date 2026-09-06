import { describe, it, expect } from 'vitest';
import { Player } from './Player';
import { InputSystem } from '../../engine/core/InputSystem';

describe('Player Controller', () => {
  it('moves according to speed setting (fast vs slow mode)', () => {
    const input = new InputSystem();
    const player = new Player({ x: 200, y: 300 });

    input.simulateKeyDown('ArrowRight');
    input.update();

    // Fast mode: 4.5 px/frame
    player.handleInput(input);
    player.update(1);
    expect(player.position.x).toBeCloseTo(204.5);

    // Toggle slow mode (Shift)
    input.simulateKeyDown('ShiftLeft');
    input.update();

    // Slow mode: 2.0 px/frame
    player.handleInput(input);
    player.update(1);
    expect(player.position.x).toBeCloseTo(206.5);
    expect(player.isSlowMode).toBe(true);
  });

  it('clamps player position within playfield bounds', () => {
    const input = new InputSystem();
    const player = new Player({ x: 10, y: 300 }, { playfield: { minX: 30, maxX: 400, minY: 30, maxY: 500 } });

    input.simulateKeyDown('ArrowLeft');
    input.update();
    player.handleInput(input);
    player.update(1);

    expect(player.position.x).toBe(30);
  });

  it('spawns bullets when shoot key is held', () => {
    const input = new InputSystem();
    const player = new Player({ x: 200, y: 400 });

    input.simulateKeyDown('KeyZ');
    input.update();
    player.handleInput(input);

    const bullets = player.shoot(0);
    expect(bullets.length).toBeGreaterThan(0);
    expect(bullets[0].velocity.y).toBeLessThan(0); // Upward
  });

  it('handles death and respawn invulnerability', () => {
    const player = new Player({ x: 200, y: 400 });
    expect(player.lives).toBe(3);

    player.hit();
    expect(player.lives).toBe(2);
    expect(player.isInvulnerable).toBe(true);

    // Invulnerability update
    player.update(60);
    expect(player.isInvulnerable).toBe(true);
    player.update(180);
    expect(player.isInvulnerable).toBe(false);
  });

  it('flies toward the finger while touch-dragging (mobile)', () => {
    const input = new InputSystem();
    const player = new Player({ x: 200, y: 300 });

    // Finger starts 80px above the ship
    input.pointerDown(200, 220);

    // Simulate the real per-frame loop
    const frame = () => {
      player.handleInput(input);
      player.update(1);
    };

    frame();
    // Moves toward the finger, never overshooting past it
    expect(player.position.y).toBeGreaterThan(220);
    expect(player.position.y).toBeLessThan(300);

    for (let i = 0; i < 30; i++) frame();
    // Arrives at (and stays at) the finger
    expect(player.position.y).toBeCloseTo(220, 0);

    // Holds still once arrived — does not jitter past the finger
    const before = player.position.y;
    frame();
    expect(player.position.y).toBe(before);
  });
});
