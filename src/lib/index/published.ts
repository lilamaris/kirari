import type { Post } from "@/types";
import { getCollection } from "astro:content";
import { compareDate, objectKeys } from "../utils";

export type Year = string;
export type Month = number;

export interface PublishedPost {
  id: string;
  title: string;
  published: Date;
}

export interface YearEntry {
  months: MonthEntry[];
  totalPostCount: number;
}

export interface MonthEntry {
  month: number;
  monthName: string;
  posts: PublishedPost[];
  postCount: number;
}

export type PublishedIndex = Record<Year, YearEntry>;

let _cache: PublishedIndex | undefined;

export const getPublishedIndex = async (): Promise<PublishedIndex> => {
  if (_cache) return _cache;
  const posts = await getCollection("posts");
  _cache = buildPublishedIndex(posts);
  return _cache;
};

export const getIndexedYear = async (): Promise<Year[]> => {
  return objectKeys(await getPublishedIndex())
    .sort()
    .reverse();
};

const buildPublishedIndex = (posts: Post[]): PublishedIndex => {
  const index: PublishedIndex = {};

  for (const post of posts) {
    const normalizedPost = normalize(post);
    appendPostToIndex(index, normalizedPost);
  }

  for (const year of objectKeys(index)) {
    const yearEntry = index[year];
    yearEntry.months.sort((a, b) => a.month - b.month);

    let totalPostCount = 0;
    for (const month of yearEntry.months) {
      month.posts.sort((a, b) => compareDate(a.published, b.published, "desc"));
      month.postCount = month.posts.length;
      totalPostCount += month.postCount;
    }

    yearEntry.totalPostCount = totalPostCount;
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

  const yearEntry = (index[year] ??= createYearEntry());
  let monthEntry = yearEntry.months.find((entry) => entry.month == month);
  if (!monthEntry) {
    monthEntry = createMonthEntry(month);
    yearEntry.months.push(monthEntry);
  }
  monthEntry.posts.push(post);
};

const getYearAndMonth = (date: Date): YearAndMonth => ({
  year: String(date.getFullYear()),
  month: date.getMonth() + 1,
});

const createYearEntry = (): YearEntry => ({
  months: [],
  totalPostCount: 0,
});

const createMonthEntry = (month: Month): MonthEntry => ({
  month,
  monthName: getMonthName(month),
  posts: [],
  postCount: 0,
});

const normalize = (post: Post): PublishedPost => ({
  id: post.id,
  title: post.data.title,
  published: post.data.published,
});

const getMonthName = (month: Month): string =>
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][month - 1];
