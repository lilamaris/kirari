import type { LayoutConfig, SiteConfig, ThemeConfig } from "./types";
import demoIcon from "@/assets/demo-icon.png";
import demoProfile from "@/assets/demo-profile.jpg";
import demoBanner from "@/assets/demo-banner.jpg";
import demoThumbnail from "@/assets/demo-thumnail.png";

export const siteConfig: SiteConfig = {
  title: "Kirari",
  description: "kirari astro blog",
  authorName: "lilamaris",
  authorComment: "haaiii",
  lang: "en",
  siteUrl: "",
  email: "",
};

export const themeConfig: ThemeConfig = {
  initialHue: 200,
  initialTheme: "system",
  thumbnailOption: "static",
  enableBanner: true,
  enableHueControl: true,
  enableThemeControl: true,
  recentPostCount: 3,
  postPerPage: 4,
  siteIconUrl: demoIcon,
  avatarImgUrl: demoProfile,
  bannerImgUrl: demoBanner,
  thumbnailFallbackImgUrl: demoThumbnail,
};

export const layoutConfig: LayoutConfig = {
  bannerHeight: 40,
  bannerExtend: 10,
  navigationHeight: 3,
  contentWidth: 45,
  asideWidth: 16,
  layoutGap: 0.5,
};

export const theme = {
  Light: "light",
  Dark: "dark",
  System: "system",
} as const;

export const indexType = {
  PublishedYear: "publishedYear",
  Categories: "categories",
  Tags: "tags",
  Series: "series",
} as const;

export const thumbnailOption = {
  None: "none",
  Static: "static",
  Image: "image",
} as const;

export const routes = {
  root: {
    href: "/",
    label: "/Home",
  },
  blog: {
    href: "/blog/",
    label: "/Blog",
  },
  index: {
    href: "/index/",
    label: "/Index",
  },
  about: {
    href: "/about/",
    label: "/About",
  },
} as const;

export const socials = {
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
