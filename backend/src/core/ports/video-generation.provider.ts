import { GenerationMode } from '@/domain/video.entity';

export interface GenerateVideoRequest {
  prompt: string;
  mode: GenerationMode;
}

export interface GenerateVideoResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  previewUrl?: string;
  error?: string;
}

export interface IVideoGenerationProvider {
  generateVideo(request: GenerateVideoRequest): Promise<GenerateVideoResponse>;
  getGenerationStatus(jobId: string): Promise<GenerateVideoResponse>;
  generatePreview(prompt: string): Promise<{ previewUrl: string }>;
  downloadVideo(videoId: string): Promise<Buffer>;
}
