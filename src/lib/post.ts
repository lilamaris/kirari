import { getCollection } from "astro:content";
import type { Post, PostEntry } from "@/types/post";
import path from "node:path";
import slugify from "slugify";

const p = path.posix;
const byPublished = (a: PostEntry, b: PostEntry): number => {
  const d = b.data.published.getTime() - a.data.published.getTime();
  return d !== 0 ? d : a.data.title.localeCompare(b.data.title);
};

const makeSlug = (title: string, series?: string): string => {
  const s = series ? `${series}_${title}` : title;
  return slugify(s);
};

export const getAllPosts = async (): Promise<Post[]> => {
  const entries = await getCollection("post", ({ data }) => !data.draft);
  const groups = new Map<string, PostEntry[]>();
  for (const e of entries) {
    const k = p.parse(e.id).dir;
    Boolean(k) && (groups.get(k) ?? groups.set(k, []).get(k)!).push(e);
  }

  const used = new Map<string, number>();
  const built: Post[] = [];

  for (const [group, arr] of groups) {
    const isSeries = arr.length > 1;

    const groupBuilt: Post[] = [];
    const sorted = arr.slice().sort(byPublished);
    for (const e of sorted) {
      const seriesName = isSeries ? group : undefined;
      let slug = makeSlug(e.data.title, seriesName);

      const seen = used.get(slug) ?? 0;
      if (seen > 0) {
        used.set(slug, seen + 1);
        slug = `${slug}-${seen + 1}`;
      }

      const post: Post = {
        ...e,
        data: {
          ...e.data,
          slug,
          isSeries,
          seriesName,
          prevPost: undefined,
          nextPost: undefined,
        },
      };

      groupBuilt.push(post);
      built.push(post);
    }

    for (let i = 0; i < groupBuilt.length; i++) {
      groupBuilt[i].data.prevPost = i > 0 ? groupBuilt[i - 1] : undefined;
      groupBuilt[i].data.nextPost =
        i < groupBuilt.length - 1 ? groupBuilt[i + 1] : undefined;
    }
  }

  built.sort(byPublished);

  return built;
};

export const getAllTags = async () => {
  const posts = await getAllPosts();
  const tags = new Set<string>();
  posts.forEach((post) => post.data.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
};

export const getAllCategories = async () => {
  const posts = await getAllPosts();
  const categories = new Set<string>();
  posts.forEach((post) => categories.add(post.data.category));
  return Array.from(categories).sort((a, b) => a.localeCompare(b));
};
