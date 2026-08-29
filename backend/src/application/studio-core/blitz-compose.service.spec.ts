import { BadRequestException } from '@nestjs/common';
import { BlitzComposeService } from '@/application/studio-core/blitz-compose.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { ContentItemMediaKind } from '@/domain/content-item.entity';
import { JobStatus } from '@/domain/job.entity';
import { JobService } from '@/application/studio-core/job.service';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';
import type { IStorageService } from '@/core/ports/storage.service';

function storageFake(): IStorageService {
  return {
    upload: async (key) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key) => `https://cdn.example.com/${key}`,
  };
}

describe('BlitzComposeService', () => {
  function createService() {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const brandRepo = new InMemoryBrandKitRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const service = new BlitzComposeService(
      jobService,
      contentRepo,
      brandRepo,
      storageFake(),
    );
    return { service, brandRepo };
  }

  async function seedBrand(brandRepo: InMemoryBrandKitRepository) {
    await brandRepo.create(
      BrandKit.create(
        'brand-1',
        'user-1',
        'Acme',
        'https://cdn.example.com/logo.png',
        { primary: '#111111', secondary: '#eeeeee' },
        'professional',
        'Creators',
        '',
      ),
    );
  }

  it('stores a composed image as a blitz_compose job and content item', async () => {
    const { service, brandRepo } = createService();
    await seedBrand(brandRepo);

    const result = await service.composeAndSave('user-1', {
      brandId: 'brand-1',
      formatId: 'green-screen',
      hook: 'POV: this edit stuck',
      sourceTemplateId: 'template-1',
      file: Buffer.from('fake-image'),
      contentType: 'image/jpeg',
      originalName: 'compose.jpg',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.mediaKind).toBe(ContentItemMediaKind.IMAGE);
    expect(result.mediaUrl).toContain('blitz-composes/user-1/');
    expect(result.contentItemId).toBeTruthy();
  });

  it('rejects compose without a composed file', async () => {
    const { service, brandRepo } = createService();
    await seedBrand(brandRepo);

    await expect(
      service.composeAndSave('user-1', {
        brandId: 'brand-1',
        formatId: 'green-screen',
        hook: 'POV: this edit stuck',
        file: Buffer.alloc(0),
        contentType: 'image/jpeg',
        originalName: 'compose.jpg',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
