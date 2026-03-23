# Kirari

`Kirari`는 Astro 기반 블로그 템플릿입니다.  
사이트 정보, 테마 값, 레이아웃 폭 같은 핵심 커스터마이징 포인트를 [`src/consts.ts`](src/consts.ts)에 모아두어, 컴포넌트 내부를 깊게 수정하지 않고도 빠르게 블로그를 자신의 스타일에 맞출 수 있도록 구성했습니다.

## 특징

- [`src/consts.ts`](src/consts.ts)에서 사이트/테마/레이아웃 설정을 중앙 관리
- Markdown/MDX 기반 포스트 작성
- Astro Content Collections 기반 포스트 로딩
- 글 읽기 시간, 이전 글/다음 글, 시리즈 값 자동 계산
- `/blog`, `/about`, `/index` 아카이브 페이지 자동 생성
- 연도, 카테고리, 태그, 시리즈 기준 인덱스 페이지 제공
- RSS, sitemap, robots.txt, web manifest 생성
- 목차(Table of Contents), 페이지 전환, 테마 전환용 UI 포함

## 기술 스택

- Astro 5
- Svelte 5
- Tailwind CSS 4
- Astro Content Collections
- Iconify
- Swup

## 빠른 시작

```bash
pnpm install
pnpm dev
```

기본 개발 서버는 `http://localhost:4321`에서 실행됩니다.

### 사용 가능한 명령어

| Command | Description |
| :-- | :-- |
| `pnpm dev` | 개발 서버 실행 |
| `pnpm build` | 프로덕션 빌드 생성 |
| `pnpm preview` | 빌드 결과 로컬 미리보기 |
| `pnpm astro ...` | Astro CLI 실행 |

## 프로젝트 구조

```text
.
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── content/
│   │   └── posts/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── consts.ts
│   ├── content.config.ts
│   └── types.ts
├── docker/
├── scripts/
└── package.json
```

핵심 커스터마이징 지점은 아래 파일들입니다.

- [`src/consts.ts`](src/consts.ts): 사이트 정보, 테마, 레이아웃, 네비게이션, 소셜 링크
- [`src/content.config.ts`](src/content.config.ts): 포스트 frontmatter 스키마
- [`src/pages`](src/pages): 라우팅 구조
- `src/content/posts`: 블로그 글 위치

## 커스터마이징

### 1. 사이트 기본 정보

[`siteConfig`](src/consts.ts)는 사이트 메타데이터와 작성자 정보를 정의합니다.

```ts
export const siteConfig = {
  title: "Kirari",
  description: "kirari astro blog",
  authorName: "lilamaris",
  authorComment: "haaiii",
  lang: "en",
  siteUrl: "",
  email: "",
};
```

- `title`: 사이트 이름
- `description`: 기본 SEO 설명
- `authorName`: 작성자 이름
- `authorComment`: 프로필 카드에 노출되는 한 줄 소개
- `lang`: HTML `lang` 값
- `siteUrl`: 배포 URL
- `email`: 연락처 메일

`siteUrl`은 canonical URL, Open Graph 이미지 URL, RSS, sitemap, robots.txt 생성에 사용됩니다.  
배포 시에는 `siteConfig.siteUrl` 또는 `PUBLIC_SITE_URL` 환경 변수를 반드시 설정하는 것을 권장합니다.

```bash
PUBLIC_SITE_URL=https://example.com pnpm build
```

### 2. 테마 설정

[`themeConfig`](src/consts.ts)는 색상, 포스트 노출 개수, 대표 이미지 같은 시각 설정을 관리합니다.

```ts
export const themeConfig = {
  initialHue: 200,
  initialTheme: "system",
  thumbnailOption: "static",
  enableBanner: true,
  enableHueControl: true,
  enableThemeControl: true,
  recentPostCount: 3,
  postPerPage: 4,
  siteIconUrl: demoIcon,
  avatarImgUrl: demoProfile,
  bannerImgUrl: demoBanner,
  thumbnailFallbackImgUrl: demoThumbnail,
};
```

- `initialHue`: 기본 강조색 Hue 값
- `initialTheme`: 초기 테마 (`light`, `dark`, `system`)
- `recentPostCount`: 메인 페이지 최근 글 개수
- `postPerPage`: `/blog` 페이지네이션 크기
- `siteIconUrl`: 네비게이션/메타 아이콘
- `avatarImgUrl`: 프로필 이미지
- `bannerImgUrl`: 상단 배너 이미지
- `thumbnailFallbackImgUrl`: 포스트 대표 이미지가 없을 때 사용할 기본 썸네일

