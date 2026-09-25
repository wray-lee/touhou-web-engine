import { defineConfig } from 'vite';
import path from 'path';

/**
 * Standalone page for the container. Same app build as vite.pages.config.ts,
 * served from the site root instead of `/touhou-web-engine/`.
 */
export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@core': path.resolve(__dirname, '../src/engine/core'),
      '@renderer': path.resolve(__dirname, '../src/engine/renderer'),
      '@physics': path.resolve(__dirname, '../src/engine/physics'),
      '@touhou': path.resolve(__dirname, '../src/touhou-common'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
  },
});
