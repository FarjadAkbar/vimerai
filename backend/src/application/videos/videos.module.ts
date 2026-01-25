import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmVideoRepository } from '@/infrastructure/persistence/typeorm/repositories/video.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [VideosController],
  providers: [
    VideosService,
    {
      provide: 'IVideoRepository',
      useClass: TypeOrmVideoRepository,
    },
  ],
})
export class VideosModule {}
