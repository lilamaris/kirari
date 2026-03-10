import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { indexType, routes, themeConfig } from "@/consts";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";
import { objectValues } from "@/lib/utils";

const escapeXml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: APIRoute = async () => {
  const siteUrl = getSiteUrl();
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const indexes = await getCollection("postIndex");

  const pageCount = Math.max(1, Math.ceil(posts.length / themeConfig.postPerPage));
  const blogPages = Array.from({ length: pageCount }, (_, i) =>
    i === 0 ? routes.blog.href : `${routes.blog.href}/${i + 1}`,
  );

  const urls = [
    { path: routes.root.href },
    { path: routes.about.href },
    ...blogPages.map((path) => ({ path })),
    { path: routes.index.href },
    ...objectValues(indexType).map((type) => ({
      path: `${routes.index.href}/${type}`,
    })),
    ...indexes.map((index) => ({
      path: `${routes.index.href}/${index.id}`,
    })),
    ...posts.map((post) => ({
      path: `${routes.blog.href}/${post.id}`,
      lastmod: post.data.published.toISOString(),
    })),
  ]
    .map((entry) => ({
      ...entry,
      loc: toAbsoluteUrl(entry.path, siteUrl),
    }))
    .filter((entry): entry is { path: string; loc: string; lastmod?: string } =>
      Boolean(entry.loc),
    );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>\n` : ""}  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
