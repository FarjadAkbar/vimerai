import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FalImageGenerationProvider } from '@/infrastructure/ai/fal-image-generation.provider';
import { IMAGE_GENERATION_PROVIDER_TOKEN } from '@/core/tokens/injection.tokens';
import imageGenerationConfig from '@/infrastructure/config/image-generation.config';

@Module({
  imports: [ConfigModule.forFeature(imageGenerationConfig)],
  providers: [
    FalImageGenerationProvider,
    {
      provide: IMAGE_GENERATION_PROVIDER_TOKEN,
      useExisting: FalImageGenerationProvider,
    },
  ],
  exports: [IMAGE_GENERATION_PROVIDER_TOKEN],
})
export class ImageGenerationModule {}
