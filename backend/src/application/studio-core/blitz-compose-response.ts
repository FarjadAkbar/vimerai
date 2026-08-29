import type { ContentItem } from '@/domain/content-item.entity';
import type { Job } from '@/domain/job.entity';
import type { BlitzComposeResult } from '@/core/ports/blitz-compose.service';

export function toBlitzComposeResult(
  job: Job,
  contentItem: ContentItem | null,
): BlitzComposeResult {
  return {
    jobId: job.id,
    status: job.status,
    error: job.error,
    contentItemId: contentItem?.id ?? null,
    mediaKind: contentItem?.mediaKind ?? 'image',
    mediaUrl: contentItem?.mediaUrl ?? null,
    thumbnailUrl: contentItem?.thumbnailUrl ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
