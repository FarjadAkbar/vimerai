import type { IBusinessDnaExtractor } from '@/core/ports/business-dna-extractor';
import type {
  BusinessDnaExtraction,
  HomepageScrapeResult,
} from '@/types/brand/business-dna';
import { emptyBusinessDna } from '@/types/brand/business-dna';

export class FakeBusinessDnaExtractor implements IBusinessDnaExtractor {
  public calls: HomepageScrapeResult[] = [];
  public result: BusinessDnaExtraction | null = null;

  async extract(scrape: HomepageScrapeResult): Promise<BusinessDnaExtraction> {
    this.calls.push(scrape);
    if (this.result) {
      return this.result;
    }
    const dna = emptyBusinessDna(scrape.url);
    dna.tagline = scrape.description;
    dna.elevatorPitch = scrape.description;
    dna.typography = 'Montserrat';
    dna.colorPalette = ['#1A1A1A', '#FFFFFF'];
    dna.values = ['Professional Quality', 'Simplicity'];
    dna.aesthetic = ['Modern', 'Clean'];
    dna.toneOfVoice = 'Authoritative yet accessible';
    dna.imageStyle = 'High-contrast product photography';
    dna.writingStyle = 'Instructional and encouraging';
    dna.industry = 'Automotive & Transportation Services';
    dna.primaryLanguage = 'English';
    return {
      name: scrape.title?.split('|')[0]?.trim() || 'Extracted Brand',
      logoUrl: scrape.logoCandidateUrl,
      primaryColor: '#E80000',
      secondaryColor: '#1A1A1A',
      tone: 'professional',
      audience: scrape.description || 'Customers',
      businessDna: dna,
    };
  }
}
