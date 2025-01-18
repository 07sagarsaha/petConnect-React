import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "firebase-messaging-sw.js",
      injectManifest: {
        swSrc: "src/firebase-messaging-sw.js",
        swDest: "dist/firebase-messaging-sw.js",
        globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      },
    }),
  ],
  assetsInclude: ["**/*.glb"],
});
