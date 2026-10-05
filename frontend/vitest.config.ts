import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Vitest bundles its own copy of Vite, so the React plugin (typed against the
  // app's Vite) is nominally incompatible with Vitest's `PluginOption` even
  // though the runtime shape matches. Cast to bridge the two Vite copies.
  plugins: [react()] as never,
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
