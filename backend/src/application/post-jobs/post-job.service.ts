import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IFormatCatalog } from '@/core/ports/format.catalog';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type { IPostJobRepository } from '@/core/ports/post-job.repository';
import type {
  CreatePostJobInput,
  CreatePostJobResult,
  GetPostJobResult,
  IPostJobService,
  ListPostJobsResult,
} from '@/core/ports/post-job.service';
import type { IProductRepository } from '@/core/ports/product.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  FORMAT_CATALOG_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  POST_JOB_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { BrandKit } from '@/domain/brand-kit.entity';
import {
  PostJob,
  type PostJobSnapshot,
} from '@/domain/post-job.entity';
import { Product } from '@/domain/product.entity';
import type { Format } from '@/types/format/format';
import { POST_JOB_CREDIT_COST } from '@/types/post-job/credits';

@Injectable()
export class PostJobService implements IPostJobService {
  constructor(
    @Inject(POST_JOB_REPOSITORY_TOKEN)
    private readonly postJobRepository: IPostJobRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(FORMAT_CATALOG_TOKEN)
    private readonly formatCatalog: IFormatCatalog,
    @Inject(IMAGE_GENERATION_PROVIDER_TOKEN)
    private readonly imageGenerationProvider: IImageGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async createPostJob(
    userId: string,
    input: CreatePostJobInput,
  ): Promise<CreatePostJobResult> {
    const brand = await this.requireOwnedBrand(userId, input.brandId);
    const product = await this.requireOwnedProduct(userId, input.productId);
    const format = this.requirePostFormat(input.formatId);

    if (product.imageUrls.length === 0) {
      throw new BadRequestException(
        'Post Job requires at least one Product image for conditioning',
      );
    }

    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      POST_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Post Job credit limit reached');
    }

    const snapshot = this.buildSnapshot(brand, product, format);
    let job = PostJob.create({
      id: uuidv4(),
      userId,
      brandId: brand.id,
      productId: product.id,
      formatId: format.id,
      snapshot,
      creditCharge: POST_JOB_CREDIT_COST,
    });
    await this.postJobRepository.create(job);
    await this.subscriptionService.recordVideoGeneration(
      userId,
      POST_JOB_CREDIT_COST,
    );

    try {
      const imageResult = await this.imageGenerationProvider.generateImage({
        prompt: this.buildImagePrompt(snapshot),
        productImageUrls: snapshot.product.imageUrls,
        negativePrompt: [
          snapshot.brand.thingsToAvoid,
          'plain white background catalog packshot',
          'readable fake caption overlay as the main focus',
        ]
          .filter(Boolean)
          .join('. '),
      });
      job = job.withUpdates({
        status: 'completed',
        postImageUrl: imageResult.imageUrl,
        error: null,
      });
    } catch (error) {
      job = job.withUpdates({
        status: 'failed',
        postImageUrl: null,
        error:
          error instanceof Error
            ? error.message
            : 'AI Post image generation failed',
      });
    }

    await this.postJobRepository.update(job);
    return { postJob: job };
  }

  async listPostJobs(userId: string): Promise<ListPostJobsResult> {
    const postJobs = await this.postJobRepository.findByUserId(userId);
    return { postJobs };
  }

  async getPostJob(userId: string, jobId: string): Promise<GetPostJobResult> {
    const postJob = await this.requireOwnedJob(userId, jobId);
    return { postJob };
  }

  async regeneratePostJob(
    userId: string,
    jobId: string,
  ): Promise<CreatePostJobResult> {
    const existing = await this.requireOwnedJob(userId, jobId);
    if (existing.status !== 'completed') {
      throw new BadRequestException(
        'Only a completed Post Job can be regenerated',
      );
    }
    return this.createPostJob(userId, {
      brandId: existing.brandId,
      productId: existing.productId,
      formatId: existing.formatId,
    });
  }

  private async requireOwnedBrand(
    userId: string,
    brandId: string,
  ): Promise<BrandKit> {
    const brand = await this.brandKitRepository.findById(brandId);
    if (!brand || brand.userId !== userId) {
      throw new BadRequestException('Brand not found');
    }
    return brand;
  }

  private async requireOwnedProduct(
    userId: string,
    productId: string,
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);
    if (!product || product.userId !== userId) {
      throw new BadRequestException('Product not found');
    }
    return product;
  }

  private requirePostFormat(formatId: string): Format {
    const format = this.formatCatalog.getById(formatId);
    if (!format) {
      throw new BadRequestException('Format not found');
    }
    if (format.modality === 'video') {
      throw new BadRequestException(
        'Format is video-only; pick a Format tagged post or both',
      );
    }
    return format;
  }

  private async requireOwnedJob(
    userId: string,
    jobId: string,
  ): Promise<PostJob> {
    const job = await this.postJobRepository.findById(jobId);
    if (!job || job.userId !== userId) {
      throw new NotFoundException('Post Job not found');
    }
    return job;
  }

  private buildSnapshot(
    brand: BrandKit,
    product: Product,
    format: Format,
  ): PostJobSnapshot {
    return {
      brand: {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl,
        colors: brand.colors,
        tone: brand.tone,
        audience: brand.audience,
        thingsToAvoid: brand.thingsToAvoid,
        aiInstructions: brand.aiInstructions,
      },
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        imageUrls: product.imageUrls,
        landingPageUrl: product.landingPageUrl,
        price: product.price,
      },
      format: {
        id: format.id,
        label: format.label,
        description: format.description,
        modality: format.modality,
        promptStructure: format.promptStructure,
      },
    };
  }

  private buildImagePrompt(snapshot: PostJobSnapshot): string {
    const { brand, product, format } = snapshot;
    return [
      `Brand: ${brand.name}. Tone: ${brand.tone}.`,
      `Primary color: ${brand.colors.primary}. Secondary color: ${brand.colors.secondary}.`,
      `Logo: ${brand.logoUrl}.`,
      brand.audience ? `Audience: ${brand.audience}.` : '',
      brand.aiInstructions ? `Brand guidance: ${brand.aiInstructions}.` : '',
      `Product: ${product.name}. ${product.description}`,
      product.price ? `Price: ${product.price}.` : '',
      `Format: ${format.label}. ${format.promptStructure}`,
      'Create one Instagram feed Post image (1:1 social still).',
      'Always AI-designed creative — not a raw Product photo. Show the product recognizably.',
      'Do not generate caption text packages; visual creative only.',
    ]
      .filter(Boolean)
      .join(' ');
  }
}
