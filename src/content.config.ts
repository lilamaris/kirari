import { z, defineCollection } from "astro:content";
import { postLoader } from "./lib/loader/post-loader";

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
      newerPostRef: z.string().optional(),
      olderPostRef: z.string().optional(),
    }),
});

export const collections = { posts };
