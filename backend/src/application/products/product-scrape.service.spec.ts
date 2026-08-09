import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ProductScrapeService } from '@/application/products/product-scrape.service';
import { FakeProductScrapeProvider } from '@/testing/fakes/fake-product-scrape.provider';

describe('ProductScrapeService', () => {
  it('returns structured Product fields from a successful scrape', async () => {
    const provider = new FakeProductScrapeProvider();
    provider.outcome = {
      ok: true,
      product: {
        sourceUrl: 'https://shop.example.com/products/serum',
        name: 'Hydrating Serum',
        description: 'A light daily serum',
        imageUrls: ['https://cdn.example.com/serum.jpg'],
        price: '42.00',
      },
    };
    const service = new ProductScrapeService(provider);

    const result = await service.scrapePreview('user-1', {
      url: 'https://shop.example.com/products/serum',
    });

    expect(provider.calls).toEqual([
      'https://shop.example.com/products/serum',
    ]);
    expect(result.scrape).toEqual({
      sourceUrl: 'https://shop.example.com/products/serum',
      name: 'Hydrating Serum',
      description: 'A light daily serum',
      imageUrls: ['https://cdn.example.com/serum.jpg'],
      price: '42.00',
    });
  });

  it('maps fetch failures to ServiceUnavailableException', async () => {
    const provider = new FakeProductScrapeProvider();
    provider.outcome = {
      ok: false,
      error: {
        code: 'fetch_failed',
        message: 'Failed to fetch product page: timeout',
      },
    };
    const service = new ProductScrapeService(provider);

    await expect(
      service.scrapePreview('user-1', {
        url: 'https://shop.example.com/products/gone',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('maps missing fields to BadRequestException with a clear message', async () => {
    const provider = new FakeProductScrapeProvider();
    provider.outcome = {
      ok: false,
      error: {
        code: 'missing_required_fields',
        message:
          'Could not find product name, description, and images on this page',
      },
    };
    const service = new ProductScrapeService(provider);

    try {
      await service.scrapePreview('user-1', {
        url: 'https://shop.example.com/about',
      });
      throw new Error('expected scrapePreview to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).message).toContain(
        'Could not find product name',
      );
    }
  });
});
