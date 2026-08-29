import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IContentItemRepository } from '@/core/ports/content-item.repository';
import type { IFormatCatalog } from '@/core/ports/format.catalog';
import type { IJobService } from '@/core/ports/job.service';
import type { IMediaAssetService } from '@/core/ports/media-asset.service';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type {
  GenerateVideoResponse,
  IVideoGenerationProvider,
} from '@/core/ports/video-generation.provider';
import type {
  CreateViralRemixInput,
  IViralRemixService,
  ViralRemixJobInput,
  ViralRemixJobResult,
} from '@/core/ports/viral-remix.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  CONTENT_ITEM_REPOSITORY_TOKEN,
  FORMAT_CATALOG_TOKEN,
  JOB_SERVICE_TOKEN,
  MEDIA_ASSET_SERVICE_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { BrandKit } from '@/domain/brand-kit.entity';
import { ContentItem, ContentItemMediaKind } from '@/domain/content-item.entity';
import { JobType } from '@/domain/job.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { GenerationMode } from '@/domain/video.entity';
import type { Format } from '@/types/format/format';
import {
  VIDEO_JOB_CREDIT_COST,
  VIDEO_JOB_DURATION_TARGET_SECONDS,
} from '@/types/video-job/credits';
import type { VideoAspectRatio } from '@/types/video-job/aspect-ratio';
import { toViralRemixJobResponse } from '@/application/studio-core/viral-remix-response';

@Injectable()
export class ViralRemixService implements IViralRemixService {
  constructor(
    @Inject(JOB_SERVICE_TOKEN)
    private readonly jobService: IJobService,
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(MEDIA_ASSET_SERVICE_TOKEN)
    private readonly mediaAssetService: IMediaAssetService,
    @Inject(FORMAT_CATALOG_TOKEN)
    private readonly formatCatalog: IFormatCatalog,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async createRemix(
    userId: string,
    input: CreateViralRemixInput,
  ): Promise<ViralRemixJobResult> {
    const jobInput = await this.buildJobInput(userId, input);
    return this.runRemixJob(userId, jobInput);
  }

  async getRemix(userId: string, jobId: string): Promise<ViralRemixJobResult> {
    const job = await this.jobService.getJob(userId, jobId);
    if (job.type !== JobType.VIRAL_REMIX) {
      throw new NotFoundException('Viral Remix job not found');
    }
    const contentItem = await this.contentItemRepository.findByJobId(jobId);
    return toViralRemixJobResponse(job, contentItem);
  }

  async regenerateRemix(
    userId: string,
    jobId: string,
  ): Promise<ViralRemixJobResult> {
    const existing = await this.jobService.getJob(userId, jobId);
    if (existing.type !== JobType.VIRAL_REMIX) {
      throw new NotFoundException('Viral Remix job not found');
    }
    if (existing.status !== 'completed') {
      throw new BadRequestException(
        'Only a completed Viral Remix can be regenerated',
      );
    }
    const jobInput = existing.input as ViralRemixJobInput;
    return this.runRemixJob(userId, jobInput);
  }

  private async runRemixJob(
    userId: string,
    jobInput: ViralRemixJobInput,
  ): Promise<ViralRemixJobResult> {
    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Viral Remix credit limit reached');
    }

    const job = await this.jobService.createJob(userId, {
      type: JobType.VIRAL_REMIX,
      brandId: jobInput.brandId,
      jobInput: jobInput as unknown as Record<string, unknown>,
      creditCharge: VIDEO_JOB_CREDIT_COST,
    });

    const placeholder = ContentItem.create({
      id: uuidv4(),
      userId,
      jobId: job.id,
      mediaKind: ContentItemMediaKind.VIDEO,
      title: 'Viral Remix',
    });
    await this.contentItemRepository.create(placeholder);

    await this.subscriptionService.recordVideoGeneration(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );

    try {
      await this.jobService.markJobProcessing(job.id);
      const format = this.requireVideoFormat(jobInput.formatId);
      const videoUrl = await this.renderVerticalVideo(jobInput, format);
      const result = await this.jobService.completeJob(userId, job.id, {
        mediaKind: ContentItemMediaKind.VIDEO,
        mediaUrl: videoUrl,
        title: 'Viral Remix',
      });
      return toViralRemixJobResponse(result.job, result.contentItem);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Viral Remix generation failed';
      const failed = await this.jobService.failJob(job.id, message);
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      return toViralRemixJobResponse(failed, contentItem);
    }
  }

