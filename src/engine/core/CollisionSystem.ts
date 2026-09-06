import { Entity } from './Entity';
import { SpatialHashGrid } from '../physics/SpatialHashGrid';

export class CollisionSystem {
  private grid: SpatialHashGrid;
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

  checkCollision(entity: Entity): Entity[] {
    const hits = this.grid.checkCollisions(entity);
    this.totalChecks++;
    return hits;
  }
}
