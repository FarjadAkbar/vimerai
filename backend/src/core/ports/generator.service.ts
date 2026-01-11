import { GenerationMode } from '@/domain/video.entity';

export interface GenerateVideoDto {
  prompt: string;
  mode?: GenerationMode;
}

export interface IGeneratorService {
  generateVideo(
    userId: string,
    dto: GenerateVideoDto,
    type: 'preview' | 'full',
  ): Promise<{ jobId: string; status: string }>;
  getGenerationStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
    previewUrl?: string;
  }>;
  downloadVideo(videoId: string): Promise<Buffer>;
}
