import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AiImageService } from '@/application/studio-core/ai-image.service';
import { JobService } from '@/application/studio-core/job.service';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import { Job, JobStatus, JobType } from '@/domain/job.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';
import { InMemoryMediaAssetRepository } from '@/testing/fakes/in-memory-media-asset.repository';
import { FakeImageGenerationProvider } from '@/testing/fakes/fake-image-generation.provider';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { IStorageService } from '@/core/ports/storage.service';

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

describe('AiImageService', () => {
  function createService(imageUrl = 'https://cdn.example.com/ai-image.png') {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const mediaRepo = new InMemoryMediaAssetRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const mediaAssetService = new MediaAssetService(mediaRepo, storageFake());
    const imageProvider = new FakeImageGenerationProvider(imageUrl);

    const service = new AiImageService(
      jobService,
      contentRepo,
      mediaAssetService,
      imageProvider,
      subscriptionFake(),
    );

    return { service, mediaAssetService, imageProvider, jobRepo };
  }

  it('creates an AI image job and content item from media assets', async () => {
    const { service, mediaAssetService, imageProvider } = createService();
    const ref = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'product.jpg',
      url: 'https://cdn.example.com/product.jpg',
    });

    const result = await service.generateImage('user-1', {
      instructions: 'Premium perfume on silk',
      referenceMediaAssetIds: [ref.id],
      aspectRatio: '1:1',
      outputFormat: 'png',
      generationMode: 'enhanced',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.jobType).toBe(JobType.AI_IMAGE);
    expect(result.mediaUrl).toBe('https://cdn.example.com/ai-image.png');
    expect(imageProvider.calls).toHaveLength(1);
    expect(imageProvider.calls[0]?.productImageUrls).toEqual([
      'https://cdn.example.com/product.jpg',
    ]);
    expect(imageProvider.calls[0]?.enhancePrompt).toBe(true);
    expect(imageProvider.calls[0]?.aspectRatio).toBe('1:1');
    expect(imageProvider.calls[0]?.outputFormat).toBe('png');
  });

  it('supports direct generation mode without provider prompt enhancement', async () => {
    const { service, mediaAssetService, imageProvider } = createService();
    const ref = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'ref.jpg',
      url: 'https://cdn.example.com/ref.jpg',
    });

    await service.generateImage('user-1', {
      instructions: 'Exact prompt only',
      referenceMediaAssetIds: [ref.id],
      generationMode: 'direct',
      aspectRatio: '9:16',
      outputFormat: 'jpeg',
    });

    expect(imageProvider.calls[0]?.enhancePrompt).toBe(false);
    expect(imageProvider.calls[0]?.aspectRatio).toBe('9:16');
    expect(imageProvider.calls[0]?.outputFormat).toBe('jpeg');
  });

  it('rejects generation without reference images', async () => {
    const { service } = createService();

    await expect(
      service.generateImage('user-1', {
        instructions: 'No refs',
        referenceMediaAssetIds: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists AI image jobs for the user', async () => {
    const { service, mediaAssetService } = createService();
    const ref = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'ref.jpg',
      url: 'https://cdn.example.com/ref.jpg',
    });

    await service.generateImage('user-1', {
      instructions: 'First image',
      referenceMediaAssetIds: [ref.id],
    });
    await service.generateImage('user-1', {
      instructions: 'Second image',
      referenceMediaAssetIds: [ref.id],
    });

    const jobs = await service.listImageJobs('user-1');
    expect(jobs).toHaveLength(2);
    expect(jobs[0]?.status).toBe(JobStatus.COMPLETED);
  });

  it('regenerates a completed AI image job', async () => {
    const { service, mediaAssetService } = createService();
    const ref = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'ref.jpg',
      url: 'https://cdn.example.com/ref.jpg',
    });

    const first = await service.generateImage('user-1', {
      instructions: 'Regen me',
      referenceMediaAssetIds: [ref.id],
    });

    const second = await service.regenerateImage('user-1', first.jobId);
    expect(second.status).toBe(JobStatus.COMPLETED);
    expect(second.jobId).not.toBe(first.jobId);
  });

  it('rejects regenerate for non-AI-image jobs', async () => {
    const { service, jobRepo } = createService();
    const job = Job.create({
      id: 'other-job',
      userId: 'user-1',
      type: JobType.VIRAL_REMIX,
      jobInput: {},
      status: JobStatus.COMPLETED,
    });
    await jobRepo.create(job);

    await expect(
      service.regenerateImage('user-1', job.id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
