import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IFormatCatalog } from '@/core/ports/format.catalog';
import type { IProductRepository } from '@/core/ports/product.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type {
  GenerateVideoResponse,
  IVideoGenerationProvider,
} from '@/core/ports/video-generation.provider';
import type { IVideoJobRepository } from '@/core/ports/video-job.repository';
import type {
  CreateVideoJobInput,
  CreateVideoJobResult,
  GetVideoJobResult,
  IVideoJobService,
  ListVideoJobsResult,
} from '@/core/ports/video-job.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  FORMAT_CATALOG_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
  VIDEO_JOB_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';
import { BrandKit } from '@/domain/brand-kit.entity';
import { GenerationMode } from '@/domain/video.entity';
import {
  VideoJob,
  type VideoJobSnapshot,
} from '@/domain/video-job.entity';
import { Product } from '@/domain/product.entity';
import type { Format } from '@/types/format/format';
import {
  VIDEO_JOB_CREDIT_COST,
  VIDEO_JOB_DURATION_TARGET_SECONDS,
} from '@/types/video-job/credits';
import {
  REEL_PLATFORM_LABELS,
  type ReelPlatform,
} from '@/types/video-job/reel-platform';

@Injectable()
export class VideoJobService implements IVideoJobService {
  constructor(
    @Inject(VIDEO_JOB_REPOSITORY_TOKEN)
    private readonly videoJobRepository: IVideoJobRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
    @Inject(FORMAT_CATALOG_TOKEN)
    private readonly formatCatalog: IFormatCatalog,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async createVideoJob(
    userId: string,
    input: CreateVideoJobInput,
  ): Promise<CreateVideoJobResult> {
    const brand = await this.requireOwnedBrand(userId, input.brandId);
    const product = await this.requireOwnedProduct(userId, input.productId);
    const format = this.requireVideoFormat(input.formatId);

    if (product.imageUrls.length === 0) {
      throw new BadRequestException(
        'Video Job requires at least one Product image for conditioning',
      );
    }

    const snapshot = this.buildSnapshot(
      brand,
      product,
      format,
      input.reelPlatform,
    );
    return this.runChargedVideoJob(userId, {
      brandId: brand.id,
      productId: product.id,
      formatId: format.id,
      reelPlatform: input.reelPlatform,
      snapshot,
    });
  }

  async listVideoJobs(userId: string): Promise<ListVideoJobsResult> {
    const videoJobs = await this.videoJobRepository.findByUserId(userId);
    return { videoJobs };
  }

  async getVideoJob(userId: string, jobId: string): Promise<GetVideoJobResult> {
    const videoJob = await this.requireOwnedJob(userId, jobId);
    return { videoJob };
  }

  async regenerateVideoJob(
    userId: string,
    jobId: string,
  ): Promise<CreateVideoJobResult> {
    const existing = await this.requireOwnedJob(userId, jobId);
    if (existing.status !== 'completed') {
      throw new BadRequestException(
        'Only a completed Video Job can be regenerated',
      );
    }
    // Clone snapshot inputs so later Brand/Product edits do not alter Regenerate.
    const snapshot: VideoJobSnapshot = structuredClone(existing.snapshot);
    return this.runChargedVideoJob(userId, {
      brandId: existing.brandId,
      productId: existing.productId,
      formatId: existing.formatId,
      reelPlatform: existing.reelPlatform,
      snapshot,
    });
  }

  private async runChargedVideoJob(
    userId: string,
    input: {
      brandId: string;
      productId: string;
      formatId: string;
      reelPlatform: ReelPlatform;
      snapshot: VideoJobSnapshot;
    },
  ): Promise<CreateVideoJobResult> {
    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Video Job credit limit reached');
    }

    let job = VideoJob.create({
      id: uuidv4(),
      userId,
      brandId: input.brandId,
      productId: input.productId,
      formatId: input.formatId,
      reelPlatform: input.reelPlatform,
      snapshot: input.snapshot,
      durationTargetSeconds: VIDEO_JOB_DURATION_TARGET_SECONDS,
      creditCharge: VIDEO_JOB_CREDIT_COST,
    });
    await this.videoJobRepository.create(job);
    await this.subscriptionService.recordVideoGeneration(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );

    try {
      const videoUrl = await this.renderVerticalVideo(input.snapshot);
      job = job.withUpdates({
        status: 'completed',
        videoUrl,
        error: null,
      });
    } catch (error) {
      job = job.withUpdates({
        status: 'failed',
        videoUrl: null,
        error:
          error instanceof Error
            ? error.message
            : 'AI Video generation failed',
      });
    }

    await this.videoJobRepository.update(job);
    return { videoJob: job };
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

  private requireVideoFormat(formatId: string): Format {
    const format = this.formatCatalog.getById(formatId);
    if (!format) {
      throw new BadRequestException('Format not found');
    }
    if (format.modality === 'post') {
      throw new BadRequestException(
        'Format is post-only; pick a Format tagged video or both',
      );
    }
    return format;
  }

  private async requireOwnedJob(
    userId: string,
    jobId: string,
  ): Promise<VideoJob> {
    const job = await this.videoJobRepository.findById(jobId);
    if (!job || job.userId !== userId) {
      throw new NotFoundException('Video Job not found');
    }
    return job;
  }

  private buildSnapshot(
    brand: BrandKit,
    product: Product,
    format: Format,
    reelPlatform: ReelPlatform,
  ): VideoJobSnapshot {
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
      reelPlatform,
    };
  }

