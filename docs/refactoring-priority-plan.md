# Refactoring Priority Plan

작성일: 2026-03-05  
대상 프로젝트: `kirari`

## 목적
현재 코드베이스에서 다음 항목을 우선순위 기반으로 정리한다.
- 미사용 모듈/코드 제거
- 비효율 로직 개선
- 책임 분리를 통한 유지보수 인지 부하 감소

## 우선순위 기준
- 1단계(긴급): 빌드 안정성/실패 가능성, 사용자 영향 버그, 즉시 수정 가치가 큰 항목
- 2단계(중요): 성능/중복/구조적 부채로 유지보수 비용을 높이는 항목
- 3단계(개선): 가독성/일관성/위생성 개선 항목

## 1단계 (긴급)

### 1. 미사용 GitHub Calendar 기능으로 인한 빌드 리스크 제거
- 대상
  - `src/components/ui/GithubCalendar.svelte`
  - `src/pages/api/github-calendar.ts`
- 문제
  - `GithubCalendar` 컴포넌트는 현재 import/사용처가 없음.
  - 정적 빌드 시 API 라우트가 외부 네트워크(`api.github.com`) 호출에 의존하여 실패 로그 발생.
- 리팩토링 방향
  - 기능을 유지하지 않을 경우 컴포넌트와 API 라우트 제거.
  - 기능을 유지할 경우에도 빌드 타임 외부 호출 의존성을 없애고, 실패 시 graceful fallback을 명시.
- 완료 기준
  - `npm run build` 시 해당 API fetch 에러 로그가 사라짐.
  - GitHub Calendar 사용 여부가 코드와 문서에서 일관됨.

### 2. 명백한 오타/속성 결함 수정
- 대상
  - `src/components/common/Decorator.astro` (`stlye` 오타)
  - `src/components/index/TagList.astro` (`<spae>` 오타 태그)
- 문제
  - 스타일 전달 무시 및 마크업 품질 저하 가능성.
- 리팩토링 방향
  - `stlye` -> `style`, `<spae>` -> `<span>` 즉시 수정.
- 완료 기준
  - 컴포넌트 스타일 전달 정상 동작.
  - 오타 태그 제거 및 렌더링 결과 정상.

### 3. TOC 계산 버그 및 스크롤 과부하 완화
- 대상
  - `src/lib/table-of-contents.ts`
- 문제
  - 글로벌 오프셋 계산에서 `height`에 `scrollY`를 더하는 오류.
  - 스크롤 이벤트마다 `smooth` 스크롤 수행으로 잔떨림/성능 저하 가능.
- 리팩토링 방향
  - `height` 계산식 수정.
  - `requestAnimationFrame` 또는 throttle 적용.
  - 실제 위치가 크게 변할 때만 `scrollTo` 실행하도록 조건화.
- 완료 기준
  - 스크롤 시 TOC indicator 동작 안정화.
  - 불필요한 연속 스크롤 애니메이션 제거.

## 2단계 (중요)

### 1. 마크다운 렌더링 중복 제거 (읽기시간 계산 경로 단일화)
- 대상
  - `src/components/post/PostItem.astro`
  - `src/components/post/PostHeader.astro`
  - `src/pages/blog/[...id].astro`
  - `src/lib/loader.ts` 또는 콘텐츠 스키마 레이어
- 문제
  - `render(post)`가 목록/헤더/상세에서 중복 호출됨.
  - 읽기시간 조회 목적 대비 비용이 큼.
- 리팩토링 방향
  - 읽기시간(`minutes`)을 컬렉션 로딩 시점에 계산/주입.
  - 컴포넌트는 계산된 값을 props/data로만 소비.
- 완료 기준
  - `PostItem`, `PostHeader`에서 `render(post)` 제거.
  - 읽기시간 데이터 경로가 단일화됨.

