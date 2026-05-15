import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const prodBase = '/projeto-hub/'
  const base = command === 'build' ? prodBase : '/'
  return {
    plugins: [react()],
    base,
    build: {
      outDir: '../public/projeto-hub',
      emptyOutDir: true,
    },
    server: {
      port: 5173,
      proxy: {
        '^/Api': {
          target: env.VITE_PROXY_TARGET || 'http://127.0.0.1:8888',
          changeOrigin: true,
        },
      },
    },
  }
})
