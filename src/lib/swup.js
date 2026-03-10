import Swup from "swup";
import { splitUrl } from "./utils";

const NON_HTML_ENDPOINTS = new Set([
  "/rss.xml",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest.webmanifest",
]);

const isNonHtmlEndpoint = (url) => {
  const pathname = new URL(url, window.location.origin).pathname;
  return NON_HTML_ENDPOINTS.has(pathname);
};

const setBaseUrlToDocument = () => {
  const path = window.location.pathname;
  const parts = splitUrl(path, { includeRoot: false });
  const base = parts.length > 0 ? parts[0] : "root";
  document.documentElement.setAttribute("data-baseloc", base);
};

const swup = new Swup({
  containers: ["#swup-target"],
  animationSelector: '[class*="transition-swup-"]',
  ignoreVisit: (url, { el } = {}) =>
    !!el?.closest("[data-no-swup]") || isNonHtmlEndpoint(url),
});

swup.hooks.on("animation:out:start", () => {
  console.log("Animation out start");
  setBaseUrlToDocument();
});

swup.hooks.on("visit:start", () => {
  console.log("Visit start");
  setBaseUrlToDocument();
});

export default swup;
