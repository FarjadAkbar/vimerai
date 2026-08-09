import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VideoJobService } from '@/application/video-jobs/video-job.service';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { Product } from '@/domain/product.entity';
import { CuratedFormatCatalog } from '@/infrastructure/formats/curated-format.catalog';
import { FakeVideoGenerationProvider } from '@/testing/fakes/fake-video-generation.provider';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { InMemoryProductRepository } from '@/testing/fakes/in-memory-product.repository';
import { InMemoryVideoJobRepository } from '@/testing/fakes/in-memory-video-job.repository';
import {
  VIDEO_JOB_CREDIT_COST,
  VIDEO_JOB_DURATION_TARGET_SECONDS,
} from '@/types/video-job/credits';

describe('VideoJobService', () => {
  const userId = 'user-1';

  async function seedBrandAndProduct(
    brands: InMemoryBrandKitRepository,
    products: InMemoryProductRepository,
  ) {
    const brand = BrandKit.create(
      'brand-1',
      userId,
      'NitroShine',
      'https://cdn.example.com/logo.png',
      { primary: '#E80000', secondary: '#1A1A1A' },
      'professional',
      'Car enthusiasts',
      'cheap plastic look',
    );
    await brands.create(brand);

    const product = Product.create(
      'product-1',
      userId,
      'Ceramic Spray',
      'Pro-grade ceramic spray for home use',
      ['https://cdn.example.com/product.jpg'],
      'https://shop.example.com/ceramic',
      [],
      '29.99',
    );
    await products.create(product);

    return { brand, product };
  }

  function createService(options?: {
    creditLimit?: number;
    videoUrl?: string;
  }) {
    const brands = new InMemoryBrandKitRepository();
    const products = new InMemoryProductRepository();
    const jobs = new InMemoryVideoJobRepository();
    const formats = new CuratedFormatCatalog();
    const videos = new FakeVideoGenerationProvider(
      options?.videoUrl ?? 'https://cdn.example.com/video.mp4',
    );
    let usageIncrements = 0;
    const creditLimit = options?.creditLimit ?? 20;
    const subscription = {
      canGenerate: async (_userId: string, creditsNeeded = 1) =>
        creditsNeeded <= creditLimit - usageIncrements,
      recordVideoGeneration: async (_userId: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    const service = new VideoJobService(
      jobs,
      brands,
      products,
      formats,
      videos,
      subscription,
    );

    return {
      service,
      brands,
      products,
      jobs,
      videos,
      getUsage: () => usageIncrements,
    };
  }

  it('creates a Video Job from Brand + Product + Format + platform and yields a Video', async () => {
    const { service, brands, products, videos, getUsage } = createService();
    await seedBrandAndProduct(brands, products);

    const { videoJob } = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'hook-reveal',
      reelPlatform: 'instagram_reels',
    });

    expect(videoJob.status).toBe('completed');
    expect(videoJob.videoUrl).toBe('https://cdn.example.com/video.mp4');
    expect(videoJob.reelPlatform).toBe('instagram_reels');
    expect(videoJob.durationTargetSeconds).toBe(
      VIDEO_JOB_DURATION_TARGET_SECONDS,
    );
    expect(videoJob.creditCharge).toBe(VIDEO_JOB_CREDIT_COST);
    expect(getUsage()).toBe(VIDEO_JOB_CREDIT_COST);
    expect(videoJob.snapshot.brand.name).toBe('NitroShine');
    expect(videoJob.snapshot.product.name).toBe('Ceramic Spray');
    expect(videoJob.snapshot.format.id).toBe('hook-reveal');
    expect(videoJob.snapshot.reelPlatform).toBe('instagram_reels');
    expect(videos.generateCalls.length).toBeGreaterThanOrEqual(1);
    expect(videos.generateCalls[0].aspectRatio).toBe('9:16');
    expect(videos.generateCalls[0].productAssetUrls).toEqual([
      'https://cdn.example.com/product.jpg',
    ]);
    expect(videos.generateCalls[0].prompt).toContain('Hook reveal');
    expect(videos.generateCalls[0].prompt).toContain('Instagram Reels');
    expect(videos.generateCalls[0].prompt).toContain('NitroShine');
    expect(videos.stitchCalls).toHaveLength(1);
  });

  it('does not produce an AI Reel caption on the Video Job', async () => {
    const { service, brands, products } = createService();
    await seedBrandAndProduct(brands, products);

    const { videoJob } = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'demo-in-use',
      reelPlatform: 'tiktok',
    });

    expect(videoJob).not.toHaveProperty('caption');
    expect(videoJob).not.toHaveProperty('headline');
    expect(videoJob).not.toHaveProperty('hashtags');
    expect(Object.keys(videoJob)).toEqual(
      expect.arrayContaining([
        'id',
        'status',
        'videoUrl',
        'reelPlatform',
        'snapshot',
        'creditCharge',
        'durationTargetSeconds',
      ]),
    );
  });

  it('rejects Video Jobs when credit limit is reached', async () => {
    const { service, brands, products, getUsage } = createService({
      creditLimit: 0,
    });
    await seedBrandAndProduct(brands, products);

    await expect(
      service.createVideoJob(userId, {
        brandId: 'brand-1',
        productId: 'product-1',
        formatId: 'hook-reveal',
        reelPlatform: 'tiktok',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getUsage()).toBe(0);
  });

  it('rejects Formats that are post-only for Make a Video', async () => {
    const { service, brands, products, videos, getUsage } = createService();
    await seedBrandAndProduct(brands, products);

    await expect(
      service.createVideoJob(userId, {
        brandId: 'brand-1',
        productId: 'product-1',
        formatId: 'listicle-hook',
        reelPlatform: 'instagram_reels',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(videos.generateCalls).toHaveLength(0);
    expect(getUsage()).toBe(0);
  });

  it('accepts Formats tagged both for Make a Video', async () => {
    const { service, brands, products } = createService();
    await seedBrandAndProduct(brands, products);

    const { videoJob } = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'problem-solution',
      reelPlatform: 'tiktok',
    });

    expect(videoJob.status).toBe('completed');
    expect(videoJob.snapshot.format.modality).toBe('both');
  });

  it('requires an owned Brand, Product, and Product image', async () => {
    const { service, brands, products } = createService();
    await seedBrandAndProduct(brands, products);

    await expect(
      service.createVideoJob(userId, {
        brandId: 'missing-brand',
        productId: 'product-1',
        formatId: 'hook-reveal',
        reelPlatform: 'tiktok',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createVideoJob(userId, {
        brandId: 'brand-1',
        productId: 'missing-product',
        formatId: 'hook-reveal',
        reelPlatform: 'tiktok',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const now = new Date();
    const bareProduct = new Product(
      'product-bare',
      userId,
      'No Images',
      'Missing conditioning',
      [],
      '',
      null,
      [],
      now,
      now,
    );
    await products.create(bareProduct);

    await expect(
      service.createVideoJob(userId, {
        brandId: 'brand-1',
        productId: 'product-bare',
        formatId: 'hook-reveal',
        reelPlatform: 'tiktok',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks the Video Job failed when video generation fails and still charges credits', async () => {
    const { service, brands, products, videos, jobs, getUsage } =
      createService();
    await seedBrandAndProduct(brands, products);
    videos.failNextGenerate = true;

    const { videoJob } = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'demo-in-use',
      reelPlatform: 'instagram_reels',
    });

    expect(videoJob.status).toBe('failed');
    expect(videoJob.videoUrl).toBeNull();
    expect(videoJob.error).toContain('AI Video provider failed');
    expect(getUsage()).toBe(VIDEO_JOB_CREDIT_COST);
    const stored = await jobs.findById(videoJob.id);
    expect(stored?.status).toBe('failed');
  });

  it('regenerates as a new credited Video Job with the same inputs', async () => {
    const { service, brands, products, getUsage, videos } = createService({
      videoUrl: 'https://cdn.example.com/regen.mp4',
    });
    const { brand, product } = await seedBrandAndProduct(brands, products);

    const first = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'before-after',
      reelPlatform: 'tiktok',
    });

    await brands.update(
      brand.update({ name: 'Renamed After First Job' }),
    );
    await products.update(
      product.update({ name: 'Renamed Product After First' }),
    );

    const second = await service.regenerateVideoJob(userId, first.videoJob.id);

    expect(second.videoJob.id).not.toBe(first.videoJob.id);
    expect(second.videoJob.brandId).toBe('brand-1');
    expect(second.videoJob.productId).toBe('product-1');
    expect(second.videoJob.formatId).toBe('before-after');
    expect(second.videoJob.reelPlatform).toBe('tiktok');
    expect(second.videoJob.status).toBe('completed');
    expect(second.videoJob.videoUrl).toBe('https://cdn.example.com/regen.mp4');
    expect(second.videoJob.snapshot.brand.name).toBe('NitroShine');
    expect(second.videoJob.snapshot.product.name).toBe('Ceramic Spray');
    expect(getUsage()).toBe(VIDEO_JOB_CREDIT_COST * 2);
    const regenPrompt = videos.generateCalls.at(-1)?.prompt ?? '';
    expect(regenPrompt).toContain('NitroShine');
    expect(regenPrompt).not.toContain('Renamed After First Job');

    const listed = await service.listVideoJobs(userId);
    expect(listed.videoJobs).toHaveLength(2);
  });

  it('rejects Regenerate unless the Video Job completed', async () => {
    const { service, brands, products, videos, getUsage } = createService();
    await seedBrandAndProduct(brands, products);
    videos.failNextGenerate = true;

    const failed = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'hook-reveal',
      reelPlatform: 'instagram_reels',
    });
    expect(failed.videoJob.status).toBe('failed');

    await expect(
      service.regenerateVideoJob(userId, failed.videoJob.id),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getUsage()).toBe(VIDEO_JOB_CREDIT_COST);
  });

  it('lists and gets only the user’s Video Jobs', async () => {
    const { service, brands, products } = createService();
    await seedBrandAndProduct(brands, products);
    const otherBrand = BrandKit.create(
      'brand-2',
      'user-2',
      'Other',
      'https://cdn.example.com/o.png',
      { primary: '#000000' },
      'bold',
      '',
      '',
    );
    await brands.create(otherBrand);
    const otherProduct = Product.create(
      'product-2',
      'user-2',
      'Other Product',
      'Desc',
      ['https://cdn.example.com/o-product.jpg'],
      '',
      [],
    );
    await products.create(otherProduct);

    const created = await service.createVideoJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'demo-in-use',
      reelPlatform: 'tiktok',
    });
    await service.createVideoJob('user-2', {
      brandId: 'brand-2',
      productId: 'product-2',
      formatId: 'hook-reveal',
      reelPlatform: 'instagram_reels',
    });

    const listed = await service.listVideoJobs(userId);
    expect(listed.videoJobs).toHaveLength(1);
    expect(listed.videoJobs[0].id).toBe(created.videoJob.id);

    const got = await service.getVideoJob(userId, created.videoJob.id);
    expect(got.videoJob.videoUrl).toBe('https://cdn.example.com/video.mp4');

    await expect(
      service.getVideoJob(userId, 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps Brand + Product + Format + platform snapshots even if live entities change later', async () => {
    const { service, brands, products } = createService();
    const { brand, product } = await seedBrandAndProduct(brands, products);

    const { videoJob } = await service.createVideoJob(userId, {
      brandId: brand.id,
      productId: product.id,
      formatId: 'hook-reveal',
      reelPlatform: 'instagram_reels',
    });

    await brands.update(
      brand.update({ name: 'Renamed Brand', audience: 'Everyone' }),
    );
    await products.update(
      product.update({ name: 'Renamed Product', description: 'Changed' }),
    );

    const got = await service.getVideoJob(userId, videoJob.id);
    expect(got.videoJob.snapshot.brand.name).toBe('NitroShine');
    expect(got.videoJob.snapshot.product.name).toBe('Ceramic Spray');
    expect(got.videoJob.snapshot.format.label).toBe('Hook reveal');
    expect(got.videoJob.snapshot.reelPlatform).toBe('instagram_reels');
  });
});
