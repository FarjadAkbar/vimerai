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
import type {
  CreateInfluencerVideoInput,
  IInfluencerVideoService,
  InfluencerContentItemResult,
  InfluencerVideoJobInput,
  InfluencerVideoMode,
} from '@/core/ports/influencer-video.service';
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
import { VIDEO_JOB_CREDIT_COST } from '@/types/video-job/credits';
import type { InfluencerImageJobInput } from '@/core/ports/influencer-image.service';

@Injectable()
export class InfluencerVideoService implements IInfluencerVideoService {
  constructor(
    @Inject(JOB_SERVICE_TOKEN)
    private readonly jobService: IJobService,
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
    @Inject(AI_INFLUENCER_REPOSITORY_TOKEN)
    private readonly influencerRepository: IAiInfluencerRepository,
    @Inject(MEDIA_ASSET_SERVICE_TOKEN)
    private readonly mediaAssetService: IMediaAssetService,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async generateVideo(
    userId: string,
    influencerId: string,
    input: CreateInfluencerVideoInput,
  ): Promise<InfluencerContentItemResult> {
    const influencer = await this.requireInfluencer(userId, influencerId);

    if (input.mode === 'talking_head') {
      const script = input.script?.trim();
      if (!script) {
        throw new BadRequestException('Script is required for talking head');
      }
    }

    const source = await this.resolveSourceImage(userId, influencerId, influencer, {
      sourceContentItemId: input.sourceContentItemId,
      sourceMediaAssetId: input.sourceMediaAssetId,
    });

    const jobInput = this.buildVideoJobInput(influencer, {
      mode: input.mode,
      sourceImageUrl: source.url,
      sourceContentItemId: source.contentItemId ?? null,
      sourceMediaAssetId: source.mediaAssetId ?? null,
      instructions: input.instructions?.trim() || null,
      script: input.script?.trim() || null,
    });

    return this.runVideoJob(userId, influencer, jobInput);
  }

  async animateFromContentItem(
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

    const sourceInput = sourceJob.input as unknown as InfluencerImageJobInput;
    if (sourceInput.influencerId !== influencerId) {
      throw new NotFoundException('Content item not found');
    }

    const jobInput = this.buildVideoJobInput(influencer, {
      mode: 'image_to_video',
      sourceImageUrl: contentItem.mediaUrl,
      sourceContentItemId: contentItemId,
      sourceMediaAssetId: null,
      instructions: null,
      script: null,
    });

    return this.runVideoJob(userId, influencer, jobInput);
  }

  async listInfluencerVideos(
    userId: string,
    influencerId: string,
  ): Promise<InfluencerContentItemResult[]> {
    await this.requireInfluencer(userId, influencerId);
    const jobTypes = [JobType.INFLUENCER_VIDEO_I2V, JobType.INFLUENCER_TALKING_HEAD];
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

  private async runVideoJob(
    userId: string,
    influencer: AiInfluencer,
    jobInput: InfluencerVideoJobInput,
  ): Promise<InfluencerContentItemResult> {
    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      VIDEO_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Video generation credit limit reached');
    }

    const jobType =
      jobInput.mode === 'talking_head'
        ? JobType.INFLUENCER_TALKING_HEAD
        : JobType.INFLUENCER_VIDEO_I2V;

    const title =
      jobInput.mode === 'talking_head'
        ? `${influencer.name} talking head`
        : `${influencer.name} video`;

    const job = await this.jobService.createJob(userId, {
      type: jobType,
      jobInput: jobInput as unknown as Record<string, unknown>,
      creditCharge: VIDEO_JOB_CREDIT_COST,
    });

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
      const generationMode =
        jobInput.mode === 'talking_head'
          ? GenerationMode.AVATAR
          : GenerationMode.CINEMATIC;

      const video = await this.waitForVideo(
        await this.videoGenerationProvider.generateVideo({
          prompt: jobInput.prompt,
          mode: generationMode,
          useImageConditioning: true,
          productAssetUrls: [jobInput.sourceImageUrl],
          aspectRatio: '9:16',
        }),
      );
      if (video.status === 'failed' || !video.videoUrl) {
        throw new Error(video.error ?? 'Influencer video generation failed');
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
        error instanceof Error ? error.message : 'Influencer video failed';
      const failed = await this.jobService.failJob(job.id, message);
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      return toInfluencerContentItemResult(failed, contentItem);
    }
  }

  private buildVideoJobInput(
    influencer: AiInfluencer,
    input: {
      mode: InfluencerVideoMode;
      sourceImageUrl: string;
      sourceContentItemId: string | null;
      sourceMediaAssetId: string | null;
      instructions: string | null;
      script: string | null;
    },
  ): InfluencerVideoJobInput {
    return {
      influencerId: influencer.id,
      mode: input.mode,
      sourceImageUrl: input.sourceImageUrl,
      sourceContentItemId: input.sourceContentItemId,
      sourceMediaAssetId: input.sourceMediaAssetId,
      instructions: input.instructions,
      script: input.script,
      prompt:
        input.mode === 'talking_head'
          ? this.buildTalkingHeadPrompt(influencer, input.script!)
          : this.buildImageToVideoPrompt(influencer, input.instructions),
    };
  }

  private buildImageToVideoPrompt(
    influencer: AiInfluencer,
    instructions: string | null,
  ): string {
    return [
      `Animate this image of ${influencer.name} into a short vertical social video.`,
      `Appearance: ${influencer.appearancePrompt}.`,
      `Gender: ${influencer.gender}. Age: ${influencer.age}.`,
      influencer.ethnicity ? `Ethnicity: ${influencer.ethnicity}.` : '',
      instructions ? `Creator instructions: ${instructions}.` : '',
      'Subtle natural motion, cinematic lighting, vertical 9:16 framing.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildTalkingHeadPrompt(
    influencer: AiInfluencer,
    script: string,
  ): string {
    return [
      `Talking head video of ${influencer.name} speaking directly to camera.`,
      `Script: "${script}".`,
      `Appearance: ${influencer.appearancePrompt}.`,
      `Gender: ${influencer.gender}. Age: ${influencer.age}.`,
      influencer.ethnicity ? `Ethnicity: ${influencer.ethnicity}.` : '',
      'Natural lip sync, steady eye contact, vertical 9:16 framing, studio lighting.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private async resolveSourceImage(
    userId: string,
    influencerId: string,
    influencer: AiInfluencer,
    input: {
      sourceContentItemId?: string;
      sourceMediaAssetId?: string;
    },
  ): Promise<{
    url: string;
    contentItemId?: string;
    mediaAssetId?: string;
  }> {
    if (input.sourceContentItemId) {
      const contentItem = await this.contentItemRepository.findById(
        input.sourceContentItemId,
      );
      if (!contentItem || contentItem.userId !== userId) {
        throw new NotFoundException('Content item not found');
      }
      if (!contentItem.mediaUrl) {
        throw new BadRequestException('Source image is not ready yet');
      }

      const sourceJob = await this.jobService.getJob(userId, contentItem.jobId);
      const jobInput = sourceJob.input as { influencerId?: string };
      if (
        sourceJob.type !== JobType.INFLUENCER_IMAGE ||
        jobInput.influencerId !== influencerId
      ) {
        throw new BadRequestException(
          'Source must be a completed influencer image',
        );
      }

      return {
        url: contentItem.mediaUrl,
        contentItemId: contentItem.id,
      };
    }

    if (input.sourceMediaAssetId) {
      const asset = await this.mediaAssetService.getMediaAsset(
        userId,
        input.sourceMediaAssetId,
      );
      if (asset.kind !== MediaAssetKind.IMAGE) {
        throw new BadRequestException('Source media asset must be an image');
      }
      return {
        url: asset.url,
        mediaAssetId: asset.id,
      };
    }

    if (influencer.portraitUrl) {
      return { url: influencer.portraitUrl };
    }

    throw new BadRequestException(
      'A source image is required (portrait, media asset, or influencer image)',
    );
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
