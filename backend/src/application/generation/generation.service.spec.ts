import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { GenerationService } from '@/application/generation/generation.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { Product } from '@/domain/product.entity';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IProductRepository } from '@/core/ports/product.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { InMemoryGenerationRepository } from '@/testing/fakes/in-memory-generation.repository';
import { InMemoryProductRepository } from '@/testing/fakes/in-memory-product.repository';
import { FakeImageGenerationProvider } from '@/testing/fakes/fake-image-generation.provider';
import { FakeTextGenerationProvider } from '@/testing/fakes/fake-text-generation.provider';

describe('GenerationService.createGeneration', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let videoCalls: number;
  let usageIncrements: number;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    videoCalls = 0;
    usageIncrements = 0;

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => {
        videoCalls += 1;
        return {
          jobId: 'fal-job-1',
          status: 'completed',
          videoUrl: 'https://cdn.example.com/teaser.mp4',
        };
      },
      getGenerationStatus: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
      }),
      stitchClips: async () => ({
        jobId: 'stitch-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'Glow up',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
      'social-post': JSON.stringify({
        headline: 'Hydration elevated',
        body: 'Feel the difference.',
        cta: 'Shop now',
        caption: 'Luxury moisture in every drop.',
        hashtags: ['#serum', '#glow'],
      }),
      'reel-storyboard': JSON.stringify({
        hook: '0-3s hook',
        attention: 'problem',
        productDisplay: 'product shot',
        viewerConnection: 'testimonial vibe',
        scenes: [{ order: 1, description: 'Close-up bottle' }],
      }),
      'reel-caption': 'Watch this glow-up. Link in bio.',
    });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      {
        generateImage: async () => ({
          imageUrl: 'https://cdn.example.com/ai.jpg',
        }),
      },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );
  });

  it('blocks Generate when the user has no Brand Kit', async () => {
    const emptyKits = new InMemoryBrandKitRepository();
    const emptyProducts = new InMemoryProductRepository();
    const blocked = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      emptyProducts,
      emptyKits,
      subscription,
    );

    await expect(
      blocked.createGeneration('user-1', {
        productId: 'prod-1',
        goal: 'increase_sales',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a Teaser Generation with defaults and full content bundle', async () => {
    const result = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });

    expect(result.generationId).toBeTruthy();
    expect(result.status).toBe('completed');
    expect(usageIncrements).toBe(1);
    expect(videoCalls).toBe(1);

    const stored = await service.getGeneration('user-1', result.generationId);
    expect(stored.generation.lengthTier).toBe('teaser');
    expect(stored.generation.feedPlatform).toBe('instagram');
    expect(stored.generation.reelPlatform).toBe('instagram_reels');
    expect(stored.generation.postImageMode).toBe('product_photo');
    expect(stored.generation.snapshot.brandKit.name).toBe('Nitro');
    expect(stored.generation.snapshot.product.name).toBe('Serum');
    expect(stored.generation.socialPost?.caption).toContain('Luxury');
    expect(stored.generation.socialPost?.postImageUrl).toContain('product.jpg');
    expect(stored.generation.reelStoryboard?.hook).toBeTruthy();
    expect(stored.generation.reelCaption).toContain('glow');
    expect(stored.generation.video?.videoUrl).toContain('teaser.mp4');
  });

  it('forbids reading another user Generation', async () => {
    const result = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'brand_awareness',
    });

    await expect(
      service.getGeneration('intruder', result.generationId),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects Generate when credits are exhausted', async () => {
    const noCredits = {
      canGenerate: async () => false,
      recordVideoGeneration: async () => undefined,
    } as unknown as ISubscriptionService;

    const broke = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      noCredits,
    );

    await expect(
      broke.createGeneration('user-1', {
        productId: 'prod-1',
        goal: 'product_launch',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('GenerationService.updateGeneration', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let videoCalls: number;
  let imageCalls: number;
  let usageIncrements: number;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;
  let generationId: string;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    videoCalls = 0;
    imageCalls = 0;
    usageIncrements = 0;

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => {
        videoCalls += 1;
        return {
          jobId: 'fal-job-1',
          status: 'completed',
          videoUrl: 'https://cdn.example.com/teaser.mp4',
        };
      },
      getGenerationStatus: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
      }),
      stitchClips: async () => ({
        jobId: 'stitch-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'Glow up',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
      'social-post': JSON.stringify({
        headline: 'Hydration elevated',
        body: 'Feel the difference.',
        cta: 'Shop now',
        caption: 'Luxury moisture in every drop.',
        hashtags: ['#serum', '#glow'],
      }),
      'reel-storyboard': JSON.stringify({
        hook: '0-3s hook',
        attention: 'problem',
        productDisplay: 'product shot',
        viewerConnection: 'testimonial vibe',
        scenes: [
          { order: 1, description: 'Close-up bottle' },
          { order: 2, description: 'Skin glow' },
        ],
      }),
      'reel-caption': 'Watch this glow-up. Link in bio.',
    });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      {
        generateImage: async () => {
          imageCalls += 1;
          return {
            imageUrl: 'https://cdn.example.com/ai.jpg',
          };
        },
      },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );

    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    generationId = created.generationId;
    text.calls.length = 0;
    videoCalls = 0;
    imageCalls = 0;
    usageIncrements = 0;
  });

  it('persists Manual edits without provider calls or credit spend', async () => {
    const result = await service.updateGeneration('user-1', generationId, {
      socialPost: {
        headline: 'Edited headline',
        caption: 'Edited feed caption',
        hashtags: ['#edited'],
      },
      reelStoryboard: {
        hook: 'Edited hook',
        scenes: [
          { order: 1, description: 'Skin glow' },
          { order: 2, description: 'Close-up bottle' },
        ],
      },
      reelCaption: 'Edited reel caption',
    });

    expect(text.calls).toHaveLength(0);
    expect(videoCalls).toBe(0);
    expect(imageCalls).toBe(0);
    expect(usageIncrements).toBe(0);

    expect(result.generation.socialPost?.headline).toBe('Edited headline');
    expect(result.generation.socialPost?.caption).toBe('Edited feed caption');
    expect(result.generation.socialPost?.hashtags).toEqual(['#edited']);
    expect(result.generation.socialPost?.body).toBe('Feel the difference.');
    expect(result.generation.reelStoryboard?.hook).toBe('Edited hook');
    expect(result.generation.reelStoryboard?.scenes.map((s) => s.description)).toEqual([
      'Skin glow',
      'Close-up bottle',
    ]);
    expect(result.generation.reelCaption).toBe('Edited reel caption');

    const stored = await service.getGeneration('user-1', generationId);
    expect(stored.generation.socialPost?.headline).toBe('Edited headline');
    expect(stored.generation.reelStoryboard?.scenes[0].description).toBe(
      'Skin glow',
    );
  });

  it('forbids Manual edit by another user', async () => {
    await expect(
      service.updateGeneration('intruder', generationId, {
        reelCaption: 'Nope',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('GenerationService.regenerateSection', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let videoCalls: number;
  let usageIncrements: number;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;
  let generationId: string;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    videoCalls = 0;
    usageIncrements = 0;

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => {
        videoCalls += 1;
        return {
          jobId: 'fal-job-1',
          status: 'completed',
          videoUrl: 'https://cdn.example.com/teaser.mp4',
        };
      },
      getGenerationStatus: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
      }),
      stitchClips: async () => ({
        jobId: 'stitch-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider(
      {
        'creative-brief': JSON.stringify({
          hook: 'Stop scrolling',
          attention: 'Glow up',
          productDisplay: 'Bottle hero',
          viewerConnection: 'Made for you',
          cta: 'Shop now',
        }),
        'social-post': JSON.stringify({
          headline: 'Hydration elevated',
          body: 'Feel the difference.',
          cta: 'Shop now',
          caption: 'Luxury moisture in every drop.',
          hashtags: ['#serum', '#glow'],
        }),
        'reel-storyboard': JSON.stringify({
          hook: '0-3s hook',
          attention: 'problem',
          productDisplay: 'product shot',
          viewerConnection: 'testimonial vibe',
          scenes: [
            { order: 1, description: 'Close-up bottle' },
            { order: 2, description: 'Skin glow' },
          ],
        }),
        'reel-caption': 'Watch this glow-up. Link in bio.',
      },
      {
        'social.hashtags': JSON.stringify(['#playful', '#live']),
        'social.cta': 'Try it today',
        'storyboard.scene': 'Audience reaction close-up',
      },
    );

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );

    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    generationId = created.generationId;
    text.calls.length = 0;
    videoCalls = 0;
    usageIncrements = 0;
  });

  it('rewrites only the chosen section via text provider with no credit charge', async () => {
    const before = await service.getGeneration('user-1', generationId);
    const originalHeadline = before.generation.socialPost!.headline;
    const originalBody = before.generation.socialPost!.body;

    const result = await service.regenerateSection('user-1', generationId, {
      sectionKey: 'social.hashtags',
    });

    expect(text.calls).toHaveLength(1);
    expect(text.calls[0].artifact).toBe('section-regenerate');
    expect(text.calls[0].sectionKey).toBe('social.hashtags');
    expect(videoCalls).toBe(0);
    expect(usageIncrements).toBe(0);

    expect(result.generation.socialPost?.hashtags).toEqual([
      '#playful',
      '#live',
    ]);
    expect(result.generation.socialPost?.headline).toBe(originalHeadline);
    expect(result.generation.socialPost?.body).toBe(originalBody);
    expect(result.generation.textSectionRegenCount).toBe(1);
  });

  it('uses live Brand Kit and Product for section regenerate, not only the snapshot', async () => {
    const kit = await brandKits.findById('kit-1');
    await brandKits.update(kit!.update({ tone: 'playful' }));
    const product = await products.findById('prod-1');
    await products.update(
      product!.update({ description: 'Live reformulated serum' }),
    );

    await service.regenerateSection('user-1', generationId, {
      sectionKey: 'social.cta',
    });

    expect(text.calls[0].layers.brandKit).toContain('Tone: playful');
    expect(text.calls[0].layers.brandKit).not.toContain('Tone: luxury');
    expect(text.calls[0].layers.product).toContain('Live reformulated serum');
    expect(text.calls[0].layers.outputSchema).toContain('social.cta');
  });

  it('regenerates one storyboard scene by order', async () => {
    const result = await service.regenerateSection('user-1', generationId, {
      sectionKey: 'storyboard.scene',
      sceneOrder: 2,
    });

    expect(result.generation.reelStoryboard?.scenes).toEqual([
      { order: 1, description: 'Close-up bottle' },
      { order: 2, description: 'Audience reaction close-up' },
    ]);
  });

  it('rejects section regenerate when fair-use limit is reached', async () => {
    const current = await generations.findById(generationId);
    await generations.update(
      current!.withUpdates({ textSectionRegenCount: 20 }),
    );

    await expect(
      service.regenerateSection('user-1', generationId, {
        sectionKey: 'social.hashtags',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(text.calls).toHaveLength(0);
    expect(usageIncrements).toBe(0);
  });
});

describe('GenerationService.retryFailedArms', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let videoCalls: number;
  let usageIncrements: number;
  let failVideo: boolean;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;

  const defaultTextResponses = {
    'creative-brief': JSON.stringify({
      hook: 'Stop scrolling',
      attention: 'Glow up',
      productDisplay: 'Bottle hero',
      viewerConnection: 'Made for you',
      cta: 'Shop now',
    }),
    'social-post': JSON.stringify({
      headline: 'Hydration elevated',
      body: 'Feel the difference.',
      cta: 'Shop now',
      caption: 'Luxury moisture in every drop.',
      hashtags: ['#serum', '#glow'],
    }),
    'reel-storyboard': JSON.stringify({
      hook: '0-3s hook',
      attention: 'problem',
      productDisplay: 'product shot',
      viewerConnection: 'testimonial vibe',
      scenes: [
        { order: 1, description: 'Close-up bottle' },
        { order: 2, description: 'Skin glow' },
      ],
    }),
    'reel-caption': 'Watch this glow-up. Link in bio.',
  };

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    videoCalls = 0;
    usageIncrements = 0;
    failVideo = true;

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => {
        videoCalls += 1;
        if (failVideo) {
          throw new Error('fal down');
        }
        return {
          jobId: 'fal-job-retry',
          status: 'completed',
          videoUrl: 'https://cdn.example.com/teaser-retry.mp4',
        };
      },
      getGenerationStatus: async () => ({
        jobId: 'fal-job-retry',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser-retry.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'fal-job-retry',
        status: 'completed',
      }),
      stitchClips: async () => ({
        jobId: 'stitch-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({ ...defaultTextResponses });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );
  });

  it('keeps successful Content Outputs when video fails (partial success)', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });

    expect(created.status).toBe('partial');
    expect(usageIncrements).toBe(1);
    expect(videoCalls).toBe(1);

    const stored = await service.getGeneration('user-1', created.generationId);
    expect(stored.generation.socialPost?.headline).toBe('Hydration elevated');
    expect(stored.generation.reelStoryboard?.hook).toBeTruthy();
    expect(stored.generation.reelCaption).toContain('glow');
    expect(stored.generation.video?.status).toBe('failed');
    expect(
      stored.generation.arms.find((arm) => arm.arm === 'video')?.status,
    ).toBe('failed');
    expect(
      stored.generation.arms.find((arm) => arm.arm === 'social-post')?.status,
    ).toBe('completed');
  });

  it('retries failed video arm without charging again for completed arms', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    expect(created.status).toBe('partial');
    expect(usageIncrements).toBe(1);
    const socialHeadline = (
      await service.getGeneration('user-1', created.generationId)
    ).generation.socialPost!.headline;

    failVideo = false;
    usageIncrements = 0;
    videoCalls = 0;
    text.calls.length = 0;

    const retried = await service.retryFailedArms(
      'user-1',
      created.generationId,
      { arms: ['video'] },
    );

    expect(usageIncrements).toBe(0);
    expect(videoCalls).toBe(1);
    expect(text.calls).toHaveLength(0);
    expect(retried.generation.status).toBe('completed');
    expect(retried.generation.video?.videoUrl).toContain('teaser-retry.mp4');
    expect(retried.generation.socialPost?.headline).toBe(socialHeadline);
    expect(
      retried.generation.arms.find((arm) => arm.arm === 'video')?.status,
    ).toBe('completed');
  });

  it('retries a failed text arm without recharging', async () => {
    text = new FakeTextGenerationProvider({
      'creative-brief': defaultTextResponses['creative-brief'],
      'reel-storyboard': defaultTextResponses['reel-storyboard'],
      'reel-caption': defaultTextResponses['reel-caption'],
    });
    failVideo = false;
    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );

    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'brand_awareness',
    });
    expect(created.status).toBe('partial');
    const stored = await service.getGeneration('user-1', created.generationId);
    expect(stored.generation.socialPost).toBeNull();
    expect(
      stored.generation.arms.find((arm) => arm.arm === 'social-post')?.status,
    ).toBe('failed');

    text.setResponse(
      'social-post',
      JSON.stringify({
        headline: 'Retried headline',
        body: 'Retried body',
        cta: 'Buy',
        caption: 'Retried caption',
        hashtags: ['#retry'],
      }),
    );
    usageIncrements = 0;
    videoCalls = 0;

    const retried = await service.retryFailedArms(
      'user-1',
      created.generationId,
      { arms: ['social-post'] },
    );

    expect(usageIncrements).toBe(0);
    expect(videoCalls).toBe(0);
    expect(retried.generation.socialPost?.headline).toBe('Retried headline');
    expect(
      retried.generation.arms.find((arm) => arm.arm === 'social-post')?.status,
    ).toBe('completed');
  });

  it('rejects retrying an arm that is not failed', async () => {
    failVideo = false;
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    expect(created.status).toBe('completed');

    await expect(
      service.retryFailedArms('user-1', created.generationId, {
        arms: ['social-post'],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('GenerationService Promo Length Tier', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let videoCalls: number;
  let stitchCalls: number;
  let usageIncrements: number;
  let failBeat: string | null;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    videoCalls = 0;
    stitchCalls = 0;
    usageIncrements = 0;
    failBeat = null;

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async (request) => {
        videoCalls += 1;
        if (failBeat && request.prompt.includes(`Beat: ${failBeat}`)) {
          throw new Error(`${failBeat} shot failed`);
        }
        return {
          jobId: `fal-shot-${videoCalls}`,
          status: 'completed',
          videoUrl: `https://cdn.example.com/shot-${videoCalls}.mp4`,
        };
      },
      getGenerationStatus: async (jobId) => ({
        jobId,
        status: 'completed',
        videoUrl: 'https://cdn.example.com/shot.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'preview',
        status: 'completed',
      }),
      stitchClips: async (clipUrls) => {
        stitchCalls += 1;
        return {
          jobId: 'stitch-promo',
          status: 'completed',
          videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
        };
      },
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'Glow up',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
      'social-post': JSON.stringify({
        headline: 'Hydration elevated',
        body: 'Feel the difference.',
        cta: 'Shop now',
        caption: 'Luxury moisture in every drop.',
        hashtags: ['#serum', '#glow'],
      }),
      'reel-storyboard': JSON.stringify({
        hook: '0-3s hook',
        attention: 'problem',
        productDisplay: 'product shot',
        viewerConnection: 'testimonial vibe',
        scenes: [
          { order: 1, description: 'Close-up bottle' },
          { order: 2, description: 'Skin glow' },
          { order: 3, description: 'Product in hand' },
          { order: 4, description: 'Happy viewer' },
        ],
      }),
      'reel-caption': 'Watch this glow-up. Link in bio.',
    });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );
  });

  it('charges Promo weighted credits and stitches beat-aligned Shots', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
      lengthTier: 'promo',
    });

    expect(created.status).toBe('completed');
    expect(usageIncrements).toBe(4);
    expect(videoCalls).toBe(4);
    expect(stitchCalls).toBe(1);

    const stored = await service.getGeneration('user-1', created.generationId);
    expect(stored.generation.lengthTier).toBe('promo');
    expect(stored.generation.video?.shots).toHaveLength(4);
    expect(stored.generation.video?.shots?.map((shot) => shot.beat)).toEqual([
      'hook',
      'attention',
      'product_display',
      'viewer_connection',
    ]);
    expect(stored.generation.video?.videoUrl).toContain('promo-stitched');
    expect(text.calls.some((call) =>
      call.layers.outputSchema.includes('Promo'),
    )).toBe(true);
  });

  it('keeps successful Promo Shots and retries only failed ones without recharging', async () => {
    failBeat = 'attention';
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'product_launch',
      lengthTier: 'promo',
    });
    expect(created.status).toBe('partial');
    expect(usageIncrements).toBe(4);

    const partial = await service.getGeneration('user-1', created.generationId);
    expect(partial.generation.video?.shots?.find((s) => s.beat === 'hook')?.status).toBe(
      'completed',
    );
    expect(
      partial.generation.video?.shots?.find((s) => s.beat === 'attention')
        ?.status,
    ).toBe('failed');

    failBeat = null;
    usageIncrements = 0;
    const callsBeforeRetry = videoCalls;
    stitchCalls = 0;

    const retried = await service.retryFailedArms(
      'user-1',
      created.generationId,
      { arms: ['video'] },
    );

    expect(usageIncrements).toBe(0);
    expect(videoCalls - callsBeforeRetry).toBe(1);
    expect(stitchCalls).toBe(1);
    expect(retried.generation.status).toBe('completed');
    expect(retried.generation.video?.videoUrl).toContain('promo-stitched');
  });
});

