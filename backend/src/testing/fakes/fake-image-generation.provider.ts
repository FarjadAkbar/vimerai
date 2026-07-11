import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/generation/image-generation';

export class FakeImageGenerationProvider implements IImageGenerationProvider {
  constructor(private readonly imageUrl: string) {}

  async generateImage(
    _request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    return { imageUrl: this.imageUrl };
  }
}
