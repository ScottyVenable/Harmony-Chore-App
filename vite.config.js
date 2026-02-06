import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    exclude: ['node_modules', 'dist', 'tests/e2e/**'],
  },
})
