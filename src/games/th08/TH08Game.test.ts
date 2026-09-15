import { describe, it, expect } from 'vitest';
import { TH08Game } from './TH08Game';
import { ITEM_SPECS } from '../../touhou-common/item/Item';
import { DEATH_POWER_COST, MAX_POWER } from '../../touhou-common/player/CharacterProfile';

describe('TH08Game', () => {
  it('keeps the performance monitor opt-in for library consumers', () => {
    expect(new TH08Game({ headless: true }).monitor.isVisible).toBe(false);
    expect(new TH08Game({ headless: true, showPerformanceMonitor: true }).monitor.isVisible).toBe(true);
  });

  it('instantiates game with player, bullet system and collision system', () => {
    const game = new TH08Game({ headless: true });
    expect(game.player).toBeDefined();
    expect(game.bulletSystem).toBeDefined();
    expect(game.collisionSystem).toBeDefined();
    expect(game.stage).toBeDefined();
    expect(game.player.lives).toBe(3);
  });

  it('steps frames correctly in simulation', async () => {
    const game = new TH08Game({ headless: true });
    expect(game.stage.currentFrame).toBe(0);

    game.stepFrame(1);
    expect(game.stage.currentFrame).toBe(1);

    // Run 100 frames
    for (let i = 0; i < 99; i++) {
      game.stepFrame(1);
    }
    expect(game.stage.currentFrame).toBe(100);

    // The field belongs to the translated script, which arrives a few event-loop
    // turns after the constructor. Once it is in, the stage clock keeps counting
    // and the real waves start arriving.
    expect(await game.waitForScript()).toBe(true);
    let sawEnemy = false;
    for (let i = 0; i < 900; i++) {
      game.stepFrame(1);
      if (game.enemies.length > 0) sawEnemy = true;
    }
    expect(sawEnemy).toBe(true);
    expect(game.stage.currentFrame).toBeGreaterThan(100);
    game.destroy();
  });

  it('binds a later campaign stage to its own translated script', async () => {
    const game = new TH08Game({ headless: true, campaign: true, stage: 2 });
    expect(await game.waitForScript()).toBe(true);
    expect(game.stageNumber).toBe(2);
    expect(game.stage.name).toBe('蠢々秋月');

    const runner = game.eclRunner!;
    let sawEnemy = false;
    for (let i = 0; i < 900; i++) {
      game.stepFrame(1);
      if (runner.enemies.activeCount > 0) sawEnemy = true;
    }
    expect(sawEnemy).toBe(true);
    game.destroy();
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

  describe('Drop items', () => {
    it('shares the Touhou 8 power ceiling and splits the item line by team', () => {
      const games = (['reimu-yukari', 'marisa-alice', 'sakuya-remilia', 'youmu-yuyuko'] as const).map(
        (character) => new TH08Game({ headless: true, character }),
      );
      // Touhou 8 caps power at 128 (drawn as 2.00) for every team.
      for (const game of games) expect(game.player.maxPower).toBe(MAX_POWER);
      // Marisa's team owns the lower point-of-collection line (sht 160 vs 128).
      const lines = games.map((g) => g.player.team.pointItemValueLine);
      expect(lines).toEqual([128, 160, 128, 128]);
      // The three boxes, as `Player::AddedCallback` halves them out of `plyNNa.sht`
      // (`Player.cpp:1619-1633`): hit = +0x0C/2, graze = +0x10/2, item = +0x18/2.
      expect(games.map((g) => g.player.itemPickupHalfExtent)).toEqual([12, 16, 12, 12]);
      expect(games.map((g) => g.player.hitboxHalfExtent)).toEqual([0.825, 1, 1, 1]);
      expect(games.map((g) => g.player.grazeHalfExtent)).toEqual([1.4, 1.4, 3, 1.5]);
      // The entity box follows the team, so the point on screen is the real box.
      expect(games.map((g) => g.player.hitbox.radius)).toEqual([0.825, 1, 1, 1]);
    });

    it('raises power when the player grabs a drop', () => {
      const game = new TH08Game({ headless: true });
      game.player.power = 100;
      game.itemSystem.spawn('power', game.player.position.x, game.player.position.y);
      game.stepFrame(1);
      expect(game.player.power).toBe(100 + ITEM_SPECS.power.power);
      expect(game.itemSystem.count).toBe(0);
    });

    it('fills power to the team cap on a full-power item', () => {
      const game = new TH08Game({ headless: true, character: 'sakuya-remilia' });
      game.player.power = 100;
      game.itemSystem.spawn('fullpower', game.player.position.x, game.player.position.y);
      game.stepFrame(1);
      expect(game.player.power).toBe(game.player.maxPower);
      expect(game.hud.maxPower).toBe(game.player.maxPower);
    });

    it('credits point, life and bomb pickups', () => {
      const game = new TH08Game({ headless: true });
      const { x, y } = game.player.position;
      const lives = game.player.lives;
      const bombs = game.player.bombs;
      const score = game.player.score;
      game.itemSystem.spawn('point', x, y);
      game.itemSystem.spawn('life', x, y);
      game.itemSystem.spawn('bomb', x, y);
      game.stepFrame(1);
      expect(game.player.score).toBe(score + ITEM_SPECS.point.score);
      expect(game.player.lives).toBe(lives + 1);
      expect(game.player.bombs).toBe(bombs + 1);
    });

    it('scatters the shed power once the grace window has closed', () => {
      const game = new TH08Game({ headless: true });
      game.player.power = game.player.maxPower;
      game.player.hit();
      // Dying pays nothing yet: the window has to run out first, which is the whole
      // reason a deathbomb is worth two bombs.
      expect(game.itemSystem.count).toBe(0);
      expect(game.player.power).toBe(game.player.maxPower);
      // Drive the ship clock directly: a bare game is still on the title state, and
      // stepFrame only advances the player while a stage is running.
      while (game.player.graceTimer > 0) game.player.update(1);
      expect(game.itemSystem.count).toBeGreaterThan(0);
      // The shed amount is handed to the drop spawner, which clears it.
      expect(game.player.powerLost).toBe(0);
      expect(game.player.power).toBe(game.player.maxPower - DEATH_POWER_COST);
    });

    it('sweeps every remaining drop into the player when the stage ends', async () => {
      const game = new TH08Game({ headless: true, campaign: true });
      expect(await game.waitForScript()).toBe(true);
      const runner = game.eclRunner!;
      runner.player.power = 0;

      // Drops on opposite corners: neither is inside the grab box, so only the
      // end-of-stage sweep (`ItemManager::collectAll(-1)`) can reach them.
      runner.items.spawn('powerBig', 60, 300);
      runner.items.spawn('point', 380, 320);
      expect(runner.items.activeCount).toBe(2);

      runner.timeline.finished = true;
      for (const slot of runner.enemies.slots) slot.active = false;
      game.stepFrame(1);

      expect(runner.items.activeCount).toBe(0);
      expect(runner.player.power).toBeGreaterThan(0);
      game.destroy();
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
