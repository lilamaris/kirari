#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/.tmp/articles-build"

ARTICLE_REPO_URL=""
ARTICLE_SUBDIR=""
IMAGE_REPO="${IMAGE_REPO:-astro-blog}"
IMAGE_TAG="${IMAGE_TAG:-local}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-docker/Dockerfile}"
CONTENT_DIR="${CONTENT_DIR:-${ROOT_DIR}/src/content/blog}"
NORMALIZE_SCRIPT="${NORMALIZE_SCRIPT:-${ROOT_DIR}/scripts/normalize-articles.ts}"
BASE_DIR=""

log() {
  printf '\n[%s] %s\n' "$(date '+%F %T')" "$*"
}

fail() {
  echo "error: $*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

usage() {
  cat <<EOF
Usage:
  $0 --repo <repo-url> [options]

Options:
  -r, --repo <url>           External git repository URL containing articles
  -d, --subdir <dir>         Optional subdirectory inside the article repo
  -b, --base-dir <dir>       Base directory for category calculation
  -i, --image-repo <repo>    Container image repository
  -t, --image-tag <tag>      Container image tag
      --dockerfile <path>    Dockerfile path relative to project root
      --content-dir <path>   Output content directory (default: src/content/blog)
      --no-build             Normalize only, skip image build
  -h, --help                 Show this help

Examples:
  $0 --repo git@github.com:lilamaris/articles.git
  $0 --repo git@github.com:lilamaris/articles.git --subdir blog
  $0 -r git@github.com:lilamaris/articles.git -d blog \\
     -i registry.lilamaris.kr/blog/astro-blog -t v0.1.0
EOF
}

SKIP_BUILD="false"

cleanup() {
  rm -rf "$WORK_DIR"
}

trap cleanup EXIT

while [[ $# -gt 0 ]]; do
  case "$1" in
  -r | --repo)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    ARTICLE_REPO_URL="$2"
    shift 2
    ;;
  -d | --subdir)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    ARTICLE_SUBDIR="$2"
    shift 2
    ;;
  -b | --base-dir)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    BASE_DIR="$2"
    shift 2
    ;;
  -i | --image-repo)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    IMAGE_REPO="$2"
    shift 2
    ;;
  -t | --image-tag)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    IMAGE_TAG="$2"
    shift 2
    ;;
  --dockerfile)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    DOCKERFILE_PATH="$2"
    shift 2
    ;;
  --content-dir)
    [[ $# -ge 2 ]] || fail "missing value for $1"
    CONTENT_DIR="$2"
    shift 2
    ;;
  --no-build)
    SKIP_BUILD="true"
    shift
    ;;
  -h | --help)
    usage
    exit 0
    ;;
  *)
    fail "unknown option: $1"
    ;;
  esac
done

[[ -n "$ARTICLE_REPO_URL" ]] || {
  usage
  exit 1
}

require_cmd git
require_cmd pnpm
require_cmd podman

[[ -f "$NORMALIZE_SCRIPT" ]] || fail "normalize script not found: $NORMALIZE_SCRIPT"
[[ -f "${ROOT_DIR}/${DOCKERFILE_PATH}" ]] || fail "Dockerfile not found at ${DOCKERFILE_PATH}"

log "Preparing temporary workspace"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

log "Cloning article repository"
git clone "$ARTICLE_REPO_URL" "$WORK_DIR/repo"

SOURCE_DIR="$WORK_DIR/repo"
if [[ -n "$ARTICLE_SUBDIR" ]]; then
  SOURCE_DIR="$SOURCE_DIR/$ARTICLE_SUBDIR"
fi

[[ -d "$SOURCE_DIR" ]] || fail "article source directory not found: $SOURCE_DIR"

if [[ -z "$BASE_DIR" ]]; then
  BASE_DIR="$SOURCE_DIR"
fi

log "Normalizing articles into content directory"
cd "$ROOT_DIR"
pnpm tsx "$NORMALIZE_SCRIPT" \
  --source "$SOURCE_DIR" \
  --output "$CONTENT_DIR" \
  --base-dir "$BASE_DIR"

if [[ "$SKIP_BUILD" == "true" ]]; then
  log "Skipped image build (--no-build)"
  exit 0
fi

FULL_IMAGE_REF="${IMAGE_REPO}:${IMAGE_TAG}"

log "Building container image: $FULL_IMAGE_REF"
podman build -f "$DOCKERFILE_PATH" -t "$FULL_IMAGE_REF" .

log "Done"
echo "Built image: $FULL_IMAGE_REF"
echo "Articles source: $ARTICLE_REPO_URL"
echo "Normalized content output: $CONTENT_DIR"
