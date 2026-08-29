import type { ContentItem } from '@/domain/content-item.entity';
import type { JobStatus } from '@/domain/job.entity';

export interface ListContentItemsFilter {
  jobStatus?: JobStatus;
}

export interface IContentItemRepository {
  create(item: ContentItem): Promise<void>;
  findById(id: string): Promise<ContentItem | null>;
  findByJobId(jobId: string): Promise<ContentItem | null>;
  findByUserId(
    userId: string,
    filter?: ListContentItemsFilter,
  ): Promise<ContentItem[]>;
  update(item: ContentItem): Promise<void>;
}
