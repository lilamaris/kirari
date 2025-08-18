import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const post = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
      category: z.string().default("general"),
      published: z.coerce.date(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { post };
