import { type MarkdownInstance } from "astro";
import { type Loader } from "astro/loaders";
import getReadingTime from "reading-time";
import { type IndexEnum, type Post } from "@/types";
import { indexType } from "@/consts";
import { objectValues, toArray } from "../utils";
import { buildCategoryTree } from "./category-tree";
import { globWithLoader } from "./glob-loader";

// ── 공통 유틸리티 ──────────────────────────────────────────────

/** 포스트 ID 경로에서 파일 ID 추출 */
const toId = (id: string) =>
  id.replace(/.*\/content\/posts\//, "").replace(/\.(md|mdx)$/i, "");

/** series 추출: 경로가 여러 segment면 첫 segment, 아니면 "standalone" */
const extractSeries = (id: string): string => {
  const parts = id.split("/");
  return parts.length > 1 ? parts[0] : "standalone";
};

/** Post[]용: draft 제외 + published 내림차순 정렬 */
const normalizePosts = <
  T extends { data: { published: Date; draft: boolean; title: string } },
>(
  posts: T[],
): T[] =>
  posts
    .filter((e) => !e.data.draft)
    .sort((a, b) => {
      const compare =
        +new Date(b.data.published ?? 0) - +new Date(a.data.published ?? 0);
      return compare !== 0
        ? compare
        : (a.data.title ?? a.id).localeCompare(b.data.title ?? b.id);
    });

// ── 포스트 로더 (인접 포스트 참조) ─────────────────────────────

export const postWithAdjacentLinkLoader = (): Loader => {
  return globWithLoader(
    {
      pattern: "**/*.{md,mdx}",
      base: "./src/content/posts",
    },
    async (context) => {
      const all = context.store.values() as Post[];
      const getReadTimeMinute = (body: string) =>
        Math.max(1, Math.round(getReadingTime(body).minutes));

      // 포스트별 추가 데이터 추출
      for (const post of all) {
        post.data.series = extractSeries(post.id);
        post.data.minutes = getReadTimeMinute(post.body ?? "");
      }

      // 인접 포스트 참조 설정
      const sorted = normalizePosts(all);
      for (const [index, post] of sorted.entries()) {
        if (index > 0) {
          post.data.newerPostRef = sorted[index - 1].id;
        }
        if (index < sorted.length - 1) {
          post.data.olderPostRef = sorted[index + 1].id;
        }
      }
    },
  );
};

// ── 인덱스 로더 ────────────────────────────────────────────────

/** 포스트 데이터 추출 결과 타입 */
interface RawPostData {
  id: string;
  title: string;
  published: Date;
  draft: boolean;
  tags: string[];
  categories: string[];
  series: string;
  publishedYear: string;
}

/** RawPostData[]용: draft 제외 + published 내림차순 정렬 */
const normalizeRawPosts = (posts: RawPostData[]): RawPostData[] =>
  posts
    .filter((e) => !e.draft)
    .sort((a, b) => {
      const compare = +new Date(b.published ?? 0) - +new Date(a.published ?? 0);
      return compare !== 0
        ? compare
        : (a.title ?? a.id).localeCompare(b.title ?? b.id);
    });

/** 포스트에서 인덱싱용 데이터 추출 */
const extractPostData = (
  module: Record<string, MarkdownInstance<Post["data"]>>,
): RawPostData[] =>
  Object.entries(module).map(([key, v]) => ({
    id: toId(key),
    title: v.frontmatter.title,
    published: v.frontmatter.published,
    publishedYear: new Date(v.frontmatter.published).getFullYear().toString(),
    draft: v.frontmatter.draft,
    tags: toArray(v.frontmatter.tags),
    categories: toArray(v.frontmatter.categories),
    series: extractSeries(toId(key)),
  }));

/** 인덱스 엔트리 생성 공통 타입 */
interface IndexEntry {
  id: string;
  data: { name: string; type: IndexEnum; count: number; items: string[] };
}

/** 버킷 기반 인덱스 생성 (tags, series, publishedYear) */
const buildBucketEntries = (
  posts: RawPostData[],
  indexKeys: IndexEnum[],
): IndexEntry[] => {
  const buckets = {
    publishedYear: new Map<string, { items: string[] }>(),
    categories: new Map<string, { items: string[] }>(),
    tags: new Map<string, { items: string[] }>(),
    series: new Map<string, { items: string[] }>(),
  };

  for (const post of posts) {
    for (const key of indexKeys) {
      let values: string[] = [];
      if (key === "tags") values = post.tags;
      else if (key === "series") values = [post.series];
      else if (key === "publishedYear") values = [post.publishedYear];

      for (const raw of values) {
        const id = `${key}/${raw}`;
        const rec = buckets[key].get(id) ?? { items: [] };
        rec.items.push(post.id);
        buckets[key].set(id, rec);
      }
    }
  }

  return indexKeys.flatMap((key) =>
    [...buckets[key].entries()].map(([id, { items }]) => ({
      id,
      data: {
        name: id.split("/").slice(1).join("/"),
        type: key,
        count: items.length,
        items,
      },
    })),
  );
};

/** 카테고리 트리 기반 인덱스 생성 */
const buildCategoryEntries = (posts: RawPostData[]): IndexEntry[] => {
  const categoryEntries: Array<[string, string]> = posts.flatMap((post) =>
    post.categories.map((cat) => [cat, post.id] as [string, string]),
  );

  const categoryTree = buildCategoryTree(categoryEntries);

  return Object.entries(categoryTree).map(([id, node]) => ({
    id: `${indexType.Categories}/${id}`,
    data: {
      name: node.name,
      type: indexType.Categories,
      count: node.postIds.length,
      items: node.postIds,
    },
  }));
};

export const postIndexLoader: Loader = {
  name: "post-index",
  load: async ({ store, parseData }) => {
    // 1. 포스트 스캔 & 데이터 추출
    const module = import.meta.glob<MarkdownInstance<Post["data"]>>(
      "../content/posts/**/*.{md,mdx}",
      { eager: true },
    );
    const allPosts = extractPostData(module);

    // 2. visible 포스트 정렬
    const visible = normalizeRawPosts(allPosts);

    // 3. 버킷 기반 인덱스 생성 (tags, series, publishedYear)
    const otherKeys: IndexEnum[] = objectValues(indexType).filter(
      (k) => k !== indexType.Categories,
    );
    const bucketEntries = buildBucketEntries(visible, otherKeys);

    // 4. 카테고리 트리 기반 인덱스 생성
    const categoryEntries = buildCategoryEntries(visible);

    // 5. store에 저장
    await Promise.all(
      [...categoryEntries, ...bucketEntries].map(async (entry) => {
        const data = await parseData({
          id: entry.id,
          data: entry.data,
        });
        store.set({ id: entry.id, data });
      }),
    );
  },
};
