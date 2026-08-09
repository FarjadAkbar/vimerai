import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IProductScrapeProvider } from '@/core/ports/product-scrape.provider';
import type {
  IProductScrapeService,
  ScrapeProductInput,
} from '@/core/ports/product-scrape.service';
import { PRODUCT_SCRAPE_PROVIDER_TOKEN } from '@/core/tokens/injection.tokens';
import type { ProductScrapeFailure } from '@/types/product/product-scrape';

@Injectable()
export class ProductScrapeService implements IProductScrapeService {
  constructor(
    @Inject(PRODUCT_SCRAPE_PROVIDER_TOKEN)
    private readonly productScrape: IProductScrapeProvider,
  ) {}

  async scrapePreview(_userId: string, input: ScrapeProductInput) {
    const outcome = await this.productScrape.scrape(input.url);
    if (outcome.ok) {
      return { scrape: outcome.product };
    }
    throw mapFailure(outcome.error);
  }
}

function mapFailure(error: ProductScrapeFailure): Error {
  switch (error.code) {
    case 'fetch_failed':
      return new ServiceUnavailableException(error.message);
    case 'invalid_url':
    case 'empty_html':
    case 'unparseable':
    case 'missing_required_fields':
      return new BadRequestException(error.message);
    default: {
      const _exhaustive: never = error.code;
      return new BadRequestException(String(_exhaustive));
    }
  }
}
