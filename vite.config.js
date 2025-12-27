import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: true,
    hmr: {
      clientPort: 4000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Adjust this if your API runs on a different port
        changeOrigin: true,
        secure: false,
      },
      '/chapa-api': {
        target: 'https://api.chapa.co',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/chapa-api/, ''),
      },
    },
  },
});
