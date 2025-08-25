import type { CollectionEntry, SchemaContext } from "astro:content";
import { z, getCollection } from "astro:content";

// content.config.ts import this schema
export const postSchema = ({ image }: SchemaContext) =>
  z.object({
    title: z.string(),
    slug: z.string(),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default("general"),
    published: z.coerce.date(),
    draft: z.boolean().default(false),
    image: image().optional(),

    // NOTE: Refer to post located before and after the relevant post
    // Use this field as an ID to retrieve data from collection using 'getEntry' in 'astro:content'
    previousPostSlug: z.string().optional(),
    nextPostSlug: z.string().optional(),
  });

export type Post = CollectionEntry<"post">;

export interface Tag {
  label: string;
  count: number;
}

const sortByPublished = (a: Post, b: Post): number => {
  const compare = b.data.published.getTime() - a.data.published.getTime();
  return compare !== 0 ? compare : a.id.localeCompare(b.id);
};

// NOTE: Return all of post collection.
// This function loads the raw markdown according to the post import path defined in content.config.ts.
export const getSortedPosts = async (): Promise<Post[]> => {
  const posts = await getCollection(
    "post",
    ({ data }) => !data.draft && data.published,
  );

  posts.sort(sortByPublished);

  for (const [index, _post] of posts.entries()) {
    if (index > 0) {
      const nextPostSlug = posts[index - 1].data.slug;
      posts[index].data.nextPostSlug = nextPostSlug;
    }
    if (index < posts.length - 1) {
      const previousPostSlug = posts[index + 1].data.slug;
      posts[index].data.previousPostSlug = previousPostSlug;
    }
  }

  return posts;
};

// NOTE: Return post data grouped by series
// This function reference series field in the frontmatter of markdown during grouping
// Posts without series field are included in an array with the key "single".
export const getPostsGroupBySeries = async (): Promise<
  Record<string, Post[]>
> => {
  const rawSortedPosts = await getSortedPosts();

  const result: Record<string, Post[]> = {};

  for (const post of rawSortedPosts) {
    const postSeries = post.data.series ?? "single";
    if (!result[postSeries]) {
      result[postSeries] = [];
    }

    result[postSeries].push(post);
  }

  // NOTE: Set previous/next post references for posts in a series with posts within the series.
  for (const [_seriesName, posts] of Object.entries(result).filter(
    ([seriesName, _]) => seriesName !== "single",
  )) {
    for (const [index, _post] of posts.entries()) {
      if (index > 0) {
        const nextPostSlug = posts[index - 1].data.slug;
        posts[index].data.nextPostSlug = nextPostSlug;
      }
      if (index < posts.length - 1) {
        const previousPostSlug = posts[index + 1].data.slug;
        posts[index].data.previousPostSlug = previousPostSlug;
      }
    }
  }

  return result;
};

// NOTE: Return all tags
export const getAllTags = async (): Promise<Record<string, Tag>> => {
  const rawSortedPosts = await getSortedPosts();

  const tagExistsMap = new Map<string, number>();
  for (const post of rawSortedPosts) {
    const postTags = post.data.tags.map((tag) => tag.toLowerCase());
    postTags.forEach((tag) =>
      tagExistsMap.set(tag, (tagExistsMap.get(tag) ?? 0) + 1),
    );
  }

  const result: Record<string, Tag> = {};
  for (const [tagName, count] of tagExistsMap.entries()) {
    const label = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    const tag: Tag = { label, count };

    result[tagName] = tag;
  }

  console.log(result);
  return result;
};
