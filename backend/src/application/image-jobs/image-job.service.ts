import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type { IImageJobRepository } from '@/core/ports/image-job.repository';
import type {
  CreateImageJobInput,
  CreateImageJobResult,
  GetImageJobResult,
  IImageJobService,
  ListImageJobsResult,
} from '@/core/ports/image-job.service';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import {
  IMAGE_GENERATION_PROVIDER_TOKEN,
  IMAGE_JOB_REPOSITORY_TOKEN,
  SUBSCRIPTION_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { ImageJob } from '@/domain/image-job.entity';
import { IMAGE_JOB_CREDIT_COST } from '@/types/image-job/credits';

@Injectable()
export class ImageJobService implements IImageJobService {
  constructor(
    @Inject(IMAGE_JOB_REPOSITORY_TOKEN)
    private readonly imageJobRepository: IImageJobRepository,
    @Inject(IMAGE_GENERATION_PROVIDER_TOKEN)
    private readonly imageGenerationProvider: IImageGenerationProvider,
    @Inject(SUBSCRIPTION_SERVICE_TOKEN)
    private readonly subscriptionService: ISubscriptionService,
  ) {}

  async createImageJob(
    userId: string,
    input: CreateImageJobInput,
  ): Promise<CreateImageJobResult> {
    const prompt = input.prompt.trim();
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }

    const referenceImageUrls = input.referenceImageUrls.filter((url) =>
      url?.trim(),
    );
    if (referenceImageUrls.length === 0) {
      throw new BadRequestException(
        'At least one reference image URL is required',
      );
    }

    const canGenerate = await this.subscriptionService.canGenerate(
      userId,
      IMAGE_JOB_CREDIT_COST,
    );
    if (!canGenerate) {
      throw new BadRequestException('Image generation credit limit reached');
    }

    let job = ImageJob.create({
      id: uuidv4(),
      userId,
      prompt,
      referenceImageUrls,
      negativePrompt: input.negativePrompt?.trim() || null,
      creditCharge: IMAGE_JOB_CREDIT_COST,
    });
    await this.imageJobRepository.create(job);
    await this.subscriptionService.recordVideoGeneration(
      userId,
      IMAGE_JOB_CREDIT_COST,
    );

    try {
      const imageResult = await this.imageGenerationProvider.generateImage({
        prompt,
        productImageUrls: referenceImageUrls,
        negativePrompt: input.negativePrompt?.trim(),
      });
      job = job.withUpdates({
        status: 'completed',
        imageUrl: imageResult.imageUrl,
        error: null,
      });
    } catch (error) {
      job = job.withUpdates({
        status: 'failed',
        imageUrl: null,
        error:
          error instanceof Error
            ? error.message
            : 'AI image generation failed',
      });
    }

    await this.imageJobRepository.update(job);
    return { imageJob: job };
  }

  async listImageJobs(userId: string): Promise<ListImageJobsResult> {
    const imageJobs = await this.imageJobRepository.findByUserId(userId);
    return { imageJobs };
  }

  async getImageJob(userId: string, jobId: string): Promise<GetImageJobResult> {
    const imageJob = await this.requireOwnedJob(userId, jobId);
    return { imageJob };
  }

  async regenerateImageJob(
    userId: string,
    jobId: string,
  ): Promise<CreateImageJobResult> {
    const existing = await this.requireOwnedJob(userId, jobId);
    if (existing.status !== 'completed') {
      throw new BadRequestException(
        'Only a completed Image Job can be regenerated',
      );
    }
    return this.createImageJob(userId, {
      prompt: existing.prompt,
      referenceImageUrls: existing.referenceImageUrls,
      negativePrompt: existing.negativePrompt ?? undefined,
    });
  }

  private async requireOwnedJob(
    userId: string,
    jobId: string,
  ): Promise<ImageJob> {
    const job = await this.imageJobRepository.findById(jobId);
    if (!job || job.userId !== userId) {
      throw new NotFoundException('Image Job not found');
    }
    return job;
  }
}