`thumbnailOption`, `enableBanner`, `enableHueControl`, `enableThemeControl` 같은 필드도 설정 객체에 포함되어 있습니다. 현재 프로젝트를 확장할 때 제어 플래그로 활용하기 좋으며, 사용 전에는 해당 값이 실제 UI 분기에 연결되어 있는지 함께 확인하는 편이 안전합니다.

### 3. 레이아웃 설정

[`layoutConfig`](src/consts.ts)는 전체 페이지 비율과 간격을 조정합니다.

```ts
export const layoutConfig = {
  bannerHeight: 40,
  bannerExtend: 10,
  navigationHeight: 3,
  contentWidth: 45,
  asideWidth: 16,
  layoutGap: 0.5,
};
```

- `bannerHeight`: 상단 배너 높이
- `bannerExtend`: 홈 화면에서 추가로 확장되는 배너 높이
- `navigationHeight`: 네비게이션 바 높이
- `contentWidth`: 본문 영역 너비
- `asideWidth`: 좌우 사이드 영역 너비
- `layoutGap`: 컬럼 간 간격

이 값들은 레이아웃 전체 폭과 sticky aside 위치 계산에 직접 사용됩니다.

### 4. 라우트와 소셜 링크

[`routes`](src/consts.ts)와 [`socials`](src/consts.ts)를 수정하면 네비게이션 메뉴와 외부 링크 영역을 함께 관리할 수 있습니다.

## 포스트 작성

포스트는 `src/content/posts`에 `md` 또는 `mdx` 파일로 추가합니다.

예시:

```text
src/content/posts/
├── hello-world.md
├── astro/first-post.md
└── astro/second-post.mdx
```

### frontmatter 규격

[`src/content.config.ts`](src/content.config.ts)의 스키마 기준 frontmatter는 다음 형태를 따릅니다.

```md
---
title: Hello World
description: 첫 글입니다.
published: 2026-03-23
categories: dev
tags:
  - astro
  - blog
draft: false
image: ../../assets/demo-banner.jpg
---
```

지원 필드:

- `title`: 글 제목
- `description`: 글 요약
- `published`: 발행일
- `categories`: 카테고리 문자열
- `tags`: 태그 배열
- `draft`: `true`이면 목록/페이지/피드에서 제외
- `image`: 포스트 대표 이미지

자동 계산되는 값:

- `minutes`: 읽기 시간
- `newerPostRef`, `olderPostRef`: 이전/다음 글 연결
- `series`: 폴더 이름 기준 자동 계산

예를 들어 `src/content/posts/astro/first-post.md`처럼 작성하면 `series`는 `astro`로 계산되고, 루트에 작성하면 `standalone`으로 처리됩니다.

## 생성되는 페이지

- `/`: 홈
- `/blog`: 블로그 목록
- `/blog/:page`: 페이지네이션 목록
- `/blog/:id`: 포스트 상세
- `/about`: 소개 페이지
- `/index`: 아카이브 메인
- `/index/publishedYear`, `/index/categories`, `/index/tags`, `/index/series`: 축별 인덱스
- `/index/:type/:name`: 그룹 상세 아카이브
- `/rss.xml`: RSS 피드
- `/sitemap.xml`: 사이트맵
- `/robots.txt`: robots 정책
- `/manifest.webmanifest`: 웹 앱 매니페스트

## SEO와 배포 시 참고사항

- 배포 주소가 없으면 canonical URL과 절대 URL 기반 메타가 일부 비어 있을 수 있습니다.
- RSS, sitemap, robots.txt 품질을 위해 `PUBLIC_SITE_URL` 또는 `siteConfig.siteUrl`을 설정하는 편이 좋습니다.
- 포스트 대표 이미지가 없으면 기본 썸네일이 Open Graph 이미지 후보로 사용됩니다.
- 빌드 결과물은 `dist/`에 생성됩니다.

## 다음 작업 제안

README 작성 후 보통 바로 이어서 하는 작업은 아래 정도입니다.

1. [`src/consts.ts`](src/consts.ts)의 기본 문구와 데모 이미지를 실제 브랜드 값으로 교체
2. `src/content/posts`에 샘플 포스트 1~2개 추가
3. `PUBLIC_SITE_URL`을 설정한 상태로 `pnpm build` 실행
