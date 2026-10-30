import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' loads every variable, not just VITE_ ones. FOOTBALL_DATA_KEY has no VITE_ prefix, so it's
  // only used here by the dev server and never ends up in the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Local stand-in for netlify/functions/football-data.mjs: same path, same key handling.
      proxy: {
        '/api/football-data': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football-data/, '/v4'),
          headers: { 'X-Auth-Token': env.FOOTBALL_DATA_KEY ?? '' },
        },
      },
    },
  }
})
