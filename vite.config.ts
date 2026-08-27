import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    open: false
  },
  esbuild: {
    // Strip dev logs and debuggers in production builds
    drop: mode === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor-libs';
          }
          if (id.includes('src/data/')) {
            return 'game-data';
          }
          if (id.includes('src/combat/')) {
            return 'combat-engine';
          }
        }
      }
    }
  }
}));
