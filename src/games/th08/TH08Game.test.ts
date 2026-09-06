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
