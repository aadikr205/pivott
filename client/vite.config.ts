import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/onboarding': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/schedule': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/topics': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/quiz': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/progress': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
