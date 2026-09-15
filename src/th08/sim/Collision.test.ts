import { describe, expect, it } from 'vitest';
import { checkPlayerCollisions, GRAZE_BULLET_MARGIN } from './Collision';
import { PlayerSim } from './PlayerSim';
import { createGameState } from './GameState';
import { RESPAWN_X, RESPAWN_Y } from './Playfield';
import { blankBullet, type Bullet } from './BulletPool';
import { BULLET_LIVE } from './BulletTransform';

/** A live enemy bullet of `radius` sitting at (x, y). */
function shot(x: number, y: number, radius = 4): Bullet {
  return {
    ...blankBullet(),
    active: true,
    state: BULLET_LIVE,
    x,
    y,
    vx: 0,
    vy: 0,
    angle: 0,
    speed: 0,
    type: 0,
    color: 0,
    radius,
    damage: 1,
    lifetime: 0,
    grazed: false,
    tag: 'enemy',
  };
}

const HIT_HALF = 0.825; // ply00a.sht + 0x0C / 2
const GRAZE_HALF = 1.4; // ply00a.sht + 0x10 / 2

function ship() {
  const player = new PlayerSim(createGameState());
  player.hitboxHalfExtent = HIT_HALF;
  player.grazeHalfExtent = GRAZE_HALF;
  return player;
}

describe('checkPlayerCollisions', () => {
  it('hits when the two boxes overlap on both axes', () => {
    const player = ship();
    // Reach on an axis is hitHalf + bulletHalf = 4.825.
    const inside = shot(RESPAWN_X + 4.8, RESPAWN_Y);
    const outside = shot(RESPAWN_X + 4.9, RESPAWN_Y);
    const { hits } = checkPlayerCollisions([inside, outside], player, HIT_HALF, GRAZE_HALF);
    expect(hits).toEqual([inside]);
  });

  it('is a square, not a circle, like Player::FUN_0044a230', () => {
    const player = ship();
    // A circle of radius 4.825 would miss this at 6.6 away; retail's AABB hits it,
    // because both boxes are axis-aligned and overlap on each axis separately.
    const diagonal = shot(RESPAWN_X + 4.7, RESPAWN_Y + 4.7);
    const { hits } = checkPlayerCollisions([diagonal], player, HIT_HALF, GRAZE_HALF);
    expect(hits).toHaveLength(1);
  });

  it('grazes off the bullet box grown by 20px, not a fixed ring', () => {
    const player = ship();
    const reach = GRAZE_HALF + 12 + GRAZE_BULLET_MARGIN; // big bullet: 33.4
    const near = shot(RESPAWN_X + reach - 0.4, RESPAWN_Y, 12);
    const far = shot(RESPAWN_X + reach + 0.4, RESPAWN_Y, 12);
    const { grazes } = checkPlayerCollisions([near, far], player, HIT_HALF, GRAZE_HALF);
    expect(grazes).toEqual([near]);
    expect(GRAZE_BULLET_MARGIN).toBe(20);
  });

  it('pays each graze once and never reports a hit as a graze', () => {
    const player = ship();
    const b = shot(RESPAWN_X + 20, RESPAWN_Y);
    const first = checkPlayerCollisions([b], player, HIT_HALF, GRAZE_HALF);
    expect(first.grazes).toHaveLength(1);
    const second = checkPlayerCollisions([b], player, HIT_HALF, GRAZE_HALF);
    expect(second.grazes).toHaveLength(0);

    const touching = shot(RESPAWN_X + 1, RESPAWN_Y);
    const hit = checkPlayerCollisions([touching], player, HIT_HALF, GRAZE_HALF);
    expect(hit.hits).toHaveLength(1);
    expect(hit.grazes).toHaveLength(0);
    expect(touching.grazed).toBe(false);
  });

  it('leaves a dying ship alone, which is what keeps the death window safe', () => {
    const player = ship();
    player.hit();
    expect(player.state).toBe('dying');
    const { hits, grazes } = checkPlayerCollisions(
      [shot(RESPAWN_X, RESPAWN_Y), shot(RESPAWN_X + 22, RESPAWN_Y)],
      player,
      HIT_HALF,
      GRAZE_HALF,
    );
    expect(hits).toHaveLength(0);
    expect(grazes).toHaveLength(0);
  });

  it('ignores the ship own shots', () => {
    const player = ship();
    const mine = shot(RESPAWN_X, RESPAWN_Y);
    mine.tag = 'player';
    const { hits } = checkPlayerCollisions([mine], player, HIT_HALF, GRAZE_HALF);
    expect(hits).toHaveLength(0);
  });
});

describe('collision stats', () => {
  it('counts one test per live enemy bullet and nothing else', () => {
    const player = ship();
    const live = [shot(RESPAWN_X + 40, RESPAWN_Y), shot(RESPAWN_X - 40, RESPAWN_Y)];
    // A pooled slot that is not in use, and a bullet still in its appear phase:
    // neither reaches a comparison, so neither earns one.
    const dead = { ...blankBullet(), active: false };
    const spawning = { ...shot(RESPAWN_X, RESPAWN_Y + 40), state: 0 };
    const stats = { checks: 0 };
    checkPlayerCollisions([...live, dead, spawning], player, HIT_HALF, GRAZE_HALF, stats);
    expect(stats.checks).toBe(2);
  });

  it('counts nothing while the ship is off the field', () => {
    const player = ship();
    player.state = 'dead';
    const stats = { checks: 0 };
    checkPlayerCollisions([shot(RESPAWN_X, RESPAWN_Y)], player, HIT_HALF, GRAZE_HALF, stats);
    expect(stats.checks).toBe(0);
  });

  it('works without a stats object at all', () => {
    const player = ship();
    expect(() =>
      checkPlayerCollisions([shot(RESPAWN_X, RESPAWN_Y)], player, HIT_HALF, GRAZE_HALF),
    ).not.toThrow();
  });
});
