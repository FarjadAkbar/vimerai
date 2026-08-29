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
import type { ContentStatusBucket } from '@/core/ports/content-library.service';
import { JobStatus } from '@/domain/job.entity';

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
    filter?: { statusBucket?: ContentStatusBucket },
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
      .filter((entry) => matchesStatusBucket(entry.jobStatus, filter?.statusBucket))
      .sort(
        (a, b) =>
          b.contentItem.createdAt.getTime() - a.contentItem.createdAt.getTime(),
      );
  }
}

function matchesStatusBucket(
  jobStatus: JobStatus,
  bucket?: ContentStatusBucket,
): boolean {
  if (!bucket) {
    return true;
  }
  if (bucket === 'building') {
    return (
      jobStatus === JobStatus.PENDING || jobStatus === JobStatus.PROCESSING
    );
  }
  if (bucket === 'created') {
    return jobStatus === JobStatus.COMPLETED;
  }
  return jobStatus === JobStatus.FAILED;
}
