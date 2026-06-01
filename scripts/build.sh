#!/usr/bin/env bash
set -euo pipefail

RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[0;33m'
NC=$'\033[0m'

log_info() {
  printf '%s[INFO]%s %s\n' "$GREEN" "$NC" "$1"
}

log_error() {
  printf '%s[ERROR]%s %s\n' "$RED" "$NC" "$1"
}

log_warn() {
  printf '%s[WARN]%s %s\n' "$YELLOW" "$NC" "$1"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    log_error "Missing required command: $1"
    exit 1
  }
}

usage() {
  printf 'Usage: %s [-r <content-repository-url>] [-o <output-dir>] <source-dir>\n' "$0" >&2
}

require_cmd pnpm

repo=""
output="dist"

while getopts "r:o:" opt; do
  case "$opt" in
  r) repo="$OPTARG" ;;
  o) output="$OPTARG" ;;
  *)
    usage
    exit 1
    ;;
  esac
done

shift $((OPTIND - 1))

if [[ "$#" -ne 1 ]]; then
  usage
  exit 1
fi

source_dir="$1"

if [[ ! -d "$source_dir" ]]; then
  log_error "Source directory does not exists: $source_dir"
  exit 1
fi

if [[ -z "$output" ]]; then
  log_error "Output directory must not be empty"
  exit 1
fi

if [[ -n "$repo" ]]; then
  require_cmd git
fi

if [[ "$output" == /* ]]; then
  output_dir="$output"
else
  output_dir="${source_dir}/${output}"
fi

log_info "Source dir=${source_dir}"
log_info "Output dir=${output_dir}"

workdir="$(mktemp -d)"
log_info "Working dir=${workdir}"
trap 'rm -rf "$workdir"' EXIT

cp -a "$source_dir"/. "$workdir"/

if [[ -n "$repo" ]]; then
  log_info "Content repository=${repo}"

  clone_directory="$workdir/src/content/posts"
  rm -rf "$clone_directory"
  mkdir -p "$(dirname "$clone_directory")"

  log_info "Cloning content repository into $clone_directory..."
  git clone --depth=1 "$repo" "$clone_directory"
fi

build_output_dir="$workdir/dist"

log_info "Installing dependencies..."
pnpm --dir "$workdir" install --frozen-lockfile

log_info "Building project..."
pnpm --dir "$workdir" build

if [[ ! -d "$build_output_dir" ]]; then
  log_error "Build output directory not found: $build_output_dir"
  exit 1
fi

log_warn "Replacing output directory: $output_dir"
rm -rf "$output_dir"
mkdir -p "$output_dir"
cp -a "$build_output_dir"/. "$output_dir"/

log_info "Build completed. $output_dir"
