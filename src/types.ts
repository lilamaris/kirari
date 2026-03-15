import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import type {
  indexType,
  routes,
  socials,
  theme,
  thumbnailOption,
} from "./consts";

export type Post = CollectionEntry<"posts">;
export type PostIndex = CollectionEntry<"postIndex">;
export type AssetLike = string | ImageMetadata;

export type ThemeEnum = (typeof theme)[keyof typeof theme];
export type IndexEnum = (typeof indexType)[keyof typeof indexType];
export type ThumbnailOptionEnum =
  (typeof thumbnailOption)[keyof typeof thumbnailOption];

export interface StyledProps {
  class?: string;
  "class:list"?: string[];
  style?: string;
}

export interface SiteConfig {
  title: string;
  description: string;
  authorName: string;
  authorComment?: string;
  lang: string;
  siteUrl?: string;
  email?: string;
}

export interface ThemeConfig {
  initialHue: number;
  initialTheme: ThemeEnum;
  thumbnailOption: ThumbnailOptionEnum;
  enableBanner: boolean;
  enableHueControl: boolean;
  enableThemeControl: boolean;
  recentPostCount: number;
  postPerPage: number;
  siteIconUrl: AssetLike;
  avatarImgUrl: AssetLike;
  bannerImgUrl: AssetLike;
  thumbnailFallbackImgUrl: AssetLike;
}

export interface LayoutConfig {
  bannerHeight: number;
  bannerExtend: number;
  navigationHeight: number;
  contentWidth: number;
  asideWidth: number;
  layoutGap: number;
}

export interface SeoMeta {
  title?: string;
  description?: string;
  image?: AssetLike;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: Date;
  modifiedTime?: Date;
  keywords?: string[];
}

export type Route = keyof typeof routes;
export interface RouteMeta {
  href: string;
  label: string;
  icon?: string;
}

export type Social = keyof typeof socials;
export interface SocialMeta {
  href: string;
  label: string;
  icon: string;
}

export type RouteRegistry = Record<Route, RouteMeta>;
export type SocialRegistry = Record<Social, SocialMeta>;