  private async buildJobInput(
    userId: string,
    input: CreateViralRemixInput,
  ): Promise<ViralRemixJobInput> {
    const brand = await this.requireOwnedBrand(userId, input.brandId);
    this.requireVideoFormat(input.formatId);

    let referenceVideoUrl = input.referenceVideoUrl?.trim() ?? null;
    let referenceVideoMediaAssetId = input.referenceVideoMediaAssetId ?? null;

    if (referenceVideoMediaAssetId) {
      const asset = await this.mediaAssetService.getMediaAsset(
        userId,
        referenceVideoMediaAssetId,
      );
      if (asset.kind !== MediaAssetKind.VIDEO) {
        throw new BadRequestException('Reference must be a video media asset');
      }
      referenceVideoUrl = asset.url;
    }

    if (!referenceVideoUrl) {
      throw new BadRequestException('A reference video is required');
    }

    let productImageUrl: string | null = null;
    let productImageMediaAssetId = input.productImageMediaAssetId ?? null;
    if (productImageMediaAssetId) {
      const asset = await this.mediaAssetService.getMediaAsset(
        userId,
        productImageMediaAssetId,
      );
      if (asset.kind !== MediaAssetKind.IMAGE) {
        throw new BadRequestException('Product image must be an image asset');
      }
      productImageUrl = asset.url;
    }

    let personImageUrl: string | null = null;
    let personImageMediaAssetId = input.personImageMediaAssetId ?? null;
    if (personImageMediaAssetId) {
      const asset = await this.mediaAssetService.getMediaAsset(
        userId,
        personImageMediaAssetId,
      );
      if (asset.kind !== MediaAssetKind.IMAGE) {
        throw new BadRequestException('Person image must be an image asset');
      }
      personImageUrl = asset.url;
    }

    if (!productImageUrl && !personImageUrl) {
      throw new BadRequestException(
        'Upload at least one product or person image',
      );
    }

    return {
      brandId: brand.id,
      formatId: input.formatId,
      referenceVideoUrl,
      referenceVideoMediaAssetId,
      productImageUrl,
      productImageMediaAssetId,
      personImageUrl,
      personImageMediaAssetId,
      instructions: input.instructions?.trim() || null,
      aspectRatio: input.aspectRatio ?? '9:16',
      durationSeconds:
        input.durationSeconds ?? VIDEO_JOB_DURATION_TARGET_SECONDS,
      quality: input.quality ?? '720p',
      brandSnapshot: {
        id: brand.id,
        name: brand.name,
        logoUrl: brand.logoUrl,
        colors: brand.colors,
        tone: brand.tone,
        audience: brand.audience,
        thingsToAvoid: brand.thingsToAvoid,
        aiInstructions: brand.aiInstructions,
      },
    };
  }

  private async renderVerticalVideo(
    jobInput: ViralRemixJobInput,
    format: Format,
  ): Promise<string> {
    const imageUrls = [jobInput.productImageUrl, jobInput.personImageUrl].filter(
      (url): url is string => Boolean(url),
    );

    const negativePrompt = [
      jobInput.brandSnapshot.thingsToAvoid,
      'horizontal landscape framing',
      'readable fake caption overlay as the main focus',
      'watermark',
    ]
      .filter(Boolean)
      .join('. ');

    const hook = await this.waitForVideo(
      await this.videoGenerationProvider.generateVideo({
        prompt: this.buildClipPrompt(jobInput, format, 'hook'),
        mode: GenerationMode.CINEMATIC,
        useImageConditioning: true,
        productAssetUrls: imageUrls,
        referenceVideoUrl: jobInput.referenceVideoUrl,
        aspectRatio: jobInput.aspectRatio,
        negativePrompt,
      }),
    );
    if (hook.status === 'failed' || !hook.videoUrl) {
      throw new Error(hook.error ?? 'AI Video provider failed');
    }

    const payoff = await this.waitForVideo(
      await this.videoGenerationProvider.generateVideo({
        prompt: this.buildClipPrompt(jobInput, format, 'payoff'),
        mode: GenerationMode.CINEMATIC,
        useImageConditioning: true,
        productAssetUrls: imageUrls,
        referenceVideoUrl: jobInput.referenceVideoUrl,
        aspectRatio: jobInput.aspectRatio,
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
    jobInput: ViralRemixJobInput,
    format: Format,
    beat: 'hook' | 'payoff',
  ): string {
    const { brandSnapshot } = jobInput;
    const beatLine =
      beat === 'hook'
        ? 'Opening beat: cold-open curiosity hook in the first seconds.'
        : 'Closing beat: brand payoff, product or person hero moment, soft CTA energy.';

    return [
      `Viral Remix: match the pacing, hook structure, and camera energy of this reference video: ${jobInput.referenceVideoUrl}.`,
      jobInput.instructions
        ? `Creator instructions: ${jobInput.instructions}.`
        : '',
      jobInput.personImageUrl
        ? 'Include a person matching the reference person image when relevant.'
        : '',
      jobInput.productImageUrl
        ? 'Feature the product from the reference product image clearly.'
        : '',
      `Brand: ${brandSnapshot.name}. Tone: ${brandSnapshot.tone}.`,
      `Primary color: ${brandSnapshot.colors.primary}. Secondary color: ${brandSnapshot.colors.secondary}.`,
      brandSnapshot.audience ? `Audience: ${brandSnapshot.audience}.` : '',
      brandSnapshot.aiInstructions
        ? `Brand guidance: ${brandSnapshot.aiInstructions}.`
        : '',
      `Format: ${format.label}. ${format.promptStructure}`,
      `Platform: vertical short-form video. Aspect ratio ${jobInput.aspectRatio}. Quality ${jobInput.quality}.`,
      beatLine,
      'No AI caption package, no on-screen caption text focus.',
      `Target total video length about ${jobInput.durationSeconds} seconds across beats.`,
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

  private requireVideoFormat(formatId: string): Format {
    const format = this.formatCatalog.getById(formatId);
    if (!format) {
      throw new BadRequestException('Format not found');
    }
    if (format.modality === 'post') {
      throw new BadRequestException(
        'Format is post-only; pick a video-capable format',
      );
    }
    return format;
  }
}
