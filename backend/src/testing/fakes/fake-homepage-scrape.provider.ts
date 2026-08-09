import type { IHomepageScrapeProvider } from '@/core/ports/homepage-scrape.provider';
import type { HomepageScrapeResult } from '@/types/brand/business-dna';

export class FakeHomepageScrapeProvider implements IHomepageScrapeProvider {
  public calls: string[] = [];
  public result: HomepageScrapeResult | null = null;
  public error: Error | null = null;

  async scrape(url: string): Promise<HomepageScrapeResult> {
    this.calls.push(url);
    if (this.error) {
      throw this.error;
    }
    if (!this.result) {
      throw new Error('FakeHomepageScrapeProvider result not configured');
    }
    return { ...this.result, url: this.result.url || url };
  }
}
