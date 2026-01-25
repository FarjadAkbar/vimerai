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
} from '@/core/ports/generator.service';
import type { IVideoRepository } from '@/core/ports/video.repository';
import type { ISubscriptionService } from '@/core/ports/subscription.service';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import type { IStorageService } from '@/core/ports/storage.service';
import {
  STORAGE_SERVICE_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { Video, GenerationMode, VideoStatus } from '@/domain/video.entity';

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
  ) {}

  async generateVideo(
    userId: string,
    dto: GenerateVideoDto,
    type: 'preview' | 'full',
  ): Promise<{ jobId: string; status: string }> {
    const jobId = uuidv4();
    const mode = (dto.mode as GenerationMode) || GenerationMode.FAST;

    // Handle preview generation
    // if (type === 'preview') {
    //   // Check if user already used preview (first preview is free, no subscription required)
    //   const videos = await this.videoRepository.getVideosByUserId(userId, 100, 0);
    //   const hasPreview = videos.videos.some((v) => v.previewUrl !== null);

    //   if (hasPreview) {
    //     throw new BadRequestException('Preview already used');
    //   }

    //   // First preview is free - no subscription check needed
    //   const video = Video.create(
    //     uuidv4(),
    //     userId,
    //     dto.prompt,
    //     GenerationMode.FAST,
    //     jobId,
    //   );

    //   await this.videoRepository.createVideo(video);

    //   // Generate preview using provider (async - returns jobId for status polling)
    //   try {
    //     const previewResult = await this.videoGenerationProvider.generatePreview(
    //       dto.prompt,
    //       jobId, // Pass jobId so provider can use it
    //     );

    //     // Update video with generation result
    //     const statusMap: Record<string, VideoStatus> = {
    //       pending: VideoStatus.PENDING,
    //       processing: VideoStatus.PROCESSING,
    //       completed: VideoStatus.COMPLETED,
    //       failed: VideoStatus.FAILED,
    //     };

    //     const providerJobId = previewResult.jobId || jobId;
    //     let updatedVideo = video.updateJobId(providerJobId);

    //     updatedVideo = updatedVideo.updateStatus(
    //       statusMap[previewResult.status] || VideoStatus.PENDING,
    //       null, // No videoUrl for previews
    //     );

    //     // Set previewUrl if provided
    //     if (previewResult.previewUrl) {
    //       updatedVideo = updatedVideo.updatePreviewUrl(previewResult.previewUrl);
    //     }

    //     await this.videoRepository.updateVideo(updatedVideo);

    //     return {
    //       jobId: providerJobId,
    //       status: previewResult.status,
    //     };
    //   } catch (error) {
    //     // If generation fails, mark video as failed
    //     const failedVideo = video.updateStatus(VideoStatus.FAILED, null);
    //     await this.videoRepository.updateVideo(failedVideo);

    //     throw new BadRequestException(
    //       `Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    //     );
    //   }
    // }

    // Handle full video generation
    // Check if user can generate
    const canGenerate = await this.subscriptionService.canGenerate(userId);
    if (!canGenerate) {
      throw new BadRequestException('Video generation limit reached');
    }

    const video = Video.create(uuidv4(), userId, dto.prompt, mode, jobId);

    await this.videoRepository.createVideo(video);

    // Generate video using provider (Sora)
    try {
      const generationResult = await this.videoGenerationProvider.generateVideo(
        {
          prompt: dto.prompt,
          mode,
          jobId, // Pass the jobId to the provider so it uses the same one
        },
      );

      // Update video with generation result
      const statusMap: Record<string, VideoStatus> = {
        pending: VideoStatus.PENDING,
        processing: VideoStatus.PROCESSING,
        completed: VideoStatus.COMPLETED,
        failed: VideoStatus.FAILED,
      };

      const providerJobId = generationResult.jobId || jobId;
      let updatedVideo = video.updateJobId(providerJobId);

      updatedVideo = updatedVideo.updateStatus(
        statusMap[generationResult.status] || VideoStatus.PENDING,
        generationResult.videoUrl || null,
      );

      await this.videoRepository.updateVideo(updatedVideo);

      // Only record usage if generation was successful
      if (generationResult.status === 'completed') {
        await this.subscriptionService.recordVideoGeneration(userId);
      }

      return {
        jobId: providerJobId,
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

  async getGenerationStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
    previewUrl?: string;
  }> {
    const video = await this.videoRepository.getVideoByJobId(jobId);
    if (!video) {
      throw new NotFoundException('Generation job not found');
    }

    // Check for timeout: if video has been processing for more than 30 minutes, mark as failed
    const MAX_PROCESSING_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
    const processingTime = Date.now() - video.createdAt.getTime();

    if (
      (video.status === VideoStatus.PENDING ||
        video.status === VideoStatus.PROCESSING) &&
      processingTime > MAX_PROCESSING_TIME
    ) {
      // Mark as failed due to timeout
      const failedVideo = video.updateStatus(VideoStatus.FAILED, null);
      await this.videoRepository.updateVideo(failedVideo);

      return {
        status: 'failed',
        videoUrl: undefined,
      };
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
        const statusMap: Record<string, VideoStatus> = {
          pending: VideoStatus.PENDING,
          processing: VideoStatus.PROCESSING,
          completed: VideoStatus.COMPLETED,
          failed: VideoStatus.FAILED,
        };

        const newStatus = statusMap[statusResult.status] || video.status;

        // Always update if status changed, if we got a video URL, or if we got a preview URL
        if (
          newStatus !== video.status ||
          (statusResult.videoUrl && !video.videoUrl) ||
          (statusResult.previewUrl && !video.previewUrl)
        ) {
          let updatedVideo = video.updateStatus(
            newStatus,
            statusResult.videoUrl || video.videoUrl || null,
          );

          // Update previewUrl if provided
          // if (statusResult.previewUrl) {
          //   updatedVideo = updatedVideo.updatePreviewUrl(
          //     statusResult.previewUrl,
          //   );
          // }

          await this.videoRepository.updateVideo(updatedVideo);

          // Record usage only for full videos (not previews)
          // Full videos have videoUrl, previews only have previewUrl
          // Only record if it's a full video (has videoUrl) and not just a preview
          if (newStatus === VideoStatus.COMPLETED && updatedVideo.videoUrl) {
            await this.subscriptionService.recordVideoGeneration(video.userId);
          }
        }

        return {
          status: statusResult.status,
          videoUrl: statusResult.videoUrl ?? video.videoUrl ?? undefined,
          previewUrl: statusResult.previewUrl ?? video.previewUrl ?? undefined,
        };
      } catch (error) {
        console.error('Status check failed:', error);

        // If status check fails multiple times and video has been processing for a while,
        // we might want to mark it as failed, but for now, return current status
        // to allow polling to continue
        return {
          status: video.status.toString(),
          videoUrl: video.videoUrl ?? undefined,
          previewUrl: video.previewUrl ?? undefined,
        };
      }
    }

    return {
      status: video.status.toString(),
      videoUrl: video.videoUrl ?? undefined,
      previewUrl: video.previewUrl ?? undefined,
    };
  }

  async downloadVideo(videoId: string): Promise<Buffer> {
    // Get the video record by jobId (videoId from Sora)
    const video = await this.videoRepository.getVideoByJobId(videoId);
    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Download video from provider (Sora)
    const videoBuffer =
      await this.videoGenerationProvider.downloadVideo(videoId);

    // If video URL is not set, save the file and update the URL
    if (!video.videoUrl) {
      // Save video to storage and get the URL
      const key = `videos/${videoId}.mp4`;
      const savedVideoUrl = await this.storageService.upload(
        key,
        videoBuffer,
        'video/mp4',
      );

      // Update video record with the saved URL
      const updatedVideo = video.updateStatus(video.status, savedVideoUrl);
      await this.videoRepository.updateVideo(updatedVideo);
    }

    return videoBuffer;
  }
}
