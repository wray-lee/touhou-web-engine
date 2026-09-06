import { describe, it, expect } from 'vitest';
import { PerformanceMonitor } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
  it('tracks FPS and entity counts', () => {
    const monitor = new PerformanceMonitor();
    expect(monitor.fps).toBe(60);

    monitor.updateMetrics(2500, 120);
    expect(monitor.entityCount).toBe(2500);
    expect(monitor.collisionChecks).toBe(120);
  });

  it('toggles visibility on toggle call', () => {
    const monitor = new PerformanceMonitor();
    expect(monitor.isVisible).toBe(true);

    monitor.toggle();
    expect(monitor.isVisible).toBe(false);

    monitor.toggle();
    expect(monitor.isVisible).toBe(true);
  });
});
