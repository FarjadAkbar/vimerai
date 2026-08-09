/**
 * Primary Fetra create path (ADR-0031 / ADR-0033).
 * Brand comes from Business DNA; Product is scraped/created inline on Posts/Videos.
 * Legacy Brands/Products library pages remain in the repo but are not primary nav.
 */
export const PRODUCT_PATH = {
  studio: "/studio",
  posts: "/studio/posts",
  videos: "/studio/videos",
  businessDna: "/studio/business-dna",
  /** @deprecated Demoted library — not primary nav (use Business DNA). */
  brands: "/studio/brands",
  /** @deprecated Demoted library — not primary nav (inline scrape/create). */
  products: "/products",
} as const;

/**
 * When true, home mounts BrandGeneration (multi-arm). MVP keeps this false so
 * the primary path is Brand Studio only (spec: feature-flag / hide legacy).
 */
export const LEGACY_GENERATION_PRIMARY = false;
