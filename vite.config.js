// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://medreminder-backends.onrender.com',
        changeOrigin: true,
      }
    }
  }
})