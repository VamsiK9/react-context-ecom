// client/vite.config.js (ES Module Syntax required by Vite)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy redirects /api requests from port 5173 to the Node server on port 5000
    proxy: {
      '/api': {
        // IMPORTANT: Ensure this target matches your server's configured port (5000)
        target: 'http://localhost:5000', 
        changeOrigin: true, // Needed for virtual hosting
        secure: false,
      },
    },
  },
});