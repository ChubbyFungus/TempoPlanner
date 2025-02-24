import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // Minimal configuration
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}); 