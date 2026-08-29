import type { ContentItem, ContentItemMediaKind } from '@/domain/content-item.entity';
import type { Job, JobStatus, JobType } from '@/domain/job.entity';

export interface CreateJobInput {
  type: JobType;
  jobInput: Record<string, unknown>;
  brandId?: string | null;
  creditCharge?: number;
}

export interface CompleteJobInput {
  mediaKind: ContentItemMediaKind;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  title?: string | null;
}

export interface IJobService {
  createJob(userId: string, input: CreateJobInput): Promise<Job>;
  getJob(userId: string, jobId: string): Promise<Job>;
  markJobProcessing(jobId: string, providerJobId?: string | null): Promise<Job>;
  completeJob(
    userId: string,
    jobId: string,
    output: CompleteJobInput,
  ): Promise<{ job: Job; contentItem: ContentItem }>;
  failJob(jobId: string, error: string): Promise<Job>;
  listJobs(
    userId: string,
    filter?: { type?: JobType; status?: JobStatus },
  ): Promise<Job[]>;
}
