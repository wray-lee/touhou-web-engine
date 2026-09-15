/**
 * Shot dispatch: translate ECL shot setup instructions into bullets.
 *
 * In the original, DispatchShotInstruction reads the shot descriptor stored
 * by ECL opcode 104 (shotSetup) and creates bullets via BulletManager. The
 * descriptor holds: type, color, count, base angle, spread, speed, and flags.
 *
 * We pack the descriptor into the EnemySlot and fire on the next tick.
 */

import type { EnemySlot } from './EnemySlot';
import { BulletPool } from './BulletPool';

export interface ShotDescriptor {
  type: number; // bullet shape index
  color: number; // palette color index
  count: number; // number of bullets per volley
  angle: number; // base firing angle (radians)
  spread: number; // angular spread (radians)
  speed: number; // bullet speed
  speedVar: number; // per-bullet speed variance
  flags: number; // aim-at-player, random-angle, etc.
}

/** Default shot descriptor (single aimed bullet). */
export function defaultShotDesc(): ShotDescriptor {
  return { type: 0, color: 0, count: 1, angle: Math.PI / 2, spread: 0, speed: 2, speedVar: 0, flags: 0 };
}

/** Fire one volley from a shot descriptor. */
export function fireShotVolley(
  enemy: EnemySlot,
  desc: ShotDescriptor,
  pool: BulletPool,
  playerX: number,
  playerY: number,
): number {
  const count = Math.max(1, desc.count);
  let baseAngle = desc.angle;

  // Flag 1: aim at player
  if (desc.flags & 1) {
    baseAngle = Math.atan2(playerY - enemy.posY, playerX - enemy.posX);
  }

  // Flag 2: random base angle
  if (desc.flags & 2) {
    baseAngle = Math.random() * Math.PI * 2 - Math.PI;
  }

  let spawned = 0;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0 : i / (count - 1) - 0.5;
    const angle = baseAngle + t * desc.spread;
    const speed = desc.speed + (desc.speedVar ? (Math.random() - 0.5) * desc.speedVar : 0);
    const b = pool.spawn(enemy.posX, enemy.posY, angle, speed, desc.type, desc.color, 3, 1, 'enemy');
    if (b) spawned++;
  }
  return spawned;
}

/**
 * Ring pattern: evenly spaced bullets around 360 degrees.
 * This is the most common Touhou bullet pattern.
 */
export function fireRing(
  x: number,
  y: number,
  count: number,
  speed: number,
  offset: number,
  type: number,
  color: number,
  pool: BulletPool,
): number {
  let spawned = 0;
  const step = (Math.PI * 2) / count;
  for (let i = 0; i < count; i++) {
    const angle = offset + i * step;
    if (pool.spawn(x, y, angle, speed, type, color, 3, 1, 'enemy')) spawned++;
  }
  return spawned;
}

/**
 * Fan pattern: bullets spread in an arc from a base angle.
 */
export function fireFan(
  x: number,
  y: number,
  count: number,
  speed: number,
  baseAngle: number,
  totalSpread: number,
  type: number,
  color: number,
  pool: BulletPool,
): number {
  let spawned = 0;
  if (count <= 1) {
    if (pool.spawn(x, y, baseAngle, speed, type, color, 3, 1, 'enemy')) spawned++;
    return spawned;
  }
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1) - 0.5;
    const angle = baseAngle + t * totalSpread;
    if (pool.spawn(x, y, angle, speed, type, color, 3, 1, 'enemy')) spawned++;
  }
  return spawned;
}

/**
 * Aimed pattern: bullets aimed at the player position with optional spread.
 */
export function fireAimed(
  x: number,
  y: number,
  playerX: number,
  playerY: number,
  count: number,
  speed: number,
  spread: number,
  type: number,
  color: number,
  pool: BulletPool,
): number {
  const base = Math.atan2(playerY - y, playerX - x);
  return fireFan(x, y, count, speed, base, spread, type, color, pool);
}
