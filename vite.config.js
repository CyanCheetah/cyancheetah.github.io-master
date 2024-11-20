import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Remove the externalization of react-router-dom for production
    rollupOptions: {
      // external: ['react-router-dom'], // Remove this line
    },
  },
});
