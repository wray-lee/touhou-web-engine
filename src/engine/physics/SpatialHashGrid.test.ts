import { describe, it, expect } from 'vitest';
import { SpatialHashGrid } from './SpatialHashGrid';
import { Entity } from '../core/Entity';

describe('SpatialHashGrid & Collision Detection', () => {
  it('correctly inserts and queries nearby entities', () => {
    const grid = new SpatialHashGrid(64);
    const e1 = new Entity({ x: 50, y: 50 }, {}, { radius: 10 });
    const e2 = new Entity({ x: 60, y: 60 }, {}, { radius: 10 });
    const e3 = new Entity({ x: 500, y: 500 }, {}, { radius: 10 });

    grid.insert(e1);
    grid.insert(e2);
    grid.insert(e3);

    const neighbors = grid.query(e1);
    expect(neighbors.has(e2)).toBe(true);
    expect(neighbors.has(e3)).toBe(false);
  });

  it('detects circle-circle collision between entities', () => {
    const grid = new SpatialHashGrid(64);
    const player = new Entity({ x: 100, y: 100 }, {}, { radius: 2 });
    const bulletHitting = new Entity({ x: 105, y: 100 }, {}, { radius: 4 });
    const bulletMissing = new Entity({ x: 110, y: 100 }, {}, { radius: 4 });

    grid.insert(bulletHitting);
    grid.insert(bulletMissing);

    const hits = grid.checkCollisions(player);
    expect(hits.length).toBe(1);
    expect(hits[0]).toBe(bulletHitting);
  });

  it('clears grid for new frame updates', () => {
    const grid = new SpatialHashGrid(64);
    const e = new Entity({ x: 50, y: 50 });
    grid.insert(e);
    expect(grid.query(e).size).toBe(0); // Only itself

    grid.clear();
    expect(grid.query(e).size).toBe(0);
  });
});
