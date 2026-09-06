import { describe, it, expect } from 'vitest';
import { Entity } from './Entity';

describe('Entity', () => {
  it('initializes with default position, velocity and alive state', () => {
    const entity = new Entity({ x: 100, y: 200 });
    expect(entity.position.x).toBe(100);
    expect(entity.position.y).toBe(200);
    expect(entity.velocity.x).toBe(0);
    expect(entity.velocity.y).toBe(0);
    expect(entity.isAlive).toBe(true);
    expect(entity.hitbox.radius).toBe(0);
  });

  it('updates position based on velocity and dt', () => {
    const entity = new Entity({ x: 100, y: 100 }, { x: 10, y: -20 });
    entity.update(1); // 1 frame
    expect(entity.position.x).toBe(110);
    expect(entity.position.y).toBe(80);
  });

  it('handles destruction and lifecycle hooks', () => {
    let destroyed = false;
    const entity = new Entity({ x: 0, y: 0 });
    entity.on('destroy', () => {
      destroyed = true;
    });

    entity.destroy();
    expect(entity.isAlive).toBe(false);
    expect(destroyed).toBe(true);
  });

  it('calculates distance to another entity', () => {
    const e1 = new Entity({ x: 0, y: 0 });
    const e2 = new Entity({ x: 3, y: 4 });
    expect(e1.distanceTo(e2)).toBe(5);
    expect(e1.angleTo(e2)).toBeCloseTo(Math.atan2(4, 3));
  });
});
