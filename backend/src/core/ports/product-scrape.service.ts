import type { ProductScrapeResult } from '@/types/product/product-scrape';

export interface ScrapeProductInput {
  url: string;
}

export interface IProductScrapeService {
  scrapePreview(
    userId: string,
    input: ScrapeProductInput,
  ): Promise<{ scrape: ProductScrapeResult }>;
}
