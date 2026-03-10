import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { siteConfig } from "@/consts";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/seo";

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

  const sortedPosts = posts.sort(
    (a, b) => +new Date(b.data.published) - +new Date(a.data.published),
  );
  const feedUrl = toAbsoluteUrl("/rss.xml", siteUrl) ?? "/rss.xml";
  const homeUrl = toAbsoluteUrl("/", siteUrl) ?? "/";
  const lastBuildDate = sortedPosts[0]?.data.published ?? new Date();

  const items = sortedPosts
    .map((post) => {
      const link = toAbsoluteUrl(`/blog/${post.id}`, siteUrl) ?? `/blog/${post.id}`;
      return `  <item>
    <title>${escapeXml(post.data.title)}</title>
    <description>${escapeXml(post.data.description ?? "")}</description>
    <link>${escapeXml(link)}</link>
    <guid>${escapeXml(link)}</guid>
    <pubDate>${new Date(post.data.published).toUTCString()}</pubDate>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteConfig.title)}</title>
    <description>${escapeXml(siteConfig.description)}</description>
    <link>${escapeXml(homeUrl)}</link>
    <language>${escapeXml(siteConfig.lang)}</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
