export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  lang: string;
  theme: SiteTheme;
  hue: number;
}

export interface SiteAppearanceConfig {
  bannerHeight: number;
  bannerOverlap: number;
  showRecentPost: boolean;
  recentPostCount: number;
  postPerPageCount: number;
}

export type SiteTheme = "light" | "dark" | "system";
