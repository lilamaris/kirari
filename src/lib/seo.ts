import { siteConfig } from "@/consts";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const getSiteUrl = (): string => {
  const configuredUrl = import.meta.env.PUBLIC_SITE_URL || siteConfig.siteUrl || "";
  return configuredUrl.trim().replace(/\/+$/, "");
};

export const normalizePath = (path: string): string => {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
};

export const isAbsoluteUrl = (value: string): boolean =>
  ABSOLUTE_URL_PATTERN.test(value);

export const toAbsoluteUrl = (
  path: string,
  siteUrl = getSiteUrl(),
): string | undefined => {
  if (!siteUrl) return undefined;
  return new URL(normalizePath(path), `${siteUrl}/`).toString();
};

export const resolveSeoImage = (
  image?: string,
  siteUrl = getSiteUrl(),
): string | undefined => {
  if (!image) return undefined;
  if (isAbsoluteUrl(image)) return image;
  return toAbsoluteUrl(image, siteUrl);
};
