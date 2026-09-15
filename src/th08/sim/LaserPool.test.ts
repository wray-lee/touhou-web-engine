import { describe, expect, it } from 'vitest';
import { LaserPool, MAX_LASERS } from './LaserPool';
import { EnemySlot } from './EnemySlot';
import { createGameState } from './GameState';
import { checkLaserCollisions } from './Collision';
import { reg } from '../danmaku/ShotDescriptor';
import type { LaserDescriptor } from '../danmaku/ShotDescriptor';
import type { PlayerSim } from './PlayerSim';

/**
 * A laser descriptor with the shape stage 3 and 6 actually author: a long beam,
 * eight wide, that comes up over ten frames. Each test overrides what it cares
 * about, which is the point of the descriptor — the old call handed the slot
 * fifteen positional words and the reader had to know which one was the width.
 */
function beam(over: Partial<LaserDescriptor>): LaserDescriptor {
  return {
    aimed: false,
    type: 0,
    color: 0,
    angle: 0,
    speed: 0,
    tail: 0,
    head: 400,
    startLength: 400,
    width: 8,
    startTime: 0,
    duration: 10,
    despawn: 0,
    hitboxStart: 0,
    hitboxEnd: 0,
    flags: 0,
    ...over,
  };
}

/** A static 640-long beam across the field, as stage 3 and 6 author them. */
function staticBeam(pool: LaserPool, angle = 0) {
  return pool.spawn({
    x: 32,
    y: 240,
    angle,
    tail: 0,
    head: 640,
    startLength: 640,
    width: 8,
    speed: 0,
    startTime: 60,
    hitboxStartTime: 60,
    duration: 540,
    despawnDuration: 60,
    hitboxEndDelay: 60,
    flags: 0,
    color: 6,
    bulletType: 0,
  })!;
}

describe('LaserPool', () => {
  it('spawns into a fixed pool and reports the live count', () => {
    const pool = new LaserPool();
    expect(pool.activeCount).toBe(0);
    staticBeam(pool);
    staticBeam(pool);
    expect(pool.activeCount).toBe(2);
    expect(pool.lasers.length).toBe(MAX_LASERS);
  });

  it('holds the hitbox off during the grow phase and opens it at hitboxStartTime', () => {
    const pool = new LaserPool();
    const laser = staticBeam(pool);
    // The ramp keeps the beam a 1.2 px sliver until the last 30 frames.
    for (let i = 0; i < 20; i++) pool.tick();
    expect(laser.state).toBe(0);
    expect(laser.currentWidth).toBeCloseTo(1.2);
    expect(laser.lethal).toBe(false);
    // `hitboxStartTime` is 60, the same frame the grow phase ends.
    for (let i = 0; i < 39; i++) pool.tick();
    expect(laser.state).toBe(0);
    expect(laser.lethal).toBe(false);
    // The phase clock advances at the end of the tick, so the 61st frame still
    // finds the beam growing and the 62nd is the one that walks the chain.
    pool.tick();
    expect(laser.state).toBe(0);
    pool.tick();
    expect(laser.state).toBe(1);
    expect(laser.currentWidth).toBe(8);
    expect(laser.lethal).toBe(true);
  });

  it('shrinks out and then frees the slot', () => {
    const pool = new LaserPool();
    const laser = staticBeam(pool);
    let guard = 0;
    while (laser.state !== 2 && guard++ < 5000) pool.tick();
    expect(laser.state).toBe(2);
    // The frame that opens the shrink phase still reads `timer` 0, so the beam is
    // at full width there and only narrows from the next one on.
    pool.tick();
    expect(laser.currentWidth).toBeLessThan(8);
    guard = 0;
    while (laser.active && guard++ < 5000) pool.tick();
    expect(laser.active).toBe(false);
    expect(pool.activeCount).toBe(0);
  });

  it('advances the head by speed and drags the tail behind startLength', () => {
    const pool = new LaserPool();
    const laser = pool.spawn({
      x: 192,
      y: 100,
      angle: Math.PI / 2,
      tail: 0,
      head: 0,
      startLength: 200,
      width: 16,
      speed: 30,
      startTime: 0,
      hitboxStartTime: 0,
      duration: 400,
      despawnDuration: 0,
      hitboxEndDelay: 0,
      flags: 0,
      color: 6,
      bulletType: 4,
    })!;
    // `startTime` 0 opens straight in the holding phase.
    expect(laser.state).toBe(1);
    pool.tick();
    expect(laser.head).toBeCloseTo(30);
    expect(laser.tail).toBe(0);
    for (let i = 0; i < 7; i++) pool.tick();
    expect(laser.head).toBeCloseTo(240);
    // Span is capped at `startLength`, so the tail has to start moving.
    expect(laser.tail).toBeCloseTo(40);
    expect(laser.head - laser.tail).toBeCloseTo(200);
  });

  it('retires a beam once its tail has left the field', () => {
    const pool = new LaserPool();
    const laser = pool.spawn({
      x: 0,
      y: 0,
      angle: 0,
      tail: 0,
      head: 700,
      startLength: 700,
      width: 8,
      speed: 0,
      startTime: 0,
      hitboxStartTime: 0,
      duration: 1000,
      despawnDuration: 1000,
      hitboxEndDelay: 0,
      flags: 0,
      color: 6,
      bulletType: 0,
    })!;
    pool.tick();
    expect(laser.active).toBe(true);
    laser.tail = 640;
    pool.tick();
    expect(laser.active).toBe(false);
  });

  it('ramps alpha instead of width when transformFlags bit 0 is set', () => {
    const pool = new LaserPool();
    const laser = pool.spawn({
      x: 32,
      y: 240,
      angle: 0,
      tail: 0,
      head: 640,
      startLength: 640,
      width: 8,
      speed: 0,
      startTime: 40,
      hitboxStartTime: 0,
      duration: 100,
      despawnDuration: 40,
      hitboxEndDelay: 0,
      flags: 1,
      color: 6,
      bulletType: 0,
    })!;
    pool.tick();
    pool.tick();
    expect(laser.currentWidth).toBe(8);
    expect(laser.sizeX).toBeCloseTo(640);
    // The ramp reads the phase clock before it advances, so two ticks in the
    // beam is one fortieth of the way faded up.
    expect(laser.alpha).toBeCloseTo(1 / 40);
  });

  it('freezes with the rest of the field while Sakuya stops the clock', () => {
    const pool = new LaserPool();
    const laser = staticBeam(pool);
    pool.tick();
    const head = laser.head;
    const timer = laser.timer;
    pool.tick(true);
    expect(laser.head).toBe(head);
    expect(laser.timer).toBe(timer);
    expect(laser.lethal).toBe(false);
  });
});

