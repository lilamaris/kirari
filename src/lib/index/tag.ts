import type { Post } from "@/types";
import { getCollection } from "astro:content";

export type TagName = string;

export interface TaggedPost {
  id: string;
  tags: TagName[];
}

export type TagIndex = Record<TagName, TaggedPost[]>;

let _cache: TagIndex | undefined;

export const getTagIndex = async () => {
  if (_cache) return _cache;
  const posts = await getCollection("posts");
  _cache = buildTagIndex(posts);
  return _cache;
};

const buildTagIndex = (posts: Post[]): TagIndex => {
  const index = {};

  for (const post of posts) {
    const normalizedPost = normalize(post);
    if (normalizedPost.tags.length > 0) {
      appendPostToIndex(index, normalizedPost);
    }
  }

  return index;
};

const appendPostToIndex = (index: TagIndex, post: TaggedPost): void => {
  for (const tag of post.tags) {
    (index[tag] ??= []).push(post);
  }
};

const normalize = (post: Post): TaggedPost => ({
  id: post.id,
  tags: post.data.tags,
});
