import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVideoRepository } from '@/core/ports/video.repository';
import { Video } from '@/domain/video.entity';
import { VideoEntity } from '../entities/video.entity';

@Injectable()
export class TypeOrmVideoRepository implements IVideoRepository {
  constructor(
    @InjectRepository(VideoEntity)
    private readonly repository: Repository<VideoEntity>,
  ) {}

  async createVideo(video: Video): Promise<void> {
    const entity = VideoEntity.fromDomain(video);
    await this.repository.save(entity);
  }

  async getVideoById(id: string): Promise<Video | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? VideoEntity.toDomain(entity) : null;
  }

  async getVideoByJobId(jobId: string): Promise<Video | null> {
    const entity = await this.repository.findOne({ where: { jobId } });
    return entity ? VideoEntity.toDomain(entity) : null;
  }

  async getVideosByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ videos: Video[]; total: number }> {
    const [entities, total] = await this.repository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      videos: entities.map((e) => VideoEntity.toDomain(e)),
      total,
    };
  }

  async updateVideo(video: Video): Promise<void> {
    const entity = VideoEntity.fromDomain(video);
    await this.repository.save(entity);
  }

  async deleteVideo(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
