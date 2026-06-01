import type { Post } from "@/types";
import { getCollection } from "astro:content";
import { compareDate, objectValues } from "../utils";

export type TagName = string;

export interface TaggedPost {
  id: string;
  title: string;
  published: Date;
}

export interface TagEntry {
  name: TagName;
  posts: TaggedPost[];
  postCount: number;
}

export type TagIndex = Record<TagName, TagEntry>;

let _cache: TagIndex | undefined;

export const getTagIndex = async (): Promise<TagIndex> => {
  if (_cache) return _cache;
  const posts = await getCollection("posts");
  _cache = buildTagIndex(posts);
  return _cache;
};

export const getIndexedTag = async (): Promise<TagName[]> => {
  return objectKeys(await getTagIndex()).sort();
};

const buildTagIndex = (posts: Post[]): TagIndex => {
  const index: TagIndex = {};

  for (const post of posts) {
    const normalizedPost = normalize(post);
    for (const tag of post.data.tags) {
      const entry = (index[tag] ??= createTagEntry(tag));
      entry.posts.push(normalizedPost);
    }
  }

  for (const entry of objectValues(index)) {
    entry.posts.sort((a, b) => compareDate(a.published, b.published, "desc"));
    entry.postCount = entry.posts.length;
  }

  return index;
};

const normalize = (post: Post): TaggedPost => ({
  id: post.id,
  title: post.data.title,
  published: post.data.published,
});

const createTagEntry = (name: TagName): TagEntry => ({
  name,
  posts: [],
  postCount: 0,
});

const objectKeys = <T extends object>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[];
