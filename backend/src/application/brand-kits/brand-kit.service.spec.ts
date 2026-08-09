import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BrandKitService } from '@/application/brand-kits/brand-kit.service';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IStorageService } from '@/core/ports/storage.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';

function createStorageFake(): IStorageService {
  return {
    upload: async (key: string) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key: string) => `https://cdn.example.com/${key}`,
  };
}

describe('BrandKitService', () => {
  let repository: IBrandKitRepository;
  let service: BrandKitService;
  let storage: IStorageService;

  beforeEach(() => {
    repository = new InMemoryBrandKitRepository();
    storage = createStorageFake();
    service = new BrandKitService(repository, storage);
  });

  it('lets a user create a Brand Kit with required fields', async () => {
    const result = await service.createBrandKit('user-1', {
      name: 'Nitro Shine',
      logoUrl: 'https://cdn.example.com/logo.png',
      colors: { primary: '#111111', secondary: '#C9A227' },
      tone: 'luxury',
      audience: 'Premium shoppers',
      thingsToAvoid: 'Slang, hype',
      aiInstructions: 'Keep sentences short',
    });

    expect(result.brandKit.name).toBe('Nitro Shine');
    expect(result.brandKit.tone).toBe('luxury');
    expect(result.brandKit.userId).toBe('user-1');
    expect(result.brandKit.aiInstructions).toBe('Keep sentences short');
  });

  it('lets a user create a thin Brand with Brand Confirm fields only', async () => {
    const result = await service.createBrandKit('user-1', {
      name: 'Nitro Shine',
      logoUrl: 'https://cdn.example.com/logo.png',
      colors: { primary: '#111111' },
      tone: 'professional',
    });

    expect(result.brandKit.name).toBe('Nitro Shine');
    expect(result.brandKit.colors.primary).toBe('#111111');
    expect(result.brandKit.colors.secondary).toBe('#111111');
    expect(result.brandKit.tone).toBe('professional');
    expect(result.brandKit.audience).toBe('');
    expect(result.brandKit.thingsToAvoid).toBe('');
    expect(result.brandKit.businessDna).toBeNull();
  });

  it('persists Business DNA on a Brand', async () => {
    const result = await service.createBrandKit('user-1', {
      name: 'NitroShine',
      logoUrl: 'https://cdn.example.com/logo.png',
      colors: { primary: '#E80000', secondary: '#1A1A1A' },
      tone: 'professional',
      audience: 'Car enthusiasts',
      businessDna: {
        websiteUrl: 'https://nitroshinepro.com/',
        typography: 'Montserrat',
        colorPalette: ['#FFFFFF'],
        tagline: 'Showroom Shine Starts With Nitro Shine',
        values: ['Reliability'],
        aesthetic: ['Modern'],
        toneOfVoice: 'Authoritative yet accessible',
        imageStyle: 'High-contrast product shots',
        writingStyle: 'Instructional',
        industry: 'Automotive',
        primaryLanguage: 'English',
        elevatorPitch: 'Pro-grade care for home use.',
      },
    });

    expect(result.brandKit.businessDna?.tagline).toContain('Showroom Shine');
    expect(result.brandKit.businessDna?.typography).toBe('Montserrat');
  });

  it('lists only Brand Kits owned by the user', async () => {
    await service.createBrandKit('user-1', {
      name: 'Mine',
      logoUrl: 'https://cdn.example.com/a.png',
      colors: { primary: '#000000', secondary: '#ffffff' },
      tone: 'bold',
      audience: 'Athletes',
      thingsToAvoid: 'Weak CTAs',
    });
    await repository.create(
      BrandKit.create(
        'other-id',
        'user-2',
        'Other',
        'https://cdn.example.com/b.png',
        { primary: '#000000', secondary: '#ffffff' },
        'playful',
        'Kids',
        'Scary imagery',
      ),
    );

    const result = await service.listBrandKits('user-1');

    expect(result.brandKits).toHaveLength(1);
    expect(result.brandKits[0].name).toBe('Mine');
  });

  it('updates a Brand Kit the user owns', async () => {
    const created = await service.createBrandKit('user-1', {
      name: 'Aura',
      logoUrl: 'https://cdn.example.com/logo.png',
      colors: { primary: '#111111', secondary: '#222222' },
      tone: 'professional',
      audience: 'B2B buyers',
      thingsToAvoid: 'Emojis',
    });

    const updated = await service.updateBrandKit('user-1', created.brandKit.id, {
      tone: 'friendly',
      audience: 'Gen Z',
    });

    expect(updated.brandKit.tone).toBe('friendly');
    expect(updated.brandKit.audience).toBe('Gen Z');
    expect(updated.brandKit.name).toBe('Aura');
  });

  it('forbids updating another user Brand Kit', async () => {
    const created = await service.createBrandKit('user-1', {
      name: 'Aura',
      logoUrl: 'https://cdn.example.com/logo.png',
      colors: { primary: '#111111', secondary: '#222222' },
      tone: 'professional',
      audience: 'B2B buyers',
      thingsToAvoid: 'Emojis',
    });

    await expect(
      service.updateBrandKit('intruder', created.brandKit.id, { name: 'Stolen' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns not found for missing Brand Kit', async () => {
    await expect(
      service.updateBrandKit('user-1', 'missing-id', { name: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an invalid tone', async () => {
    await expect(
      service.createBrandKit('user-1', {
        name: 'Bad',
        logoUrl: 'https://cdn.example.com/logo.png',
        colors: { primary: '#111111', secondary: '#222222' },
        tone: 'chaotic' as 'luxury',
        audience: 'Everyone',
        thingsToAvoid: 'Everything',
      }),
    ).rejects.toThrow(/Invalid tone/);
  });

  it('uploads a logo and returns a storage URL', async () => {
    const result = await service.uploadLogo(
      'user-1',
      Buffer.from('fake-image'),
      'image/png',
    );

    expect(result.logoUrl).toContain('https://cdn.example.com/');
    expect(result.logoUrl).toContain('user-1');
  });
});
