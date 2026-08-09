import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IVideoJobRepository } from '@/core/ports/video-job.repository';
import { VideoJob } from '@/domain/video-job.entity';
import { VideoJobEntity } from '../entities/video-job.entity';

@Injectable()
export class TypeOrmVideoJobRepository implements IVideoJobRepository {
  constructor(
    @InjectRepository(VideoJobEntity)
    private readonly repository: Repository<VideoJobEntity>,
  ) {}

  async create(job: VideoJob): Promise<void> {
    await this.repository.save(VideoJobEntity.fromDomain(job));
  }

  async findById(id: string): Promise<VideoJob | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? VideoJobEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<VideoJob[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => VideoJobEntity.toDomain(entity));
  }

  async update(job: VideoJob): Promise<void> {
    await this.repository.save(VideoJobEntity.fromDomain(job));
  }
}
