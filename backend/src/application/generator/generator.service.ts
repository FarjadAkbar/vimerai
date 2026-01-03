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
import { IVideoRepository } from '@/core/ports/video.repository';
import { ISubscriptionService } from '@/core/ports/subscription.service';
import { Video, GenerationMode, VideoStatus } from '@/domain/video.entity';

@Injectable()
export class GeneratorService implements IGeneratorService {
  constructor(
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
    @Inject('ISubscriptionService')
    private readonly subscriptionService: ISubscriptionService,
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

    const video = Video.create(
      uuidv4(),
      userId,
      dto.prompt,
      mode,
      jobId,
    );

    await this.videoRepository.createVideo(video);

    // Record usage
    await this.subscriptionService.recordVideoGeneration(userId);

    // Mock: In Phase 1, immediately mark as completed with mock URL
    const completedVideo = video.updateStatus(
      VideoStatus.COMPLETED,
      `https://mock-video-url.com/${jobId}.mp4`,
    );
    await this.videoRepository.updateVideo(completedVideo);

    return { jobId, status: 'pending' };
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

    const previewUrl = `https://mock-preview-url.com/${jobId}.gif`;
    const videoWithPreview = video.updatePreviewUrl(previewUrl);

    await this.videoRepository.createVideo(videoWithPreview);

    return { previewUrl, used: true };
  }

  async getGenerationStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
  }> {
    const video = await this.videoRepository.getVideoByJobId(jobId);
    if (!video) {
      throw new NotFoundException('Generation job not found');
    }

    return {
      status: video.status,
      videoUrl: video.videoUrl ?? undefined,
    };
  }
}

