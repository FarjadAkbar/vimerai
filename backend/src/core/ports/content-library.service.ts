import type { ContentItem } from '@/domain/content-item.entity';
import type { JobStatus, JobType } from '@/domain/job.entity';

export interface ContentLibraryEntry {
  contentItem: ContentItem;
  jobType: JobType;
  jobStatus: JobStatus;
  jobError: string | null;
}

export interface IContentLibrary {
  listUserContent(
    userId: string,
    filter?: { jobStatus?: JobStatus },
  ): Promise<ContentLibraryEntry[]>;
}
