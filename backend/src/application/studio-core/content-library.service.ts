import { Inject, Injectable } from '@nestjs/common';
import type {
  ContentLibraryEntry,
  IContentLibrary,
} from '@/core/ports/content-library.service';
import type { IContentItemRepository } from '@/core/ports/content-item.repository';
import type { IJobRepository } from '@/core/ports/job.repository';
import {
  CONTENT_ITEM_REPOSITORY_TOKEN,
  JOB_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';
import type { JobStatus } from '@/domain/job.entity';

@Injectable()
export class ContentLibraryService implements IContentLibrary {
  constructor(
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
    @Inject(JOB_REPOSITORY_TOKEN)
    private readonly jobRepository: IJobRepository,
  ) {}

  async listUserContent(
    userId: string,
    filter?: { jobStatus?: JobStatus },
  ): Promise<ContentLibraryEntry[]> {
    const [contentItems, jobs] = await Promise.all([
      this.contentItemRepository.findByUserId(userId),
      this.jobRepository.findByUserId(userId),
    ]);

    const jobById = new Map(jobs.map((job) => [job.id, job]));

    return contentItems
      .map((contentItem) => {
        const job = jobById.get(contentItem.jobId);
        if (!job) {
          return null;
        }
        return {
          contentItem,
          jobType: job.type,
          jobStatus: job.status,
          jobError: job.error,
        };
      })
      .filter((entry): entry is ContentLibraryEntry => entry !== null)
      .filter((entry) =>
        filter?.jobStatus ? entry.jobStatus === filter.jobStatus : true,
      )
      .sort(
        (a, b) =>
          b.contentItem.createdAt.getTime() - a.contentItem.createdAt.getTime(),
      );
  }
}
