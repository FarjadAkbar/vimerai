import type {
  AiImageAspectRatio,
  AiImageOutputFormat,
} from '@/types/image-job/ai-image-options';

export interface ImageGenerationRequest {
  prompt: string;
  /** Product image URLs used as conditioning references. */
  productImageUrls: string[];
  negativePrompt?: string;
  aspectRatio?: AiImageAspectRatio;
  outputFormat?: AiImageOutputFormat;
  /** When false, the provider uses the prompt as-is. Defaults to true. */
  enhancePrompt?: boolean;
}

export interface ImageGenerationResult {
  imageUrl: string;
}
