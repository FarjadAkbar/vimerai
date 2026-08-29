import type { Job, JobStatus, JobType } from '@/domain/job.entity';

export interface ListJobsFilter {
  type?: JobType;
  status?: JobStatus;
}

export interface IJobRepository {
  create(job: Job): Promise<void>;
  findById(id: string): Promise<Job | null>;
  findByUserId(userId: string, filter?: ListJobsFilter): Promise<Job[]>;
  update(job: Job): Promise<void>;
}
