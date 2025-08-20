import type { SiteAppearanceConfig, SiteConfig } from "@/types/config";

export const SITE_CONFIG: SiteConfig = {
  title: "astro-blog-template",
  description: "goot blog template",
  author: "lilamaris",
  lang: "en",
  theme: "light",
  hue: 270,
};
export const SITE_APPEARANCE_CONFIG: SiteAppearanceConfig = {
  bannerHeight: 75,
  bannerOverlap: 5,
  showRecentPost: true,
  recentPostCount: 3,
  postPerPageCount: 4,
};
