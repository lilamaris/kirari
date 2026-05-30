import type { Post } from "@/types";
import { getCollection } from "astro:content";

export type CategoryName = string;
export interface CategoryNode {
  name: CategoryName;
  categories: CategoryName[];
  children: Record<CategoryName, CategoryNode>;
  directPostRefs: CategorizedPost[];
}

export interface CategorizedPost {
  id: string;
  categories: CategoryName[];
}

export interface CategoryTree {
  root: CategoryNode;
}

export const getCategoryTree = async (): Promise<CategoryTree> => {
  const posts = await getCollection("posts");
  return buildCategoryTree(posts);
};

export const buildCategoryTree = (posts: Post[]): CategoryTree => {
  const root = createNode("", ["/"]);

  for (const post of posts) {
    const categorizedPost = categorize(post);
    appendPostToTree(root, categorizedPost);
  }
  return { root };
};

const appendPostToTree = (root: CategoryNode, post: CategorizedPost): void => {
  let current = root;
  const segments: CategoryName[] = [];

  for (const category of post.categories) {
    segments.push(category);

    current.children[category] ??= createNode(category, segments);

    current = current.children[category];
  }

  current.directPostRefs.push(post);
};

const createNode = (name: CategoryName, categories: CategoryName[]) => ({
  name,
  categories,
  children: {},
  directPostRefs: [],
});

const categorize = (post: Post): CategorizedPost => {
  const contentPath = post.data.contentPath;
  if (!contentPath)
    throw Error(`post filePath must not be undefined. id=${post.id}`);

  var paths = getCategoriesFromFilePath(contentPath);

  return {
    id: post.id,
    categories: paths.slice(0, -1),
  };
};

const getCategoriesFromFilePath = (filePath: string): CategoryName[] => {
  return filePath
    .split("/")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};
