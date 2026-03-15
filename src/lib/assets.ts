import type { ImageMetadata } from "astro";
import type { AssetLike } from "@/types";

export const isImageMetadata = (value: AssetLike): value is ImageMetadata =>
  typeof value === "object" && value !== null && "src" in value;

export const getAssetSrc = (asset?: AssetLike): string | undefined => {
  if (!asset) return undefined;
  return typeof asset === "string" ? asset : asset.src;
};
