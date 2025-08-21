// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import swup from "@swup/astro";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    svelte(),
    swup({
      theme: false,
      animationClass: "transition-swup-",
      containers: ["main", "#toc"],
    }),
  ],
});
