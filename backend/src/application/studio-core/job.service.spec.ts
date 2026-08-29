import { JobService } from '@/application/studio-core/job.service';
import { ContentItemMediaKind } from '@/domain/content-item.entity';
import { JobStatus, JobType } from '@/domain/job.entity';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';

describe('JobService', () => {
  it('creates a job and produces a content item on completion', async () => {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const service = new JobService(jobRepo, contentRepo);

    const job = await service.createJob('user-1', {
      type: JobType.BLITZ_COMPOSE,
      jobInput: { templateSlug: 'slideshow' },
      creditCharge: 1,
    });

    expect(job.status).toBe(JobStatus.PENDING);

    await service.markJobProcessing(job.id, 'provider-123');

    const result = await service.completeJob('user-1', job.id, {
      mediaKind: ContentItemMediaKind.VIDEO,
      mediaUrl: 'https://cdn.example.com/final.mp4',
      title: 'My Blitz export',
    });

    expect(result.job.status).toBe(JobStatus.COMPLETED);
    expect(result.contentItem.mediaUrl).toBe(
      'https://cdn.example.com/final.mp4',
    );
    expect(result.contentItem.jobId).toBe(job.id);
  });

  it('marks a job failed without creating content', async () => {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const service = new JobService(jobRepo, contentRepo);

    const job = await service.createJob('user-1', {
      type: JobType.VIRAL_REMIX,
      jobInput: { instructions: 'make it punchy' },
    });

    const failed = await service.failJob(job.id, 'Provider timeout');

    expect(failed.status).toBe(JobStatus.FAILED);
    expect(failed.error).toBe('Provider timeout');
    expect(await contentRepo.findByJobId(job.id)).toBeNull();
  });
});
