import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), svelte()],
  clearScreen: false,
  optimizeDeps: {
    // workspace source package — let Vite compile it, don't prebundle
    exclude: ['@tauri-desk/dashboard']
  },
  server: {
    port: 1420,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || false,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: 'esnext',
    sourcemap: false
  }
});
