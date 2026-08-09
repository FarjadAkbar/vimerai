import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PostJobService } from '@/application/post-jobs/post-job.service';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import { BrandKit } from '@/domain/brand-kit.entity';
import { Product } from '@/domain/product.entity';
import { CuratedFormatCatalog } from '@/infrastructure/formats/curated-format.catalog';
import { FakeImageGenerationProvider } from '@/testing/fakes/fake-image-generation.provider';
import { InMemoryBrandKitRepository } from '@/testing/fakes/in-memory-brand-kit.repository';
import { InMemoryPostJobRepository } from '@/testing/fakes/in-memory-post-job.repository';
import { InMemoryProductRepository } from '@/testing/fakes/in-memory-product.repository';
import { POST_JOB_CREDIT_COST } from '@/types/post-job/credits';

describe('PostJobService', () => {
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
    imageUrl?: string;
  }) {
    const brands = new InMemoryBrandKitRepository();
    const products = new InMemoryProductRepository();
    const jobs = new InMemoryPostJobRepository();
    const formats = new CuratedFormatCatalog();
    const images = new FakeImageGenerationProvider(
      options?.imageUrl ?? 'https://cdn.example.com/post.png',
    );
    let usageIncrements = 0;
    const creditLimit = options?.creditLimit ?? 10;
    const subscription = {
      canGenerate: async (_userId: string, creditsNeeded = 1) =>
        creditsNeeded <= creditLimit - usageIncrements,
      recordVideoGeneration: async (_userId: string, creditsNeeded = 1) => {
        usageIncrements += creditsNeeded;
      },
    } as unknown as ISubscriptionService;

    const service = new PostJobService(
      jobs,
      brands,
      products,
      formats,
      images,
      subscription,
    );

    return {
      service,
      brands,
      products,
      jobs,
      images,
      getUsage: () => usageIncrements,
    };
  }

  it('creates a Post Job from Brand + Product + Format and AI-generates a Post image', async () => {
    const { service, brands, products, images, getUsage } = createService();
    await seedBrandAndProduct(brands, products);

    const { postJob } = await service.createPostJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'listicle-hook',
    });

    expect(postJob.status).toBe('completed');
    expect(postJob.postImageUrl).toBe('https://cdn.example.com/post.png');
    expect(postJob.creditCharge).toBe(POST_JOB_CREDIT_COST);
    expect(getUsage()).toBe(POST_JOB_CREDIT_COST);
    expect(postJob.snapshot.brand.name).toBe('NitroShine');
    expect(postJob.snapshot.product.name).toBe('Ceramic Spray');
    expect(postJob.snapshot.format.id).toBe('listicle-hook');
    expect(images.calls).toHaveLength(1);
    expect(images.calls[0].productImageUrls).toEqual([
      'https://cdn.example.com/product.jpg',
    ]);
    expect(images.calls[0].prompt).toContain('Listicle');
    expect(images.calls[0].prompt).toContain('NitroShine');
    expect(images.calls[0].negativePrompt).toContain('cheap plastic look');
  });

  it('does not produce an AI caption package on the Post Job', async () => {
    const { service, brands, products } = createService();
    await seedBrandAndProduct(brands, products);

    const { postJob } = await service.createPostJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'meme-cta',
    });

    expect(postJob).not.toHaveProperty('caption');
    expect(postJob).not.toHaveProperty('headline');
    expect(postJob).not.toHaveProperty('hashtags');
    expect(Object.keys(postJob)).toEqual(
      expect.arrayContaining([
        'id',
        'status',
        'postImageUrl',
        'snapshot',
        'creditCharge',
      ]),
    );
  });

  it('rejects Post Jobs when credit limit is reached', async () => {
    const { service, brands, products, getUsage } = createService({
      creditLimit: 0,
    });
    await seedBrandAndProduct(brands, products);

    await expect(
      service.createPostJob(userId, {
        brandId: 'brand-1',
        productId: 'product-1',
        formatId: 'listicle-hook',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getUsage()).toBe(0);
  });

  it('rejects Formats that are video-only for Make a Post', async () => {
    const { service, brands, products, images, getUsage } = createService();
    await seedBrandAndProduct(brands, products);

    await expect(
      service.createPostJob(userId, {
        brandId: 'brand-1',
        productId: 'product-1',
        formatId: 'hook-reveal',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(images.calls).toHaveLength(0);
    expect(getUsage()).toBe(0);
  });

  it('requires an owned Brand and Product', async () => {
    const { service, brands, products } = createService();
    await seedBrandAndProduct(brands, products);

    await expect(
      service.createPostJob(userId, {
        brandId: 'missing-brand',
        productId: 'product-1',
        formatId: 'listicle-hook',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.createPostJob(userId, {
        brandId: 'brand-1',
        productId: 'missing-product',
        formatId: 'listicle-hook',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks the Post Job failed when image generation fails and still charges credits', async () => {
    const { service, brands, products, images, jobs, getUsage } =
      createService();
    await seedBrandAndProduct(brands, products);
    images.failNext = true;

    const { postJob } = await service.createPostJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'problem-solution',
    });

    expect(postJob.status).toBe('failed');
    expect(postJob.postImageUrl).toBeNull();
    expect(postJob.error).toContain('AI Post image provider failed');
    expect(getUsage()).toBe(POST_JOB_CREDIT_COST);
    const stored = await jobs.findById(postJob.id);
    expect(stored?.status).toBe('failed');
  });

  it('regenerates as a new credited Post Job with the same inputs', async () => {
    const { service, brands, products, getUsage } = createService({
      imageUrl: 'https://cdn.example.com/regen.png',
    });
    await seedBrandAndProduct(brands, products);

    const first = await service.createPostJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'before-after',
    });

    const second = await service.regeneratePostJob(userId, first.postJob.id);

    expect(second.postJob.id).not.toBe(first.postJob.id);
    expect(second.postJob.brandId).toBe('brand-1');
    expect(second.postJob.productId).toBe('product-1');
    expect(second.postJob.formatId).toBe('before-after');
    expect(second.postJob.status).toBe('completed');
    expect(second.postJob.postImageUrl).toBe(
      'https://cdn.example.com/regen.png',
    );
    expect(getUsage()).toBe(POST_JOB_CREDIT_COST * 2);

    const listed = await service.listPostJobs(userId);
    expect(listed.postJobs).toHaveLength(2);
  });

  it('rejects Regenerate unless the Post Job completed', async () => {
    const { service, brands, products, images, getUsage } = createService();
    await seedBrandAndProduct(brands, products);
    images.failNext = true;

    const failed = await service.createPostJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'listicle-hook',
    });
    expect(failed.postJob.status).toBe('failed');

    await expect(
      service.regeneratePostJob(userId, failed.postJob.id),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(getUsage()).toBe(POST_JOB_CREDIT_COST);
  });

  it('lists and gets only the user’s Post Jobs', async () => {
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

    const created = await service.createPostJob(userId, {
      brandId: 'brand-1',
      productId: 'product-1',
      formatId: 'ugc-testimonial',
    });
    await service.createPostJob('user-2', {
      brandId: 'brand-2',
      productId: 'product-2',
      formatId: 'meme-cta',
    });

    const listed = await service.listPostJobs(userId);
    expect(listed.postJobs).toHaveLength(1);
    expect(listed.postJobs[0].id).toBe(created.postJob.id);

    const got = await service.getPostJob(userId, created.postJob.id);
    expect(got.postJob.postImageUrl).toBe('https://cdn.example.com/post.png');

    await expect(
      service.getPostJob(userId, 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps Brand + Product + Format snapshots even if live entities change later', async () => {
    const { service, brands, products } = createService();
    const { brand, product } = await seedBrandAndProduct(brands, products);

    const { postJob } = await service.createPostJob(userId, {
      brandId: brand.id,
      productId: product.id,
      formatId: 'listicle-hook',
    });

    await brands.update(
      brand.update({ name: 'Renamed Brand', audience: 'Everyone' }),
    );
    await products.update(
      product.update({ name: 'Renamed Product', description: 'Changed' }),
    );

    const got = await service.getPostJob(userId, postJob.id);
    expect(got.postJob.snapshot.brand.name).toBe('NitroShine');
    expect(got.postJob.snapshot.product.name).toBe('Ceramic Spray');
    expect(got.postJob.snapshot.format.label).toBe('Listicle hook');
  });
});
