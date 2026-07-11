import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  IGeneratorService,
  GenerateVideoDto,
} from '@/core/ports/generator.service';
import type { IVideoRepository } from '@/core/ports/video.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type {
  GenerateVideoResponse,
  IVideoGenerationProvider,
} from '@/core/ports/video-generation.provider';
import type { IStorageService } from '@/core/ports/storage.service';
import type { IProductKitService } from '@/core/ports/product-kit.service';
import {
  PRODUCT_KIT_SERVICE_TOKEN,
  STORAGE_SERVICE_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { Video, GenerationMode, VideoStatus } from '@/domain/video.entity';

const STATUS_MAP: Record<GenerateVideoResponse['status'], VideoStatus> = {
  pending: VideoStatus.PENDING,
  processing: VideoStatus.PROCESSING,
  completed: VideoStatus.COMPLETED,
  failed: VideoStatus.FAILED,
};

@Injectable()
export class GeneratorService implements IGeneratorService {
  constructor(
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
    @Inject(PRODUCT_KIT_SERVICE_TOKEN)
    private readonly productKitService: IProductKitService,
  ) {}

  async generateVideo(
    userId: string,
    dto: GenerateVideoDto,
    type: 'preview' | 'full',
  ): Promise<{ jobId: string; status: string }> {
    void type;
    const localJobId: string = randomUUID();
    const videoId: string = randomUUID();
    const mode: GenerationMode = dto.mode ?? GenerationMode.FAST;

    const canGenerate = await this.subscriptionService.canGenerate(userId);
    if (!canGenerate) {
      throw new BadRequestException('Video generation limit reached');
    }

    const video = Video.create(videoId, userId, dto.prompt, mode, localJobId);

    await this.videoRepository.createVideo(video);

    const kitContext = await this.productKitService.buildGenerationContext(
      dto.prompt,
      dto.shotTemplate,
    );

    try {
      const generationResult: GenerateVideoResponse =
        await this.videoGenerationProvider.generateVideo({
          prompt: kitContext.prompt,
          mode,
          jobId: localJobId,
          productAssetUrls: kitContext.productAssetUrls,
          negativePrompt: kitContext.negativePrompt,
          useImageConditioning: kitContext.useImageConditioning,
          textToVideoModel: kitContext.textToVideoModel,
          imageToVideoModel: kitContext.imageToVideoModel,
        });

      const providerJobId: string = generationResult.jobId || localJobId;
      let updatedVideo = video.updateJobId(providerJobId);

      updatedVideo = updatedVideo.updateStatus(
        STATUS_MAP[generationResult.status] ?? VideoStatus.PENDING,
        generationResult.videoUrl ?? null,
      );

      await this.videoRepository.updateVideo(updatedVideo);

      if (generationResult.status === 'completed') {
        await this.subscriptionService.recordVideoGeneration(userId);
      }

      return {
        jobId: providerJobId,
        status: generationResult.status,
      };
    } catch (error) {
      const failedVideo = video.updateStatus(VideoStatus.FAILED, null);
      await this.videoRepository.updateVideo(failedVideo);
      throw new BadRequestException(
        `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getGenerationStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
    previewUrl?: string;
    error?: string;
  }> {
    const video = await this.videoRepository.getVideoByJobId(jobId);
    if (!video) {
      throw new NotFoundException('Generation job not found');
    }

    const MAX_PROCESSING_TIME = 30 * 60 * 1000;
    const processingTime = Date.now() - video.createdAt.getTime();

    if (
      (video.status === VideoStatus.PENDING ||
        video.status === VideoStatus.PROCESSING) &&
      processingTime > MAX_PROCESSING_TIME
    ) {
      const failedVideo = video.updateStatus(VideoStatus.FAILED, null);
      await this.videoRepository.updateVideo(failedVideo);

      return {
        status: 'failed',
        videoUrl: undefined,
        error: 'Generation timed out',
      };
    }

    if (
      video.status === VideoStatus.PENDING ||
      video.status === VideoStatus.PROCESSING
    ) {
      try {
        const statusResult: GenerateVideoResponse =
          await this.videoGenerationProvider.getGenerationStatus(jobId);

        const newStatus: VideoStatus =
          STATUS_MAP[statusResult.status] ?? video.status;

        if (
          newStatus !== video.status ||
          (statusResult.videoUrl && !video.videoUrl) ||
          (statusResult.previewUrl && !video.previewUrl)
        ) {
          let updatedVideo = video.updateStatus(
            newStatus,
            statusResult.videoUrl ?? video.videoUrl ?? null,
          );

          if (statusResult.previewUrl) {
            updatedVideo = updatedVideo.updatePreviewUrl(
              statusResult.previewUrl,
            );
          }

          await this.videoRepository.updateVideo(updatedVideo);

          if (newStatus === VideoStatus.COMPLETED && updatedVideo.videoUrl) {
            await this.subscriptionService.recordVideoGeneration(video.userId);
          }
        }

        return {
          status: statusResult.status,
          videoUrl: statusResult.videoUrl ?? video.videoUrl ?? undefined,
          previewUrl: statusResult.previewUrl ?? video.previewUrl ?? undefined,
          error: statusResult.error,
        };
      } catch (error) {
        console.error('Status check failed:', error);

        return {
          status: video.status,
          videoUrl: video.videoUrl ?? undefined,
          previewUrl: video.previewUrl ?? undefined,
        };
      }
    }

    return {
      status: video.status,
      videoUrl: video.videoUrl ?? undefined,
      previewUrl: video.previewUrl ?? undefined,
    };
  }

  async downloadVideo(videoId: string): Promise<Buffer> {
    const video = await this.videoRepository.getVideoByJobId(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const videoBuffer =
      await this.videoGenerationProvider.downloadVideo(videoId);

    if (!video.videoUrl) {
      const key = `videos/${videoId}.mp4`;
      const savedVideoUrl = await this.storageService.upload(
        key,
        videoBuffer,
        'video/mp4',
      );

      const updatedVideo = video.updateStatus(video.status, savedVideoUrl);
      await this.videoRepository.updateVideo(updatedVideo);
    }

    return videoBuffer;
  }
}
