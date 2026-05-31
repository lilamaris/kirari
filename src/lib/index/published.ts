import type { Post } from "@/types";
import { getCollection } from "astro:content";
import { compareDate, objectKeys } from "../utils";

export type Year = string;
export type Month = number;

export interface PublishedPost {
  id: string;
  published: Date;
}

export interface MonthEntry {
  month: number;
  posts: PublishedPost[];
}

export type PublishedIndex = Record<Year, MonthEntry[]>;

let _cache: PublishedIndex | undefined;

export const getPublishedIndex = async (): Promise<PublishedIndex> => {
  if (_cache) return _cache;
  const posts = await getCollection("posts");
  _cache = buildPublishedIndex(posts);
  return _cache;
};

const buildPublishedIndex = (posts: Post[]): PublishedIndex => {
  const index: PublishedIndex = {};

  for (const post of posts) {
    const normalizedPost = normalize(post);
    appendPostToIndex(index, normalizedPost);
  }

  for (const year of objectKeys(index)) {
    index[year].sort((a, b) => a.month - b.month);
    for (const entry of index[year]) {
      entry.posts.sort((a, b) => compareDate(a.published, b.published, "desc"));
    }
  }

  return index;
};

interface YearAndMonth {
  year: Year;
  month: Month;
}

const appendPostToIndex = (
  index: PublishedIndex,
  post: PublishedPost,
): void => {
  const { year, month } = getYearAndMonth(post.published);

  const yearEntry = (index[year] ??= []);
  let monthEntry = yearEntry.find((m) => m.month === month);
  if (!monthEntry) {
    monthEntry = createMonthEntry(month);
    yearEntry.push(monthEntry);
  }
  monthEntry.posts.push(post);
};

const getYearAndMonth = (date: Date): YearAndMonth => ({
  year: String(date.getFullYear()),
  month: date.getMonth() + 1,
});

const createMonthEntry = (month: Month): MonthEntry => ({
  month,
  posts: [],
});

const normalize = (post: Post): PublishedPost => ({
  id: post.id,
  published: post.data.published,
});
