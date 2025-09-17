import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000',  // yahan apne backend server ka URL daalo
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
