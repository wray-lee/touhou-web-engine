import { describe, it, expect } from 'vitest';
import { TH08Game } from './TH08Game';

describe('TH08Game', () => {
  it('instantiates game with player, bullet system and collision system', () => {
    const game = new TH08Game({ headless: true });
    expect(game.player).toBeDefined();
    expect(game.bulletSystem).toBeDefined();
    expect(game.collisionSystem).toBeDefined();
    expect(game.stage).toBeDefined();
    expect(game.player.lives).toBe(3);
  });

  it('steps frames correctly in simulation', () => {
    const game = new TH08Game({ headless: true });
    expect(game.stage.currentFrame).toBe(0);

    game.stepFrame(1);
    expect(game.stage.currentFrame).toBe(1);

    // Run 100 frames
    for (let i = 0; i < 99; i++) {
      game.stepFrame(1);
    }
    expect(game.stage.currentFrame).toBe(100);
    expect(game.enemies.length).toBeGreaterThan(0);
  });

  describe('Pause (ESC)', () => {
    it('freezes the game while paused and resumes on toggle', () => {
      const game = new TH08Game({ headless: true });

      for (let i = 0; i < 100; i++) {
        game.stepFrame(1);
      }
      expect(game.stage.currentFrame).toBe(100);
      const playerPosBefore = { ...game.player.position };

      // Pause: ESC pressed
      game.pause();
      expect(game.isPaused).toBe(true);

      const frameFrozen = game.stage.currentFrame;
      game.stepFrame(60); // freeze: nothing advances
      expect(game.stage.currentFrame).toBe(frameFrozen);
      expect(game.player.position).toEqual(playerPosBefore); // player frozen too

      // Resume: ESC pressed again
      game.resume();
      expect(game.isPaused).toBe(false);

      game.stepFrame(1);
      expect(game.stage.currentFrame).toBe(frameFrozen + 1);
    });

    it('toggles pause on ESC edge press through stepFrame', () => {
      const game = new TH08Game({ headless: true });
      game.input.simulateKeyDown('Escape');
      game.stepFrame(1);
      expect(game.isPaused).toBe(true);

      // Release ESC, then press again -> toggles back
      game.input.simulateKeyUp('Escape');
      game.stepFrame(1);
      expect(game.isPaused).toBe(true); // still paused (key released, no edge)

      game.input.simulateKeyDown('Escape');
      game.stepFrame(1);
      expect(game.isPaused).toBe(false);
    });
  });

  describe('Touch drag (mobile, US#9)', () => {
    it('player follows the pointer target and auto-fires while dragging', () => {
      const game = new TH08Game({ headless: true });
      game.stepFrame(1); // baseline input frame

      // Finger down at (300, 200) in game coords (no attach target -> raw coords)
      game.input.pointerDown(300, 200);
      expect(game.input.isDragging).toBe(true);
      expect(game.input.getPointerTarget()).toEqual({ x: 300, y: 200 });

      const before = { ...game.player.position };
      game.stepFrame(1);

      // Moved toward the finger, capped by fast speed (4.5/frame)
      const dx = game.player.position.x - before.x;
      const dy = game.player.position.y - before.y;
      expect(Math.hypot(dx, dy)).toBeGreaterThan(0);
      expect(Math.hypot(dx, dy)).toBeLessThanOrEqual(4.5 + 1e-6);
      expect(game.player.position.x).toBeGreaterThan(before.x); // finger is right of spawn
      expect(game.player.position.y).toBeLessThan(before.y); // finger is above spawn

      // Auto-fire: dragging counts as held shoot
      expect(game.bulletSystem.getBullets().some((b) => b.tag === 'player-bullet')).toBe(true);

      game.input.pointerUp();
      game.stepFrame(1);
      expect(game.input.getPointerTarget()).toBeNull();
    });

    it('respects slow mode speed cap while dragging', () => {
      const game = new TH08Game({ headless: true });
      game.input.simulateKeyDown('ShiftLeft');
      game.input.pointerDown(400, 100);
      game.stepFrame(1); // samples shift-down + drag start
      const before = { ...game.player.position };
      game.stepFrame(1);
      const dist = Math.hypot(game.player.position.x - before.x, game.player.position.y - before.y);
      expect(game.player.isSlowMode).toBe(true);
      expect(dist).toBeLessThanOrEqual(game.player.slowSpeed + 1e-6);
    });
  });

  describe('Lifecycle', () => {
    it('destroy() tears down cleanly (headless)', () => {
      const game = new TH08Game({ headless: true });
      game.stepFrame(10);
      expect(() => game.destroy()).not.toThrow();
      // After destroy, stepping further frames must not crash either
      expect(() => game.stepFrame(1)).not.toThrow();
    });
  });
});
