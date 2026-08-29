import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ContentLibraryService } from '@/application/studio-core/content-library.service';
import { toContentLibraryItemResponse } from '@/application/studio-core/content-library-response';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '@/infrastructure/auth/current-user.decorator';
import type { ContentStatusBucket } from '@/core/ports/content-library.service';

@Controller('content-library')
@UseGuards(JwtAuthGuard)
export class ContentLibraryController {
  constructor(private readonly contentLibraryService: ContentLibraryService) {}

  @Get()
  async listContent(
    @CurrentUser() user: { userId: string },
    @Query('statusBucket') statusBucket?: string,
  ) {
    const parsedBucket = parseStatusBucketQuery(statusBucket);
    const entries = await this.contentLibraryService.listUserContent(
      user.userId,
      parsedBucket ? { statusBucket: parsedBucket } : undefined,
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

function parseStatusBucketQuery(
  value?: string,
): ContentStatusBucket | undefined {
  if (value === 'building' || value === 'created' || value === 'failed') {
    return value;
  }
  return undefined;
}
