import { route, routeRegistry, themeConfig } from "@/consts";
import type { RouteEnum, Theme } from "@/types";

export const objectKeys = <T extends object>(obj: T) =>
  Object.keys(obj) as (keyof T)[];

export const objectValues = <T extends object>(obj: T) =>
  Object.values(obj) as T[keyof T][];

export const objectEntries = <T extends object>(obj: T) =>
  Object.entries(obj) as [keyof T, T[keyof T]][];

export const toInlineStyle = (rules: string[]): string =>
  rules
    .filter(Boolean)
    .map((r) => r.trim().replace(/;?$/, ";"))
    .join(" ");

export const toStyleVars = (vars: Record<string, string | number>): string =>
  Object.entries(vars)
    .map(([k, v]) => `--${k}:${typeof v === "number" ? `${v}rem` : v};`)
    .join("");

export interface SplitUrlOptions {
  includeSeparator: boolean;
  rootName: string;
}
const defaultSplitUrlOptions: SplitUrlOptions = {
  includeSeparator: false,
  rootName: route.Root,
};

export const splitUrl = (
  path: string,
  options?: Partial<SplitUrlOptions>,
): string[] => {
  const opts = { ...defaultSplitUrlOptions, ...options };
  const ROOT = opts.rootName;
  const separator = "/";
  const pattern = opts.includeSeparator
    ? new RegExp(`(?=${separator})`)
    : `${separator}`;
  const part = path.split(pattern).filter((part) => !!part.trim());
  return !!part.length ? part : [ROOT];
};

export const joinUrl = (...parts: string[]) => {
  const joined = parts.join("/");
  return joined.replace(/\/+/g, "/");
};

export const createUrl = (path: string) => {
  return joinUrl("", import.meta.env.BASE_URL, path);
};

export const createRouteUrl = (route: RouteEnum, path?: string): string => {
  const baseUrl = routeRegistry[route].href;
  return joinUrl(baseUrl, ...(path != undefined ? [path] : []));
};

export const formatDate = (date: Date) => {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const getTheme = (): Theme => {
  const fallback = themeConfig.initialTheme;
  const storedTheme = localStorage.getItem("theme") as Theme;
  return storedTheme ?? fallback;
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
};

export const getHue = (): number => {
  const fallback = themeConfig.initialHue;
  const storedHue = localStorage.getItem("hue");
  return storedHue != null ? Number.parseInt(storedHue) : fallback;
};

export const setHue = (hue: number): void => {
  const v = String(hue);
  localStorage.setItem("hue", v);
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty("--hue", v);
};
