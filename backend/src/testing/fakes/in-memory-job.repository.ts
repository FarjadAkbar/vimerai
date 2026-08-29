import type { IJobRepository, ListJobsFilter } from '@/core/ports/job.repository';
import { Job } from '@/domain/job.entity';

export class InMemoryJobRepository implements IJobRepository {
  private readonly items = new Map<string, Job>();

  async create(job: Job): Promise<void> {
    this.items.set(job.id, job);
  }

  async findById(id: string): Promise<Job | null> {
    return this.items.get(id) ?? null;
  }

  async findByUserId(userId: string, filter?: ListJobsFilter): Promise<Job[]> {
    return [...this.items.values()]
      .filter((job) => job.userId === userId)
      .filter((job) => (filter?.type ? job.type === filter.type : true))
      .filter((job) => (filter?.status ? job.status === filter.status : true))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(job: Job): Promise<void> {
    this.items.set(job.id, job);
  }
}
