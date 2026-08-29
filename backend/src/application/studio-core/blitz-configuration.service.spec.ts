import { BlitzConfigurationService } from '@/application/studio-core/blitz-configuration.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { InMemoryBlitzConfigurationRepository } from '@/testing/fakes/in-memory-blitz-configuration.repository';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';

describe('BlitzConfigurationService', () => {
  it('returns and persists defaults for a brand on first load', async () => {
    const brandRepo = new InMemoryBrandKitRepository();
    const configRepo = new InMemoryBlitzConfigurationRepository();
    const service = new BlitzConfigurationService(configRepo, brandRepo);

    await brandRepo.create(
      BrandKit.create(
        'brand-1',
        'user-1',
        'Acme',
        'https://cdn.example.com/logo.png',
        { primary: '#000000' },
        'professional',
        'Creators',
        '',
      ),
    );

    const first = await service.getForBrand('user-1', 'brand-1');
    const second = await service.getForBrand('user-1', 'brand-1');

    expect(first.brandId).toBe('brand-1');
    expect(first.mentionFrequency).toBe('sometimes');
    expect(first.enabledFormats['green-screen']).toBe(true);
    expect(second.id).toBe(first.id);
  });

  it('updates mention frequency and enabled content types', async () => {
    const brandRepo = new InMemoryBrandKitRepository();
    const configRepo = new InMemoryBlitzConfigurationRepository();
    const service = new BlitzConfigurationService(configRepo, brandRepo);

    await brandRepo.create(
      BrandKit.create(
        'brand-1',
        'user-1',
        'Acme',
        'https://cdn.example.com/logo.png',
        { primary: '#000000' },
        'professional',
        'Creators',
        '',
      ),
    );

    await service.getForBrand('user-1', 'brand-1');
    const updated = await service.updateForBrand('user-1', 'brand-1', {
      mentionFrequency: 'often',
      showInfluencerMaterials: true,
      enabledFormats: {
        slideshow: false,
        'wall-of-text': true,
        'hook-demo': false,
        'green-screen': true,
      },
    });

    expect(updated.mentionFrequency).toBe('often');
    expect(updated.showInfluencerMaterials).toBe(true);
    expect(updated.enabledFormats.slideshow).toBe(false);
    expect(updated.enabledFormats['green-screen']).toBe(true);
  });
});
