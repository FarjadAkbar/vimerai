import { ContentLibraryService } from '@/application/studio-core/content-library.service';
import { JobService } from '@/application/studio-core/job.service';
import { ContentItemMediaKind } from '@/domain/content-item.entity';
import { JobStatus, JobType } from '@/domain/job.entity';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';

describe('ContentLibraryService', () => {
  it('lists user content with job status for library filters', async () => {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const library = new ContentLibraryService(contentRepo, jobRepo);

    const buildingJob = await jobService.createJob('user-1', {
      type: JobType.VIRAL_REMIX,
      jobInput: {},
    });
    await jobService.markJobProcessing(buildingJob.id);

    const createdJob = await jobService.createJob('user-1', {
      type: JobType.BLITZ_COMPOSE,
      jobInput: {},
    });
    await jobService.completeJob('user-1', createdJob.id, {
      mediaKind: ContentItemMediaKind.VIDEO,
      mediaUrl: 'https://cdn.example.com/done.mp4',
    });

    const all = await library.listUserContent('user-1');
    const building = await library.listUserContent('user-1', {
      jobStatus: JobStatus.PROCESSING,
    });
    const created = await library.listUserContent('user-1', {
      jobStatus: JobStatus.COMPLETED,
    });

    expect(all).toHaveLength(1);
    expect(all[0].jobStatus).toBe(JobStatus.COMPLETED);
    expect(building).toHaveLength(0);
    expect(created).toHaveLength(1);
    expect(created[0].contentItem.mediaUrl).toBe(
      'https://cdn.example.com/done.mp4',
    );
  });
});
