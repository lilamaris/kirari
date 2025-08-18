export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  lang: string;
}

export interface SiteAppearanceConfig {
  bannerHeight: number;
  bannerOverlap: number;
  showRecentPost: boolean;
  recentPostCount: number;
  postPerPageCount: number;
}
