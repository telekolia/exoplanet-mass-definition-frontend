import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  return {
    base: './',
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
        },
        '/s3': {
          target: env.VITE_S3_TARGET || 'http://localhost:9000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/s3/, ''),
        },
      },
    },
  }
})
