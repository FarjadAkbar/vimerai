import type { ImageJob } from '@/domain/image-job.entity';

export interface CreateImageJobInput {
  prompt: string;
  referenceImageUrls: string[];
  negativePrompt?: string;
}

export interface CreateImageJobResult {
  imageJob: ImageJob;
}

export interface ListImageJobsResult {
  imageJobs: ImageJob[];
}

export interface GetImageJobResult {
  imageJob: ImageJob;
}

export interface IImageJobService {
  createImageJob(
    userId: string,
    input: CreateImageJobInput,
  ): Promise<CreateImageJobResult>;
  listImageJobs(userId: string): Promise<ListImageJobsResult>;
  getImageJob(userId: string, jobId: string): Promise<GetImageJobResult>;
  regenerateImageJob(
    userId: string,
    jobId: string,
  ): Promise<CreateImageJobResult>;
}
