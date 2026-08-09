import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IPostJobRepository } from '@/core/ports/post-job.repository';
import { PostJob } from '@/domain/post-job.entity';
import { PostJobEntity } from '../entities/post-job.entity';

@Injectable()
export class TypeOrmPostJobRepository implements IPostJobRepository {
  constructor(
    @InjectRepository(PostJobEntity)
    private readonly repository: Repository<PostJobEntity>,
  ) {}

  async create(job: PostJob): Promise<void> {
    await this.repository.save(PostJobEntity.fromDomain(job));
  }

  async findById(id: string): Promise<PostJob | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PostJobEntity.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<PostJob[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => PostJobEntity.toDomain(entity));
  }

  async update(job: PostJob): Promise<void> {
    await this.repository.save(PostJobEntity.fromDomain(job));
  }
}
