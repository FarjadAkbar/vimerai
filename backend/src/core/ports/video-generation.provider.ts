import { GenerationMode } from '@/domain/video.entity';
import type { VideoAspectRatio } from '@/types/video-job/aspect-ratio';

export type { VideoAspectRatio };

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
  /** Vertical short-form default for Video Jobs. */
  aspectRatio?: VideoAspectRatio;
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
  /** Concatenate ordered clip URLs into one Promo Video. */
  stitchClips(clipUrls: string[]): Promise<GenerateVideoResponse>;
}
