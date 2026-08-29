import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IBlitzComposeService } from '@/core/ports/blitz-compose.service';
import type {
  BlitzComposeJobInput,
  ComposeBlitzEditInput,
  BlitzComposeResult,
} from '@/core/ports/blitz-compose.service';
import type { IBrandKitRepository } from '@/core/ports/brand-kit.repository';
import type { IContentItemRepository } from '@/core/ports/content-item.repository';
import type { IJobService } from '@/core/ports/job.service';
import type { IStorageService } from '@/core/ports/storage.service';
import {
  BRAND_KIT_REPOSITORY_TOKEN,
  CONTENT_ITEM_REPOSITORY_TOKEN,
  JOB_SERVICE_TOKEN,
  STORAGE_SERVICE_TOKEN,
} from '@/core/tokens/injection.tokens';
import {
  ContentItem,
  ContentItemMediaKind,
} from '@/domain/content-item.entity';
import { JobType } from '@/domain/job.entity';
import { toBlitzComposeResult } from '@/application/studio-core/blitz-compose-response';
import { extensionForContentType } from '@/application/studio-core/media-asset-upload';

@Injectable()
export class BlitzComposeService implements IBlitzComposeService {
  constructor(
    @Inject(JOB_SERVICE_TOKEN)
    private readonly jobService: IJobService,
    @Inject(CONTENT_ITEM_REPOSITORY_TOKEN)
    private readonly contentItemRepository: IContentItemRepository,
    @Inject(BRAND_KIT_REPOSITORY_TOKEN)
    private readonly brandKitRepository: IBrandKitRepository,
    @Inject(STORAGE_SERVICE_TOKEN)
    private readonly storageService: IStorageService,
  ) {}

  async composeAndSave(
    userId: string,
    input: ComposeBlitzEditInput,
  ): Promise<BlitzComposeResult> {
    const hook = input.hook.trim();
    if (!hook) {
      throw new BadRequestException('Hook text is required');
    }
    if (!input.file.length) {
      throw new BadRequestException('Composed file is required');
    }

    await this.requireOwnedBrand(userId, input.brandId);

    const jobInput: BlitzComposeJobInput = {
      brandId: input.brandId,
      formatId: input.formatId,
      hook,
      sourceTemplateId: input.sourceTemplateId ?? null,
    };

    const mediaKind = inferMediaKind(input.contentType);
    const job = await this.jobService.createJob(userId, {
      type: JobType.BLITZ_COMPOSE,
      brandId: input.brandId,
      jobInput: jobInput as unknown as Record<string, unknown>,
    });

    const placeholder = ContentItem.create({
      id: uuidv4(),
      userId,
      jobId: job.id,
      mediaKind,
      title: hook.slice(0, 120),
    });
    await this.contentItemRepository.create(placeholder);

    try {
      await this.jobService.markJobProcessing(job.id);
      const extension = extensionForContentType(input.contentType);
      const key = `blitz-composes/${userId}/${job.id}.${extension}`;
      const mediaUrl = await this.storageService.upload(
        key,
        input.file,
        input.contentType,
      );

      const result = await this.jobService.completeJob(userId, job.id, {
        mediaKind,
        mediaUrl,
        thumbnailUrl: mediaKind === ContentItemMediaKind.IMAGE ? mediaUrl : null,
        title: hook.slice(0, 120),
      });
      return toBlitzComposeResult(result.job, result.contentItem);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Blitz compose failed';
      const failed = await this.jobService.failJob(job.id, message);
      const contentItem = await this.contentItemRepository.findByJobId(job.id);
      return toBlitzComposeResult(failed, contentItem);
    }
  }

  async getComposeJob(
    userId: string,
    jobId: string,
  ): Promise<BlitzComposeResult> {
    const job = await this.jobService.getJob(userId, jobId);
    if (job.type !== JobType.BLITZ_COMPOSE) {
      throw new NotFoundException('Blitz compose job not found');
    }
    const contentItem = await this.contentItemRepository.findByJobId(jobId);
    return toBlitzComposeResult(job, contentItem);
  }

  private async requireOwnedBrand(userId: string, brandId: string) {
    const brand = await this.brandKitRepository.findById(brandId);
    if (!brand || brand.userId !== userId) {
      throw new BadRequestException('Brand not found');
    }
  }
}

function inferMediaKind(contentType: string): ContentItemMediaKind {
  if (contentType.startsWith('video/')) {
    return ContentItemMediaKind.VIDEO;
  }
  return ContentItemMediaKind.IMAGE;
}