  /**
   * Renders ~15–30s 9:16 via two ~10s cinematic clips stitched together
   * (fal clip length cap; not Length Tier Promo UX).
   */
  private async renderVerticalVideo(
    snapshot: VideoJobSnapshot,
  ): Promise<string> {
    const negativePrompt = [
      snapshot.brand.thingsToAvoid,
      'horizontal landscape framing',
      'readable fake caption overlay as the main focus',
      'watermark',
    ]
      .filter(Boolean)
      .join('. ');

    const hook = await this.waitForVideo(
      await this.videoGenerationProvider.generateVideo({
        prompt: this.buildClipPrompt(snapshot, 'hook'),
        mode: GenerationMode.CINEMATIC,
        useImageConditioning: true,
        productAssetUrls: snapshot.product.imageUrls,
        aspectRatio: '9:16',
        negativePrompt,
      }),
    );
    if (hook.status === 'failed' || !hook.videoUrl) {
      throw new Error(hook.error ?? 'AI Video provider failed');
    }

    const payoff = await this.waitForVideo(
      await this.videoGenerationProvider.generateVideo({
        prompt: this.buildClipPrompt(snapshot, 'payoff'),
        mode: GenerationMode.CINEMATIC,
        useImageConditioning: true,
        productAssetUrls: snapshot.product.imageUrls,
        aspectRatio: '9:16',
        negativePrompt,
      }),
    );
    if (payoff.status === 'failed' || !payoff.videoUrl) {
      throw new Error(payoff.error ?? 'AI Video provider failed');
    }

    const stitched = await this.videoGenerationProvider.stitchClips([
      hook.videoUrl,
      payoff.videoUrl,
    ]);
    const final = await this.waitForVideo(stitched);
    if (final.status === 'failed' || !final.videoUrl) {
      throw new Error(final.error ?? 'AI Video stitch failed');
    }
    return final.videoUrl;
  }

  private buildClipPrompt(
    snapshot: VideoJobSnapshot,
    beat: 'hook' | 'payoff',
  ): string {
    const { brand, product, format, reelPlatform } = snapshot;
    const platformLabel = REEL_PLATFORM_LABELS[reelPlatform];
    const beatLine =
      beat === 'hook'
        ? 'Opening beat: cold-open curiosity hook in the first seconds.'
        : 'Closing beat: Product payoff, brand mark, soft CTA energy.';

    return [
      `Brand: ${brand.name}. Tone: ${brand.tone}.`,
      `Primary color: ${brand.colors.primary}. Secondary color: ${brand.colors.secondary}.`,
      brand.audience ? `Audience: ${brand.audience}.` : '',
      brand.aiInstructions ? `Brand guidance: ${brand.aiInstructions}.` : '',
      `Product: ${product.name}. ${product.description}`,
      product.price ? `Price: ${product.price}.` : '',
      `Format: ${format.label}. ${format.promptStructure}`,
      `Platform: ${platformLabel}. Vertical 9:16 short-form Video.`,
      beatLine,
      'Show the product recognizably. No AI caption package, no on-screen caption text focus.',
      `Target total Video length about ${VIDEO_JOB_DURATION_TARGET_SECONDS} seconds across beats.`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  private async waitForVideo(
    initial: GenerateVideoResponse,
  ): Promise<GenerateVideoResponse> {
    if (initial.status === 'completed' || initial.status === 'failed') {
      return initial;
    }

    const deadline = Date.now() + 5 * 60_000;
    let latest = initial;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      latest = await this.videoGenerationProvider.getGenerationStatus(
        initial.jobId,
      );
      if (latest.status === 'completed' || latest.status === 'failed') {
        return latest;
      }
    }

    return {
      ...latest,
      status: 'failed',
      error: latest.error ?? 'Video generation timed out',
    };
  }
}
