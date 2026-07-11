import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import type { IGenerationService } from '@/core/ports/generation.service';
import type { IImageGenerationProvider } from '@/core/ports/image-generation.provider';
import type { ITextGenerationProvider } from '@/core/ports/text-generation.provider';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import {
  IMAGE_GENERATION_PROVIDER_TOKEN,
  TEXT_GENERATION_PROVIDER_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import type {
  CreateGenerationInput,
  CreateGenerationResult,
} from '@/types/generation/generation';

@Injectable()
export class GenerationService implements IGenerationService {
  constructor(
    @Inject(TEXT_GENERATION_PROVIDER_TOKEN)
    private readonly _textGenerationProvider: ITextGenerationProvider,
    @Inject(IMAGE_GENERATION_PROVIDER_TOKEN)
    private readonly _imageGenerationProvider: IImageGenerationProvider,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly _videoGenerationProvider: IVideoGenerationProvider,
  ) {}

  async createGeneration(
    _userId: string,
    _input: CreateGenerationInput,
  ): Promise<CreateGenerationResult> {
    // Providers injected for expand; createGeneration lands in ticket 04.
    void this._textGenerationProvider;
    void this._imageGenerationProvider;
    void this._videoGenerationProvider;
    throw new NotImplementedException(
      'createGeneration is implemented in a later Phase 1 ticket',
    );
  }
}