describe('GenerationService AI Post image', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let images: FakeImageGenerationProvider;
  let usageIncrements: number;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    usageIncrements = 0;
    images = new FakeImageGenerationProvider(
      'https://cdn.example.com/ai-post.jpg',
    );

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      getGenerationStatus: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
      }),
      stitchClips: async () => ({
        jobId: 'stitch-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'Glow up',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
      'social-post': JSON.stringify({
        headline: 'Hydration elevated',
        body: 'Feel the difference.',
        cta: 'Shop now',
        caption: 'Luxury moisture in every drop.',
        hashtags: ['#serum', '#glow'],
      }),
      'reel-storyboard': JSON.stringify({
        hook: '0-3s hook',
        attention: 'problem',
        productDisplay: 'product shot',
        viewerConnection: 'testimonial vibe',
        scenes: [{ order: 1, description: 'Close-up bottle' }],
      }),
      'reel-caption': 'Watch this glow-up. Link in bio.',
    });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      images,
      video,
      generations,
      products,
      brandKits,
      subscription,
    );
  });

  it('defaults to Product photo without calling the image provider or surcharge', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });

    expect(created.status).toBe('completed');
    expect(usageIncrements).toBe(1);
    expect(images.calls).toHaveLength(0);

    const stored = await service.getGeneration('user-1', created.generationId);
    expect(stored.generation.postImageMode).toBe('product_photo');
    expect(stored.generation.socialPost?.postImageUrl).toContain('product.jpg');
  });

  it('charges AI Post image surcharge and conditions on Product images', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'brand_awareness',
      postImageMode: 'ai_image',
    });

    expect(created.status).toBe('completed');
    expect(usageIncrements).toBe(2);
    expect(images.calls).toHaveLength(1);
    expect(images.calls[0].productImageUrls).toEqual([
      'https://cdn.example.com/product.jpg',
    ]);
    expect(images.calls[0].prompt.length).toBeGreaterThan(0);

    const stored = await service.getGeneration('user-1', created.generationId);
    expect(stored.generation.postImageMode).toBe('ai_image');
    expect(stored.generation.socialPost?.postImageUrl).toBe(
      'https://cdn.example.com/ai-post.jpg',
    );
  });

  it('keeps Social Post copy when AI image fails (partial success)', async () => {
    images.failNext = true;

    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'brand_awareness',
      postImageMode: 'ai_image',
    });

    expect(created.status).toBe('partial');
    expect(usageIncrements).toBe(2);
    expect(images.calls).toHaveLength(1);

    const stored = await service.getGeneration('user-1', created.generationId);
    expect(stored.generation.socialPost?.caption.length).toBeGreaterThan(0);
    expect(stored.generation.socialPost?.postImageUrl).toContain('product.jpg');
    expect(
      stored.generation.arms.find((arm) => arm.arm === 'social-post')?.status,
    ).toBe('failed');
  });
});

