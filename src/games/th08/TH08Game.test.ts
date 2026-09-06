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
});
