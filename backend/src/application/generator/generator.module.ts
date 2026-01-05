import { Module } from '@nestjs/common';
import { GeneratorController } from './generator.controller';
import { GeneratorService } from './generator.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmVideoRepository } from '@/infrastructure/persistence/typeorm/repositories/video.repository';
import { SubscriptionModule } from '../subscription/subscription.module';
import { StorageModule } from '@/infrastructure/storage/storage.module';
import { VideoGenerationModule } from '@/infrastructure/video-generation/video-generation.module';

@Module({
  imports: [
    DatabaseModule,
    SubscriptionModule,
    StorageModule,
    VideoGenerationModule,
  ],
  controllers: [GeneratorController],
  providers: [
    GeneratorService,
    {
      provide: 'IVideoRepository',
      useClass: TypeOrmVideoRepository,
    },
  ],
  exports: [GeneratorService],
})
export class GeneratorModule {}
