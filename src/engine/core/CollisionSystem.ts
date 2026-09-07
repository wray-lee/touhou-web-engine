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
  /** Last list handed to update(); the grid is (re)built from it lazily. */
  private lastEntities: Entity[] = [];
  private dirty = true;
  /** Number of real distance comparisons performed this frame (F12 metric). */
  public totalChecks = 0;

  constructor(cellSize = 64) {
    this.grid = new SpatialHashGrid(cellSize);
  }

  /**
   * Register the live entity set for this frame. The grid itself is rebuilt
   * lazily on the first query (once per update), so calling this before every
   * query is not required — but queries between two update() calls reuse the
   * grid built from the previous list.
   */
  update(entities: Entity[]): void {
    this.lastEntities = entities;
    this.dirty = true;
    this.totalChecks = 0;
  }

  /** Rebuild the grid from the last update() list if it is stale (no-op when fresh). */
  private ensureGrid(): void {
    if (!this.dirty) return;
    this.grid.clear();
    for (const entity of this.lastEntities) {
      if (entity.isAlive) {
        this.grid.insert(entity);
      }
    }
    this.dirty = false;
  }

  /** Cell edge length in px (read-only; exposed for debug visualization). */
  get cellSize(): number {
    return this.grid.cellSize;
  }

  /** Read-only traversal of occupied cells (key = "cx,cy"); for debug visualization only. */
  forEachCell(callback: (key: string, entities: ReadonlySet<Entity>) => void): void {
    this.ensureGrid();
    this.grid.forEachCell(callback);
  }

  private matchesFilter(tag: EntityTag, filter: TagFilter): boolean {
    return Array.isArray(filter) ? filter.includes(tag) : filter === tag;
  }

  private resolve(entity: Entity): CollisionHit[] {
    if (!entity.isAlive || entity.hitbox.radius <= 0) return [];
    this.ensureGrid();
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
    this.ensureGrid();
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
