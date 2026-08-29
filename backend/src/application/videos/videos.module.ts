import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmVideoRepository } from '@/infrastructure/persistence/typeorm/repositories/video.repository';
import { StudioCoreModule } from '@/application/studio-core/studio-core.module';

@Module({
  imports: [DatabaseModule, StudioCoreModule],
  controllers: [VideosController],
  providers: [
    VideosService,
    {
      provide: 'IVideoRepository',
      useClass: TypeOrmVideoRepository,
    },
  ],
  exports: [VideosService],
})
export class VideosModule {}
