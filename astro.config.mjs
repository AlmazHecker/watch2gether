// @ts-check
import { defineConfig } from "astro/config";
import basicSsl from "@vitejs/plugin-basic-ssl";
// import AstroPWA from "@vite-pwa/astro";

import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",

  // Note that everything in this vite object runs only locally.
  // SSL is used to fix WebRTC issue on mobile(WebRTC doesn't work on http on mobile idk why)
  vite: {
    plugins: [basicSsl(), tailwindcss()],
    server: {
      https: true,
    },
  },
  integrations: [
    // AstroPWA({
    //   mode: "production",
    //   base: "/",
    //   scope: "/",
    //   includeAssets: ["favicon.svg"],
    //   registerType: "autoUpdate",
    //   manifest: {
    //     name: "Watch2gether",
    //     short_name: "Watch2gether",
    //     theme_color: "#030712",
    //     icons: [
    //       {
    //         src: "android-chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //       {
    //         src: "android-chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         // default if no one matches
    //         src: "android-chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //         purpose: "any maskable",
    //       },
    //     ],
    //   },
    // }),
  ],

  adapter: vercel(),
});
