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
    dna.imageStyle =
      'Images should feature high-contrast, sharp product photography with clear before-and-after results. Use a modern studio aesthetic with clean pedestals for hero shots, plus real-world application scenes that show the product working on vehicles.';
    dna.writingStyle =
      'Write in an authoritative yet accessible voice that focuses on the brand promise from the homepage. Use instructional, encouraging sentences that simplify the process and emphasize ease of use and visible results — not vague tone labels alone.';
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
