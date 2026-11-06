import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/code-practice/",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/pyodide\/.*/,
            handler: "CacheFirst",
            options: { cacheName: "pyodide-cache", expiration: { maxEntries: 30 } },
          },
        ],
      },
      manifest: {
        name: "程式練習平台",
        short_name: "程式練習",
        description: "繁體中文友善的程式練習平台,支援視覺化執行",
        lang: "zh-Hant",
        theme_color: "#1e1e2e",
        background_color: "#1e1e2e",
        display: "standalone",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
});
