import type { APIRoute } from "astro";
import { getSiteUrl } from "@/lib/seo";

export const GET: APIRoute = () => {
  const siteUrl = getSiteUrl();
  const lines = ["User-agent: *", "Allow: /"];

  if (siteUrl) {
    lines.push(`Sitemap: ${new URL("/sitemap.xml", `${siteUrl}/`).toString()}`);
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
