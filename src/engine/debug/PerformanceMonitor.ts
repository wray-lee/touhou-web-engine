/** Optional per-kind entity breakdown shown in the debug overlay. */
export interface EntityCategoryCounts {
  bullets: number;
  enemies: number;
  /** Collectible drops currently on the playfield. */
  items: number;
  player: number;
}

interface ChromeMemoryInfo {
  usedJSHeapSize: number;
}

export class PerformanceMonitor {
  public fps = 60;
  public entityCount = 0;
  public collisionChecks = 0;
  public isVisible = true;
  private categories: EntityCategoryCounts | null = null;
  private frameCount = 0;
  private lastTime = typeof performance !== 'undefined' ? performance.now() : 0;

  updateFrame(currentTime = typeof performance !== 'undefined' ? performance.now() : 0): void {
    this.frameCount++;
    const delta = currentTime - this.lastTime;
    if (delta >= 500) {
      this.fps = Math.round((this.frameCount * 1000) / delta);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  updateMetrics(entityCount: number, collisionChecks: number, categories?: EntityCategoryCounts): void {
    this.entityCount = entityCount;
    this.collisionChecks = collisionChecks;
    if (categories) this.categories = categories;
  }

  toggle(): void {
    this.isVisible = !this.isVisible;
  }

  /** Chrome-only JS heap usage; null where `performance.memory` is unavailable. */
  private getMemoryText(): string {
    const memory = (performance as unknown as { memory?: ChromeMemoryInfo }).memory;
    if (!memory || typeof memory.usedJSHeapSize !== 'number') return 'Memory: n/a';
    return `Memory: ${(memory.usedJSHeapSize / 1048576).toFixed(1)} MB`;
  }

  getMetricsText(): string[] {
    const lines = [`FPS: ${this.fps}`, this.getMemoryText(), `Entities: ${this.entityCount}`];
    if (this.categories) {
      const c = this.categories;
      lines.push(`  bullets:${c.bullets} enemies:${c.enemies} items:${c.items} player:${c.player}`);
    }
    lines.push(`Collision Checks: ${this.collisionChecks}`, `Engine: PixiJS 8 + TS`);
    return lines;
  }
}
