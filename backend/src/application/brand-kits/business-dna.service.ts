import { Inject, Injectable } from '@nestjs/common';
import type { IBrandKitService } from '@/core/ports/brand-kit.service';
import type { IBusinessDnaExtractor } from '@/core/ports/business-dna-extractor';
import type {
  GenerateBusinessDnaInput,
  IBusinessDnaService,
} from '@/core/ports/business-dna.service';
import type { IHomepageScrapeProvider } from '@/core/ports/homepage-scrape.provider';
import {
  BRAND_KIT_SERVICE_TOKEN,
  BUSINESS_DNA_EXTRACTOR_TOKEN,
  HOMEPAGE_SCRAPE_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';

const PLACEHOLDER_LOGO =
  'https://cdn.example.com/placeholders/brand-logo.png';

@Injectable()
export class BusinessDnaService implements IBusinessDnaService {
  constructor(
    @Inject(HOMEPAGE_SCRAPE_PROVIDER_TOKEN)
    private readonly homepageScrape: IHomepageScrapeProvider,
    @Inject(BUSINESS_DNA_EXTRACTOR_TOKEN)
    private readonly extractor: IBusinessDnaExtractor,
    @Inject(BRAND_KIT_SERVICE_TOKEN)
    private readonly brandKitService: IBrandKitService,
  ) {}

  async generateFromUrl(userId: string, input: GenerateBusinessDnaInput) {
    const scrape = await this.homepageScrape.scrape(input.url);
    const extraction = await this.extractor.extract(scrape);
    const logoUrl = extraction.logoUrl?.trim() || PLACEHOLDER_LOGO;

    return this.brandKitService.createBrandKit(userId, {
      name: extraction.name,
      logoUrl,
      colors: {
        primary: extraction.primaryColor,
        secondary: extraction.secondaryColor ?? extraction.primaryColor,
      },
      tone: extraction.tone,
      audience: extraction.audience,
      thingsToAvoid: '',
      businessDna: extraction.businessDna,
    });
  }
}
