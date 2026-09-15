/**
 * Adapter that wraps ECL sim-layer entities (EnemySlot, BulletPool) into
 * engine-layer entities (Enemy, Bullet) so the existing PixiRenderer can
 * draw them without changes.
 *
 * This is the bridge between the deterministic sim layer (src/th08/sim/)
 * and the presentation layer (src/engine/renderer/).
 */

import { Enemy } from '../../touhou-common/enemy/Enemy';
import { Bullet, obtainBullet } from '../../engine/core/Bullet';
import type { EnemySlot } from '../../th08/sim/EnemySlot';
import type { Bullet as SimBullet } from '../../th08/sim/BulletPool';
import type { Laser as SimLaser } from '../../th08/sim/LaserPool';
import type { LaserView } from '../../engine/renderer/PixiRenderer';
import { enemyAnimCell } from './data/th08-enemy-anm';
import { stgenmAnimCell } from './data/th08-stgenm-anm';
import { stageEnemyCellKey } from './data/th08-enemy-registration';
import {
  getBulletDrawRadius,
  getBulletHitRadius,
  getBulletTextureKey,
  getLaserTextureKey,
} from './data/th08-bullet-types';

/** Persistent map from slot index to engine Enemy wrapper. */
const enemyCache = new Map<number, Enemy>();

/** Persistent pool for bullet wrappers. */
const bulletWrappers: Bullet[] = [];
let bulletPoolCursor = 0;

/** Reused laser views, so a busy laser stage does not allocate per frame. */
const laserViews: LaserView[] = [];
let laserCursor = 0;

/**
 * Asset slot for an enemy on this frame.
 *
 * The ECL ANM script number selects an `enemy.anm` animation, and the lifted
 * table says which atlas cell that animation shows `timer` frames into the
 * enemy's life. Unknown scripts keep the script number so the fallback painter
 * still draws something distinct per script.
 */
export function enemySpriteKey(slot: EnemySlot): string {
  // The ANM VM reports the cell its own script selected; only when no script is
  // running does the lifted frame table stand in for it.
  if (slot.anmUseStagePack && slot.anmStageName) {
    const pack = slot.anmStageName;
    const cell = slot.anmSprite ?? stgenmAnimCell(pack, slot.anmScript, slot.timer);
    const keyed = cell === null ? null : stageEnemyCellKey(pack, cell);
    if (keyed) return 'enemy:stage-' + keyed;
    return 'enemy:stage-' + pack + ':script' + slot.anmScript;
  }
  const cell = slot.anmSprite ?? enemyAnimCell(slot.anmScript, slot.timer);
  return 'enemy:' + (cell === null ? 'script' + slot.anmScript : cell);
}

/**
 * Convert active EnemySlots into engine Enemy objects for the renderer.
 * Reuses wrappers across frames to avoid GC pressure.
 */
export function adaptEclEnemies(slots: EnemySlot[]): Enemy[] {
  const result: Enemy[] = [];
  const seen = new Set<number>();

  for (const slot of slots) {
    if (!slot.active) continue;
    // `EMUF1_NO_SPRITE` keeps a live enemy out of the draw list entirely
    // (`EnemyManagerUpdate.cpp:985-993`): it still moves, still fires and still
    // absorbs shots, it just never reaches the renderer. Launcher nodes that ops
    // 90..92 hang off a boss are the usual owners of this bit, and drawing them is
    // what made a summon look like one bright blob welded to the boss.
    if (slot.noSprite) continue;
    seen.add(slot.slotIndex);

    let enemy = enemyCache.get(slot.slotIndex);
    if (!enemy) {
      enemy = new Enemy(
        { x: slot.posX, y: slot.posY },
        { x: 0, y: 0 },
        { hp: slot.maxHp || 100, radius: 14, color: 0x44aaff },
      );
      enemyCache.set(slot.slotIndex, enemy);
    }

    // Sync position and state
    enemy.position.x = slot.posX;
    enemy.position.y = slot.posY;
    enemy.hp = slot.hp;
    enemy.maxHp = slot.maxHp || 100;
    enemy.isAlive = true;
    // Alpha, spin and scale all come off the enemy's ANM script when one runs.
    enemy.alpha = slot.anmAlpha / 255;

    enemy.spriteKey = enemySpriteKey(slot);
    enemy.rotation = slot.rotAngle;
    // The left and right turn cycles are one sprite mirrored, so the sign of the
    // script's X scale is the only thing that tells them apart.
    enemy.drawScale = slot.anmFlipX ? -slot.anmScale : slot.anmScale;

    result.push(enemy);
  }

  // Clean up wrappers for deactivated slots
  for (const [idx, enemy] of enemyCache) {
    if (!seen.has(idx)) {
      enemy.isAlive = false;
      enemyCache.delete(idx);
    }
  }

  return result;
}

