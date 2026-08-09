import type { HomepageScrapeResult } from '@/types/brand/business-dna';

export interface IHomepageScrapeProvider {
  scrape(url: string): Promise<HomepageScrapeResult>;
}
