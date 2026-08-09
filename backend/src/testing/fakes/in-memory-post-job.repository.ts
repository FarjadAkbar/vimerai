import type { IPostJobRepository } from '@/core/ports/post-job.repository';
import { PostJob } from '@/domain/post-job.entity';

export class InMemoryPostJobRepository implements IPostJobRepository {
  private readonly items = new Map<string, PostJob>();

  async create(job: PostJob): Promise<void> {
    this.items.set(job.id, job);
  }

  async findById(id: string): Promise<PostJob | null> {
    return this.items.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<PostJob[]> {
    return [...this.items.values()]
      .filter((job) => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(job: PostJob): Promise<void> {
    this.items.set(job.id, job);
  }
}
