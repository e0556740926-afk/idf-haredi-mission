import { staticFile } from "remotion";
import manifest from "../generated/manifest.json";

const present = new Set<string>(manifest.present);

export const hasAsset = (rel: string) => present.has(rel);
export const assetSrc = (rel: string) => staticFile(rel);
export const italyPhotos: string[] = manifest.italy;
export const missingAssets: string[] = manifest.missing;
