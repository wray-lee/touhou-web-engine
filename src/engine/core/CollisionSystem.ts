import { Entity, EntityTag } from './Entity';
import { SpatialHashGrid } from '../physics/SpatialHashGrid';

export interface CollisionHit {
  entity: Entity;
  distance: number;
}

type TagFilter = EntityTag | EntityTag[];

/** Resolves collisions through the spatial hash grid (O(n) neighbourhood queries). */
export class CollisionSystem {
  private grid: SpatialHashGrid;
  /** Number of real distance comparisons performed this frame (F12 metric). */
  public totalChecks = 0;

  constructor(cellSize = 64) {
    this.grid = new SpatialHashGrid(cellSize);
  }

  update(entities: Entity[]): void {
    this.grid.clear();
    this.totalChecks = 0;
    for (const entity of entities) {
      if (entity.isAlive) {
        this.grid.insert(entity);
      }
    }
  }

  private matchesFilter(tag: EntityTag, filter: TagFilter): boolean {
    return Array.isArray(filter) ? filter.includes(tag) : filter === tag;
  }

  private resolve(entity: Entity): CollisionHit[] {
    if (!entity.isAlive || entity.hitbox.radius <= 0) return [];
    const candidates = this.grid.query(entity);
    const result: CollisionHit[] = [];
    const myCenter = entity.getHitboxCenter();
    const myRadius = entity.hitbox.radius;

    for (const candidate of candidates) {
      // Skip self, dead entities, and zero-radius hitboxes
      if (candidate === entity || !candidate.isAlive || candidate.hitbox.radius <= 0) continue;

      const targetCenter = candidate.getHitboxCenter();
      const dx = targetCenter.x - myCenter.x;
      const dy = targetCenter.y - myCenter.y;
      this.totalChecks++;
      const distSq = dx * dx + dy * dy;
      const hitRadius = myRadius + candidate.hitbox.radius;
      if (distSq <= hitRadius * hitRadius) {
        result.push({ entity: candidate, distance: Math.sqrt(distSq) });
      }
    }

    return result;
  }

  /** Collisions of `entity` against candidates matching `tags`. */
  checkCollisions(entity: Entity, tags?: TagFilter): CollisionHit[] {
    const hits = this.resolve(entity);
    return tags ? hits.filter((h) => this.matchesFilter(h.entity.tag, tags)) : hits;
  }

  /** Entities within `radius` px of `entity`, filtered by `tags` (used for graze). */
  queryNearby(entity: Entity, radius: number, tags?: TagFilter): CollisionHit[] {
    if (!entity.isAlive || radius <= 0) return [];
    const candidates = this.grid.query(entity);
    const result: CollisionHit[] = [];
    const myCenter = entity.getHitboxCenter();

    for (const candidate of candidates) {
      if (candidate === entity || !candidate.isAlive) continue;
      if (tags && !this.matchesFilter(candidate.tag, tags)) continue;

      const targetCenter = candidate.getHitboxCenter();
      const dx = targetCenter.x - myCenter.x;
      const dy = targetCenter.y - myCenter.y;
      this.totalChecks++;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        result.push({ entity: candidate, distance: dist });
      }
    }

    return result;
  }
}
