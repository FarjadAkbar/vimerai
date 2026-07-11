import { Module } from '@nestjs/common';
import { GenerationService } from '@/application/generation/generation.service';
import {
  GENERATION_SERVICE_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  TEXT_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { StubImageGenerationProvider } from '@/infrastructure/ai/stub-image-generation.provider';
import { StubTextGenerationProvider } from '@/infrastructure/ai/stub-text-generation.provider';
import { VideoGenerationModule } from '@/infrastructure/video-generation/video-generation.module';

@Module({
  imports: [VideoGenerationModule],
  providers: [
    StubTextGenerationProvider,
    StubImageGenerationProvider,
    {
      provide: TEXT_GENERATION_PROVIDER_TOKEN,
      useExisting: StubTextGenerationProvider,
    },
    {
      provide: IMAGE_GENERATION_PROVIDER_TOKEN,
      useExisting: StubImageGenerationProvider,
    },
    GenerationService,
    {
      provide: GENERATION_SERVICE_TOKEN,
      useExisting: GenerationService,
    },
  ],
  exports: [
    GENERATION_SERVICE_TOKEN,
    TEXT_GENERATION_PROVIDER_TOKEN,
    IMAGE_GENERATION_PROVIDER_TOKEN,
    GenerationService,
  ],
})
export class GenerationModule {}
