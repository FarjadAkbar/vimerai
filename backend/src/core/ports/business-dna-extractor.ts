import type {
  BusinessDnaExtraction,
  HomepageScrapeResult,
} from '@/types/brand/business-dna';

export interface IBusinessDnaExtractor {
  extract(scrape: HomepageScrapeResult): Promise<BusinessDnaExtraction>;
}
