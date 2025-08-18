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
