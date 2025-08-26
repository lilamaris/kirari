import { glob } from "astro/loaders";
import { z, defineCollection } from "astro:content";

const post = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      series: z.string().optional(),
      seriesOrder: z.number().optional(),
      tags: z.array(z.string()).default([]),
      published: z.coerce.date(),
      draft: z.boolean().default(false),
      image: image().optional(),

      // NOTE: Refer to post located before and after the relevant post
      // Use this field as an ID to retrieve data from collection using 'getEntry' in 'astro:content'
      previousPostSlug: z.string().optional(),
      nextPostSlug: z.string().optional(),
    }),
});

export const collections = { post };
