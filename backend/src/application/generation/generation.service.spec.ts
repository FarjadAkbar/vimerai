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
      canGenerate: async () => true,
      recordVideoGeneration: async () => {
        usageIncrements += 1;
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
