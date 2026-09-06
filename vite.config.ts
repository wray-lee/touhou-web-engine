import { defineConfig } from 'vite';
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
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        th08: path.resolve(__dirname, 'src/games/th08/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['pixi.js'],
      output: {
        globals: {
          'pixi.js': 'PIXI',
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
