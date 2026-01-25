import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MockVideoGenerationProvider } from './mock-video-generation.provider';
import { SoraVideoGenerationProvider } from './sora-video-generation.provider';
import { VIDEO_GENERATION_PROVIDER_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  providers: [
    {
      provide: VIDEO_GENERATION_PROVIDER_TOKEN,
      useFactory: (configService: ConfigService) => {
        const providerType =
          configService.get<string>('videoGeneration.provider') || 'mock';

        switch (providerType.toLowerCase()) {
          case 'sora':
            return new SoraVideoGenerationProvider(configService);
          case 'mock':
          default:
            return new MockVideoGenerationProvider();
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [VIDEO_GENERATION_PROVIDER_TOKEN],
})
export class VideoGenerationModule {}
