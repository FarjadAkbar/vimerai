import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FalVideoGenerationProvider } from './fal-video-generation.provider';
import { VIDEO_GENERATION_PROVIDER_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  providers: [
    {
      provide: VIDEO_GENERATION_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService) =>
        new FalVideoGenerationProvider(configService),
      inject: [ConfigService],
    },
  ],
  exports: [VIDEO_GENERATION_PROVIDER_TOKEN],
})
export class VideoGenerationModule {}
