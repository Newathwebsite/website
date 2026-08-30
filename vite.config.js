import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// `npm run build:public` / `build:admin` (see package.json) set --mode, which
// selects both the .env.<mode> file (VITE_BUILD_TARGET, read by App.jsx to
// pick which route tree to mount) and the output directory here, so the two
// deployable bundles land in separate folders instead of overwriting `dist`.
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    // Forwards /api/* to the ath-ai-server backend (see ../ath-ai-server) so
    // the admin panel's AI-assist buttons work in dev without CORS hassle.
    // In production, point VITE_AI_API_URL at the deployed backend instead.
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: mode === 'public' ? 'dist-public' : mode === 'admin' ? 'dist-admin' : 'dist',
  },
}))
