import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const API_TARGET = env.VITE_API_TARGET || 'http://localhost:4501';

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || 5501,
      strictPort: true,
      proxy: {
        '/api': { target: API_TARGET, changeOrigin: true },
        '/uploads': { target: API_TARGET, changeOrigin: true },
        // Teknik SEO — backend seoRoutes'a proxy (dev'de Vite serve etmez, backend üretir).
        '/robots.txt': { target: API_TARGET, changeOrigin: true },
        '/sitemap.xml': { target: API_TARGET, changeOrigin: true },
        '/feed.xml': { target: API_TARGET, changeOrigin: true },
      },
    },
  };
});
