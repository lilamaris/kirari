import type { SiteTheme } from "@/types/config";

export const formatDate = (date: Date) => {
  return date.toISOString().slice(0, 10);
};

export const getTheme = (): SiteTheme => {
  // TODO: Read default theme from site config
  const fallback = "light";
  const storedTheme = localStorage.getItem("theme") as SiteTheme;
  return storedTheme || fallback;
};

export const setTheme = (theme: SiteTheme) => {
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
