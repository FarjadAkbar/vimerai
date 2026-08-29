import type {
  AiImageAspectRatio,
  AiImageGenerationMode,
  AiImageOutputFormat,
} from '@/types/image-job/ai-image-options';

export interface AiImageJobInput {
  instructions: string;
  referenceMediaAssetIds: string[];
  referenceImageUrls: string[];
  aspectRatio: AiImageAspectRatio;
  outputFormat: AiImageOutputFormat;
  generationMode: AiImageGenerationMode;
  negativePrompt: string | null;
  prompt: string;
}

export interface CreateAiImageInput {
  instructions: string;
  referenceMediaAssetIds: string[];
  aspectRatio?: AiImageAspectRatio;
  outputFormat?: AiImageOutputFormat;
  generationMode?: AiImageGenerationMode;
  negativePrompt?: string | null;
}

export interface AiImageJobResult {
  id: string;
  jobId: string;
  jobType: string;
  status: string;
  error: string | null;
  mediaKind: 'image';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAiImageService {
  generateImage(
    userId: string,
    input: CreateAiImageInput,
  ): Promise<AiImageJobResult>;
  regenerateImage(userId: string, jobId: string): Promise<AiImageJobResult>;
  getImageJob(userId: string, jobId: string): Promise<AiImageJobResult>;
  listImageJobs(userId: string): Promise<AiImageJobResult[]>;
}
