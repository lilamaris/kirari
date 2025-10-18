import { objectKeys } from "./lib/utils";

export const SITE = {
  title: "Kirari",
  description: "kirari astro blog",
  author: "lilamaris",
  lang: "en",
} as const;
export type Site = typeof SITE;

export const APPEARANCE = {
  hue: 270,
  theme: "light",
  bannerHeight: 30,
  bannerOverlap: 5,
  contentWidth: 35,
  showRecentPost: true,
  recentPostCount: 3,
  postPerPageCount: 4,
} as const;
export type Appearance = typeof APPEARANCE;

export const ROUTE = {
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
} as const;
export type AvailableRoute = keyof typeof ROUTE;
export type Routes = typeof ROUTE;
export type Route = Routes[AvailableRoute];
export const availableRoute = objectKeys(ROUTE);

export const SOCIAL = {
  github: {
    href: "https://github.com/lilamaris",
    label: "Github",
    icon: "fa6-brands:github",
  },
  twitter: {
    href: "https://x.com/_lilamaris",
    label: "Twitter",
    icon: "fa6-brands:twitter",
  },
  steam: {
    href: "https://steamcommunity.com/profiles/76561198072587653",
    label: "Steam",
    icon: "fa6-brands:steam",
  },
} as const;
export type AvailableSocial = keyof typeof SOCIAL;
export type Socials = typeof SOCIAL;
export type Social = Socials[AvailableSocial];
export const availableSocial = objectKeys(SOCIAL);
