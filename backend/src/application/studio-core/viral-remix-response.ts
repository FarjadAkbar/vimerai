import type { ContentItem } from '@/domain/content-item.entity';
import type { Job } from '@/domain/job.entity';
import type { ViralRemixJobResult } from '@/core/ports/viral-remix.service';

export function toViralRemixJobResponse(
  job: Job,
  contentItem: ContentItem | null,
): ViralRemixJobResult {
  return {
    jobId: job.id,
    status: job.status,
    error: job.error,
    contentItemId: contentItem?.id ?? null,
    mediaUrl: contentItem?.mediaUrl ?? null,
    thumbnailUrl: contentItem?.thumbnailUrl ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}
