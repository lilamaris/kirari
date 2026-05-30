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
      const posts = context.store.values() as Post[];

      for (const post of posts) {
        console.log(post.id);
        post.data.minutes = Math.max(
          1,
          Math.floor(getReadingTime(post.body ?? "").minutes),
        );
      }

      const sorted = posts.sort((a, b) => comparePost(a, b));
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

const comparePost = (a: Post, b: Post): number => {
  const publishedAtCompare =
    +new Date(b.data.published ?? 0) - +new Date(a.data.published ?? 0);
  return publishedAtCompare !== 0
    ? publishedAtCompare
    : a.id.localeCompare(b.id);
};
