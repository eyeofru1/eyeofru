import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8081,
    strictPort: true,
    host: true
  },
  preview: {
    port: 8081,
    strictPort: true,
    host: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        concierge: resolve(__dirname, 'concierge.html')
      }
    }
  }
});
