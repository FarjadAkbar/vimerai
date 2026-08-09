import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FormatsController } from '@/application/post-jobs/formats.controller';
import { PostJobService } from '@/application/post-jobs/post-job.service';
import { PostJobsController } from '@/application/post-jobs/post-jobs.controller';
import { SubscriptionModule } from '@/application/subscription/subscription.module';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  FORMAT_CATALOG_TOKEN,
  IMAGE_GENERATION_PROVIDER_TOKEN,
  POST_JOB_REPOSITORY_TOKEN,
  POST_JOB_SERVICE_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';
import { FalImageGenerationProvider } from '@/infrastructure/ai/fal-image-generation.provider';
import imageGenerationConfig from '@/infrastructure/config/image-generation.config';
import { CuratedFormatCatalog } from '@/infrastructure/formats/curated-format.catalog';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { TypeOrmPostJobRepository } from '@/infrastructure/persistence/typeorm/repositories/post-job.repository';
import { TypeOrmProductRepository } from '@/infrastructure/persistence/typeorm/repositories/product.repository';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    ConfigModule.forFeature(imageGenerationConfig),
  ],
  controllers: [PostJobsController, FormatsController],
  providers: [
    CuratedFormatCatalog,
    FalImageGenerationProvider,
    PostJobService,
    {
      provide: FORMAT_CATALOG_TOKEN,
      useExisting: CuratedFormatCatalog,
    },
    {
      provide: IMAGE_GENERATION_PROVIDER_TOKEN,
      useExisting: FalImageGenerationProvider,
    },
    {
      provide: POST_JOB_REPOSITORY_TOKEN,
      useClass: TypeOrmPostJobRepository,
    },
    {
      provide: POST_JOB_SERVICE_TOKEN,
      useExisting: PostJobService,
    },
    {
      provide: BRAND_KIT_REPOSITORY_TOKEN,
      useClass: TypeOrmBrandKitRepository,
    },
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: TypeOrmProductRepository,
    },
  ],
  exports: [POST_JOB_SERVICE_TOKEN, FORMAT_CATALOG_TOKEN, PostJobService],
})
export class PostJobsModule {}
