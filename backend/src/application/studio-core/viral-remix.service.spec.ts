import { BadRequestException } from '@nestjs/common';
import { ViralRemixService } from '@/application/studio-core/viral-remix.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { JobStatus } from '@/domain/job.entity';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { JobService } from '@/application/studio-core/job.service';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';
import { InMemoryMediaAssetRepository } from '@/testing/fakes/in-memory-media-asset.repository';
import { FakeVideoGenerationProvider } from '@/testing/fakes/fake-video-generation.provider';
import type { IFormatCatalog } from '@/core/ports/format.catalog';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { IStorageService } from '@/core/ports/storage.service';

function formatCatalogFake(): IFormatCatalog {
  return {
    getById: (id) => ({
      id,
      label: 'Hook Reveal',
      description: 'Hook then reveal',
      modality: 'video',
      promptStructure: 'Hook, reveal, CTA.',
      tags: [],
    }),
    list: () => [],
  };
}

function subscriptionFake(): ISubscriptionService {
  return {
    canGenerate: async () => true,
    recordVideoGeneration: async () => undefined,
    recordImageGeneration: async () => undefined,
    recordPostGeneration: async () => undefined,
    getUsage: async () => ({
      videosUsed: 0,
      imagesUsed: 0,
      postsUsed: 0,
      videoLimit: 100,
      imageLimit: 100,
      postLimit: 100,
    }),
  };
}

function storageFake(): IStorageService {
  return {
    upload: async (key) => `https://cdn.example.com/${key}`,
    delete: async () => undefined,
    getUrl: (key) => `https://cdn.example.com/${key}`,
  };
}

describe('ViralRemixService', () => {
  function createService(videoUrl = 'https://cdn.example.com/remix.mp4') {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const brandRepo = new InMemoryBrandKitRepository();
    const mediaRepo = new InMemoryMediaAssetRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const mediaAssetService = new MediaAssetService(mediaRepo, storageFake());
    const videoProvider = new FakeVideoGenerationProvider(videoUrl);

    const service = new ViralRemixService(
      jobService,
      contentRepo,
      brandRepo,
      mediaAssetService,
      formatCatalogFake(),
      videoProvider,
      subscriptionFake(),
    );

    return { service, brandRepo, mediaAssetService, videoProvider };
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

  it('creates a viral remix job and content item from media assets', async () => {
    const { service, brandRepo, mediaAssetService } = createService();
    await seedBrand(brandRepo);

    const refVideo = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.VIDEO,
      name: 'ref.mp4',
      url: 'https://cdn.example.com/ref.mp4',
    });
    const productImage = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'product.jpg',
      url: 'https://cdn.example.com/product.jpg',
    });

    const result = await service.createRemix('user-1', {
      brandId: 'brand-1',
      formatId: 'hook-reveal',
      referenceVideoMediaAssetId: refVideo.id,
      productImageMediaAssetId: productImage.id,
      instructions: 'Fast hook, bold colors',
      aspectRatio: '9:16',
      durationSeconds: 20,
      quality: '720p',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.mediaUrl).toBe('https://cdn.example.com/remix.mp4');
    expect(result.contentItemId).toBeTruthy();
  });

  it('rejects remixes without product or person images', async () => {
    const { service, brandRepo, mediaAssetService } = createService();
    await seedBrand(brandRepo);

    const refVideo = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.VIDEO,
      name: 'ref.mp4',
      url: 'https://cdn.example.com/ref.mp4',
    });

    await expect(
      service.createRemix('user-1', {
        brandId: 'brand-1',
        formatId: 'hook-reveal',
        referenceVideoMediaAssetId: refVideo.id,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('regenerates a completed remix as a new job', async () => {
    const { service, brandRepo, mediaAssetService } = createService();
    await seedBrand(brandRepo);

    const refVideo = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.VIDEO,
      name: 'ref.mp4',
      url: 'https://cdn.example.com/ref.mp4',
    });
    const personImage = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'person.jpg',
      url: 'https://cdn.example.com/person.jpg',
    });

    const first = await service.createRemix('user-1', {
      brandId: 'brand-1',
      formatId: 'hook-reveal',
      referenceVideoMediaAssetId: refVideo.id,
      personImageMediaAssetId: personImage.id,
    });

    const second = await service.regenerateRemix('user-1', first.jobId);

    expect(second.jobId).not.toBe(first.jobId);
    expect(second.status).toBe(JobStatus.COMPLETED);
    expect(second.mediaUrl).toBe('https://cdn.example.com/remix.mp4');
  });
});
