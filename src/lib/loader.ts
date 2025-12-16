import { type MarkdownInstance } from "astro";
import { glob, type Loader } from "astro/loaders";
import { type IndexEnum, type Post } from "@/types";
import { indexType } from "@/consts";
import { objectKeys, objectValues } from "./utils";

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
        publishedYear: new Date(v.frontmatter.published)
          .getFullYear()
          .toString(),
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

    type IndexBucket = Map<
      string,
      { type: string; name: string; items: string[] }
    >;
    const buckets: Record<IndexEnum, IndexBucket> = {
      publishedYear: new Map(),
      tags: new Map(),
      categories: new Map(),
      series: new Map(),
    };

    for (const post of visible) {
      for (const key of objectValues(indexType)) {
        const values: string[] = Array.isArray(post[key])
          ? post[key]
          : [post[key]];

        for (const raw of values) {
          const id = `${key}/${raw}`;
          const bucket = buckets[key];
          const rec = bucket.get(id) ?? { type: key, name: raw, items: [] };
          rec.items.push(post.id);
          bucket.set(id, rec);
        }
      }
    }

    await Promise.all(
      objectValues(indexType).flatMap((key) =>
        [...buckets[key].entries()].map(async ([id, { type, name, items }]) => {
          const unique = [...new Set(items)];
          const data = await parseData({
            id,
            data: {
              name,
              type,
              count: unique.length,
              items: unique,
            },
          });

          store.set({ id, data });
        }),
      ),
    );
  },
};
