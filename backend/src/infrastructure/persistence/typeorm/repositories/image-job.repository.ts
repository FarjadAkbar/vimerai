import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IImageJobRepository } from '@/core/ports/image-job.repository';
import { ImageJob } from '@/domain/image-job.entity';
import { ImageJobEntity } from '../entities/image-job.entity';

@Injectable()
export class TypeOrmImageJobRepository implements IImageJobRepository {
  constructor(
    @InjectRepository(ImageJobEntity)
    private readonly repository: Repository<ImageJobEntity>,
  ) {}

  async create(job: ImageJob): Promise<void> {
    await this.repository.save(ImageJobEntity.fromDomain(job));
  }

  async findById(id: string): Promise<ImageJob | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? ImageJobEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<ImageJob[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => ImageJobEntity.toDomain(entity));
  }

  async update(job: ImageJob): Promise<void> {
    await this.repository.save(ImageJobEntity.fromDomain(job));
  }
}
