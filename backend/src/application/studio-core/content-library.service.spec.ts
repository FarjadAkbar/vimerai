import { ContentLibraryService } from '@/application/studio-core/content-library.service';
import { JobService } from '@/application/studio-core/job.service';
import {
  ContentItem,
  ContentItemMediaKind,
} from '@/domain/content-item.entity';
import { JobStatus, JobType } from '@/domain/job.entity';
import { InMemoryContentItemRepository } from '@/testing/fakes/in-memory-content-item.repository';
import { InMemoryJobRepository } from '@/testing/fakes/in-memory-job.repository';
import { v4 as uuidv4 } from 'uuid';

describe('ContentLibraryService', () => {
  it('lists user content with status bucket filters', async () => {
    const jobRepo = new InMemoryJobRepository();
    const contentRepo = new InMemoryContentItemRepository();
    const jobService = new JobService(jobRepo, contentRepo);
    const library = new ContentLibraryService(contentRepo, jobRepo);

    const buildingJob = await jobService.createJob('user-1', {
      type: JobType.VIRAL_REMIX,
      jobInput: {},
    });
    await jobService.markJobProcessing(buildingJob.id);
    await contentRepo.create(
      ContentItem.create({
        id: uuidv4(),
        userId: 'user-1',
        jobId: buildingJob.id,
        mediaKind: ContentItemMediaKind.VIDEO,
        title: 'Building remix',
      }),
    );

    const createdJob = await jobService.createJob('user-1', {
      type: JobType.VIRAL_REMIX,
      jobInput: {},
    });
    await jobService.completeJob('user-1', createdJob.id, {
      mediaKind: ContentItemMediaKind.VIDEO,
      mediaUrl: 'https://cdn.example.com/done.mp4',
    });

    const failedJob = await jobService.createJob('user-1', {
      type: JobType.BLITZ_COMPOSE,
      jobInput: {},
    });
    await contentRepo.create(
      ContentItem.create({
        id: uuidv4(),
        userId: 'user-1',
        jobId: failedJob.id,
        mediaKind: ContentItemMediaKind.IMAGE,
        title: 'Failed blitz',
      }),
    );
    await jobService.failJob(failedJob.id, 'Compose failed');

    const all = await library.listUserContent('user-1');
    const building = await library.listUserContent('user-1', {
      statusBucket: 'building',
    });
    const created = await library.listUserContent('user-1', {
      statusBucket: 'created',
    });
    const failed = await library.listUserContent('user-1', {
      statusBucket: 'failed',
    });

    expect(all).toHaveLength(3);
    expect(building).toHaveLength(1);
    expect(building[0].jobStatus).toBe(JobStatus.PROCESSING);
    expect(created).toHaveLength(1);
    expect(created[0].contentItem.mediaUrl).toBe(
      'https://cdn.example.com/done.mp4',
    );
    expect(failed).toHaveLength(1);
    expect(failed[0].jobError).toBe('Compose failed');
  });
});
