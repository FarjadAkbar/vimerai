import type { ContentItem } from '@/domain/content-item.entity';
import type { JobStatus } from '@/domain/job.entity';

export type ContentLibraryItemResponse = {
  id: string;
  jobId: string;
  jobType: string;
  jobStatus: JobStatus;
  jobError: string | null;
  mediaKind: ContentItem['mediaKind'];
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toContentLibraryItemResponse(input: {
  contentItem: ContentItem;
  jobType: string;
  jobStatus: JobStatus;
  jobError: string | null;
}): ContentLibraryItemResponse {
  return {
    id: input.contentItem.id,
    jobId: input.contentItem.jobId,
    jobType: input.jobType,
    jobStatus: input.jobStatus,
    jobError: input.jobError,
    mediaKind: input.contentItem.mediaKind,
    mediaUrl: input.contentItem.mediaUrl,
    thumbnailUrl: input.contentItem.thumbnailUrl,
    title: input.contentItem.title,
    createdAt: input.contentItem.createdAt.toISOString(),
    updatedAt: input.contentItem.updatedAt.toISOString(),
  };
}