/**
 * Convert active sim bullets into engine Bullet objects for the renderer.
 */
export function adaptEclBullets(simBullets: SimBullet[]): Bullet[] {
  bulletPoolCursor = 0;

  for (const sb of simBullets) {
    if (!sb.active) continue;

    let wrapper: Bullet;
    if (bulletPoolCursor < bulletWrappers.length) {
      wrapper = bulletWrappers[bulletPoolCursor];
    } else {
      wrapper = obtainBullet({
        position: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        damage: 1,
        radius: 3,
      });
      wrapper.tag = 'enemy-bullet';
      bulletWrappers.push(wrapper);
    }

    wrapper.position.x = sb.x;
    wrapper.position.y = sb.y;
    wrapper.velocity.x = sb.vx;
    wrapper.velocity.y = sb.vy;
    wrapper.isAlive = true;
    wrapper.grazed = sb.grazed;
    wrapper.tag = sb.tag === 'player' ? 'player-bullet' : 'enemy-bullet';
    // Enemy danmaku carries its own retail art: `(type, colour)` addresses one
    // sliced `etama` cell, which is drawn 1:1 and hit-tested at the sim radius.
    wrapper.color = bulletColor(sb.color);
    wrapper.sprite = getBulletTextureKey(sb.type, sb.color);
    wrapper.drawRadius = getBulletDrawRadius(sb.type, sb.color);
    wrapper.hitbox.radius = getBulletHitRadius(sb.type);
    bulletPoolCursor++;
  }

  // Mark excess wrappers as dead
  for (let i = bulletPoolCursor; i < bulletWrappers.length; i++) {
    bulletWrappers[i].isAlive = false;
  }

  return bulletWrappers.slice(0, bulletPoolCursor);
}

/**
 * Turn live sim lasers into the rotated rectangles the renderer draws.
 *
 * The sim keeps its geometry in beam space — `tail` and `head` measured along the
 * heading from the anchor — because that is how retail stores it and how the
 * hitbox test wants it. Here the centre comes back out into playfield space.
 */
export function adaptEclLasers(simLasers: SimLaser[]): LaserView[] {
  laserCursor = 0;
  for (const laser of simLasers) {
    if (!laser.active) continue;
    const span = Math.max(0, laser.head - laser.tail);
    // A beam that has not grown past its own width would stretch the cell into
    // noise, so it is skipped until it has something to show.
    if (span < 1 || laser.currentWidth < 1) continue;
    const along = laser.tail + span / 2;
    let view = laserViews[laserCursor];
    if (!view) {
      view = { x: 0, y: 0, angle: 0, length: 0, width: 0, sprite: '', alpha: 1 };
      laserViews[laserCursor] = view;
    }
    view.x = laser.x + Math.cos(laser.angle) * along;
    view.y = laser.y + Math.sin(laser.angle) * along;
    view.angle = laser.angle;
    view.length = span;
    view.width = laser.currentWidth;
    view.sprite = getLaserTextureKey(laser.bulletType, laser.color);
    view.alpha = laser.alpha;
    laserCursor++;
  }
  return laserViews.slice(0, laserCursor);
}

/** Map etama color index to a hex color. */
function bulletColor(idx: number): number {
  const PALETTE = [
    0xff4444, 0xff8844, 0xffcc44, 0x44ff44, 0x44ffcc, 0x4488ff, 0x8844ff, 0xff44cc, 0xff6666, 0xffaa66,
    0xffdd66, 0x66ff66, 0x66ffdd, 0x6699ff, 0x9966ff, 0xff66dd,
  ];
  return PALETTE[idx % PALETTE.length] ?? 0xffffff;
}

/** Reset caches between stages. */
export function resetEclAdapters(): void {
  enemyCache.clear();
  bulletWrappers.length = 0;
  bulletPoolCursor = 0;
  laserViews.length = 0;
  laserCursor = 0;
}