describe('GenerationService.regenerateShot', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let videoCalls: number;
  let stitchCalls: number;
  let usageIncrements: number;
  let stitchedFrom: string[] | null;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();
    videoCalls = 0;
    stitchCalls = 0;
    usageIncrements = 0;
    stitchedFrom = null;

    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 10,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => {
        videoCalls += 1;
        return {
          jobId: `fal-shot-${videoCalls}`,
          status: 'completed',
          videoUrl: `https://cdn.example.com/shot-${videoCalls}.mp4`,
        };
      },
      getGenerationStatus: async (jobId) => ({
        jobId,
        status: 'completed',
        videoUrl: 'https://cdn.example.com/shot.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'preview',
        status: 'completed',
      }),
      stitchClips: async (clipUrls) => {
        stitchCalls += 1;
        stitchedFrom = [...clipUrls];
        return {
          jobId: `stitch-${stitchCalls}`,
          status: 'completed',
          videoUrl: `https://cdn.example.com/promo-stitched-${stitchCalls}.mp4`,
        };
      },
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'Glow up',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
      'social-post': JSON.stringify({
        headline: 'Hydration elevated',
        body: 'Feel the difference.',
        cta: 'Shop now',
        caption: 'Luxury moisture in every drop.',
        hashtags: ['#serum', '#glow'],
      }),
      'reel-storyboard': JSON.stringify({
        hook: '0-3s hook',
        attention: 'problem',
        productDisplay: 'product shot',
        viewerConnection: 'testimonial vibe',
        scenes: [
          { order: 1, description: 'Close-up bottle' },
          { order: 2, description: 'Skin glow' },
          { order: 3, description: 'Product in hand' },
          { order: 4, description: 'Happy viewer' },
        ],
      }),
      'reel-caption': 'Watch this glow-up. Link in bio.',
    });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );

    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );
  });

  it('charges credits and replaces the Teaser Video with one provider call', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    expect(usageIncrements).toBe(1);
    expect(videoCalls).toBe(1);
    const before = await service.getGeneration('user-1', created.generationId);
    const priorUrl = before.generation.video?.videoUrl;

    const result = await service.regenerateShot(
      'user-1',
      created.generationId,
    );

    expect(usageIncrements).toBe(2);
    expect(videoCalls).toBe(2);
    expect(stitchCalls).toBe(0);
    expect(result.generation.video?.videoUrl).toBe(
      'https://cdn.example.com/shot-2.mp4',
    );
    expect(result.generation.video?.videoUrl).not.toBe(priorUrl);
    expect(
      result.generation.arms.find((arm) => arm.arm === 'video')?.status,
    ).toBe('completed');
  });

  it('charges one credit and re-stitches Promo after regenerating a single beat Shot', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'product_launch',
      lengthTier: 'promo',
    });
    expect(usageIncrements).toBe(4);
    expect(videoCalls).toBe(4);
    expect(stitchCalls).toBe(1);

    const before = await service.getGeneration('user-1', created.generationId);
    const priorShots = before.generation.video?.shots ?? [];
    const priorAttention = priorShots.find((s) => s.beat === 'attention');
    const priorHookUrl = priorShots.find((s) => s.beat === 'hook')?.videoUrl;

    const result = await service.regenerateShot(
      'user-1',
      created.generationId,
      { beat: 'attention' },
    );

    expect(usageIncrements).toBe(5);
    expect(videoCalls).toBe(5);
    expect(stitchCalls).toBe(2);
    expect(result.generation.video?.videoUrl).toContain('promo-stitched-2');

    const attention = result.generation.video?.shots?.find(
      (s) => s.beat === 'attention',
    );
    expect(attention?.videoUrl).toBe('https://cdn.example.com/shot-5.mp4');
    expect(attention?.videoUrl).not.toBe(priorAttention?.videoUrl);
    expect(
      result.generation.video?.shots?.find((s) => s.beat === 'hook')?.videoUrl,
    ).toBe(priorHookUrl);
    expect(stitchedFrom).toEqual([
      priorHookUrl,
      'https://cdn.example.com/shot-5.mp4',
      priorShots.find((s) => s.beat === 'product_display')?.videoUrl,
      priorShots.find((s) => s.beat === 'viewer_connection')?.videoUrl,
    ]);
  });

  it('rejects Promo Shot regenerate without a beat', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'brand_awareness',
      lengthTier: 'promo',
    });

    await expect(
      service.regenerateShot('user-1', created.generationId, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usageIncrements).toBe(4);
  });

  it('rejects Shot regenerate when credits are exhausted', async () => {
    subscription = {
      canGenerate: async (_userId?: string, creditsNeeded = 1) =>
        creditsNeeded <= 0,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;
    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );

    // Seed via repo by creating with a permissive subscription first
    const permissive = {
      canGenerate: async () => true,
      recordVideoGeneration: async (_userId?: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;
    const seedService = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      permissive,
    );
    const created = await seedService.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    usageIncrements = 0;

    await expect(
      service.regenerateShot('user-1', created.generationId),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usageIncrements).toBe(0);
    expect(videoCalls).toBe(1);
  });
});

