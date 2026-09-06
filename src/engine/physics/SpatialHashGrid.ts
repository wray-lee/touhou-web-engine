import { Entity } from '../core/Entity';
import { distanceBetween } from '../core/Vector2';

export class SpatialHashGrid {
  private cellSize: number;
  private grid: Map<string, Set<Entity>>;

  constructor(cellSize = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private hash(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  clear(): void {
    this.grid.clear();
  }

  insert(entity: Entity): void {
    if (!entity.isAlive) return;
    const center = entity.getHitboxCenter();
    const key = this.hash(center.x, center.y);

    let cell = this.grid.get(key);
    if (!cell) {
      cell = new Set();
      this.grid.set(key, cell);
    }
    cell.add(entity);
  }

  query(entity: Entity): Set<Entity> {
    const center = entity.getHitboxCenter();
    const cx = Math.floor(center.x / this.cellSize);
    const cy = Math.floor(center.y / this.cellSize);
    const results = new Set<Entity>();

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (const item of cell) {
            if (item !== entity && item.isAlive) {
              results.add(item);
            }
          }
        }
      }
    }

    return results;
  }

  checkCollisions(entity: Entity): Entity[] {
    if (!entity.isAlive || entity.hitbox.radius <= 0) return [];
    const candidates = this.query(entity);
    const collisions: Entity[] = [];
    const myCenter = entity.getHitboxCenter();
    const myRadius = entity.hitbox.radius;

    for (const candidate of candidates) {
      if (candidate.hitbox.radius <= 0) continue;
      const targetCenter = candidate.getHitboxCenter();
      const dist = distanceBetween(myCenter, targetCenter);
      if (dist <= myRadius + candidate.hitbox.radius) {
        collisions.push(candidate);
      }
    }

    return collisions;
  }
}
