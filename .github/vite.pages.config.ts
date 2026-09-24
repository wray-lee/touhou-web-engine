import { defineConfig } from 'vite';
import path from 'path';

// Pages-specific standalone application build configuration.
// Bundles index.html and app runtime into dist with repository base URL.
export default defineConfig({
  base: '/touhou-web-engine/',
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
