import Swup from "swup";
import { splitUrl } from "./utils";

const setBaseUrlToDocument = () => {
  const path = window.location.pathname;
  const base = splitUrl(path)[0];
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
