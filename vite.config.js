import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PetConnect',
        short_name: 'PetConnect',
        description: 'PetConnect is a social media platform for pet owners to connect with other pet owners.',
        theme_color: '#000000',
        icons: [
          {
            src: '/Assets/logo (1).jpg',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Assets/logo (1).jpg',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Assets/logo (1).jpg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15000000, // Increased to 15MB to accommodate the 10.9MB bundle
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })],
  assetsInclude: ["**/*.glb"],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['react-icons'],
          // Add other large dependencies here
        }
      }
    },
    chunkSizeWarningLimit: 1600,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
