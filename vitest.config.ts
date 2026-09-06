import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
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
  },
});
