import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type {
  CompleteJobInput,
  CreateJobInput,
  IJobService,
} from '@/core/ports/job.service';
import type { IContentItemRepository } from '@/core/ports/content-item.repository';
import type { IJobRepository } from '@/core/ports/job.repository';
import {
  CONTENT_ITEM_REPOSITORY_TOKEN,
  JOB_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';
import { ContentItem } from '@/domain/content-item.entity';
import { Job, JobStatus } from '@/domain/job.entity';

@Injectable()
export class JobService implements IJobService {
  constructor(
    @Inject(JOB_REPOSITORY_TOKEN)
    private readonly jobRepository: IJobRepository,
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
  ) {}

  async createJob(userId: string, input: CreateJobInput): Promise<Job> {
    const job = Job.create({
      id: uuidv4(),
      userId,
      type: input.type,
      jobInput: input.jobInput,
      brandId: input.brandId,
      creditCharge: input.creditCharge,
    });
    await this.jobRepository.create(job);
    return job;
  }

  async getJob(userId: string, jobId: string): Promise<Job> {
    const job = await this.jobRepository.findById(jobId);
    if (!job || job.userId !== userId) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }

  async markJobProcessing(
    jobId: string,
    providerJobId?: string | null,
  ): Promise<Job> {
    const job = await this.requireJob(jobId);
    const updated = job.withUpdates({
      status: JobStatus.PROCESSING,
      providerJobId: providerJobId ?? job.providerJobId,
    });
    await this.jobRepository.update(updated);
    return updated;
  }

  async completeJob(
    userId: string,
    jobId: string,
    output: CompleteJobInput,
  ): Promise<{ job: Job; contentItem: ContentItem }> {
    const job = await this.getJob(userId, jobId);
    if (job.status === JobStatus.COMPLETED) {
      const existing = await this.contentItemRepository.findByJobId(jobId);
      if (existing) {
        return { job, contentItem: existing };
      }
    }

    const mediaUrl = output.mediaUrl.trim();
    if (!mediaUrl) {
      throw new BadRequestException('Completed job requires a media URL');
    }

    const updatedJob = job.withUpdates({ status: JobStatus.COMPLETED });
    await this.jobRepository.update(updatedJob);

    const existingItem = await this.contentItemRepository.findByJobId(jobId);
    if (existingItem) {
      const updatedItem = existingItem.withUpdates({
        mediaUrl,
        thumbnailUrl: output.thumbnailUrl,
        title: output.title,
      });
      await this.contentItemRepository.update(updatedItem);
      return { job: updatedJob, contentItem: updatedItem };
    }

    const contentItem = ContentItem.create({
      id: uuidv4(),
      userId,
      jobId,
      mediaKind: output.mediaKind,
      mediaUrl,
      thumbnailUrl: output.thumbnailUrl,
      title: output.title,
    });
    await this.contentItemRepository.create(contentItem);
    return { job: updatedJob, contentItem };
  }

  async failJob(jobId: string, error: string): Promise<Job> {
    const job = await this.requireJob(jobId);
    const updated = job.withUpdates({
      status: JobStatus.FAILED,
      error: error.trim() || 'Job failed',
    });
    await this.jobRepository.update(updated);
    return updated;
  }

  async listJobs(
    userId: string,
    filter?: { type?: Job['type']; status?: JobStatus },
  ): Promise<Job[]> {
    return this.jobRepository.findByUserId(userId, filter);
  }

  private async requireJob(jobId: string): Promise<Job> {
    const job = await this.jobRepository.findById(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    return job;
  }
}