describe('laser collision', () => {
  /**
   * A live, holding beam pointing right along +x from (32, 240), parked on a
   * frame where retail both hurts and offers the graze pulse.
   */
  function armedBeam() {
    const pool = new LaserPool();
    const laser = staticBeam(pool, 0);
    let guard = 0;
    // The frame that leaves the grow phase still carries the ramp's 1.2 px box, so
    // wait for a steady holding frame that also offers a graze pulse.
    while (!(laser.state === 1 && laser.graze && laser.sizeX > 100) && guard++ < 5000) {
      pool.tick();
    }
    expect(laser.lethal).toBe(true);
    return { pool, laser };
  }

  const playerAt = (x: number, y: number) => ({ x, y, isFlying: true, radius: 1.5 }) as unknown as PlayerSim;

  it('hits a ship inside the beam box', () => {
    const { pool, laser } = armedBeam();
    expect(laser.state).toBe(1);
    const { hits } = checkLaserCollisions(pool.getActive(), playerAt(200, 240), 1.5);
    expect(hits).toHaveLength(1);
  });

  it('misses a ship clear of the beam but grazes it inside 48 px', () => {
    const { pool } = armedBeam();
    expect(checkLaserCollisions(pool.getActive(), playerAt(200, 320), 1.5).hits).toHaveLength(0);
    // Every twentieth frame of the holding phase offers a graze pulse.
    const grazed = checkLaserCollisions(pool.getActive(), playerAt(200, 250), 1.5);
    expect(grazed.grazes).toHaveLength(1);
  });

  it('tests the rotated frame, not an axis-aligned box', () => {
    const pool = new LaserPool();
    const laser = pool.spawn({
      x: 192,
      y: 400,
      angle: -Math.PI / 2,
      tail: 0,
      head: 400,
      startLength: 400,
      width: 8,
      speed: 0,
      startTime: 0,
      hitboxStartTime: 0,
      duration: 100,
      despawnDuration: 0,
      hitboxEndDelay: 0,
      flags: 0,
      color: 6,
      bulletType: 1,
    })!;
    for (let i = 0; i < 3; i++) pool.tick();
    // The beam runs straight up from the anchor.
    expect(checkLaserCollisions(pool.getActive(), playerAt(192, 300), 1.5).hits).toHaveLength(1);
    expect(checkLaserCollisions(pool.getActive(), playerAt(100, 300), 1.5).hits).toHaveLength(0);
    expect(laser.active).toBe(true);
  });
});

