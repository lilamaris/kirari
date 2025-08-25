import type { CollectionEntry } from "astro:content";

export type PostEntry = CollectionEntry<"post">;
export type Post = PostEntry & { data: PostEntry["data"] & PostExtra };

export interface PostExtra {
  slug: string;
  isSeries: boolean;
  seriesName?: string;
  prevPost?: Post;
  nextPost?: Post;
}

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
