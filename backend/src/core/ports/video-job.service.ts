import type { VideoJob } from '@/domain/video-job.entity';
import type { ReelPlatform } from '@/types/video-job/reel-platform';

export interface CreateVideoJobInput {
  brandId: string;
  productId: string;
  formatId: string;
  reelPlatform: ReelPlatform;
}

export interface CreateVideoJobResult {
  videoJob: VideoJob;
}

export interface ListVideoJobsResult {
  videoJobs: VideoJob[];
}

export interface GetVideoJobResult {
  videoJob: VideoJob;
}

export interface IVideoJobService {
  createVideoJob(
    userId: string,
    input: CreateVideoJobInput,
  ): Promise<CreateVideoJobResult>;
  listVideoJobs(userId: string): Promise<ListVideoJobsResult>;
  getVideoJob(userId: string, jobId: string): Promise<GetVideoJobResult>;
  regenerateVideoJob(
    userId: string,
    jobId: string,
  ): Promise<CreateVideoJobResult>;
}
