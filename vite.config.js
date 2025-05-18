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
      }
    })],
  assetsInclude: ["**/*.glb"],
});
