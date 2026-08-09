/** Structured Product fields scraped from a product page URL (PDP). */
export interface ProductScrapeResult {
  sourceUrl: string;
  name: string;
  description: string;
  imageUrls: string[];
  price: string | null;
}

export type ProductScrapeFailureCode =
  | 'invalid_url'
  | 'fetch_failed'
  | 'empty_html'
  | 'unparseable'
  | 'missing_required_fields';

export interface ProductScrapeFailure {
  code: ProductScrapeFailureCode;
  message: string;
}

export type ProductScrapeOutcome =
  | { ok: true; product: ProductScrapeResult }
  | { ok: false; error: ProductScrapeFailure };
