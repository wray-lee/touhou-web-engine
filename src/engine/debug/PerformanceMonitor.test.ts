import { describe, it, expect, afterEach } from 'vitest';
import { PerformanceMonitor } from './PerformanceMonitor';

describe('PerformanceMonitor', () => {
  const originalMemory = (performance as unknown as { memory?: unknown }).memory;

  const setMemory = (usedJSHeapSize: number | undefined) => {
    Object.defineProperty(performance, 'memory', {
      value: usedJSHeapSize === undefined ? undefined : { usedJSHeapSize },
      configurable: true,
      writable: true,
    });
  };

  afterEach(() => {
    Object.defineProperty(performance, 'memory', {
      value: originalMemory,
      configurable: true,
      writable: true,
    });
  });

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

  it('shows "Memory: n/a" when performance.memory is unavailable', () => {
    setMemory(undefined);
    const monitor = new PerformanceMonitor();
    expect(monitor.getMetricsText()).toContain('Memory: n/a');
  });

  it('reports JS heap usage in MB when performance.memory exists (Chrome-only)', () => {
    setMemory(21 * 1048576 + 104858); // ~21.1 MB
    const monitor = new PerformanceMonitor();
    expect(monitor.getMetricsText()).toContain('Memory: 21.1 MB');
  });

  it('shows entity category breakdown when categories are provided', () => {
    const monitor = new PerformanceMonitor();
    monitor.updateMetrics(100, 42, { bullets: 90, enemies: 9, player: 1 });
    expect(monitor.getMetricsText()).toContain('  bullets:90 enemies:9 player:1');
  });

  it('omits category line and keeps legacy behavior when categories are absent', () => {
    const monitor = new PerformanceMonitor();
    monitor.updateMetrics(100, 42);
    const lines = monitor.getMetricsText();
    expect(lines.some((l) => l.includes('bullets'))).toBe(false);
    expect(lines).toContain('Entities: 100');
    expect(lines).toContain('Collision Checks: 42');
  });

  it('retains the last known categories on legacy two-arg calls', () => {
    const monitor = new PerformanceMonitor();
    monitor.updateMetrics(100, 42, { bullets: 5, enemies: 2, player: 1 });
    monitor.updateMetrics(120, 60);
    expect(monitor.getMetricsText()).toContain('  bullets:5 enemies:2 player:1');
  });
});
