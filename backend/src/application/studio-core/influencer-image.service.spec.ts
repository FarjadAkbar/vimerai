import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InfluencerImageService } from '@/application/studio-core/influencer-image.service';
import { JobService } from '@/application/studio-core/job.service';
import { MediaAssetService } from '@/application/studio-core/media-asset.service';
import {
  InfluencerGender,
  PortraitSource,
  AiInfluencer,
} from '@/domain/ai-influencer.entity';
import { Job, JobStatus, JobType } from '@/domain/job.entity';
import { ContentItem, ContentItemMediaKind } from '@/domain/content-item.entity';
import { v4 as uuidv4 } from 'uuid';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { InMemoryAiInfluencerRepository } from '@/testing/fakes/in-memory-ai-influencer.repository';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';
import { InMemoryMediaAssetRepository } from '@/testing/fakes/in-memory-media-asset.repository';
import { FakeImageGenerationProvider } from '@/testing/fakes/fake-image-generation.provider';
import { FakeVideoGenerationProvider } from '@/testing/fakes/fake-video-generation.provider';
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

describe('InfluencerImageService', () => {
  function createService(
    imageUrl = 'https://cdn.example.com/generated.jpg',
    videoUrl = 'https://cdn.example.com/animated.mp4',
  ) {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const influencerRepo = new InMemoryAiInfluencerRepository();
    const mediaRepo = new InMemoryMediaAssetRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const mediaAssetService = new MediaAssetService(mediaRepo, storageFake());
    const imageProvider = new FakeImageGenerationProvider(imageUrl);
    const videoProvider = new FakeVideoGenerationProvider(videoUrl);

    const service = new InfluencerImageService(
      jobService,
      contentRepo,
      influencerRepo,
      mediaAssetService,
      imageProvider,
      videoProvider,
      subscriptionFake(),
    );

    return {
      service,
      influencerRepo,
      mediaAssetService,
      imageProvider,
      videoProvider,
      contentRepo,
      jobRepo,
    };
  }

  async function seedInfluencer(
    influencerRepo: InMemoryAiInfluencerRepository,
    overrides?: Partial<{
      portraitUrl: string;
      portraitMediaAssetId: string | null;
    }>,
  ) {
    const influencer = AiInfluencer.create({
      id: 'inf-1',
      userId: 'user-1',
      name: 'Ava Lane',
      gender: InfluencerGender.FEMALE,
      age: 28,
      ethnicity: 'East Asian',
      appearancePrompt: 'Soft studio light, natural makeup.',
      portraitSource: PortraitSource.AI,
      portraitUrl: overrides?.portraitUrl ?? 'https://cdn.example.com/portrait.jpg',
      portraitMediaAssetId: overrides?.portraitMediaAssetId ?? null,
    });
    await influencerRepo.create(influencer);
    return influencer;
  }

  it('generates an influencer image job and content item from portrait + instructions', async () => {
    const { service, influencerRepo, imageProvider } = createService();
    await seedInfluencer(influencerRepo);

    const result = await service.generateImage('user-1', 'inf-1', {
      instructions: 'Outdoor golden hour',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.jobType).toBe(JobType.INFLUENCER_IMAGE);
    expect(result.mediaKind).toBe('image');
    expect(result.mediaUrl).toBe('https://cdn.example.com/generated.jpg');
    expect(imageProvider.calls).toHaveLength(1);
    expect(imageProvider.calls[0]?.productImageUrls).toContain(
      'https://cdn.example.com/portrait.jpg',
    );
    expect(imageProvider.calls[0]?.prompt).toContain('Outdoor golden hour');
  });

  it('includes additional reference media assets when generating', async () => {
    const { service, influencerRepo, mediaAssetService, imageProvider } =
      createService();
    await seedInfluencer(influencerRepo);
    const ref = await mediaAssetService.createMediaAsset('user-1', {
      kind: MediaAssetKind.IMAGE,
      name: 'outfit.jpg',
      url: 'https://cdn.example.com/outfit.jpg',
    });

    await service.generateImage('user-1', 'inf-1', {
      referenceMediaAssetIds: [ref.id],
    });

    expect(imageProvider.calls[0]?.productImageUrls).toEqual([
      'https://cdn.example.com/portrait.jpg',
      'https://cdn.example.com/outfit.jpg',
    ]);
  });

  it('rejects generation without any reference images', async () => {
    const { service, influencerRepo } = createService();
    await influencerRepo.create(
      AiInfluencer.create({
        id: 'inf-2',
        userId: 'user-1',
        name: 'No Portrait',
        gender: InfluencerGender.MALE,
        age: 30,
        appearancePrompt: 'Minimal look.',
        portraitSource: PortraitSource.UPLOAD,
        portraitMediaAssetId: null,
        portraitUrl: null,
      }),
    );

    await expect(
      service.generateImage('user-1', 'inf-2', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('lists influencer images filtered by influencer id', async () => {
    const { service, influencerRepo } = createService();
    await seedInfluencer(influencerRepo);
    await influencerRepo.create(
      AiInfluencer.create({
        id: 'inf-2',
        userId: 'user-1',
        name: 'Other',
        gender: InfluencerGender.MALE,
        age: 30,
        appearancePrompt: 'Other look.',
        portraitSource: PortraitSource.AI,
        portraitUrl: 'https://cdn.example.com/other.jpg',
      }),
    );

    await service.generateImage('user-1', 'inf-1', { instructions: 'Studio' });
    await service.generateImage('user-1', 'inf-2', { instructions: 'Street' });

    const images = await service.listInfluencerImages('user-1', 'inf-1');
    expect(images).toHaveLength(1);
    expect(images[0]?.status).toBe(JobStatus.COMPLETED);
  });

  it('animates a completed influencer image into a video content item', async () => {
    const { service, influencerRepo, videoProvider } = createService();
    await seedInfluencer(influencerRepo);

    const image = await service.generateImage('user-1', 'inf-1', {
      instructions: 'Close-up',
    });

    const video = await service.animateImage('user-1', 'inf-1', image.id);
    expect(video.status).toBe(JobStatus.COMPLETED);
    expect(video.jobType).toBe(JobType.INFLUENCER_VIDEO_I2V);
    expect(video.mediaKind).toBe('video');
    expect(video.mediaUrl).toMatch(/animated.*\.mp4$/);
    expect(videoProvider.generateCalls).toHaveLength(1);
    expect(videoProvider.generateCalls[0]?.productAssetUrls).toEqual([
      'https://cdn.example.com/generated.jpg',
    ]);

    const videos = await service.listInfluencerVideos('user-1', 'inf-1');
    expect(videos).toHaveLength(1);
  });

  it('rejects animate for content items that are not influencer images', async () => {
    const { service, influencerRepo, jobRepo, contentRepo } = createService();
    await seedInfluencer(influencerRepo);

    const job = Job.create({
      id: 'other-job',
      userId: 'user-1',
      type: JobType.VIRAL_REMIX,
      jobInput: { influencerId: 'inf-1' },
    });
    await jobRepo.create(job);
    const item = ContentItem.create({
      id: uuidv4(),
      userId: 'user-1',
      jobId: job.id,
      mediaKind: ContentItemMediaKind.VIDEO,
      mediaUrl: 'https://cdn.example.com/other.mp4',
    });
    await contentRepo.create(item);

    await expect(
      service.animateImage('user-1', 'inf-1', item.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects access to another users influencer', async () => {
    const { service, influencerRepo } = createService();
    await seedInfluencer(influencerRepo);

    await expect(
      service.generateImage('user-2', 'inf-1', {}),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
