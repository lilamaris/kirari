import { type MarkdownInstance } from "astro";
import { glob, type Loader } from "astro/loaders";
import type { CollectionEntry } from "astro:content";

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

const sortByPublished = (
  a: CollectionEntry<"posts">,
  b: CollectionEntry<"posts">,
): number => {
  const compare = b.data.published.getTime() - a.data.published.getTime();
  return compare !== 0 ? compare : a.id.localeCompare(b.id);
};

const groupBy = <T extends Record<string, any>>(arr: T[], key: keyof T) => {
  const m = new Map<string, T[]>();
  for (const item of arr) {
    const values: string[] = Array.isArray(item[key]) ? item[key] : [item[key]];
    for (const v of values) m.set(v, [...(m.get(v) ?? []), item]);
  }
  return [...m.entries()];
};

export const postWithAdjacentLinkLoader = (): Loader => {
  return globWithLoader(
    {
      pattern: "**/*.{md,mdx}",
      base: "./src/content/posts",
    },
    async (context) => {
      const all = context.store.values() as CollectionEntry<"posts">[];
      const sorted = all.filter((e) => !e.data.draft).sort(sortByPublished);

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

export const postIndexLoader: Loader = {
  name: "post-index",
  load: async ({ store, parseData }) => {
    const module = import.meta.glob<
      MarkdownInstance<CollectionEntry<"posts">["data"]>
    >("../content/posts/**/*.{md,mdx}", {
      eager: true,
    });

    const posts = Object.entries(module).map(([k, v]) => {
      const newKey = k.replace(/^\.\.\/content\/posts\//, "");
      const split = newKey.split("/");
      return {
        id: newKey,
        series: split.length > 1 ? split[0] : "standalone",
        ...v.frontmatter,
      };
    });

    const visible = posts.filter((e) => !e.draft);

    type AvailableKeys = keyof (typeof visible)[number];
    const groupKey: AvailableKeys[] = ["tags", "categories", "series"];

    for (const key of groupKey) {
      const groups = groupBy(visible, key).map(([k, v]) => ({
        id: `${key}/${k}`,
        name: k,
        count: v.length,
        items: v.map((v) => v.id),
      }));

      for (const group of groups) {
        const { id, ...d } = group;
        const data = await parseData({
          id,
          data: d,
        });

        store.set({
          id,
          data,
        });
      }
    }
  },
};