### 2. 리스트 렌더링 중복 축소
- 대상
  - `src/components/post/PostList.astro`
  - `src/pages/blog/[...page].astro`
- 문제
  - 동일한 포스트 목록 매핑/링크 렌더링이 중복 구현됨.
- 리팩토링 방향
  - 페이지에서 `PostList` 재사용.
  - 페이징 관련 UI만 페이지에 남기고 리스트 렌더 책임은 컴포넌트로 통합.
- 완료 기준
  - 포스트 목록 렌더 로직이 한 곳에 집중됨.

### 3. 인덱스 컴포넌트 구조 통합
- 대상
  - `src/components/index/CategoryList.astro`
  - `src/components/index/TagList.astro`
- 문제
  - 데이터 타입만 다르고 구조가 유사해 변경 시 중복 수정 필요.
- 리팩토링 방향
  - 공통 `IndexList` 컴포넌트로 통합하고, title/링크 스타일만 옵션화.
- 완료 기준
  - 공통 로직 단일화.
  - 카테고리/태그 렌더링 방식이 설정 기반으로 분리됨.

### 4. 초기 테마/색상 기본값 일관성 확보
- 대상
  - `src/layouts/Base.astro`
  - `src/consts.ts`
- 문제
  - `Base.astro`의 localStorage fallback(`hue=250`, `theme=light`)과 `themeConfig` 기본값(`200`, `system`) 불일치.
- 리팩토링 방향
  - 초기화 스크립트의 fallback 값을 `themeConfig` 기준으로 통일.
- 완료 기준
  - 최초 방문 시 테마/색상 동작이 설정과 일치.

## 3단계 (개선)

### 1. 미사용 의존성/유틸 정리
- 대상 후보
  - 의존성: `@fontsource/maple-mono`, `slugify`, `remark-reading-time`(패키지)
  - 유틸/코드: `src/lib/utils.ts`의 `objectKeys`, `createUrl`, `src/lib/loader.ts`의 미사용 import
- 문제
  - 코드 탐색 시 노이즈 증가, 의도 파악 비용 상승.
- 리팩토링 방향
  - 참조 없는 항목 제거 전 최종 검색 검증.
  - 제거 시 변경 이유를 커밋 메시지/문서에 명시.
- 완료 기준
  - 미사용 항목 제거 후 빌드/동작 영향 없음.

### 2. 디버그/표현식 정리
- 대상
  - `src/lib/swup.js`의 `console.log`
  - 여러 컴포넌트의 `!!!expr` 표현
- 문제
  - 운영 로그 노이즈, 가독성 저하.
- 리팩토링 방향
  - 불필요 로그 제거.
  - `!!!expr`를 `!expr` 또는 명시적 불리언 변환으로 교체.
- 완료 기준
  - 콘솔 노이즈 제거 및 조건식 가독성 향상.

### 3. 문서/검증 체계 보강
- 대상
  - `README.md` (현재 Astro 기본 템플릿 내용 위주)
  - 타입/검증 도구 체계 (`astro check` 실행 기반)
- 문제
  - 프로젝트 특화 운영 가이드 부족.
- 리팩토링 방향
  - 실제 구조/실행/배포 기준으로 README 업데이트.
  - 정적 검사 루틴(예: `astro check`) 도입 가능한 상태로 정비.
- 완료 기준
  - 신규 유지보수자가 README만으로 로컬 실행 및 구조 파악 가능.

## 권장 실행 순서
1. 1단계 전체 수행 및 빌드 안정화
2. 2단계 성능/중복 개선으로 구조 단순화
3. 3단계 정리 작업으로 코드베이스 위생성 마무리

## 검증 체크리스트
- `npm run build` 성공
- 블로그 목록/상세/인덱스/TOC 동작 수동 확인
- 테마/색상 컨트롤러 초기값 및 전환 확인
- 제거된 모듈/유틸에 대한 참조 재검색(`rg`) 결과 0건 확인
