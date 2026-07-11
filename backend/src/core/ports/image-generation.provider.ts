import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/generation/image-generation';

export interface IImageGenerationProvider {
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
