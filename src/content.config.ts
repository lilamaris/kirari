import { z, defineCollection } from "astro:content";
import { postIndexLoader, postWithAdjacentLinkLoader } from "./lib/loader";

const postIndex = defineCollection({
  loader: postIndexLoader,
  schema: () =>
    z.object({
      type: z.string(),
      name: z.string(),
      count: z.number(),
      items: z.array(z.string()).default([]),
    }),
});

const posts = defineCollection({
  loader: postWithAdjacentLinkLoader(),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      categories: z.string(),
      published: z.coerce.date(),
      draft: z.boolean().default(false),
      image: image().optional(),
      series: z.string().optional(),
      newerPostRef: z.string().optional(),
      olderPostRef: z.string().optional(),
    }),
});

export const collections = { posts, postIndex };
