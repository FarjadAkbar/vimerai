import { GenerationMode } from '@/domain/video.entity';

export interface GenerateVideoRequest {
  prompt: string;
  mode: GenerationMode;
  jobId?: string;
  productAssetUrls?: string[];
  referenceVideoUrl?: string;
  negativePrompt?: string;
  /** When true, use imageToVideoModel with first product asset as image_url. */
  useImageConditioning?: boolean;
  textToVideoModel?: string;
  imageToVideoModel?: string;
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
