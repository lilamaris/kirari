/**
 * 카테고리 트리 빌드 유틸리티
 *
 * flat category 문자열 배열을 재귀 트리 구조로 변환하고,
 * 각 노드에 하위 포스트 ID 목록을 채운다.
 *
 * 예: ["dev/backend", "dev/frontend", "dev/backend/runtime", "thoughts"]
 *   → {
 *       "dev":          { name: "dev",          children: ["dev/backend", "dev/frontend"], postIds: [p1, p2, p3] },
 *       "dev/backend":  { name: "dev/backend",  children: ["dev/backend/runtime"],         postIds: [p1, p3] },
 *       "dev/frontend": { name: "dev/frontend", children: [],                             postIds: [p2] },
 *       "dev/backend/runtime": { name: "dev/backend/runtime", children: [], postIds: [p3] },
 *       "thoughts":   { name: "thoughts",       children: [],                             postIds: [p4] }
 *     }
 */

export interface CategoryNode {
  name: string;
  children: string[];
  postIds: string[];
}

export type CategoryTree = Record<string, CategoryNode>;

function makeNode(name: string): CategoryNode {
  return { name, children: [], postIds: [] };
}

/**
 * flat category-포스트ID 쌍을 트리 구조로 변환
 *
 * @param entries - [categoryPath, postId] 쌍의 배열
 * @returns 모든 레벨의 카테고리 노드를 포함하는 트리
 */
export function buildCategoryTree(
  entries: [categoryPath: string, postId: string][],
): CategoryTree {
  const tree: CategoryTree = {} as CategoryTree;

  // 1단계: 모든 카테고리 경로 수집
  const allPaths = new Set<string>();
  for (const [path] of entries) {
    const parts = path.split("/");
    for (let i = 0; i < parts.length; i++) {
      allPaths.add(parts.slice(0, i + 1).join("/"));
    }
  }

  // 2단계: 모든 경로에 대해 노드 생성 + 자식 관계 설정
  for (const path of allPaths) {
    const parts = path.split("/");

    // 현재 노드 생성 (이미 있으면 skip)
    if (!(path in tree)) {
      tree[path] = makeNode(path);
    }

    // 부모 노드 찾기
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join("/");
      if (!(parentPath in tree)) {
        tree[parentPath] = makeNode(parentPath);
      }
      const parent = tree[parentPath]!;
      // 전체 경로를 children에 저장 (lookup에 사용)
      if (!parent.children.includes(path)) {
        parent.children.push(path);
      }
    }
  }

  // 3단계: 각 노드에 포스트 ID 수집 (하위 → 상위)
  function collectPostIds(node: CategoryNode): void {
    // 현재 경로의 직접 포스트 ID 추가
    for (const [path, postId] of entries) {
      if (path === node.name) {
        if (!node.postIds.includes(postId)) {
          node.postIds.push(postId);
        }
      }
    }

    // 자식 노드 처리
    for (const childPath of node.children) {
      const childNode = tree[childPath];
      if (childNode) {
        collectPostIds(childNode);
        for (const pid of childNode.postIds) {
          if (!node.postIds.includes(pid)) {
            node.postIds.push(pid);
          }
        }
      }
    }
  }

  // 4단계: 루트 노드들부터 수집 시작
  const allNodeKeys = new Set(Object.keys(tree));
  const childKeys = new Set(
    Object.values(tree).flatMap((n) => n.children),
  );
  const rootKeys = [...allNodeKeys].filter((k) => !childKeys.has(k));

  for (const key of rootKeys) {
    collectPostIds(tree[key]!);
  }

  return tree;
}