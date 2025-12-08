import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;
export type PostIndex = CollectionEntry<"postIndex">;
export type AstroComponentWithProps<P> = AstroComponentFactory &
  ((
    result: any,
    props: P,
    slots: Record<string, any>,
  ) => AsyncGenerator<string | void | unknown>);

export const theme = ["light", "dark", "system"] as const;
export type Theme = (typeof theme)[number];
export const availableIndexType = [
  "publishedYear",
  "categories",
  "tags",
  "series",
] as const;

export interface SiteInfo {
  title: string;
  description: string;
  author: string;
  authorComment: string;
}

export interface SiteConfig {
  lang: string;
  recentPostShowAmount: number;
  postPerPage: number;
}

export interface ThemeConfig {
  theme: Theme;
  initialHue: number;
}

export interface LayoutConfig {
  bannerHeight: number;
  bannerOverlap: number;
  contentWidth: number;
  asideWidth: number;
}

export type AvailableIndexType = (typeof availableIndexType)[number];

export interface StyledProps {
  class?: string;
  "class:list"?: string[];
  style?: string;
}

export interface IterableRenderProps<T> {
  items?: T[];
  renderer: AstroComponentWithProps<IterableRenderer<T>>;
}

export interface IterableRenderer<T> {
  id: string;
  index: number;
  item: T;
}

export interface Breadcrumb {
  href: string;
  name: string;
  isLast: boolean;
}
