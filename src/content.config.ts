import { z, defineCollection } from "astro:content";
import { indexLoader } from "./lib/loader/index-loader";
import { postLoader } from "./lib/loader/post-loader";

const postIndex = defineCollection({
  loader: indexLoader,
  schema: () =>
    z.object({
      type: z.string(),
      name: z.string(),
      count: z.number(),
      items: z.array(z.string()).default([]),
    }),
});

const posts = defineCollection({
  loader: postLoader(),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      tags: z.array(z.string()).default([]),
      categories: z.array(z.string()).default([]),
      published: z.coerce.date(),
      draft: z.boolean().default(false),
      image: image().optional(),
      minutes: z.number().optional(),
      series: z.string().optional(),
      newerPostRef: z.string().optional(),
      olderPostRef: z.string().optional(),
    }),
});

export const collections = { posts, postIndex };
