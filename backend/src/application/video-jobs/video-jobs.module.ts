import { Module } from '@nestjs/common';
import { VideoJobService } from '@/application/video-jobs/video-job.service';
import { VideoJobsController } from '@/application/video-jobs/video-jobs.controller';
import { SubscriptionModule } from '@/application/subscription/subscription.module';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  FORMAT_CATALOG_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  VIDEO_JOB_REPOSITORY_TOKEN,
  VIDEO_JOB_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { CuratedFormatCatalog } from '@/infrastructure/formats/curated-format.catalog';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmBrandKitRepository } from '@/infrastructure/persistence/typeorm/repositories/brand-kit.repository';
import { TypeOrmProductRepository } from '@/infrastructure/persistence/typeorm/repositories/product.repository';
import { TypeOrmVideoJobRepository } from '@/infrastructure/persistence/typeorm/repositories/video-job.repository';
import { VideoGenerationModule } from '@/infrastructure/video-generation/video-generation.module';

@Module({
  imports: [DatabaseModule, SubscriptionModule, VideoGenerationModule],
  controllers: [VideoJobsController],
  providers: [
    CuratedFormatCatalog,
    VideoJobService,
    {
      provide: FORMAT_CATALOG_TOKEN,
      useExisting: CuratedFormatCatalog,
    },
    {
      provide: VIDEO_JOB_REPOSITORY_TOKEN,
      useClass: TypeOrmVideoJobRepository,
    },
    {
      provide: VIDEO_JOB_SERVICE_TOKEN,
      useExisting: VideoJobService,
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
  exports: [VIDEO_JOB_SERVICE_TOKEN, VideoJobService],
})
export class VideoJobsModule {}
