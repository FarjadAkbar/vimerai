import type { PostJob } from '@/domain/post-job.entity';

export interface IPostJobRepository {
  create(job: PostJob): Promise<void>;
  findById(id: string): Promise<PostJob | null>;
  findByUserId(userId: string): Promise<PostJob[]>;
  update(job: PostJob): Promise<void>;
}
