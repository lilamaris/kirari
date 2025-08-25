import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { postSchema } from "./lib/content-util";

const post = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
  schema: postSchema,
});

export const collections = { post };
