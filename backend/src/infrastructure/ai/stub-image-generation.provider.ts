import { Injectable, NotImplementedException } from '@nestjs/common';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type {
  ImageGenerationRequest,
  ImageGenerationResult,
} from '@/types/generation/image-generation';

/** Test/dev placeholder; production wires FalImageGenerationProvider. */
@Injectable()
export class StubImageGenerationProvider implements IImageGenerationProvider {
  async generateImage(
    _request: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    throw new NotImplementedException(
      'Image generation provider is not configured yet',
    );
  }
}
