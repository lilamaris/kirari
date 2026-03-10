import type { APIRoute } from "astro";
import { siteConfig } from "@/consts";

export const GET: APIRoute = () => {
  const manifest = {
    name: siteConfig.title,
    short_name: siteConfig.title,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafb",
    theme_color: "#17171a",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
    },
  });
};
