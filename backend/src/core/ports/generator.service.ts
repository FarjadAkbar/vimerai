import { GenerationMode } from '@/domain/video.entity';

export interface GenerateVideoDto {
  prompt: string;
  mode?: GenerationMode;
}

export interface GeneratePreviewDto {
  prompt: string;
}

export interface IGeneratorService {
  generateVideo(
    userId: string,
    dto: GenerateVideoDto,
  ): Promise<{ jobId: string; status: string }>;
  generatePreview(
    userId: string,
    dto: GeneratePreviewDto,
  ): Promise<{ previewUrl: string; used: boolean }>;
  getGenerationStatus(jobId: string): Promise<{
    status: string;
    videoUrl?: string;
  }>;
}