describe('GenerationService.listGenerations', () => {
  let brandKits: IBrandKitRepository;
  let products: IProductRepository;
  let generations: InMemoryGenerationRepository;
  let text: FakeTextGenerationProvider;
  let subscription: ISubscriptionService;
  let video: IVideoGenerationProvider;
  let service: GenerationService;

  beforeEach(async () => {
    brandKits = new InMemoryBrandKitRepository();
    products = new InMemoryProductRepository();
    generations = new InMemoryGenerationRepository();

    subscription = {
      canGenerate: async () => true,
      recordVideoGeneration: async () => undefined,
    } as unknown as ISubscriptionService;

    video = {
      generateVideo: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      getGenerationStatus: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/teaser.mp4',
      }),
      generatePreview: async () => ({
        jobId: 'fal-job-1',
        status: 'completed',
      }),
      stitchClips: async () => ({
        jobId: 'stitch-1',
        status: 'completed',
        videoUrl: 'https://cdn.example.com/promo-stitched.mp4',
      }),
      downloadVideo: async () => Buffer.from(''),
    };

    text = new FakeTextGenerationProvider({
      'creative-brief': JSON.stringify({
        hook: 'Stop scrolling',
        attention: 'Glow up',
        productDisplay: 'Bottle hero',
        viewerConnection: 'Made for you',
        cta: 'Shop now',
      }),
      'social-post': JSON.stringify({
        headline: 'Hydration elevated',
        body: 'Feel the difference.',
        cta: 'Shop now',
        caption: 'Luxury moisture in every drop.',
        hashtags: ['#serum', '#glow'],
      }),
      'reel-storyboard': JSON.stringify({
        hook: '0-3s hook',
        attention: 'problem',
        productDisplay: 'product shot',
        viewerConnection: 'testimonial vibe',
        scenes: [{ order: 1, description: 'Close-up bottle' }],
      }),
      'reel-caption': 'Watch this glow-up. Link in bio.',
    });

    await brandKits.create(
      BrandKit.create(
        'kit-1',
        'user-1',
        'Nitro',
        'https://cdn.example.com/logo.png',
        { primary: '#111', secondary: '#c9a' },
        'luxury',
        'Premium buyers',
        'Slang',
      ),
    );
    await brandKits.create(
      BrandKit.create(
        'kit-2',
        'user-2',
        'Other Brand',
        'https://cdn.example.com/logo2.png',
        { primary: '#000', secondary: '#fff' },
        'bold',
        'Gen Z',
        'None',
      ),
    );
    await products.create(
      Product.create(
        'prod-1',
        'user-1',
        'Serum',
        'Hydrating serum',
        ['https://cdn.example.com/product.jpg'],
        'https://shop.example.com/serum',
        ['kit-1'],
        '49',
      ),
    );
    await products.create(
      Product.create(
        'prod-2',
        'user-2',
        'Cream',
        'Night cream',
        ['https://cdn.example.com/cream.jpg'],
        'https://shop.example.com/cream',
        ['kit-2'],
        '59',
      ),
    );

    service = new GenerationService(
      text,
      { generateImage: async () => ({ imageUrl: '' }) },
      video,
      generations,
      products,
      brandKits,
      subscription,
    );
  });

  it('lists only the owner Generations with status summary, newest first', async () => {
    const first = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });
    const second = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'brand_awareness',
      lengthTier: 'promo',
    });
    await service.createGeneration('user-2', {
      productId: 'prod-2',
      goal: 'product_launch',
    });

    const listed = await service.listGenerations('user-1');

    expect(listed.generations).toHaveLength(2);
    expect(listed.generations.map((item) => item.id)).toEqual([
      second.generationId,
      first.generationId,
    ]);
    expect(listed.generations[0]).toMatchObject({
      id: second.generationId,
      status: 'completed',
      goal: 'brand_awareness',
      lengthTier: 'promo',
      productName: 'Serum',
      brandKitName: 'Nitro',
    });
    expect(listed.generations[0].arms.length).toBeGreaterThan(0);
    expect(listed.generations.every((item) => item.id !== undefined)).toBe(
      true,
    );
  });

  it('returns an empty library when the user has no Generations', async () => {
    const listed = await service.listGenerations('user-1');
    expect(listed.generations).toEqual([]);
  });

  it('reopens a listed Generation with snapshot and Content Outputs', async () => {
    const created = await service.createGeneration('user-1', {
      productId: 'prod-1',
      goal: 'increase_sales',
    });

    const listed = await service.listGenerations('user-1');
    expect(listed.generations[0].id).toBe(created.generationId);

    const opened = await service.getGeneration(
      'user-1',
      listed.generations[0].id,
    );
    expect(opened.generation.snapshot.product.name).toBe('Serum');
    expect(opened.generation.snapshot.brandKit.name).toBe('Nitro');
    expect(opened.generation.socialPost?.headline).toBeTruthy();
    expect(opened.generation.video?.videoUrl).toContain('teaser.mp4');
  });

  it('forbids reopening another user Generation from the library path', async () => {
    const other = await service.createGeneration('user-2', {
      productId: 'prod-2',
      goal: 'product_launch',
    });

    const listed = await service.listGenerations('user-1');
    expect(listed.generations.map((item) => item.id)).not.toContain(
      other.generationId,
    );

    await expect(
      service.getGeneration('user-1', other.generationId),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
