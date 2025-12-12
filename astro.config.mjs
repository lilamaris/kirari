// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

import rehypeSlug from "rehype-slug";
import rehypeAutoLinkHeadings from "rehype-autolink-headings";
import { remarkReadingTime } from "./src/lib/plugins/remark-reading-time.mjs";

// https://astro.build/config
export default defineConfig({
  trailingSlash: "never",
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutoLinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["anchor"],
          },
        },
      ],
    ],
  },
  integrations: [
    svelte(),
    icon({
      include: {
        "fa6-brands": ["*"],
        lucide: ["*"],
      },
    }),
  ],
});
