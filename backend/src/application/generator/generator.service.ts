import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  IGeneratorService,
  GenerateVideoDto,
  GeneratePreviewDto,
} from '@/core/ports/generator.service';
import type { IVideoRepository } from '@/core/ports/video.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import { Video, GenerationMode, VideoStatus } from '@/domain/video.entity';

@Injectable()
export class GeneratorService implements IGeneratorService {
  constructor(
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
    @Inject('IVideoGenerationProvider')
    private readonly videoGenerationProvider: IVideoGenerationProvider,
  ) {}

  async generateVideo(
    userId: string,
    dto: GenerateVideoDto,
  ): Promise<{ jobId: string; status: string }> {
    // Check if user can generate
    const canGenerate = await this.subscriptionService.canGenerate(userId);
    if (!canGenerate) {
      throw new BadRequestException('Video generation limit reached');
    }

    const jobId = uuidv4();
    const mode = (dto.mode as GenerationMode) || GenerationMode.FAST;

    const video = Video.create(uuidv4(), userId, dto.prompt, mode, jobId);

    await this.videoRepository.createVideo(video);

    // Generate video using provider (Sora)
    try {
      const generationResult = await this.videoGenerationProvider.generateVideo(
        {
          prompt: dto.prompt,
          mode,
        },
      );

      // Update video with generation result
      const statusMap: Record<string, VideoStatus> = {
        pending: VideoStatus.PENDING,
        processing: VideoStatus.PROCESSING,
        completed: VideoStatus.COMPLETED,
        failed: VideoStatus.FAILED,
      };

      const updatedVideo = video.updateStatus(
        statusMap[generationResult.status] || VideoStatus.PENDING,
        generationResult.videoUrl || null,
      );

      await this.videoRepository.updateVideo(updatedVideo);

      // Only record usage if generation was successful
      if (generationResult.status === 'completed') {
        await this.subscriptionService.recordVideoGeneration(userId);
      }

      return {
        jobId: generationResult.jobId || jobId,
        status: generationResult.status,
      };
    } catch (error) {
      // If generation fails, mark video as failed
      const failedVideo = video.updateStatus(VideoStatus.FAILED, null);
      await this.videoRepository.updateVideo(failedVideo);
      throw new BadRequestException(
        `Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async generatePreview(
    userId: string,
    dto: GeneratePreviewDto,
  ): Promise<{ previewUrl: string; used: boolean }> {
    // Check if user already used preview
    const videos = await this.videoRepository.getVideosByUserId(userId, 1, 0);
    const hasPreview = videos.videos.some((v) => v.previewUrl !== null);

    if (hasPreview) {
      throw new BadRequestException('Preview already used');
    }

    const jobId = uuidv4();
    const video = Video.create(
      uuidv4(),
      userId,
      dto.prompt,
      GenerationMode.FAST,
      jobId,
    );

    // Generate preview using provider
    try {
      const previewResult = await this.videoGenerationProvider.generatePreview(
        dto.prompt,
      );
      const videoWithPreview = video.updatePreviewUrl(previewResult.previewUrl);
      await this.videoRepository.createVideo(videoWithPreview);

      return { previewUrl: previewResult.previewUrl, used: true };
    } catch (error) {
      throw new BadRequestException(
        `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getGenerationStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
  }> {
    const video = await this.videoRepository.getVideoByJobId(jobId);
    if (!video) {
      throw new NotFoundException('Generation job not found');
    }

    // If still processing, check with provider
    if (
      video.status === VideoStatus.PENDING ||
      video.status === VideoStatus.PROCESSING
    ) {
      try {
        const statusResult =
          await this.videoGenerationProvider.getGenerationStatus(jobId);

        // Update video status if changed
        if (statusResult.status !== video.status) {
          const statusMap: Record<string, VideoStatus> = {
            pending: VideoStatus.PENDING,
            processing: VideoStatus.PROCESSING,
            completed: VideoStatus.COMPLETED,
            failed: VideoStatus.FAILED,
          };

          const updatedVideo = video.updateStatus(
            statusMap[statusResult.status] || video.status,
            statusResult.videoUrl || null,
          );
          await this.videoRepository.updateVideo(updatedVideo);

          // Record usage if completed
          if (statusResult.status === 'completed') {
            await this.subscriptionService.recordVideoGeneration(video.userId);
          }
        }

        return {
          status: statusResult.status,
          videoUrl: statusResult.videoUrl,
        };
      } catch (error) {
        // If status check fails, return current video status
        return {
          status: video.status,
          videoUrl: video.videoUrl ?? undefined,
        };
      }
    }

    return {
      status: video.status,
      videoUrl: video.videoUrl ?? undefined,
    };
  }
}
