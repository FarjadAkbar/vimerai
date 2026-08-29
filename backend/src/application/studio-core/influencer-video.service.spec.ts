import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InfluencerVideoService } from '@/application/studio-core/influencer-video.service';
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
import { FakeVideoGenerationProvider } from '@/testing/fakes/fake-video-generation.provider';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { IStorageService } from '@/core/ports/storage.service';
import { GenerationMode } from '@/domain/video.entity';

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

describe('InfluencerVideoService', () => {
  function createService(videoUrl = 'https://cdn.example.com/video.mp4') {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const influencerRepo = new InMemoryAiInfluencerRepository();
    const mediaRepo = new InMemoryMediaAssetRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const mediaAssetService = new MediaAssetService(mediaRepo, storageFake());
    const videoProvider = new FakeVideoGenerationProvider(videoUrl);

    const service = new InfluencerVideoService(
      jobService,
      contentRepo,
      influencerRepo,
      mediaAssetService,
      videoProvider,
      subscriptionFake(),
    );

    return { service, influencerRepo, mediaAssetService, videoProvider, contentRepo, jobRepo };
  }

  async function seedInfluencer(influencerRepo: InMemoryAiInfluencerRepository) {
    const influencer = AiInfluencer.create({
      id: 'inf-1',
      userId: 'user-1',
      name: 'Ava Lane',
      gender: InfluencerGender.FEMALE,
      age: 28,
      ethnicity: 'East Asian',
      appearancePrompt: 'Soft studio light, natural makeup.',
      portraitSource: PortraitSource.AI,
      portraitUrl: 'https://cdn.example.com/portrait.jpg',
    });
    await influencerRepo.create(influencer);
    return influencer;
  }

  async function seedInfluencerImage(
    contentRepo: InMemoryContentItemRepository,
    jobRepo: InMemoryJobRepository,
  ) {
    const job = Job.create({
      id: 'img-job-1',
      userId: 'user-1',
      type: JobType.INFLUENCER_IMAGE,
      jobInput: { influencerId: 'inf-1' },
      status: JobStatus.COMPLETED,
    });
    await jobRepo.create(job);
    const item = ContentItem.create({
      id: 'img-item-1',
      userId: 'user-1',
      jobId: job.id,
      mediaKind: ContentItemMediaKind.IMAGE,
      mediaUrl: 'https://cdn.example.com/generated.jpg',
    });
    await contentRepo.create(item);
    return item;
  }

  it('generates an image-to-video job from portrait with instructions', async () => {
    const { service, influencerRepo, videoProvider } = createService();
    await seedInfluencer(influencerRepo);

    const result = await service.generateVideo('user-1', 'inf-1', {
      mode: 'image_to_video',
      instructions: 'Slow zoom, golden hour',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.jobType).toBe(JobType.INFLUENCER_VIDEO_I2V);
    expect(result.mediaKind).toBe('video');
    expect(videoProvider.generateCalls).toHaveLength(1);
    expect(videoProvider.generateCalls[0]?.mode).toBe(GenerationMode.CINEMATIC);
    expect(videoProvider.generateCalls[0]?.productAssetUrls).toEqual([
      'https://cdn.example.com/portrait.jpg',
    ]);
    expect(videoProvider.generateCalls[0]?.prompt).toContain('Slow zoom');
  });

  it('generates image-to-video from an influencer image content item', async () => {
    const { service, influencerRepo, contentRepo, jobRepo, videoProvider } =
      createService();
    await seedInfluencer(influencerRepo);
    await seedInfluencerImage(contentRepo, jobRepo);

    const result = await service.generateVideo('user-1', 'inf-1', {
      mode: 'image_to_video',
      sourceContentItemId: 'img-item-1',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(videoProvider.generateCalls[0]?.productAssetUrls).toEqual([
      'https://cdn.example.com/generated.jpg',
    ]);
  });

  it('generates a talking head video with script', async () => {
    const { service, influencerRepo, videoProvider } = createService();
    await seedInfluencer(influencerRepo);

    const result = await service.generateVideo('user-1', 'inf-1', {
      mode: 'talking_head',
      script: 'Hey everyone, check out this new drop!',
    });

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.jobType).toBe(JobType.INFLUENCER_TALKING_HEAD);
    expect(result.title).toContain('talking head');
    expect(videoProvider.generateCalls[0]?.mode).toBe(GenerationMode.AVATAR);
    expect(videoProvider.generateCalls[0]?.prompt).toContain(
      'Hey everyone, check out this new drop!',
    );
  });

  it('rejects talking head without script', async () => {
    const { service, influencerRepo } = createService();
    await seedInfluencer(influencerRepo);

    await expect(
      service.generateVideo('user-1', 'inf-1', {
        mode: 'talking_head',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('animates from a completed influencer image content item', async () => {
    const { service, influencerRepo, contentRepo, jobRepo } = createService();
    await seedInfluencer(influencerRepo);
    await seedInfluencerImage(contentRepo, jobRepo);

    const result = await service.animateFromContentItem(
      'user-1',
      'inf-1',
      'img-item-1',
    );

    expect(result.status).toBe(JobStatus.COMPLETED);
    expect(result.jobType).toBe(JobType.INFLUENCER_VIDEO_I2V);
  });

  it('lists influencer videos filtered by influencer id', async () => {
    const { service, influencerRepo } = createService();
    await seedInfluencer(influencerRepo);

    await service.generateVideo('user-1', 'inf-1', {
      mode: 'image_to_video',
    });
    await service.generateVideo('user-1', 'inf-1', {
      mode: 'talking_head',
      script: 'Hello world',
    });

    const videos = await service.listInfluencerVideos('user-1', 'inf-1');
    expect(videos).toHaveLength(2);
    expect(videos.map((v) => v.jobType).sort()).toEqual([
      JobType.INFLUENCER_TALKING_HEAD,
      JobType.INFLUENCER_VIDEO_I2V,
    ]);
  });

  it('rejects access to another users influencer', async () => {
    const { service, influencerRepo } = createService();
    await seedInfluencer(influencerRepo);

    await expect(
      service.generateVideo('user-2', 'inf-1', { mode: 'image_to_video' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
