# SEO Deployment Checklist

## Required configuration

- Set `PUBLIC_SITE_URL` in the deployment environment to the production origin, for example `https://kirari.example.com`.
- Optionally set `siteConfig.email` in `src/consts.ts` if you want the email icon to open a `mailto:` link.
- Keep each post's `title`, `description`, `published`, `tags`, and `image` frontmatter populated.

## Generated SEO artifacts

- `robots.txt`: `/robots.txt`
- Sitemap: `/sitemap.xml`
- RSS feed: `/rss.xml`
- Web app manifest: `/manifest.webmanifest`

## Deployment validation

1. Deploy with `PUBLIC_SITE_URL` configured.
2. Open the home page and one blog post, then verify the rendered `<title>`, `<meta name="description">`, canonical URL, Open Graph tags, and JSON-LD.
3. Open `/robots.txt`, `/sitemap.xml`, `/rss.xml`, and `/manifest.webmanifest` and confirm they return `200`.
4. Validate one page in a social preview tool to confirm `og:image`, `og:title`, and `og:description` are correct.
5. Confirm draft posts do not appear in blog lists, RSS, or sitemap output.

## Search Console steps

1. Add the production domain as a property in Google Search Console.
2. Complete ownership verification with DNS or the provider-supported method.
3. Submit `/sitemap.xml`.
4. Use URL Inspection on the home page and 1-2 representative posts, then request indexing if needed.
5. Re-submit the sitemap after significant content or URL structure changes.
