#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

import fg from "fast-glob";
import matter from "gray-matter";
import yaml from "js-yaml";

type Primitive = string | number | boolean | null;
type JsonLike = Primitive | JsonLike[] | { [key: string]: JsonLike };

interface CliOptions {
  source: string;
  output: string;
  baseDir?: string;
  dryRun: boolean;
}

interface Frontmatter {
  title?: string;
  description?: string;
  tags?: string[];
  categories?: string;
  published?: string | Date;
  updated?: string | Date;
  draft?: boolean;
  image?: string;
  minutes?: number;
  series?: string;
  newerPostRef?: string;
  olderPostRef?: string;
  [key: string]: JsonLike | undefined;
}

const DEFAULT_WORDS_PER_MINUTE = 220;

function parseArgs(argv: string[]): CliOptions {
  let source = "";
  let output = "";
  let baseDir: string | undefined;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    switch (arg) {
      case "-s":
      case "--source":
        source = argv[++i] ?? "";
        break;
      case "-o":
      case "--output":
        output = argv[++i] ?? "";
        break;
      case "-b":
      case "--base-dir":
        baseDir = argv[++i] ?? "";
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "-h":
      case "--help":
        printUsageAndExit(0);
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        printUsageAndExit(1);
    }
  }

  if (!source || !output) {
    printUsageAndExit(1);
  }

  return {
    source: path.resolve(source),
    output: path.resolve(output),
    baseDir: baseDir ? path.resolve(baseDir) : undefined,
    dryRun,
  };
}

function printUsageAndExit(code: number): never {
  const usage = `
Usage:
  pnpm tsx scripts/normalize-articles.ts --source <dir> --output <dir> [options]

Options:
  -s, --source <dir>     원본 articles 디렉토리
  -o, --output <dir>     frontmatter 증강본 출력 디렉토리
  -b, --base-dir <dir>   categories 계산 기준 디렉토리
      --dry-run          파일 쓰지 않고 결과만 로그
  -h, --help             도움말

Examples:
  pnpm tsx scripts/normalize-articles.ts \\
    --source /home/lilamaris/blog/articles \\
    --output ./src/content/blog

  pnpm tsx scripts/normalize-articles.ts \\
    --source /home/lilamaris/blog/articles/blog \\
    --output ./src/content/blog \\
    --base-dir /home/lilamaris/blog/articles
`.trim();

  console.log(usage);
  process.exit(code);
}

function toTitleFromFilename(filePath: string): string {
  const baseName = path.basename(filePath, path.extname(filePath));
  return baseName
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function toCategoryFromPath(filePath: string, baseDir: string): string {
  const rel = path.relative(baseDir, filePath);
  const dir = path.dirname(rel);

  if (!dir || dir === ".") {
    return "root";
  }

  return dir.split(path.sep).join("/");
}

function estimateReadingMinutes(content: string): number {
  const words = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/[#>*_~-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / DEFAULT_WORDS_PER_MINUTE));
}

function normalizeDateString(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(input)}`);
  }
  return date.toISOString();
}

function getGitDate(
  repoRoot: string,
  relativeFilePath: string,
  mode: "created" | "updated",
): string | undefined {
  try {
    const output = execFileSync(
      "git",
      [
        "-C",
        repoRoot,
        "log",
        "--follow",
        "--format=%aI",
        "--",
        relativeFilePath,
      ],
      { encoding: "utf8" },
    )
      .trim()
      .split("\n")
      .filter(Boolean);

    if (output.length === 0) {
      return undefined;
    }

    return mode === "created" ? output[output.length - 1] : output[0];
  } catch {
    return undefined;
  }
}

function stringifyFrontmatter(
  data: Record<string, JsonLike | undefined>,
): string {
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
  return yaml
    .dump(cleaned, {
      lineWidth: 120,
      noRefs: true,
      quotingType: '"',
    })
    .trim();
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function emptyDir(dir: string): Promise<void> {
  await fs.rm(dir, { recursive: true, force: true });
  await ensureDir(dir);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  const sourceRoot = options.source;
  const outputRoot = options.output;
  const categoryBaseDir = options.baseDir ?? sourceRoot;

  const markdownFiles = await fg(["**/*.md", "**/*.mdx"], {
    cwd: sourceRoot,
    absolute: true,
    dot: false,
  });

  if (markdownFiles.length === 0) {
    console.warn(`No markdown files found in ${sourceRoot}`);
    return;
  }

  if (!options.dryRun) {
    await emptyDir(outputRoot);
  }

  for (const filePath of markdownFiles) {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);
    const fm = (parsed.data ?? {}) as Frontmatter;
    const body = parsed.content;

    const relativeFromSource = path.relative(sourceRoot, filePath);
    const repoRoot = findGitRoot(filePath) ?? sourceRoot;
    const relativeFromRepo = path.relative(repoRoot, filePath);

    const createdAt = getGitDate(repoRoot, relativeFromRepo, "created");
    const updatedAt = getGitDate(repoRoot, relativeFromRepo, "updated");

    const normalized: Frontmatter = {
      ...fm,
      title: fm.title?.trim() || toTitleFromFilename(filePath),
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      categories:
        fm.categories?.trim() || toCategoryFromPath(filePath, categoryBaseDir),
      published: fm.published
        ? normalizeDateString(fm.published)
        : (createdAt ?? new Date().toISOString()),
      updated: fm.updated ? normalizeDateString(fm.updated) : updatedAt,
      draft: typeof fm.draft === "boolean" ? fm.draft : false,
      minutes:
        typeof fm.minutes === "number"
          ? fm.minutes
          : estimateReadingMinutes(body),
    };

    const finalContent = `---\n${stringifyFrontmatter(normalized)}\n---\n${body.startsWith("\n") ? body : `\n${body}`}`;

    const outputPath = path.join(outputRoot, relativeFromSource);
    const outputDir = path.dirname(outputPath);

    if (options.dryRun) {
      console.log(`\n[DRY RUN] ${relativeFromSource}`);
      console.log(normalized);
      continue;
    }

    await ensureDir(outputDir);
    await fs.writeFile(outputPath, finalContent, "utf8");
    console.log(`Wrote: ${path.relative(process.cwd(), outputPath)}`);
  }
}

function findGitRoot(startFilePath: string): string | undefined {
  let current = path.dirname(startFilePath);

  while (true) {
    const gitDir = path.join(current, ".git");
    try {
      // eslint-disable-next-line no-sync
      if (require("node:fs").existsSync(gitDir)) {
        return current;
      }
    } catch {
      return undefined;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return undefined;
    }
    current = parent;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
