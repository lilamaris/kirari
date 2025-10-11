import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;
export type PostIndex = CollectionEntry<"postIndex">;
export type AstroComponentWithProps<P> = AstroComponentFactory &
  ((result: any, props: P, slots: any) => any);

export type Theme = "light" | "dark" | "system";
export type AvailableRoute = "home" | "blog" | "index" | "about";
export type AvailableSocial = "github" | "steam" | "twitter";

export interface StyledProps {
  class?: string;
  "class:list"?: string[];
  style?: string;
}

export interface Site {
  title: string;
  description: string;
  author: string;
  lang: string;
}

export interface Appearance {
  hue: number;
  theme: Theme;
  pageWidth: number;
  bannerHeight: number;
  bannerOverlap: number;
  showRecentPost: boolean;
  recentPostCount: number;
  postPerPageCount: number;
}

export interface Route {
  href: string;
  label: string;
}

export interface Routes extends Record<AvailableRoute, Route> {}

export interface SocialLink {
  href: string;
  label: string;
  icon: string;
}
