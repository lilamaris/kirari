import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;
export type PostIndex = CollectionEntry<"postIndex">;

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  lang: string;
}

export interface SiteAppearanceConfig {
  hue: number;
  theme: SiteTheme;
  pageWidth: number;
  bannerHeight: number;
  bannerOverlap: number;
  showRecentPost: boolean;
  recentPostCount: number;
  postPerPageCount: number;
}

export type SiteTheme = "light" | "dark" | "system";