describe('ECL 114/115 decode', () => {
  function slotWithPool() {
    const gs = createGameState();
    const pool = new LaserPool();
    const slot = new EnemySlot(gs);
    slot.reset(100, 80, 10, gs);
    slot.laserPool = pool;
    slot.playerRef = { x: 192, y: 384 };
    return { gs, pool, slot };
  }

  it('maps the packed word, the float operands and the i32 timing operands', () => {
    const { pool, slot } = slotWithPool();
    // The stage-3 static beam, operand for operand. Its angle is the one field
    // that arrives as a register selector, which is what bit 0x04 used to say.
    slot.spawnLaser({
      aimed: false,
      type: 0,
      color: 6,
      angle: reg(0x2720), // f0
      speed: 0,
      tail: 0,
      head: 640,
      startLength: 640,
      width: 12,
      startTime: 120,
      duration: 20,
      despawn: 10,
      hitboxStart: 90,
      hitboxEnd: 10,
      flags: 0,
    });
    expect(pool.activeCount).toBe(1);
    const laser = pool.lasers.find((l) => l.active)!;
    expect(laser.bulletType).toBe(0);
    expect(laser.color).toBe(6);
    expect(laser.width).toBe(12);
    expect(laser.head).toBe(640);
    expect(laser.tail).toBe(0);
    expect(laser.startLength).toBe(640);
    expect(laser.startTime).toBe(120);
    expect(laser.duration).toBe(20);
    expect(laser.despawnDuration).toBe(10);
    expect(laser.hitboxStartTime).toBe(90);
    expect(laser.hitboxEndDelay).toBe(10);
    expect(laser.flags).toBe(0);
  });

  it('resolves register operands against the slot register file', () => {
    const { pool, slot } = slotWithPool();
    slot.f0 = 1.5;
    slot.f1 = 300;
    slot.f2 = 2.5;
    slot.i2 = 4;
    // Colour, angle, speed and startLength all arrive as registers.
    slot.spawnLaser({
      aimed: false,
      type: 4,
      color: reg(0x2712), // i2
      angle: reg(0x2720), // f0
      speed: reg(0x2722), // f2
      tail: 0,
      head: 0,
      startLength: reg(0x2721), // f1
      width: 8,
      startTime: 0,
      duration: 2560,
      despawn: 0,
      hitboxStart: 0,
      hitboxEnd: 0,
      flags: 0,
    });
    const laser = pool.lasers.find((l) => l.active)!;
    expect(laser.bulletType).toBe(4);
    expect(laser.color).toBe(4);
    expect(laser.angle).toBeCloseTo(1.5);
    expect(laser.speed).toBeCloseTo(2.5);
    expect(laser.startLength).toBeCloseTo(300);
    expect(laser.duration).toBe(2560);
  });

  it('aims op 115 at the ship and leaves op 114 absolute', () => {
    const { pool, slot } = slotWithPool();
    slot.spawnLaser(beam({ aimed: true, angle: 0 }));
    const aimed = pool.lasers.find((l) => l.active)!;
    expect(aimed.angle).toBeCloseTo(Math.atan2(384 - 80, 192 - 100));
    pool.clearAll();
    slot.spawnLaser(beam({ angle: 0.5 }));
    const fixed = pool.lasers.find((l) => l.active)!;
    expect(fixed.angle).toBeCloseTo(0.5);
  });

  it('spawns from the muzzle offset rather than the enemy centre', () => {
    const { pool, slot } = slotWithPool();
    slot.setShotOrigin(10, -20);
    slot.spawnLaser(beam({ head: 100, startLength: 100 }));
    const laser = pool.lasers.find((l) => l.active)!;
    expect(laser.x).toBe(110);
    expect(laser.y).toBe(60);
  });
});
