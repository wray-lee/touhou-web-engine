import { describe, it, expect, vi } from 'vitest';
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

  it('exposes a transform view sharing the same position/velocity references', () => {
    const entity = new Entity({ x: 5, y: 6 }, { x: 7, y: 8 });
    const transform = entity.transform;

    expect(transform).toBe(entity.transform); // stable reference
    expect(transform.position).toBe(entity.position);
    expect(transform.velocity).toBe(entity.velocity);
    expect(transform.rotation).toBe(0);

    entity.update(1);
    expect(transform.position.x).toBe(12); // mutations via flat fields are visible

    entity.velocity.x = 0;
    entity.velocity.y = 0;
    entity.rotation = Math.PI / 2;
    expect(transform.rotation).toBeCloseTo(Math.PI / 2); // rotation stays in sync

    transform.rotation = 1;
    expect(entity.rotation).toBe(1);
  });

  it('emits a typed destroy event to on("destroy") listeners', () => {
    const entity = new Entity();
    const listener = vi.fn();
    entity.on('destroy', listener);

    entity.destroy();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(entity.isAlive).toBe(false);
  });
});
