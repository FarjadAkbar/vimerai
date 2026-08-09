import { BusinessDnaService } from '@/application/brand-kits/business-dna.service';
import { BrandKitService } from '@/application/brand-kits/brand-kit.service';
import type { IStorageService } from '@/core/ports/storage.service';
import { FakeBusinessDnaExtractor } from '@/testing/fakes/fake-business-dna-extractor';
import { FakeHomepageScrapeProvider } from '@/testing/fakes/fake-homepage-scrape.provider';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { emptyBusinessDna } from '@/types/brand/business-dna';

function createStorageFake(): IStorageService {
  return {
    upload: async (key: string) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key: string) => `https://cdn.example.com/${key}`,
  };
}

describe('BusinessDnaService', () => {
  it('scrapes a homepage URL, extracts Business DNA, and persists a Brand', async () => {
    const scrape = new FakeHomepageScrapeProvider();
    scrape.result = {
      url: 'https://nitroshinepro.com/',
      title: 'NitroShine | Pro-Grade Car Care',
      description: 'Showroom Shine Starts With Nitro Shine',
      textContent: 'Professional-grade car care for home use in Karachi.',
      logoCandidateUrl: 'https://nitroshinepro.com/og-logo.png',
      previewImageUrl: 'https://nitroshinepro.com/og-logo.png',
    };

    const extractor = new FakeBusinessDnaExtractor();
    const dna = emptyBusinessDna('https://nitroshinepro.com/');
    dna.tagline = 'Showroom Shine Starts With Nitro Shine';
    dna.typography = 'Montserrat';
    dna.colorPalette = ['#1A1A1A', '#FFFFFF'];
    dna.values = ['Professional Quality', 'Reliability'];
    dna.aesthetic = ['Modern', 'Clean'];
    dna.industry = 'Automotive & Transportation Services';
    dna.primaryLanguage = 'English';
    dna.elevatorPitch = 'Pro-grade car care for home use.';
    extractor.result = {
      name: 'NitroShine',
      logoUrl: 'https://nitroshinepro.com/og-logo.png',
      primaryColor: '#E80000',
      secondaryColor: '#1A1A1A',
      tone: 'professional',
      audience: 'Car enthusiasts in Karachi',
      businessDna: dna,
    };

    const brandKits = new BrandKitService(
      new InMemoryBrandKitRepository(),
      createStorageFake(),
    );
    const service = new BusinessDnaService(scrape, extractor, brandKits);

    const result = await service.generateFromUrl('user-1', {
      url: 'https://nitroshinepro.com/',
    });

    expect(scrape.calls).toEqual(['https://nitroshinepro.com/']);
    expect(extractor.calls).toHaveLength(1);
    expect(result.brandKit.name).toBe('NitroShine');
    expect(result.brandKit.tone).toBe('professional');
    expect(result.brandKit.colors.primary).toBe('#E80000');
    expect(result.brandKit.audience).toBe('Car enthusiasts in Karachi');
    expect(result.brandKit.businessDna?.websiteUrl).toBe(
      'https://nitroshinepro.com/',
    );
    expect(result.brandKit.businessDna?.tagline).toBe(
      'Showroom Shine Starts With Nitro Shine',
    );
    expect(result.brandKit.businessDna?.values).toContain(
      'Professional Quality',
    );
    expect(result.brandKit.businessDna?.industry).toBe(
      'Automotive & Transportation Services',
    );
  });

  it('uses a placeholder logo when scrape has no logo candidate', async () => {
    const scrape = new FakeHomepageScrapeProvider();
    scrape.result = {
      url: 'https://example.com/',
      title: 'Example Co',
      description: 'We make things',
      textContent: 'We make things',
      logoCandidateUrl: null,
      previewImageUrl: null,
    };
    const extractor = new FakeBusinessDnaExtractor();
    extractor.result = {
      name: 'Example Co',
      logoUrl: null,
      primaryColor: '#112233',
      secondaryColor: null,
      tone: 'friendly',
      audience: 'Makers',
      businessDna: emptyBusinessDna('https://example.com/'),
    };
    const brandKits = new BrandKitService(
      new InMemoryBrandKitRepository(),
      createStorageFake(),
    );
    const service = new BusinessDnaService(scrape, extractor, brandKits);

    const result = await service.generateFromUrl('user-1', {
      url: 'https://example.com/',
    });

    expect(result.brandKit.logoUrl).toContain('placeholders/brand-logo.png');
  });
});
