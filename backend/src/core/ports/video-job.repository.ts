import type { VideoJob } from '@/domain/video-job.entity';

export interface IVideoJobRepository {
  create(job: VideoJob): Promise<void>;
  findById(id: string): Promise<VideoJob | null>;
  findByUserId(userId: string): Promise<VideoJob[]>;
  update(job: VideoJob): Promise<void>;
}
