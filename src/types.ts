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
