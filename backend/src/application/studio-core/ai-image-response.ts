import type { ContentItem } from '@/domain/content-item.entity';
import type { Job } from '@/domain/job.entity';
import type { AiImageJobResult } from '@/core/ports/ai-image.service';

export function toAiImageJobResult(
  job: Job,
  contentItem: ContentItem | null,
): AiImageJobResult {
  return {
    id: contentItem?.id ?? job.id,
    jobId: job.id,
    jobType: job.type,
    status: job.status,
    error: job.error,
    mediaKind: 'image',
    mediaUrl: contentItem?.mediaUrl ?? null,
    thumbnailUrl: contentItem?.thumbnailUrl ?? null,
    title: contentItem?.title ?? null,
    createdAt: (contentItem?.createdAt ?? job.createdAt).toISOString(),
    updatedAt: (contentItem?.updatedAt ?? job.updatedAt).toISOString(),
  };
}
