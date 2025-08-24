// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import swup from "@swup/astro";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    svelte(),
    icon({
      include: {
        "fa6-brands": ["*"],
        lucide: ["*"],
      },
    }),
    swup({
      globalInstance: true,
    }),
  ],
});
