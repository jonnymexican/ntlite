import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ntlite/',
  plugins: [react()],
  server: {
    port: 5195,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    css: true,
  },
});
