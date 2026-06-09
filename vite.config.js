import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // host: true — открывает dev/preview сервер на локальной сети,
  // чтобы зайти с телефона по http://<IP-компа>:5173 в том же Wi-Fi
  server: { host: true },
  preview: { host: true },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'WorkoutTracker',
        short_name: 'Workout',
        description: 'Ежедневные тренировки и трекер прогресса',
        lang: 'ru',
        theme_color: '#f97316',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // кэшируем приложение для офлайн-работы (активно по HTTPS / на хостинге)
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            // GIF/картинки упражнений — кэш на лету
            urlPattern: ({ url }) =>
              url.hostname.includes('exercisedb.dev') ||
              url.hostname.includes('githubusercontent.com') ||
              url.hostname.includes('workoutxapp.com'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-media',
              expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
