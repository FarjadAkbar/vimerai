import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { toInfluencerContentItemResult } from '@/application/studio-core/influencer-image-response';
import type { IAiInfluencerRepository } from '@/core/ports/ai-influencer.repository';
import type { IContentItemRepository } from '@/core/ports/content-item.repository';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type {
  CreateInfluencerImageInput,
  IInfluencerImageService,
  InfluencerAnimateJobInput,
  InfluencerContentItemResult,
  InfluencerImageJobInput,
} from '@/core/ports/influencer-image.service';
import type { IJobService } from '@/core/ports/job.service';
import type { IMediaAssetService } from '@/core/ports/media-asset.service';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type {
  GenerateVideoResponse,
  IVideoGenerationProvider,
} from '@/core/ports/video-generation.provider';
import {
  AI_INFLUENCER_REPOSITORY_TOKEN,
  CONTENT_ITEM_REPOSITORY_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  JOB_SERVICE_TOKEN,
  MEDIA_ASSET_SERVICE_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { AiInfluencer } from '@/domain/ai-influencer.entity';
import {
  ContentItem,
  ContentItemMediaKind,
} from '@/domain/content-item.entity';
import { JobType } from '@/domain/job.entity';
import { MediaAssetKind } from '@/domain/media-asset.entity';
import { GenerationMode } from '@/domain/video.entity';
import { IMAGE_JOB_CREDIT_COST } from '@/types/image-job/credits';
import { VIDEO_JOB_CREDIT_COST } from '@/types/video-job/credits';

@Injectable()
export class InfluencerImageService implements IInfluencerImageService {
  constructor(
    @Inject(JOB_SERVICE_TOKEN)
    private readonly jobService: IJobService,
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
    @Inject(AI_INFLUENCER_REPOSITORY_TOKEN)
    private readonly influencerRepository: IAiInfluencerRepository,
    @Inject(MEDIA_ASSET_SERVICE_TOKEN)
    private readonly mediaAssetService: IMediaAssetService,
    @Inject(IMAGE_GENERATION_PROVIDER_TOKEN)
    private readonly imageGenerationProvider: IImageGenerationProvider,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async generateImage(
    userId: string,
    influencerId: string,
    input: CreateInfluencerImageInput,
  ): Promise<InfluencerContentItemResult> {
    const influencer = await this.requireInfluencer(userId, influencerId);
    const jobInput = await this.buildImageJobInput(userId, influencer, input);
    return this.runImageJob(userId, influencer, jobInput);
  }

  async animateImage(
    userId: string,
    influencerId: string,
    contentItemId: string,
  ): Promise<InfluencerContentItemResult> {
    const influencer = await this.requireInfluencer(userId, influencerId);
    const contentItem = await this.contentItemRepository.findById(contentItemId);
    if (!contentItem || contentItem.userId !== userId) {
      throw new NotFoundException('Content item not found');
    }

    const sourceJob = await this.jobService.getJob(userId, contentItem.jobId);
    if (sourceJob.type !== JobType.INFLUENCER_IMAGE) {
      throw new BadRequestException('Only influencer images can be animated');
    }
    if (sourceJob.status !== 'completed' || !contentItem.mediaUrl) {
      throw new BadRequestException(
        'Only a completed influencer image can be animated',
      );
    }

    const sourceInput = sourceJob.input as InfluencerImageJobInput;
    if (sourceInput.influencerId !== influencerId) {
      throw new NotFoundException('Content item not found');
    }

    const jobInput: InfluencerAnimateJobInput = {
      influencerId,
      sourceContentItemId: contentItemId,
      sourceImageUrl: contentItem.mediaUrl,
      prompt: this.buildAnimatePrompt(influencer),
    };

    return this.runAnimateJob(userId, influencer, jobInput);
  }

  async listInfluencerImages(
    userId: string,
    influencerId: string,
  ): Promise<InfluencerContentItemResult[]> {
    return this.listInfluencerContent(userId, influencerId, [
      JobType.INFLUENCER_IMAGE,
    ]);
  }

  async listInfluencerVideos(
    userId: string,
    influencerId: string,
  ): Promise<InfluencerContentItemResult[]> {
    return this.listInfluencerContent(userId, influencerId, [
      JobType.INFLUENCER_VIDEO_I2V,
      JobType.INFLUENCER_TALKING_HEAD,
    ]);
  }

  private async listInfluencerContent(
    userId: string,
    influencerId: string,
    jobTypes: JobType[],
  ): Promise<InfluencerContentItemResult[]> {
    await this.requireInfluencer(userId, influencerId);
    const jobsByType = await Promise.all(
      jobTypes.map((type) => this.jobService.listJobs(userId, { type })),
    );
    const filtered = jobsByType.flat().filter((job) => {
      const input = job.input as { influencerId?: string };
      return input.influencerId === influencerId;
    });

    const results: InfluencerContentItemResult[] = [];
    for (const job of filtered) {
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      results.push(toInfluencerContentItemResult(job, contentItem));
    }
    return results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  private async runImageJob(
    userId: string,
    influencer: AiInfluencer,
    jobInput: InfluencerImageJobInput,
  ): Promise<InfluencerContentItemResult> {
    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      IMAGE_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Image generation credit limit reached');
    }

    const job = await this.jobService.createJob(userId, {
      type: JobType.INFLUENCER_IMAGE,
      jobInput: jobInput as unknown as Record<string, unknown>,
      creditCharge: IMAGE_JOB_CREDIT_COST,
    });

    const title = `${influencer.name} image`;
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
      });
      const result = await this.jobService.completeJob(userId, job.id, {
        mediaKind: ContentItemMediaKind.IMAGE,
        mediaUrl: imageResult.imageUrl,
        title,
      });
      return toInfluencerContentItemResult(result.job, result.contentItem);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Influencer image failed';
      const failed = await this.jobService.failJob(job.id, message);
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      return toInfluencerContentItemResult(failed, contentItem);
    }
  }

  private async runAnimateJob(
    userId: string,
    influencer: AiInfluencer,
    jobInput: InfluencerAnimateJobInput,
  ): Promise<InfluencerContentItemResult> {
    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Video generation credit limit reached');
    }

    const job = await this.jobService.createJob(userId, {
      type: JobType.INFLUENCER_VIDEO_I2V,
      jobInput: jobInput as unknown as Record<string, unknown>,
      creditCharge: VIDEO_JOB_CREDIT_COST,
    });

    const title = `${influencer.name} video`;
    const placeholder = ContentItem.create({
      id: uuidv4(),
      userId,
      jobId: job.id,
      mediaKind: ContentItemMediaKind.VIDEO,
      title,
      thumbnailUrl: jobInput.sourceImageUrl,
    });
    await this.contentItemRepository.create(placeholder);

    await this.subscriptionService.recordVideoGeneration(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );

    try {
      await this.jobService.markJobProcessing(job.id);
      const video = await this.waitForVideo(
        await this.videoGenerationProvider.generateVideo({
          prompt: jobInput.prompt,
          mode: GenerationMode.CINEMATIC,
          useImageConditioning: true,
          productAssetUrls: [jobInput.sourceImageUrl],
          aspectRatio: '9:16',
        }),
      );
      if (video.status === 'failed' || !video.videoUrl) {
        throw new Error(video.error ?? 'Image-to-video generation failed');
      }

      const result = await this.jobService.completeJob(userId, job.id, {
        mediaKind: ContentItemMediaKind.VIDEO,
        mediaUrl: video.videoUrl,
        thumbnailUrl: jobInput.sourceImageUrl,
        title,
      });
      return toInfluencerContentItemResult(result.job, result.contentItem);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Influencer animate failed';
      const failed = await this.jobService.failJob(job.id, message);
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      return toInfluencerContentItemResult(failed, contentItem);
    }
  }

  private async buildImageJobInput(
    userId: string,
    influencer: AiInfluencer,
    input: CreateInfluencerImageInput,
  ): Promise<InfluencerImageJobInput> {
    const referenceMediaAssetIds = [
      ...(input.referenceMediaAssetIds ?? []),
    ];
    if (
      influencer.portraitMediaAssetId &&
      !referenceMediaAssetIds.includes(influencer.portraitMediaAssetId)
    ) {
      referenceMediaAssetIds.unshift(influencer.portraitMediaAssetId);
    }

    const referenceImageUrls: string[] = [];
    if (
      influencer.portraitUrl &&
      !referenceMediaAssetIds.includes(influencer.portraitMediaAssetId ?? '')
    ) {
      referenceImageUrls.push(influencer.portraitUrl);
    }

    for (const assetId of referenceMediaAssetIds) {
      const asset = await this.mediaAssetService.getMediaAsset(userId, assetId);
      if (asset.kind !== MediaAssetKind.IMAGE) {
        throw new BadRequestException('Reference assets must be images');
      }
      if (!referenceImageUrls.includes(asset.url)) {
        referenceImageUrls.push(asset.url);
      }
    }

    if (referenceImageUrls.length === 0) {
      throw new BadRequestException(
        'At least one reference image is required (portrait or media asset)',
      );
    }

    const instructions = input.instructions?.trim() || null;
    return {
      influencerId: influencer.id,
      instructions,
      referenceMediaAssetIds,
      referenceImageUrls,
      prompt: this.buildImagePrompt(influencer, instructions),
    };
  }

  private buildImagePrompt(
    influencer: AiInfluencer,
    instructions: string | null,
  ): string {
    return [
      `Generate a photorealistic image of AI influencer ${influencer.name}.`,
      `Appearance: ${influencer.appearancePrompt}.`,
      `Gender: ${influencer.gender}. Age: ${influencer.age}.`,
      influencer.ethnicity ? `Ethnicity: ${influencer.ethnicity}.` : '',
      instructions ? `Creator instructions: ${instructions}.` : '',
      'Match the reference images for likeness and style consistency.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildAnimatePrompt(influencer: AiInfluencer): string {
    return [
      `Animate this image of ${influencer.name} into a short vertical social video.`,
      `Appearance: ${influencer.appearancePrompt}.`,
      `Gender: ${influencer.gender}. Age: ${influencer.age}.`,
      influencer.ethnicity ? `Ethnicity: ${influencer.ethnicity}.` : '',
      'Subtle natural motion, cinematic lighting, vertical 9:16 framing.',
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

  private async requireInfluencer(
    userId: string,
    influencerId: string,
  ): Promise<AiInfluencer> {
    const influencer = await this.influencerRepository.findById(influencerId);
    if (!influencer || influencer.userId !== userId) {
      throw new NotFoundException('Influencer not found');
    }
    return influencer;
  }
}
