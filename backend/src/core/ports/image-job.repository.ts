import type { ImageJob } from '@/domain/image-job.entity';

export interface IImageJobRepository {
  create(job: ImageJob): Promise<void>;
  findById(id: string): Promise<ImageJob | null>;
  findByUserId(userId: string): Promise<ImageJob[]>;
  update(job: ImageJob): Promise<void>;
}
