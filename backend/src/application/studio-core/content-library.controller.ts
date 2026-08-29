import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ContentLibraryService } from '@/application/studio-core/content-library.service';
import { toContentLibraryItemResponse } from '@/application/studio-core/content-library-response';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import { JobStatus } from '@/domain/job.entity';

@Controller('content-library')
@UseGuards(JwtAuthGuard)
export class ContentLibraryController {
  constructor(private readonly contentLibraryService: ContentLibraryService) {}

  @Get()
  async listContent(
    @CurrentUser() user: { userId: string },
    @Query('jobStatus') jobStatus?: string,
  ) {
    const parsedStatus = parseJobStatusQuery(jobStatus);
    const entries = await this.contentLibraryService.listUserContent(
      user.userId,
      parsedStatus ? { jobStatus: parsedStatus } : undefined,
    );

    return {
      items: entries.map((entry) =>
        toContentLibraryItemResponse({
          contentItem: entry.contentItem,
          jobType: entry.jobType,
          jobStatus: entry.jobStatus,
          jobError: entry.jobError,
        }),
      ),
    };
  }
}

function parseJobStatusQuery(value?: string): JobStatus | undefined {
  if (!value) return undefined;
  if (
    value === JobStatus.PENDING ||
    value === JobStatus.PROCESSING ||
    value === JobStatus.COMPLETED ||
    value === JobStatus.FAILED
  ) {
    return value;
  }
  return undefined;
}
