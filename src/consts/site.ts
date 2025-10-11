import type { Appearance, Site, Routes, SocialLink } from "@/types";

export const SITE: Site = {
  title: "Kirari",
  description: "kirari astro blog",
  author: "lilamaris",
  lang: "en",
};

export const APPEARANCE: Appearance = {
  hue: 270,
  theme: "light",
  bannerHeight: 30,
  bannerOverlap: 5,
  pageWidth: 60,
  showRecentPost: true,
  recentPostCount: 3,
  postPerPageCount: 4,
};

export const ROUTE: Routes = {
  home: {
    href: "/",
    label: "/Kirari",
  },
  blog: {
    href: "/blog",
    label: "/Blog",
  },
  index: {
    href: "/index",
    label: "/Index",
  },
  about: {
    href: "/about",
    label: "/About",
  },
};

export const SOCIAL: SocialLink[] = [
  {
    href: "https://github.com/lilamaris",
    label: "Github",
    icon: "fa6-brands:github",
  },
  {
    href: "https://x.com/_lilamaris",
    label: "Twitter",
    icon: "fa6-brands:twitter",
  },
  {
    href: "https://steamcommunity.com/profiles/76561198072587653",
    label: "Steam",
    icon: "fa6-brands:steam",
  },
];
