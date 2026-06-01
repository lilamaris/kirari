import type { Loader } from "astro/loaders";
import getReadingTime from "reading-time";
import { globLoader } from "./glob-loader";
import type { Post } from "@/types";
import { postsBasePath } from "@/consts";
import { compareDate } from "../utils";

export const postLoader = (): Loader => {
  const base = normalizePath(postsBasePath);

  return globLoader(
    {
      pattern: "**/*.{md,mdx}",
      base,
    },
    async (context) => {
      const posts = context.store.values() as Post[];

      for (const post of posts) {
        const filePath = post.filePath;

        if (!filePath) throw new Error(`filePath undefined. id=${post.id}`);
        post.data.title = getPostTitle(post, filePath);
        post.data.contentPath = normalizePath(filePath).slice(base.length);
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

const getPostTitle = (post: Post, filePath: string): string => {
  const title = post.data.title?.trim();
  return title ? title : getTitleFromFilePath(filePath);
};

const getTitleFromFilePath = (filePath: string): string => {
  const fileName = normalizePath(filePath).split("/").pop() ?? filePath;
  return fileName.replace(/\.(md|mdx)$/i, "").trim();
};

const comparePost = (a: Post, b: Post): number => {
  const publishedAtCompare = compareDate(
    a.data.published,
    b.data.published,
    "desc",
  );

  return publishedAtCompare !== 0
    ? publishedAtCompare
    : a.id.localeCompare(b.id);
};

const normalizePath = (path: string) => path.replaceAll("\\", "/");
