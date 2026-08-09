import type { PostJob } from '@/domain/post-job.entity';

export interface CreatePostJobInput {
  brandId: string;
  productId: string;
  formatId: string;
}

export interface CreatePostJobResult {
  postJob: PostJob;
}

export interface ListPostJobsResult {
  postJobs: PostJob[];
}

export interface GetPostJobResult {
  postJob: PostJob;
}

export interface IPostJobService {
  createPostJob(
    userId: string,
    input: CreatePostJobInput,
  ): Promise<CreatePostJobResult>;
  listPostJobs(userId: string): Promise<ListPostJobsResult>;
  getPostJob(userId: string, jobId: string): Promise<GetPostJobResult>;
  regeneratePostJob(
    userId: string,
    jobId: string,
  ): Promise<CreatePostJobResult>;
}
