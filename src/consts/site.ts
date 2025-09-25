import type { SiteAppearanceConfig, SiteConfig } from "@/types";

export const SITE: SiteConfig = {
  title: "Kirari",
  description: "kirari astro blog",
  author: "lilamaris",
  lang: "en",
};

export const APPEARANCE: SiteAppearanceConfig = {
  hue: 270,
  theme: "light",
  bannerHeight: 30,
  bannerOverlap: -2,
  pageWidth: 75,
  showRecentPost: true,
  recentPostCount: 3,
  postPerPageCount: 4,
};
