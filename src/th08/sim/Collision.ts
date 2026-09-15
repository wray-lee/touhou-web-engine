/**
 * Bullet/ship collision for the simulation.
 *
 * 永夜抄 tests the ship against every incoming object as a pair of axis-aligned
 * boxes that are both centred on their own position: the ship's box is
 * `plyNNa.sht + 0x0C / 2` (`Player.cpp:1619-1633`) and the bullet's is its size
 * halved (`Player.cpp:323-326`). Overlap therefore reduces to a per-axis sum test,
 * which is what these functions do. The circle they replace was wrong in both
 * directions: too generous on the diagonals, and blind to a big bullet whose *box*
 * reaches the ship even when its centre does not.
 */

import type { Bullet } from './BulletPool';
import { isLive } from './BulletTransform';
import type { Laser } from './LaserPool';
import type { EnemySlot } from './EnemySlot';
import type { PlayerSim } from './PlayerSim';

/**
 * How far outside a bullet's own box the graze test reaches
 * (`Player::FUN_0044a470`, `Player.cpp:380-383`: `- 20.0f` on every side).
 */
export const GRAZE_BULLET_MARGIN = 20;

/** How far outside a laser the graze box reaches (`Player.cpp:455-458`). */
const LASER_GRAZE_MARGIN = 48;

/**
 * Out-param for how many pair tests a frame actually ran.
 *
 * The debug overlay's `Collision Checks` line is only interesting as a cost
 * measure, so it counts the tests the loops above really perform rather than the
 * number of objects on the field: a bullet that is not live never reaches a
 * comparison and never earns one.
 */
export interface CollisionStats {
  checks: number;
}

export interface HitResult {
  bullet: Bullet;
  target: 'player' | 'enemy';
  enemySlot?: EnemySlot;
}

/**
 * Check enemy bullets against the player. Returns hits + grazes.
 *
 * `hitboxHalfExtent` is `plyNNa.sht + 0x0C / 2` and `grazeHalfExtent` is
 * `+0x10 / 2`, per `Player::AddedCallback` (`Player.cpp:1619-1633`).
 */
export function checkPlayerCollisions(
  bullets: Bullet[],
  player: PlayerSim,
  hitboxHalfExtent: number,
  grazeHalfExtent: number,
  stats?: CollisionStats,
): { hits: Bullet[]; grazes: Bullet[] } {
  const hits: Bullet[] = [];
  const grazes: Bullet[] = [];
  if (!player.isFlying) return { hits, grazes };

  for (const b of bullets) {
    // Appearing and dying bullets are not lethal: retail only runs the
    // collision branch for state 1, which is what lets a bullet spawn on top of
    // the ship without killing it.
    if (!b.active || b.tag !== 'enemy' || !isLive(b)) continue;
    if (stats) stats.checks++;
    const dx = Math.abs(b.x - player.x);
    const dy = Math.abs(b.y - player.y);
    // `Player::FUN_0044a230` (`Player.cpp:314-340`).
    if (dx < hitboxHalfExtent + b.radius && dy < hitboxHalfExtent + b.radius) {
      // `:335`: while the ship is not ALIVE -- which is every frame of a bomb card and
      // its red-flash tail -- the overlap is swallowed instead of being fatal.
      if (!player.bombImmune) hits.push(b);
      continue;
    }
    // `Player::FUN_0044a470` (`Player.cpp:371-396`) also refuses to graze while the
    // ship is dying or on its way back in; `isFlying` above already covers that.
    const grazeReach = grazeHalfExtent + b.radius + GRAZE_BULLET_MARGIN;
    if (!b.grazed && dx < grazeReach && dy < grazeReach) {
      b.grazed = true;
      grazes.push(b);
    }
  }
  return { hits, grazes };
}

/** Check player bullets against enemies. Returns hits per enemy. */
export function checkEnemyCollisions(bullets: Bullet[], enemies: EnemySlot[]): Map<EnemySlot, Bullet[]> {
  const result = new Map<EnemySlot, Bullet[]>();
  for (const b of bullets) {
    if (!b.active || b.tag !== 'player') continue;
    for (const e of enemies) {
      if (!e.active || e.invulnerable || !e.damageEnabled) continue;
      const dx = b.x - e.posX;
      const dy = b.y - e.posY;
      if (dx * dx + dy * dy < 24 * 24) {
        let list = result.get(e);
        if (!list) {
          list = [];
          result.set(e, list);
        }
        list.push(b);
        b.active = false;
        break;
      }
    }
  }
  return result;
}

/**
 * `Player::CalcLaserHitbox` (`Player.cpp:421-477`).
 *
 * A laser is an oriented box, but retail never rotates the box: it rotates the
 * *player* by minus the beam angle around the beam's anchor, which puts both into
 * the same axis-aligned frame, and then does a plain AABB test. The laser's
 * `centerX`/`centerY` are already in that frame, so the only world-space number
 * the transform needs is the anchor.
 *
 * The graze pass is not per-beam-continuous: retail only offers it on every
 * twentieth frame of the holding phase, which is why grazing a slow laser in
 * EoSD pays in visible steps.
 */
export function checkLaserCollisions(
  lasers: Laser[],
  player: PlayerSim,
  playerRadius: number,
  stats?: CollisionStats,
): { hits: Laser[]; grazes: Laser[] } {
  const hits: Laser[] = [];
  const grazes: Laser[] = [];
  if (!player.isFlying) return { hits, grazes };

  const cos = Math.cos;
  for (const laser of lasers) {
    if (!laser.active) continue;
    const lethal = laser.lethal;
    const graze = laser.graze;
    if (!lethal && !graze) continue;
    if (stats) stats.checks++;

    // `Rotate(&rotated, &delta, -angle)` from `Global.cpp:1250`.
    const dx = player.x - laser.x;
    const dy = player.y - laser.y;
    const c = cos(-laser.angle);
    const s = Math.sin(-laser.angle);
    const localX = c * dx - s * dy;
    const localY = c * dy + s * dx;

    // `size` is the full extent, so the box reaches half of it either way.
    const halfX = laser.sizeX / 2;
    const halfY = laser.sizeY / 2;
    const minX = laser.centerX - halfX;
    const maxX = laser.centerX + halfX;
    const minY = laser.centerY - halfY;
    const maxY = laser.centerY + halfY;

    const overlaps =
      localX + playerRadius > minX &&
      localX - playerRadius < maxX &&
      localY + playerRadius > minY &&
      localY - playerRadius < maxY;
    if (overlaps && lethal) {
      // `Player::CalcLaserHitbox:472` has the same `playerState != ALIVE` bail.
      if (!player.bombImmune) hits.push(laser);
      continue;
    }
    if (!graze) continue;
    const grazed =
      localX + playerRadius > minX - LASER_GRAZE_MARGIN &&
      localX - playerRadius < maxX + LASER_GRAZE_MARGIN &&
      localY + playerRadius > minY - LASER_GRAZE_MARGIN &&
      localY - playerRadius < maxY + LASER_GRAZE_MARGIN;
    if (grazed) grazes.push(laser);
  }
  return { hits, grazes };
}
