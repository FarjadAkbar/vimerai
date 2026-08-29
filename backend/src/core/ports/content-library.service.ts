import type { ContentItem } from '@/domain/content-item.entity';
import type { JobStatus } from '@/domain/job.entity';

export interface ContentLibraryEntry {
  contentItem: ContentItem;
  jobStatus: JobStatus;
}

export interface IContentLibrary {
  listUserContent(
    userId: string,
    filter?: { jobStatus?: JobStatus },
  ): Promise<ContentLibraryEntry[]>;
}
