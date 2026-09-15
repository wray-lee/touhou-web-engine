/**
 * The self-ship's own shot stream has to leave from the hitbox.
 *
 * Retail fans a weapon out by *angle*, not by moving the muzzle sideways, so at the
 * instant of firing every projectile of a volley sits within a few pixels of the
 * ship and the whole stream reads as coming out of one point. The `width` bound
 * below locks that in: a wide muzzle is what made the player weapon look like
 * danmaku orbiting the self-ship.
 *
 * Where each lane actually starts is not recoverable from the decompile --
 * `PlayerRawShtFile` declares the whole first 0x1c bytes of `plyNNa.sht` as
 * `unknown_fields` (`Player.hpp:13-17`) -- so these numbers are an observation of
 * retail behaviour, not a cited constant.
 */

import { describe, expect, it } from 'vitest';
import { Player } from './Player';
import { CHARACTER_PROFILES, type CharacterId } from './CharacterProfile';
import { BulletSystem } from '../../engine/core/BulletSystem';
import type { Bullet } from '../../engine/core/Bullet';

const TEAMS = Object.keys(CHARACTER_PROFILES) as CharacterId[];

function shotsAt(team: CharacterId, power: number, focused: boolean) {
  const player = new Player({ x: 192, y: 384 }, { characterId: team, initialPower: power });
  player.setFocus(focused);
  return player.shoot(0);
}

function widthOf(shots: { position: { x: number } }[]): number {
  const xs = shots.map((b) => b.position.x);
  return Math.max(...xs) - Math.min(...xs);
}

describe('shot formation width', () => {
  for (const focused of [false, true]) {
    for (const power of [0, 8, 24, 48, 80, 128]) {
      const label = `${focused ? 'focus' : 'normal'} at power ${power}`;
      it(`keeps every member inside a 24 px muzzle, ${label}`, () => {
        for (const team of TEAMS) {
          const shots = shotsAt(team, power, focused);
          expect(shots.length, team).toBeGreaterThan(1);
          const width = widthOf(shots);
          expect(width, `${team} ${label} muzzle ${width.toFixed(1)}px`).toBeLessThanOrEqual(24);
          for (const b of shots) {
            const off = Math.abs(b.position.x - 192);
            expect(off, `${team} ${label} lane offset ${off.toFixed(1)}px`).toBeLessThanOrEqual(12);
            expect(b.position.y, `${team} ${label} muzzle is ahead of the hitbox`).toBeLessThan(384);
          }
        }
      });
    }
  }

  it('spreads the stream by direction, so the muzzle is not doing the shaping', () => {
    const shots = shotsAt('reimu-yukari', 128, false);
    const headings = new Set(shots.map((b) => Math.round(b.heading * 100)));
    expect(headings.size).toBeGreaterThan(1);
  });

  it('gives every shot real forward speed', () => {
    for (const team of TEAMS) {
      for (const b of shotsAt(team, 128, false)) {
        expect(Math.hypot(b.velocity.x, b.velocity.y), team).toBeGreaterThan(1);
      }
    }
  });
});

/** Distance from the ship's hit position, which is what the orbiting bug moved. */
function fromShip(b: Bullet, player: Player): number {
  return Math.hypot(b.position.x - player.position.x, b.position.y - player.position.y);
}

describe('shot travel', () => {
  it('never lets a shot curve back onto the ship that fired it', () => {
    for (const team of TEAMS) {
      for (const focused of [false, true]) {
        const label = `${team} ${focused ? 'focus' : 'normal'}`;
        const system = new BulletSystem({ minX: -4000, maxX: 4000, minY: -4000, maxY: 4000 });
        // The only thing a homing shot ever aims at is something up the field, so a
        // shot that ends up closer to the ship than it was last frame is a bug
        // (this is the regression behind "射击时出现绕着自机转的弹幕").
        system.homingAim = () => ({ x: 192, y: 96 });
        const player = new Player({ x: 192, y: 384 }, { characterId: team, initialPower: 128 });
        player.setFocus(focused);
        const shots = player.shoot(0);
        system.add(...shots);
        let previous = shots.map((b) => fromShip(b, player));
        for (let frame = 1; frame <= 60; frame++) {
          system.update(1);
          const now = shots.map((b) => fromShip(b, player));
          for (let i = 0; i < shots.length; i++) {
            if (!shots[i].isAlive) continue;
            expect(now[i], `${label} shot ${i} frame ${frame}`).toBeGreaterThanOrEqual(previous[i] - 1e-6);
          }
          previous = now;
        }
        for (let i = 0; i < shots.length; i++) {
          if (!shots[i].isAlive) continue;
          expect(previous[i], `${label} shot ${i} after 60 frames`).toBeGreaterThan(60);
        }
      }
    }
  });
});
