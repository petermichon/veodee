import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('plyr')) {
            return 'media';
          }
        },
      },
    },
  },
});
