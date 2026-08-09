import type { IVideoJobRepository } from '@/core/ports/video-job.repository';
import { VideoJob } from '@/domain/video-job.entity';

export class InMemoryVideoJobRepository implements IVideoJobRepository {
  private readonly items = new Map<string, VideoJob>();

  async create(job: VideoJob): Promise<void> {
    this.items.set(job.id, job);
  }

  async findById(id: string): Promise<VideoJob | null> {
    return this.items.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<VideoJob[]> {
    return [...this.items.values()]
      .filter((job) => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(job: VideoJob): Promise<void> {
    this.items.set(job.id, job);
  }
}
