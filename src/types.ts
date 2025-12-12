import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { CollectionEntry } from "astro:content";
import type { indexType, route, social } from "./consts";

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

export type AvailableIndexType = (typeof availableIndexType)[number];

export interface StyledProps {
  class?: string;
  "class:list"?: string[];
  style?: string;
}

export interface Breadcrumb {
  href: string;
  name: string;
  isLast: boolean;
}

export interface SiteConfig {
  title: string;
  description: string;
  authorName: string;
  authorComment?: string;
  lang: string;
}

export interface ThemeConfig {
  initialHue: number;
  initialTheme: ThemeEnum;
  enableBanner: boolean;
  enableHueControl: boolean;
  enableThemeControl: boolean;
  recentPostCount: number;
  postPerPage: number;
  siteIconUrl: string;
  avatarImgUrl: string;
  bannerImgUrl: string;
}

export interface LayoutConfig {
  bannerHeight: number;
  bannerExtend: number;
  navigationHeight: number;
  contentWidth: number;
  asideWidth: number;
  layoutGap: number;
}

export type RouteEnum = (typeof route)[keyof typeof route];
export type ThemeEnum = (typeof theme)[keyof typeof theme];
export type IndexEnum = (typeof indexType)[keyof typeof indexType];
export type SocialEnum = (typeof social)[keyof typeof social];

export interface RouteMeta {
  href: string;
  label: string;
  icon?: string;
}

export interface SocialMeta {
  href: string;
  label: string;
  icon: string;
}

export type RouteRegistry = Record<RouteEnum, RouteMeta>;
export type SocialRegistry = Record<SocialEnum, SocialMeta>;
