/**
 * Primary Fetra create path (ADR-0031 / ADR-0033).
 * Brand comes from Business DNA; reference images come from Media Store.
 */
export const PRODUCT_PATH = {
  studio: "/studio",
  blitz: "/studio/blitz",
  /** @deprecated Posts flow merged into Blitz — use PRODUCT_PATH.blitz */
  posts: "/studio/blitz",
  videos: "/studio/videos",
  images: "/studio/images",
  influencers: "/studio/influencers",
  library: "/studio/library",
  businessDna: "/studio/business-dna",
  /** @deprecated Demoted library — not primary nav (use Business DNA). */
  brands: "/studio/brands",
} as const;

/**
 * When true, home mounts BrandGeneration (multi-arm). MVP keeps this false so
 * the primary path is Brand Studio only (spec: feature-flag / hide legacy).
 */
export const LEGACY_GENERATION_PRIMARY = false;

export function influencerDetailPath(id: string): string {
  return `${PRODUCT_PATH.influencers}/${id}`;
}
