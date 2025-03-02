import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output for Cloudflare Pages
    ssr: false,      // Disable SSR for client-side rendering
  },
});