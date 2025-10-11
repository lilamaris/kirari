import { ROUTE } from "@/consts/site";
import type { AvailableRoute, Theme } from "@/types";

export const objectValues = <T extends object>(obj: T) =>
  Object.values(obj) as T[keyof T][];

export const toInlineStyle = (rules: string[]): string =>
  rules
    .filter(Boolean)
    .map((r) => r.trim().replace(/;?$/, ";"))
    .join(" ");

export const toStyleVars = (vars: Record<string, string | number>): string =>
  Object.entries(vars)
    .map(([k, v]) => `--${k}:${typeof v === "number" ? `${v}rem` : v};`)
    .join("");

export const getUrl = (prefix: AvailableRoute, ...parts: string[]): string =>
  joinUrl(ROUTE[prefix]?.href ?? "/", ...parts);

export const joinUrl = (...parts: string[]) => {
  const joined = parts.join("/");
  return joined.replace(/\/+/g, "/");
};

export const createUrl = (path: string) => {
  return joinUrl("", import.meta.env.BASE_URL, path);
};

export const formatDate = (date: Date) => {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const getTheme = (): Theme => {
  // TODO: Read default theme from site config
  const fallback = "light";
  const storedTheme = localStorage.getItem("theme") as Theme;
  return storedTheme || fallback;
};

export const setTheme = (theme: Theme) => {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
};

export const getHue = (): number => {
  // TODO: Read default hue from site config
  const fallback = "250";
  const storedHue = localStorage.getItem("hue");
  return Number.parseInt(storedHue ?? fallback);
};

export const setHue = (hue: number): void => {
  const v = String(hue);
  localStorage.setItem("hue", v);
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty("--hue", v);
};
