import type { Post } from "@/types";
import { getCollection } from "astro:content";

export type CategoryName = string;
export interface CategoryNode {
  name: CategoryName;
  categories: CategoryName[];
  depth: number;
  children: Record<CategoryName, CategoryNode>;
  directPostRefs: CategorizedPost[];
  directPostCount: number;
  subtreePostCount: number;
}

export interface CategorizedPost {
  id: string;
  categories: CategoryName[];
}

export interface CategoryTree {
  root: CategoryNode;
}

let _cache: CategoryTree | undefined;

export const getCategoryIndex = async (): Promise<CategoryTree> => {
  if (_cache) return _cache;
  const posts = await getCollection("posts");
  _cache = buildCategoryTree(posts);
  return _cache;
};

export const getFlatten = (node: CategoryNode): CategoryNode[] => {
  const result: CategoryNode[] = [node];
  for (const child of Object.values(node.children)) {
    result.push(...getFlatten(child));
  }
  return result;
};

const buildCategoryTree = (posts: Post[]): CategoryTree => {
  const root = createNode("All", ["/"], 0);

  for (const post of posts) {
    const categorizedPost = categorize(post);
    appendPostToTree(root, categorizedPost);
  }

  countPost(root);
  return { root };
};

const appendPostToTree = (root: CategoryNode, post: CategorizedPost): void => {
  let current = root;
  const segments: CategoryName[] = [];

  for (const category of post.categories) {
    segments.push(category);

    current.children[category] ??= createNode(
      category,
      segments,
      current.depth + 1,
    );

    current = current.children[category];
  }

  current.directPostRefs.push(post);
};

const countPost = (node: CategoryNode): number => {
  node.directPostCount = node.directPostRefs.length;
  let count = node.directPostCount;
  for (const child of Object.values(node.children)) {
    count += countPost(child);
  }
  node.subtreePostCount = count;
  return count;
};

const createNode = (
  name: CategoryName,
  categories: CategoryName[],
  depth: number,
) => ({
  name,
  categories,
  depth,
  children: {},
  directPostRefs: [],
  directPostCount: 0,
  subtreePostCount: 0,
});

const categorize = (post: Post): CategorizedPost => {
  const contentPath = post.data.contentPath;
  if (!contentPath)
    throw new Error(`post filePath must not be undefined. id=${post.id}`);

  const paths = getCategoriesFromFilePath(contentPath);

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
