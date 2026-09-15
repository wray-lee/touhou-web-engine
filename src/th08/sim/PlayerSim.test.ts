import { describe, expect, it } from 'vitest';
import {
  PlayerSim,
  DEATH_FRAMES,
  SPAWN_FRAMES,
  CANCEL_FRAMES,
  INITIAL_BOMBS,
  HITBOX_DELAY_FRAMES,
} from './PlayerSim';
import { createGameState } from './GameState';
import { PLAYFIELD_W, RESPAWN_X, RESPAWN_Y } from './Playfield';

const noInput = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false };

/**
 * Tick a dying ship out and report the frames it took. The window and the dissolve
 * are both driven off the sim's own counters, so the caller reads them instead of
 * recomputing the retail formula a third time.
 */
function runOutDeath(p: PlayerSim): number {
  const window = p.graceTimer;
  let frames = 0;
  while (p.state === 'dying' && frames < window + DEATH_FRAMES + 4) {
    p.tick(noInput);
    frames++;
  }
  return frames;
}

describe('PlayerSim', () => {
  it('starts alive at the respawn point', () => {
    const p = new PlayerSim(createGameState());
    expect(p.state).toBe('alive');
    expect(p.x).toBe(RESPAWN_X);
    expect(p.y).toBe(RESPAWN_Y);
  });

  it('moves at fast speed unfocused and slow speed focused', () => {
    const p = new PlayerSim(createGameState());
    const x0 = p.x;
    p.tick({ ...noInput, dx: 1 });
    expect(p.x).toBeCloseTo(x0 + p.fastSpeed, 4);

    const p2 = new PlayerSim(createGameState());
    const x1 = p2.x;
    p2.tick({ ...noInput, dx: 1, slow: true });
    expect(p2.x).toBeCloseTo(x1 + p2.slowSpeed, 4);
  });

  it('runs the grace window, the dissolve and the spawn-in in retail order', () => {
    const gs = createGameState();
    gs.lives = 3;
    gs.bombs = 2;
    gs.power = 50;
    const p = new PlayerSim(gs);
    p.lives = 3;
    p.bombs = 2;
    p.power = 50;

    // Player.cpp:550 — dying resets the human/youkai meter along with the ship.
    p.gauge.set(6000);
    expect(p.hit()).toBe(true);
    expect(p.state).toBe('dying');
    expect(p.gauge.value).toBe(0);
    expect(p.lives).toBe(3); // the life is not spent until the ship flies back in
    // The power bill waits for the window to close (`Player.cpp:1343-1346`), which is
    // exactly what a deathbomb buys back.
    expect(p.power).toBe(50);
    expect(p.powerLost).toBe(0);

    // Player.cpp:551-573 — two bombs is twelve frames of window, and 霊夢's rows
    // buy grace 9/5 as fast, which is where the extra length comes from.
    expect(p.graceTimer).toBe(Math.floor((12 * 9) / 5));

    // The window runs before the animation: one 时符 a frame, deathbomb armed.
    const orbs = gs.timeOrbs;
    p.tick(noInput);
    expect(gs.timeOrbs).toBe(Math.max(0, orbs - 15));
    expect(p.deathbombArmed).toBe(true);
    expect(p.state).toBe('dying');

    // A press inside the window is a deathbomb, and it costs both bombs.
    expect(p.useBomb()).toBe(true);
    expect(p.deathbomb).toBe(true);
    expect(p.bombs).toBe(0);

    // Run what is left of the window, then the 30-frame dissolve.
    const left = p.graceTimer;
    expect(runOutDeath(p)).toBe(left + DEATH_FRAMES);
    expect(p.state).toBe('respawning');
    // The bill landed on the frame the window closed.
    expect(p.power).toBe(34);
    expect(p.powerLost).toBe(16);
    expect(p.lives).toBe(2);
    // Player.cpp:1408 — flying back in refills the bomb count from plyNNa.sht + 4.
    expect(p.bombs).toBe(INITIAL_BOMBS);
    expect(p.x).toBe(RESPAWN_X);
    expect(p.y).toBe(RESPAWN_Y);
    // respawn() opens the 60-frame cancel volume, and a dying frame never reaches
    // the decrement, so the first frame of the spawn-in still has all of it.
    expect(p.cancelTimer).toBe(CANCEL_FRAMES);

    for (let i = 0; i < SPAWN_FRAMES; i++) p.tick(noInput);
    expect(p.state).toBe('alive');
    // Retail grants no invulnerability after a respawn. The 60-frame bullet cancel
    // is the entire mercy period, which is why a careless ship dies twice.
    expect(p.isInvulnerable).toBe(false);
    expect(p.graceTimer).toBeGreaterThan(0);
  });

  it('dies at power <= 16: the whole bar is paid, not a 16-point slice', () => {
    const p = new PlayerSim(createGameState());
    p.power = 10;
    p.hit();
    expect(p.power).toBe(10);
    runOutDeath(p);
    expect(p.power).toBe(0);
    expect(p.powerLost).toBe(10);
  });

  it('game over when lives reach 0', () => {
    const gs = createGameState();
    gs.lives = 1;
    gs.bombs = 0;
    const p = new PlayerSim(gs);
    p.lives = 1;
    p.bombs = 0;
    p.hit();
    // No bombs left, so the window collapses to the two frames of `Die:610`.
    expect(p.graceTimer).toBe(2);
    expect(runOutDeath(p)).toBe(32);
    expect(p.state).toBe('respawning');
    expect(p.lives).toBe(0);

    for (let i = 0; i < SPAWN_FRAMES; i++) p.tick(noInput);
    expect(p.state).toBe('alive');
    p.hit();
    runOutDeath(p);
    // Out of lives, `:1361-1362` takes the whole bar instead of a slice.
    expect(p.power).toBe(0);
    expect(p.state).toBe('dead');
    expect(gs.showRetryMenu).toBe(true);
  });

  it('a normal card costs one bomb and buys no invulnerability', () => {
    const p = new PlayerSim(createGameState());
    p.bombs = 3;
    expect(p.useBomb()).toBe(true);
    expect(p.bombs).toBe(2);
    // `acceptBomb` never touches an invulnerability counter. A card is protection
    // only for as long as its own cancel sweep is eating shots, which is why a
    // bomb spent early still ends in a death.
    expect(p.isInvulnerable).toBe(false);
  });

  it('bombing inside the grace window is a deathbomb, and outside it is refused', () => {
    const gs = createGameState();
    gs.bombs = 3;
    const p = new PlayerSim(gs);
    p.bombs = 3;
    p.hit();
    expect(p.deathbombArmed).toBe(true);
    expect(p.useBomb()).toBe(true);
    expect(p.deathbomb).toBe(true);
    // `:1261-1262` charges two bombs for a deathbomb.
    expect(p.bombs).toBe(1);

    // Let the window run out, then the press is refused until the ship is back.
    const frames = p.graceTimer;
    for (let i = 0; i < frames; i++) p.tick(noInput);
    expect(p.deathbombArmed).toBe(false);
    expect(p.useBomb()).toBe(false);
  });

  it('addPower clamps to maxPower', () => {
    const p = new PlayerSim(createGameState());
    p.addPower(200);
    expect(p.power).toBe(128);
  });

  it('continue resets resources', () => {
    const p = new PlayerSim(createGameState());
    p.lives = 0;
    p.bombs = 0;
    p.power = 100;
    p.score = 50000;
    p.continue_();
    expect(p.lives).toBe(3);
    expect(p.bombs).toBe(INITIAL_BOMBS);
    expect(p.power).toBe(0);
    expect(p.state).toBe('alive');
  });

  it('resetForStage keeps resources but repositions', () => {
    const p = new PlayerSim(createGameState());
    p.lives = 2;
    p.bombs = 1;
    p.power = 80;
    p.score = 10000;
    p.x = 100;
    p.y = 100;
    p.resetForStage();
    expect(p.x).toBe(RESPAWN_X);
    expect(p.y).toBe(RESPAWN_Y);
    expect(p.lives).toBe(2);
    expect(p.bombs).toBe(1);
    expect(p.power).toBe(80);
    expect(p.score).toBe(10000);
  });

  /*
   * `RandomizeAntiTamper` sits one line above every `Player::Die` in the retail
   * binary, so the death is also a random draw: eight `GetRandomU32`, sixteen
   * `GetRandomU16`. The stage scripts read angles out of the same generator, so
   * a death has to shift the stream or every later bullet goes somewhere else.
   */
  it('burns sixteen RNG steps on death, the way the anti-tamper refresh does', () => {
    const gs = createGameState();
    const p = new PlayerSim(gs);
    const before = gs.rng.getGenerationCount();
    expect(p.hit()).toBe(true);
    expect(gs.rng.getGenerationCount() - before).toBe(16);

    // The scratch values are the retail shape: five u32s and three f32s, each
    // offset by ANTITAMPER_RNG_ADD, so none of them can be zero.
    expect(gs.antiTamperRng1).toHaveLength(5);
    expect(gs.antiTamperRng4).toHaveLength(3);
    for (const v of gs.antiTamperRng1) expect(v).toBeGreaterThanOrEqual(6543);
    for (const v of gs.antiTamperRng4) expect(v).toBeGreaterThanOrEqual(6543);
  });

  it('does not burn the anti-tamper draw on a hit that cannot connect', () => {
    const gs = createGameState();
    const p = new PlayerSim(gs);
    p.hit();
    const before = gs.rng.getGenerationCount();
    // Still inside the dying state, so the retail `playerState != ALIVE` gate holds.
    expect(p.hit()).toBe(false);
    expect(gs.rng.getGenerationCount()).toBe(before);
  });
  describe('pointer steering (moveTarget)', () => {
    it('flies to the cursor and parks there without buzzing', () => {
      const p = new PlayerSim(createGameState());
      const target = { x: 100, y: 200 };
      const start = { x: p.x, y: p.y };
      for (let i = 0; i < 240; i++) p.tick({ ...noInput, moveTarget: target });
      expect(Math.abs(p.x - target.x)).toBeLessThan(1);
      expect(Math.abs(p.y - target.y)).toBeLessThan(1);
      expect({ x: p.x, y: p.y }).not.toEqual(start);

      // Arrived: a further frame at the same point is stillness, not a jitter.
      const settled = { x: p.x, y: p.y };
      p.tick({ ...noInput, moveTarget: target });
      expect({ x: p.x, y: p.y }).toEqual(settled);
      expect(p.leanX).toBe(0);
    });

    it('travel per frame is capped at the focus speed, so the cursor never teleports the ship', () => {
      const p = new PlayerSim(createGameState());
      const far = { x: 380, y: 20 };
      p.tick({ ...noInput, moveTarget: far });
      expect(Math.hypot(p.x - RESPAWN_X, p.y - RESPAWN_Y)).toBeLessThanOrEqual(p.fastSpeed + 1e-9);
      const q = new PlayerSim(createGameState());
      q.tick({ ...noInput, slow: true, moveTarget: far });
      expect(Math.hypot(q.x - RESPAWN_X, q.y - RESPAWN_Y)).toBeLessThanOrEqual(q.slowSpeed + 1e-9);
      expect(q.slowSpeed).toBeLessThan(p.fastSpeed);
    });

    it('the cursor owns the ship: held direction keys do nothing while it is set', () => {
      const p = new PlayerSim(createGameState());
      const under = { x: p.x, y: p.y };
      p.tick({ ...noInput, dx: 1, dy: -1, moveTarget: under });
      expect(p.x).toBe(under.x);
      expect(p.y).toBe(under.y);
      // Take the cursor out of the picture and the very same keys move it again.
      p.tick({ ...noInput, dx: 1, dy: -1, moveTarget: null });
      expect(p.x).toBeGreaterThan(under.x);
      expect(p.y).toBeLessThan(under.y);
    });

    it('keeps steering inside the field when the cursor is held past the edge', () => {
      const p = new PlayerSim(createGameState());
      for (let i = 0; i < 600; i++) p.tick({ ...noInput, moveTarget: { x: 4000, y: -4000 } });
      expect(p.x).toBeLessThanOrEqual(PLAYFIELD_W);
      expect(p.y).toBeGreaterThanOrEqual(0);
    });
  });

  /**
   * The byte at `Player+5` is one field with two consumers, and reading it as two
   * fields cost us a mechanic: the hitbox dot was driven off the seven-frame
   * settle, while `Player::IsYoukai()` -- what ECL operand 0x2771, the enemy-side
   * interrupt (`EnemyManager.cpp:939-973`) and the graze push (`Player.cpp:507-508`)
   * all read -- was pointed at a 妖化 window that nothing in the build ever opened.
   * So every 阴阳 branch in the translated scripts was dead. These put the byte back
   * on the single rule retail has for it (`Player.cpp:716-717, 778-779, 783-789`).
   */
  describe('the settled side (Player+5)', () => {
    const settle = (p: PlayerSim, slow: boolean, frames: number): void => {
      for (let i = 0; i < frames; i++) p.tick({ ...noInput, slow });
    };

    it('opens on the seventh settled frame of low-speed, with the dot', () => {
      const p = new PlayerSim(createGameState());
      // The first frame is the edge and zeroes the counter, so seven *settled*
      // frames means eight ticks of held Shift before anything moves.
      settle(p, true, HITBOX_DELAY_FRAMES);
      expect(p.hitboxVisible).toBe(false);
      expect(p.isYoukai).toBe(false);
      p.tick({ ...noInput, slow: true });
      expect(p.hitboxVisible).toBe(true);
      expect(p.isYoukai).toBe(true);

      settle(p, false, HITBOX_DELAY_FRAMES);
      expect(p.isYoukai).toBe(true);
      p.tick(noInput);
      expect(p.isYoukai).toBe(false);
    });

    it('pins a solo to its half of the pair, stance aside', () => {
      const yukari = createGameState();
      yukari.shotType = 5;
      expect(new PlayerSim(yukari).isYoukai).toBe(true);

      const reimu = createGameState();
      reimu.shotType = 4;
      const p = new PlayerSim(reimu);
      settle(p, true, HITBOX_DELAY_FRAMES + 3);
      expect(p.hitboxVisible).toBe(true); // the dot still follows the stance
      expect(p.isYoukai).toBe(false); // ... and a solo 霊夢 is never the 妖 side
    });

    it('feeds the meter on a graze only from the settled side', () => {
      const idle = new PlayerSim(createGameState());
      const atRest = idle.gauge.value;
      idle.grazeReward();
      expect(idle.gauge.value).toBe(atRest);

      const flying = new PlayerSim(createGameState());
      settle(flying, true, HITBOX_DELAY_FRAMES + 1);
      expect(flying.isYoukai).toBe(true);
      const at = flying.gauge.value;
      flying.grazeReward();
      expect(flying.gauge.value - at).toBe(100);
    });

    it('pushes the meter for a 时符 off the raw focus flag, seven frames early', () => {
      const p = new PlayerSim(createGameState());
      p.tick({ ...noInput, slow: true });
      expect(p.isYoukai).toBe(false);
      const at = p.gauge.value;
      p.onTimeOrbCollected();
      // `ItemManager.cpp:642` tests `Player+3`, so the push lands on the press.
      expect(p.gauge.value - at).toBe(111);

      const upright = new PlayerSim(createGameState());
      const from = upright.gauge.value;
      upright.onTimeOrbCollected();
      expect(upright.gauge.value - from).toBe(-111);
    });
  });
});
