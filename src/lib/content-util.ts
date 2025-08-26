import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

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

// NOTE: Return all tags as key-value record data.
// key is canonical id of tag
// value is array of object that conform to the Tag interface.
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
  return result;
};

// NOTE: Return all series in key value data
// key is canonical id of series
// value is an array of the posts included in it's series.
export const getAllSeries = async (): Promise<Record<string, Series>> => {
  const rawSortedPosts = await getSortedPosts();
};
