import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IJobRepository, ListJobsFilter } from '@/core/ports/job.repository';
import { Job } from '@/domain/job.entity';
import { JobEntity } from '../entities/job.entity';

@Injectable()
export class TypeOrmJobRepository implements IJobRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly repository: Repository<JobEntity>,
  ) {}

  async create(job: Job): Promise<void> {
    await this.repository.save(JobEntity.fromDomain(job));
  }

  async findById(id: string): Promise<Job | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? JobEntity.toDomain(entity) : null;
  }

  async findByUserId(
    userId: string,
    filter?: ListJobsFilter,
  ): Promise<Job[]> {
    const qb = this.repository
      .createQueryBuilder('job')
      .where('job.userId = :userId', { userId })
      .orderBy('job.createdAt', 'DESC');

    if (filter?.type) {
      qb.andWhere('job.type = :type', { type: filter.type });
    }
    if (filter?.status) {
      qb.andWhere('job.status = :status', { status: filter.status });
    }

    const entities = await qb.getMany();
    return entities.map((entity) => JobEntity.toDomain(entity));
  }

  async update(job: Job): Promise<void> {
    await this.repository.save(JobEntity.fromDomain(job));
  }
}
