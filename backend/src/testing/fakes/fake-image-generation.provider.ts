import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/generation/image-generation';

export class FakeImageGenerationProvider implements IImageGenerationProvider {
  readonly calls: ImageGenerationRequest[] = [];
  failNext = false;

  constructor(private readonly imageUrl: string) {}

  async generateImage(
    request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    this.calls.push(request);
    if (this.failNext) {
      this.failNext = false;
      throw new Error('AI Post image provider failed');
    }
    return { imageUrl: this.imageUrl };
  }
}
