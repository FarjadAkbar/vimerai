import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { toAiImageJobResult } from '@/application/studio-core/ai-image-response';
import type {
  AiImageJobInput,
  CreateAiImageInput,
  IAiImageService,
  AiImageJobResult,
} from '@/core/ports/ai-image.service';
import type { IContentItemRepository } from '@/core/ports/content-item.repository';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type { IJobService } from '@/core/ports/job.service';
import type { IMediaAssetService } from '@/core/ports/media-asset.service';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import {
  CONTENT_ITEM_REPOSITORY_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  JOB_SERVICE_TOKEN,
  MEDIA_ASSET_SERVICE_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import {
  ContentItem,
  ContentItemMediaKind,
} from '@/domain/content-item.entity';
import { JobType } from '@/domain/job.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { IMAGE_JOB_CREDIT_COST } from '@/types/image-job/credits';
import type {
  AiImageAspectRatio,
  AiImageGenerationMode,
  AiImageOutputFormat,
} from '@/types/image-job/ai-image-options';

@Injectable()
export class AiImageService implements IAiImageService {
  constructor(
    @Inject(JOB_SERVICE_TOKEN)
    private readonly jobService: IJobService,
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
    @Inject(MEDIA_ASSET_SERVICE_TOKEN)
    private readonly mediaAssetService: IMediaAssetService,
    @Inject(IMAGE_GENERATION_PROVIDER_TOKEN)
    private readonly imageGenerationProvider: IImageGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async generateImage(
    userId: string,
    input: CreateAiImageInput,
  ): Promise<AiImageJobResult> {
    const jobInput = await this.buildJobInput(userId, input);
    return this.runImageJob(userId, jobInput);
  }

  async regenerateImage(
    userId: string,
    jobId: string,
  ): Promise<AiImageJobResult> {
    const existing = await this.jobService.getJob(userId, jobId);
    if (existing.type !== JobType.AI_IMAGE) {
      throw new NotFoundException('AI Image job not found');
    }
    if (existing.status !== 'completed') {
      throw new BadRequestException(
        'Only a completed AI Image job can be regenerated',
      );
    }
    const jobInput = existing.input as unknown as AiImageJobInput;
    return this.runImageJob(userId, jobInput);
  }

  async getImageJob(userId: string, jobId: string): Promise<AiImageJobResult> {
    const job = await this.jobService.getJob(userId, jobId);
    if (job.type !== JobType.AI_IMAGE) {
      throw new NotFoundException('AI Image job not found');
    }
    const contentItem = await this.contentItemRepository.findByJobId(jobId);
    return toAiImageJobResult(job, contentItem);
  }

  async listImageJobs(userId: string): Promise<AiImageJobResult[]> {
    const jobs = await this.jobService.listJobs(userId, {
      type: JobType.AI_IMAGE,
    });
    const results: AiImageJobResult[] = [];
    for (const job of jobs) {
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      results.push(toAiImageJobResult(job, contentItem));
    }
    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  private async runImageJob(
    userId: string,
    jobInput: AiImageJobInput,
  ): Promise<AiImageJobResult> {
    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      IMAGE_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Image generation credit limit reached');
    }

    const job = await this.jobService.createJob(userId, {
      type: JobType.AI_IMAGE,
      jobInput: jobInput as unknown as Record<string, unknown>,
      creditCharge: IMAGE_JOB_CREDIT_COST,
    });

    const title = 'AI Image';
    const placeholder = ContentItem.create({
      id: uuidv4(),
      userId,
      jobId: job.id,
      mediaKind: ContentItemMediaKind.IMAGE,
      title,
    });
    await this.contentItemRepository.create(placeholder);

    await this.subscriptionService.recordVideoGeneration(
      userId,
      IMAGE_JOB_CREDIT_COST,
    );

    try {
      await this.jobService.markJobProcessing(job.id);
      const imageResult = await this.imageGenerationProvider.generateImage({
        prompt: jobInput.prompt,
        productImageUrls: jobInput.referenceImageUrls,
        negativePrompt: jobInput.negativePrompt ?? undefined,
        aspectRatio: jobInput.aspectRatio,
        outputFormat: jobInput.outputFormat,
        enhancePrompt: jobInput.generationMode === 'enhanced',
      });
      const result = await this.jobService.completeJob(userId, job.id, {
        mediaKind: ContentItemMediaKind.IMAGE,
        mediaUrl: imageResult.imageUrl,
        title,
      });
      return toAiImageJobResult(result.job, result.contentItem);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'AI image generation failed';
      const failed = await this.jobService.failJob(job.id, message);
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      return toAiImageJobResult(failed, contentItem);
    }
  }

  private async buildJobInput(
    userId: string,
    input: CreateAiImageInput,
  ): Promise<AiImageJobInput> {
    const instructions = input.instructions.trim();
    if (!instructions) {
      throw new BadRequestException('Instructions are required');
    }

    const referenceMediaAssetIds = [...input.referenceMediaAssetIds];
    if (referenceMediaAssetIds.length === 0) {
      throw new BadRequestException('At least one reference image is required');
    }

    const referenceImageUrls: string[] = [];
    for (const assetId of referenceMediaAssetIds) {
      const asset = await this.mediaAssetService.getMediaAsset(userId, assetId);
      if (asset.kind !== MediaAssetKind.IMAGE) {
        throw new BadRequestException('Reference assets must be images');
      }
      if (!referenceImageUrls.includes(asset.url)) {
        referenceImageUrls.push(asset.url);
      }
    }

    const aspectRatio = input.aspectRatio ?? '1:1';
    const outputFormat = input.outputFormat ?? 'png';
    const generationMode = input.generationMode ?? 'enhanced';
    const negativePrompt = input.negativePrompt?.trim() || null;

    return {
      instructions,
      referenceMediaAssetIds,
      referenceImageUrls,
      aspectRatio,
      outputFormat,
      generationMode,
      negativePrompt,
      prompt: instructions,
    };
  }
}
