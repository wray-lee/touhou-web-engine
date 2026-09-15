import { describe, it, expect, beforeEach } from 'vitest';
import { Player } from './Player';
import { InputSystem } from '../../engine/core/InputSystem';
import { BulletSystem } from '../../engine/core/BulletSystem';
import { releaseBullet, drainBulletPool } from '../../engine/core/Bullet';
import { CHARACTER_PROFILES, HITBOX_RADIUS, MEMBERS, MEMBER_IDS, type CharacterId } from './CharacterProfile';

const TEAMS = Object.keys(CHARACTER_PROFILES) as CharacterId[];

describe('Player Controller', () => {
  beforeEach(() => {
    drainBulletPool(); // shared module pool — start each test empty
  });

  it('moves at the measured Reimu speed: 4.0 px/frame, 2.0 px/frame focused', () => {
    const input = new InputSystem();
    const player = new Player({ x: 200, y: 300 });

    input.simulateKeyDown('ArrowRight');
    input.update();

    player.handleInput(input);
    player.update(1);
    // `ply0Na.sht + 0x24` = 4.0 (`Player.cpp:791-820`).
    expect(player.position.x).toBeCloseTo(204);

    input.simulateKeyDown('ShiftLeft');
    input.update();

    player.handleInput(input);
    player.update(1);
    // `ply0Nas.sht + 0x28` = 2.0, which happens to be exactly half for this team.
    expect(player.position.x).toBeCloseTo(206);
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

  it('carries the authentic th08 hit box for the team that is flying', () => {
    // `ply00a.sht + 0x0C / 2`, copied into the ship's box by `Player::AddedCallback`
    // (`Player.cpp:1619-1622`). Reimu's is the smallest in the game.
    expect(new Player({ x: 200, y: 300 }).hitbox.radius).toBe(0.825);
    const marisa = new Player({ x: 200, y: 300 }, { profile: CHARACTER_PROFILES['marisa-alice'] });
    expect(marisa.hitbox.radius).toBe(1);
    // Sakuya trades a fat graze box for the same hit box.
    expect(CHARACTER_PROFILES['sakuya-remilia'].grazeHalfExtent).toBe(3);
    expect(HITBOX_RADIUS).toBeLessThanOrEqual(2);
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

  it('shoots through the shared bullet pool by default (kill + release -> next volley reuses)', () => {
    const player = new Player({ x: 200, y: 400 });

    const volleyA = player.shoot(0);
    // A starting shot level is a real multi-lane volley: three charms for Reimu A.
    expect(volleyA.length).toBeGreaterThan(2);
    for (const b of volleyA) {
      b.destroy();
      releaseBullet(b);
    }

    player.shootCooldown = 0;
    const volleyB = player.shoot(5);
    expect(volleyB.length).toBe(volleyA.length);
    // LIFO free-list: the same instances come back, re-armed as player bullets
    expect(new Set(volleyB)).toEqual(new Set(volleyA));
    for (const b of volleyB) {
      expect(b.isAlive).toBe(true);
      expect(b.tag).toBe('player-bullet');
    }
  });

  it('switches to the partner member while Shift is held (永夜抄 focus switch)', () => {
    const input = new InputSystem();
    const player = new Player({ x: 200, y: 400 }, { characterId: 'reimu-yukari' });

    expect(player.memberId).toBe('reimu');
    expect(player.partner.id).toBe('yukari');

    input.simulateKeyDown('ShiftLeft');
    input.update();
    player.handleInput(input);
    expect(player.memberId).toBe('yukari');
    expect(player.switchFlash).toBeGreaterThan(0);

    input.simulateKeyUp('ShiftLeft');
    input.update();
    player.handleInput(input);
    expect(player.memberId).toBe('reimu');
  });

  it('fires a genuinely different weapon per member, and A/B differ per team', () => {
    const signature = (characterId: CharacterId, focused: boolean) => {
      const player = new Player({ x: 200, y: 400 }, { characterId });
      player.setFocus(focused);
      const shots = player.shoot(0);
      return {
        member: player.memberId,
        style: player.shotStyle,
        sprite: player.shotSprite,
        count: shots.length,
        radius: Math.max(...shots.map((b) => b.hitbox.radius)),
        rate: player.shotRate,
      };
    };

    const seen = new Map<string, ReturnType<typeof signature>>();
    for (const team of TEAMS) {
      for (const focused of [false, true]) {
        const s = signature(team, focused);
        seen.set(s.member, s);
      }
    }

    // Eight members, eight distinct weapons.
    expect(seen.size).toBe(8);
    expect(new Set([...seen.values()].map((s) => s.sprite)).size).toBe(8);
    expect(new Set([...seen.values()].map((s) => s.style)).size).toBeGreaterThan(2);

    // Both halves of every team differ from each other.
    for (const team of TEAMS) {
      const [a, b] = CHARACTER_PROFILES[team].members;
      expect(a.id).not.toBe(b.id);
      expect(a.shotSprite).not.toBe(b.shotSprite);
    }

    // Sakuya is the rapid-fire team; Marisa hits hardest per shot.
    expect(seen.get('sakuya')!.rate).toBeLessThan(seen.get('marisa')!.rate);
    expect(seen.get('marisa')!.style).toBe('laser');
    expect(seen.get('remilia')!.radius).toBeGreaterThan(seen.get('sakuya')!.radius);
  });

  it('never lets a player shot curl back on the ship', () => {
    // The old build gave player shots an angularVelocity, which the polar
    // integrator turned into a full circle around the player.
    for (const team of TEAMS) {
      for (const focused of [false, true]) {
        const player = new Player({ x: 224, y: 400 }, { characterId: team });
        player.setFocus(focused);
        const shots = player.shoot(0);
        for (const b of shots) {
          expect(b.angularVelocity).toBe(0);
          expect(b.acceleration).toBe(0);
        }
      }
    }
  });

  it('keeps homing shots inside their turn budget so they curve, not orbit', () => {
    const player = new Player({ x: 224, y: 400 }, { characterId: 'reimu-yukari' });
    const system = new BulletSystem();
    system.homingAim = () => ({ x: 420, y: 120 });

    const shots = player.shoot(0);
    system.add(...shots);
    const homing = shots.filter((b) => b.homingTurn > 0);
    expect(homing.length).toBeGreaterThan(0);

    const launch = homing.map((b) => b.heading);
    for (let frame = 0; frame < 30; frame++) system.update(1);

    homing.forEach((b, i) => {
      const drift = Math.abs(((b.heading - launch[i] + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      expect(drift).toBeLessThanOrEqual(b.homingTurn * 30 + 1e-6);
      // Still travelling away from the ship rather than looping back around it.
      expect(b.position.y).toBeLessThan(400);
    });

    // The aim target is to the right, so a homing charm must end up aiming right.
    expect(Math.max(...homing.map((b) => b.velocity.x))).toBeGreaterThan(0);
  });

  it('spins shot sprites visually without touching their heading', () => {
    const player = new Player({ x: 224, y: 400 }, { characterId: 'youmu-yuyuko' });
    const shots = player.shoot(0);
    const spinning = shots.filter((b) => b.spin > 0);
    expect(spinning.length).toBeGreaterThan(0);
    const before = spinning.map((b) => b.heading);
    for (const b of spinning) b.update(1);
    spinning.forEach((b, i) => expect(b.heading).toBeCloseTo(before[i], 12));
  });

  it('runs the 永夜抄 grace window, the dissolve and the spawn-in', () => {
    const player = new Player({ x: 200, y: 400 });
    expect(player.lives).toBe(3);

    player.hit();
    expect(player.state).toBe('dying');
    expect(player.lives).toBe(3); // the life is spent when the ship flies back in
    // No invulnerability at any point: `Player.cpp` gates on playerState.
    expect(player.isInvulnerable).toBe(false);
    // Three bombs is fifteen frames of window, and 霊夢's rows buy it 9/5 over.
    expect(player.graceTimer).toBe(27);
    expect(player.deathbombArmed).toBe(true);

    // The window holds the power bill back -- that is what a deathbomb buys.
    player.power = 64;
    player.update(1);
    expect(player.power).toBe(64);
    expect(player.graceTimer).toBe(26);
    expect(player.whiteoutHold).toBe(true);

    player.update(player.graceTimer);
    expect(player.deathSettled).toBe(true);
    expect(player.power).toBe(48);
    expect(player.powerLost).toBe(16);

    player.update(Player.DEATH_FRAMES);
    expect(player.state).toBe('respawning');
    expect(player.lives).toBe(2);
    // `:1408` refills the bomb count from `plyNNa.sht + 4` on the way back in.
    expect(player.bombs).toBe(Player.INITIAL_BOMBS);
    expect(player.position.x).toBe(Player.RESPAWN_X);
    expect(player.position.y).toBe(Player.RESPAWN_Y);
    expect(player.cancelTimer).toBe(Player.BULLET_CANCEL_FRAMES);

    player.update(Player.SPAWN_FRAMES);
    expect(player.state).toBe('alive');
    expect(player.isInvulnerable).toBe(false);
    // The cancel volume is the whole mercy period, and it drains with the spawn-in.
    expect(player.cancelTimer).toBe(Player.BULLET_CANCEL_FRAMES - Player.SPAWN_FRAMES);
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

    for (let i = 0; i < 60; i++) frame();
    // Arrives at (and stays at) the finger
    expect(player.position.y).toBeCloseTo(220, 0);

    // Holds still once arrived — does not jitter past the finger
    const before = player.position.y;
    frame();
    expect(player.position.y).toBe(before);
  });
});

/**
 * The roster contract behind the 永夜抄 focus switch: every member must carry a
 * real weapon, and a weapon that homes has to be bounded so it can never curl
 * back over the ship.
 */
describe('TH08 member roster contract', () => {
  it('gives all eight members a distinct weapon block with a bounded homing cap', () => {
    const ids = MEMBER_IDS;
    expect(ids.length).toBe(8);
    for (const id of ids) {
      const m = MEMBERS[id];
      expect(m.shotCount).toBeGreaterThan(0);
      expect(m.shotRate).toBeGreaterThan(0);
      expect(m.shotSpeed).toBeGreaterThan(0);
      expect(m.shotSprite).toBe('shot:' + id);
      // Homing is capped well under a half turn, so a charm bends but never loops.
      if (m.homingTurn > 0) {
        expect(m.homingMaxTurn).toBeGreaterThan(0);
        expect(m.homingMaxTurn).toBeLessThanOrEqual(Math.PI / 2);
        expect(m.homingFrames).toBeGreaterThan(0);
        expect(m.homingTurn * m.homingFrames).toBeGreaterThan(m.homingMaxTurn);
      } else {
        expect(m.homingMaxTurn).toBe(0);
      }
    }
  });

  it('pairs each team with two members of opposite roles and different weapons', () => {
    for (const id of Object.keys(CHARACTER_PROFILES) as CharacterId[]) {
      const team = CHARACTER_PROFILES[id];
      expect(team.members.length).toBe(2);
      expect(team.members[0].role).toBe('A');
      expect(team.members[1].role).toBe('B');
      expect(team.members[0].id).not.toBe(team.members[1].id);
      expect(team.members[0].shotStyle).not.toBe(team.members[1].shotStyle);
    }
  });

  it('swaps the flying member with the focus key and keeps the partner opposite', () => {
    const p = new Player({ x: 224, y: 400 }, { characterId: 'sakuya-remilia' });
    expect(p.memberId).toBe('sakuya');
    p.setFocus(true);
    expect(p.memberId).toBe('remilia');
    expect(p.partner.id).toBe('sakuya');
    expect(p.isSlowMode).toBe(true);
    expect(p.velocity.x).toBeCloseTo(0);
    p.setFocus(false);
    expect(p.memberId).toBe('sakuya');
    expect(p.isSlowMode).toBe(false);
  });
});
