import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GenerationController } from '@/application/generation/generation.controller';
import { GenerationService } from '@/application/generation/generation.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  GENERATION_REPOSITORY_TOKEN,
  GENERATION_SERVICE_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  TEXT_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import { OpenAiTextGenerationProvider } from '@/infrastructure/ai/openai-text-generation.provider';
import { OpenAiImageGenerationProvider } from '@/infrastructure/ai/openai-image-generation.provider';
import openaiConfig from '@/infrastructure/config/openai.config';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { TypeOrmGenerationRepository } from '@/infrastructure/persistence/typeorm/repositories/generation.repository';
import { TypeOrmProductRepository } from '@/infrastructure/persistence/typeorm/repositories/product.repository';
import { SubscriptionModule } from '@/application/subscription/subscription.module';
import { VideoGenerationModule } from '@/infrastructure/video-generation/video-generation.module';
import { StorageModule } from '@/infrastructure/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forFeature(openaiConfig),
    DatabaseModule,
    SubscriptionModule,
    VideoGenerationModule,
    StorageModule,
  ],
  controllers: [GenerationController],
  providers: [
    OpenAiTextGenerationProvider,
    OpenAiImageGenerationProvider,
    {
      provide: TEXT_GENERATION_PROVIDER_TOKEN,
      useExisting: OpenAiTextGenerationProvider,
    },
    {
      provide: IMAGE_GENERATION_PROVIDER_TOKEN,
      useExisting: OpenAiImageGenerationProvider,
    },
    {
      provide: GENERATION_REPOSITORY_TOKEN,
      useClass: TypeOrmGenerationRepository,
    },
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: BRAND_KIT_REPOSITORY_TOKEN,
      useClass: TypeOrmBrandKitRepository,
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
