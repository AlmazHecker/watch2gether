// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import basicSsl from "@vitejs/plugin-basic-ssl";
import AstroPWA from "@vite-pwa/astro";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  output: "server",
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    AstroPWA({
      mode: "production",
      base: "/",
      scope: "/",
      includeAssets: ["favicon.svg"],
      registerType: "autoUpdate",
      manifest: {
        name: "Watch2gether",
        short_name: "Watch2gether",
        theme_color: "#030712",
        icons: [
          {
            src: "android-chrome-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "android-chrome-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            // default if no one matches
            src: "android-chrome-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],

  adapter: vercel(),
});
