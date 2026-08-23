import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageJobService } from '@/application/image-jobs/image-job.service';
import { ImageJobsController } from '@/application/image-jobs/image-jobs.controller';
import { SubscriptionModule } from '@/application/subscription/subscription.module';
import {
  IMAGE_GENERATION_PROVIDER_TOKEN,
  IMAGE_JOB_REPOSITORY_TOKEN,
  IMAGE_JOB_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import { FalImageGenerationProvider } from '@/infrastructure/ai/fal-image-generation.provider';
import imageGenerationConfig from '@/infrastructure/config/image-generation.config';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmImageJobRepository } from '@/infrastructure/persistence/typeorm/repositories/image-job.repository';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    ConfigModule.forFeature(imageGenerationConfig),
  ],
  controllers: [ImageJobsController],
  providers: [
    FalImageGenerationProvider,
    ImageJobService,
    {
      provide: IMAGE_GENERATION_PROVIDER_TOKEN,
      useExisting: FalImageGenerationProvider,
    },
    {
      provide: IMAGE_JOB_REPOSITORY_TOKEN,
      useClass: TypeOrmImageJobRepository,
    },
    {
      provide: IMAGE_JOB_SERVICE_TOKEN,
      useExisting: ImageJobService,
    },
  ],
  exports: [IMAGE_JOB_SERVICE_TOKEN, ImageJobService],
})
export class ImageJobsModule {}
