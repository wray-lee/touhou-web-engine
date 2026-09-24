import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  server: {
    fs: { strict: false },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/engine/core'),
      '@renderer': path.resolve(__dirname, './src/engine/renderer'),
      '@physics': path.resolve(__dirname, './src/engine/physics'),
      '@touhou': path.resolve(__dirname, './src/touhou-common'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    /**
     * `.scratch` is the working surface: one-off probes, translation patch
     * scripts, dumps and screenshots. Left to the default glob it gets picked up
     * by `npm test`, so a stale probe that a real suite already superseded still
     * counts as a red build -- one session lost seven such failures before the
     * actual suite could be read.
     *
     * This list replaces the vitest defaults, so they are restated. To run a
     * probe deliberately, pass its path with the same two default excludes.
     */
    exclude: ['**/node_modules/**', '**/dist/**', '**/.scratch/**'],
  },
});
