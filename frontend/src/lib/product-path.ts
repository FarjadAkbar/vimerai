/**
 * Primary Fetra create path (ADR-0031 / ticket 05).
 * Legacy multi-arm Generation UI stays in the repo but is not the default entry.
 */
export const PRODUCT_PATH = {
  studio: "/studio",
  posts: "/studio/posts",
  videos: "/studio/videos",
  businessDna: "/studio/business-dna",
  brands: "/brand-kits",
  products: "/products",
} as const;

/**
 * When true, home mounts BrandGeneration (multi-arm). MVP keeps this false so
 * the primary path is Brand Studio only (spec: feature-flag / hide legacy).
 */
export const LEGACY_GENERATION_PRIMARY = false;
