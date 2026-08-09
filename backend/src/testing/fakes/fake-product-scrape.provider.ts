import type { IProductScrapeProvider } from '@/core/ports/product-scrape.provider';
import type { ProductScrapeOutcome } from '@/types/product/product-scrape';

export class FakeProductScrapeProvider implements IProductScrapeProvider {
  public calls: string[] = [];
  public outcome: ProductScrapeOutcome = {
    ok: false,
    error: {
      code: 'unparseable',
      message: 'No fake scrape outcome configured',
    },
  };

  async scrape(url: string): Promise<ProductScrapeOutcome> {
    this.calls.push(url);
    return this.outcome;
  }
}
