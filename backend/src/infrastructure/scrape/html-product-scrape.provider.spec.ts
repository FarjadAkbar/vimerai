import { readFileSync } from 'fs';
import { join } from 'path';
import type { IProductScrapeProvider } from '@/core/ports/product-scrape.provider';
import { parseProductHtml } from '@/infrastructure/scrape/html-product-scrape.provider';

/**
 * Fixture-backed coverage for the Product scrape port seam.
 * Live HTTP stays in HtmlProductScrapeProvider.scrape; unit tests use
 * parseProductHtml (same pattern as homepage scrape) via this adapter.
 */
function fixtureProductScrapeProvider(
  htmlByUrl: Record<string, string>,
): IProductScrapeProvider {
  return {
    async scrape(url: string) {
      const html = htmlByUrl[url];
      if (!html) {
        return {
          ok: false,
          error: {
            code: 'fetch_failed',
            message: `No fixture HTML for ${url}`,
          },
        };
      }
      return parseProductHtml(url, html);
    },
  };
}

describe('IProductScrapeProvider (fixture HTML)', () => {
  it('scrapes Shopify-like product pages through the port using fixture HTML', async () => {
    const url = 'https://shop.nitroshinepro.com/products/ceramic-spray-wax';
    const html = readFileSync(
      join(
        __dirname,
        '../../testing/fixtures/scrape/shopify-like-product.html',
      ),
      'utf8',
    );
    const provider = fixtureProductScrapeProvider({ [url]: html });

    const outcome = await provider.scrape(url);

    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.product.name).toBe('Ceramic Spray Wax');
    expect(outcome.product.imageUrls).toHaveLength(2);
    expect(outcome.product.sourceUrl).toBe(url);
  });
});

describe('parseProductHtml', () => {
  it('extracts name, description, images, and price from Shopify-like JSON-LD', () => {
    const html = readFileSync(
      join(
        __dirname,
        '../../testing/fixtures/scrape/shopify-like-product.html',
      ),
      'utf8',
    );

    const outcome = parseProductHtml(
      'https://shop.nitroshinepro.com/products/ceramic-spray-wax',
      html,
    );

    expect(outcome).toEqual({
      ok: true,
      product: {
        sourceUrl:
          'https://shop.nitroshinepro.com/products/ceramic-spray-wax',
        name: 'Ceramic Spray Wax',
        description:
          'Pro-grade ceramic spray wax for showroom shine at home.',
        imageUrls: [
          'https://shop.nitroshinepro.com/cdn/shop/products/ceramic-1.jpg',
          'https://shop.nitroshinepro.com/cdn/shop/products/ceramic-2.jpg',
        ],
        price: '29.99',
      },
    });
  });

  it('falls back to Open Graph tags when JSON-LD is absent', () => {
    const html = readFileSync(
      join(__dirname, '../../testing/fixtures/scrape/og-only-product.html'),
      'utf8',
    );

    const outcome = parseProductHtml(
      'https://shop.example.com/products/matte-tire-dressing',
      html,
    );

    expect(outcome).toEqual({
      ok: true,
      product: {
        sourceUrl: 'https://shop.example.com/products/matte-tire-dressing',
        name: 'Matte Tire Dressing',
        description:
          'Non-greasy matte finish for tires that lasts through rain.',
        imageUrls: [
          'https://shop.example.com/cdn/shop/products/tire-dressing.jpg',
        ],
        price: '18.50',
      },
    });
  });

  it('returns a typed failure when required product fields are missing', () => {
    const outcome = parseProductHtml(
      'https://shop.example.com/products/empty',
      '<html><head><title>Empty</title></head><body>No product</body></html>',
    );

    expect(outcome).toEqual({
      ok: false,
      error: {
        code: 'missing_required_fields',
        message:
          'Could not find product name, description, and images on this page',
      },
    });
  });
});
