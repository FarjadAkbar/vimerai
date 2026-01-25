import { GenerationMode } from '@/domain/video.entity';

export interface GenerateVideoRequest {
  prompt: string;
  mode: GenerationMode;
  jobId?: string; // Optional jobId to use if provided
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
  generatePreview(prompt: string, jobId?: string): Promise<GenerateVideoResponse>;
  downloadVideo(videoId: string): Promise<Buffer>;
}
