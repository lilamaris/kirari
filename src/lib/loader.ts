import { type MarkdownInstance } from "astro";
import { glob, type Loader } from "astro/loaders";
import type { Post } from "@/types";

const globWithLoader = (
  options: Parameters<typeof glob>[0],
  loader: Loader["load"],
): Loader => {
  const base = glob(options);
  const baseLoad = base.load;

  return {
    name: "glob-with-loader",
    load: async (context) => {
      await baseLoad(context);
      await loader(context);
    },
  };
};

export const postWithAdjacentLinkLoader = (): Loader => {
  return globWithLoader(
    {
      pattern: "**/*.{md,mdx}",
      base: "./src/content/posts",
    },
    async (context) => {
      const all = context.store.values() as Post[];
      const sorted = all
        .filter((e) => !e.data.draft)
        .sort((a, b) => {
          const compare =
            +new Date(b.data.published ?? 0) - +new Date(a.data.published);
          return compare !== 0
            ? compare
            : (a.data.title ?? a.id).localeCompare(b.data.title ?? b.id);
        });

      for (const [index, post] of sorted.entries()) {
        const parts = post.id.split("/");
        const series = parts.length > 1 ? parts[0] : "standalone";
        post.data.series = series;
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

export const postIndexLoader: Loader = {
  name: "post-index",
  load: async ({ store, parseData }) => {
    const module = import.meta.glob<MarkdownInstance<Post["data"]>>(
      "../content/posts/**/*.{md,mdx}",
      {
        eager: true,
      },
    );
    const toArray = (v: unknown): string[] =>
      Array.isArray(v) ? v.filter(Boolean) : v == null ? [] : [String(v)];

    const toId = (id: string) =>
      id.replace(/^\.\.\/content\/posts\//, "").replace(/\.(md|mdx)$/i, "");

    const posts = Object.entries(module).map(([k, v]) => {
      const id = toId(k);
      const parts = id.split("/");
      const series = parts.length > 1 ? parts[0] : "standalone";

      return {
        id,
        title: v.frontmatter.title,
        published: v.frontmatter.published,
        draft: v.frontmatter.draft,
        tags: toArray(v.frontmatter.tags),
        categories: toArray(v.frontmatter.categories),
        series,
      };
    });

    const visible = posts
      .filter((e) => !e.draft)
      .sort((a, b) => {
        const compare =
          +new Date(b.published ?? 0) - +new Date(a.published ?? 0);
        return compare !== 0
          ? compare
          : (a.title ?? a.id).localeCompare(b.title ?? b.id);
      });

    const indexKeys = ["tags", "categories", "series"] as const;
    type IndexKey = (typeof indexKeys)[number];

    type IndexBucket = Map<string, { name: string; items: string[] }>;
    const buckets: Record<IndexKey, IndexBucket> = {
      tags: new Map(),
      categories: new Map(),
      series: new Map(),
    };

    for (const post of visible) {
      for (const key of indexKeys) {
        const values = key == "series" ? [post.series] : post[key];

        for (const raw of values) {
          const id = `${key}/${raw}`;
          const bucket = buckets[key];
          const rec = bucket.get(id) ?? { name: raw, items: [] };
          rec.items.push(post.id);
          bucket.set(id, rec);
        }
      }
    }

    await Promise.all(
      indexKeys.flatMap((key) =>
        [...buckets[key].entries()].map(async ([id, { name, items }]) => {
          const unique = [...new Set(items)];
          const data = await parseData({
            id,
            data: {
              name,
              count: unique.length,
              itmes: unique,
            },
          });
          store.set({ id, data });
        }),
      ),
    );
  },
};
