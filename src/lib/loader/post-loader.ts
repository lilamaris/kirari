import type { Loader } from "astro/loaders";
import getReadingTime from "reading-time";
import { globLoader } from "./glob-loader";
import type { Post } from "@/types";

export const postLoader = (): Loader => {
  return globLoader(
    {
      pattern: "**/*.{md,mdx}",
      base: "./src/content/posts",
    },
    async (context) => {
      const all = context.store.values() as Post[];
      const getReadTimeMinute = (body: string) =>
        Math.max(1, Math.round(getReadingTime(body).minutes));

      // 포스트별 추가 데이터 추출
      for (const post of all) {
        post.data.series = extractSeries(post.id);
        post.data.minutes = getReadTimeMinute(post.body ?? "");
      }

      // 인접 포스트 참조 설정
      const sorted = normalizePosts(all);
      for (const [index, post] of sorted.entries()) {
        if (index > 0) {
          post.data.newerPostRef = sorted[index - 1].id;
        }
        if (index < sorted.length - 1) {
          post.data.olderPostRef = sorted[index + 1].id;
        }
      }
    },
  );
};

const extractSeries = (id: string): string => {
  const parts = id.split("/");
  return parts.length > 1 ? parts[0] : "standalone";
};

export const normalizePosts = <
  T extends { data: { published: Date; draft: boolean; title: string } },
>(
  posts: T[],
): T[] =>
  posts
    .filter((e) => !e.data.draft)
    .sort((a, b) => {
      const compare =
        +new Date(b.data.published ?? 0) - +new Date(a.data.published ?? 0);
      return compare !== 0
        ? compare
        : (a.data.title ?? a.id).localeCompare(b.data.title ?? b.id);
    });
