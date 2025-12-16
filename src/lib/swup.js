import Swup from "swup";
import { splitUrl } from "./utils";

const setBaseUrlToDocument = () => {
  const path = window.location.pathname;
  const parts = splitUrl(path, { includeRoot: false });
  const base = parts.length > 0 ? parts[0] : "root";
  document.documentElement.setAttribute("data-baseloc", base);
};

const swup = new Swup({
  containers: ["#swup-target"],
  animationSelector: '[class*="transition-swup-"]',
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
