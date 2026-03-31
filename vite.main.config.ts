import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'bufferutil',
        'utf-8-validate',
        'electron',
      ],
    },
  },
  resolve: {
    // Ensure Node.js built-in modules are not bundled
    conditions: ['node'],
  },
});
