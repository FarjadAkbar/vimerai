import type { ProductScrapeOutcome } from '@/types/product/product-scrape';

export interface IProductScrapeProvider {
  scrape(url: string): Promise<ProductScrapeOutcome>;
}
