#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/.tmp/articles-build"
CONTENT_DIR="${ROOT_DIR}/src/content/posts"

ARTICLE_REPO_URL=""
ARTICLE_SUBDIR=""
IMAGE_REPO="${IMAGE_REPO:-astro-blog}"
IMAGE_TAG="${IMAGE_TAG:-local}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-docker/Dockerfile}"

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
  -i, --image-repo <repo>    Container image repository
  -t, --image-tag <tag>      Container image tag
      --dockerfile <path>    Dockerfile path relative to project root
  -h, --help                 Show this help

Examples:
  $0 --repo git@github.com:lilamaris/articles.git
  $0 --repo git@github.com:lilamaris/articles.git --subdir blog
  $0 -r git@github.com:lilamaris/articles.git -d blog \\
     -i registry.lilamaris.kr/blog/astro-blog -t v0.1.0
EOF
}

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
require_cmd rsync
require_cmd podman

[[ -f "${ROOT_DIR}/${DOCKERFILE_PATH}" ]] || fail "Dockerfile not found at ${DOCKERFILE_PATH}"

log "Preparing temporary workspace"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

log "Cloning article repository"
git clone --depth 1 "$ARTICLE_REPO_URL" "$WORK_DIR/repo"

SOURCE_DIR="$WORK_DIR/repo"
if [[ -n "$ARTICLE_SUBDIR" ]]; then
  SOURCE_DIR="$SOURCE_DIR/$ARTICLE_SUBDIR"
fi

[[ -d "$SOURCE_DIR" ]] || fail "article source directory not found: $SOURCE_DIR"

log "Refreshing blog content directory"
rm -rf "$CONTENT_DIR"
mkdir -p "$CONTENT_DIR"

rsync -av --delete \
  --exclude='.git' \
  --exclude='.obsidian' \
  --exclude='.DS_Store' \
  --exclude='node_modules' \
  "$SOURCE_DIR"/ "$CONTENT_DIR"/

log "Building container image"
cd "$ROOT_DIR"
FULL_IMAGE_REF="${IMAGE_REPO}:${IMAGE_TAG}"
podman build -f "$DOCKERFILE_PATH" -t "$FULL_IMAGE_REF" .

log "Done"
echo "Built image: $FULL_IMAGE_REF"
echo "Articles copied from: ${ARTICLE_REPO_URL}${ARTICLE_SUBDIR:+/$ARTICLE_SUBDIR}"
