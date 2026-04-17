import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/DogOffice/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/dog-profiles/ceo.png', 'assets/start-screen.png'],
      manifest: {
        name: '狗狗公司',
        short_name: 'DogOffice',
        description: '可愛又療癒的狗狗公司經營小遊戲',
        theme_color: '#ffb347',
        background_color: '#fff1dc',
        display: 'standalone',
        start_url: '/DogOffice/',
        scope: '/DogOffice/',
        icons: [
          {
            src: 'assets/dog-profiles/ceo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/dog-profiles/ceo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
