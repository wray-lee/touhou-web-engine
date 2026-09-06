export class PerformanceMonitor {
  public fps = 60;
  public entityCount = 0;
  public collisionChecks = 0;
  public isVisible = true;
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

  updateMetrics(entityCount: number, collisionChecks: number): void {
    this.entityCount = entityCount;
    this.collisionChecks = collisionChecks;
  }

  toggle(): void {
    this.isVisible = !this.isVisible;
  }

  getMetricsText(): string[] {
    return [
      `FPS: ${this.fps}`,
      `Entities: ${this.entityCount}`,
      `Collision Checks: ${this.collisionChecks}`,
      `Engine: PixiJS 8 + TS`,
    ];
  }
}
