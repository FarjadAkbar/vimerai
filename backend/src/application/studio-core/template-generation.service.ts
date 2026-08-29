import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IVideoGenerationProvider } from '@/core/ports/video-generation.provider';
import type { ITemplateRepository } from '@/core/ports/template.repository';
import {
  TEMPLATE_REPOSITORY_TOKEN,
  VIDEO_GENERATION_PROVIDER_TOKEN,
} from '@/core/tokens/injection.tokens';
import {
  BlitzContentType,
  Template,
  TemplateStatus,
  TemplateType,
} from '@/domain/template.entity';
import { GenerationMode } from '@/domain/video.entity';
import {
  BLITZ_TEMPLATE_SPECS,
  VIRAL_REMIX_TEMPLATE_SPECS,
} from './template-specs';
import { toTemplateResponse, type TemplateResponse } from './template-response';

const INFLIGHT_STATUSES = new Set<TemplateStatus>([
  TemplateStatus.PENDING,
  TemplateStatus.PROCESSING,
]);

type TemplateSeedSpec = {
  slug: string;
  label: string;
  prompt: string;
  contentType: BlitzContentType | null;
  durationLabel: string | null;
  remixFormatId: string | null;
};

@Injectable()
export class TemplateGenerationService {
  constructor(
    @Inject(TEMPLATE_REPOSITORY_TOKEN)
    private readonly templateRepository: ITemplateRepository,
    @Inject(VIDEO_GENERATION_PROVIDER_TOKEN)
    private readonly videoGenerationProvider: IVideoGenerationProvider,
  ) {}

  async listBlitzTemplates(): Promise<{ templates: TemplateResponse[] }> {
    await this.refreshProcessingTemplates(TemplateType.BLITZ);
    const templates = await this.templateRepository.findByType(
      TemplateType.BLITZ,
    );
    return { templates: templates.map(toTemplateResponse) };
  }

  async listViralRemixTemplates(): Promise<{ templates: TemplateResponse[] }> {
    await this.refreshProcessingTemplates(TemplateType.VIRAL_REMIX);
    const templates = await this.templateRepository.findByType(
      TemplateType.VIRAL_REMIX,
    );
    return { templates: templates.map(toTemplateResponse) };
  }

  async generateBlitzSamples(): Promise<{
    templates: TemplateResponse[];
    createdCount: number;
  }> {
    const createdCount = await this.generateMissingSamples(
      TemplateType.BLITZ,
      BLITZ_TEMPLATE_SPECS.map((spec) => ({
        slug: spec.slug,
        label: spec.label,
        prompt: spec.prompt,
        contentType: spec.contentType,
        durationLabel: null,
        remixFormatId: null,
      })),
    );
    const templates = await this.templateRepository.findByType(
      TemplateType.BLITZ,
    );
    return { templates: templates.map(toTemplateResponse), createdCount };
  }

  async generateViralRemixSamples(): Promise<{
    templates: TemplateResponse[];
    createdCount: number;
  }> {
    const createdCount = await this.generateMissingSamples(
      TemplateType.VIRAL_REMIX,
      VIRAL_REMIX_TEMPLATE_SPECS.map((spec) => ({
        slug: spec.slug,
        label: spec.label,
        prompt: spec.prompt,
        contentType: null,
        durationLabel: spec.durationLabel,
        remixFormatId: spec.remixFormatId,
      })),
    );
    const templates = await this.templateRepository.findByType(
      TemplateType.VIRAL_REMIX,
    );
    return { templates: templates.map(toTemplateResponse), createdCount };
  }

  private async generateMissingSamples(
    type: TemplateType,
    specs: ReadonlyArray<TemplateSeedSpec>,
  ) {
    const existing = await this.templateRepository.findByType(type, {
      activeOnly: false,
    });
    const bySlug = new Map(existing.map((template) => [template.slug, template]));

    let createdCount = 0;

    for (const spec of specs) {
      const current = bySlug.get(spec.slug);
      if (
        current &&
        (current.status === TemplateStatus.COMPLETED ||
          current.status === TemplateStatus.PROCESSING ||
          (current.status === TemplateStatus.PENDING &&
            Boolean(current.providerJobId)))
      ) {
        continue;
      }

      let template =
        current ??
        Template.create({
          id: uuidv4(),
          slug: spec.slug,
          type,
          label: spec.label,
          prompt: spec.prompt,
          contentType: spec.contentType,
          durationLabel: spec.durationLabel,
          remixFormatId: spec.remixFormatId,
        });

      if (!current) {
        await this.templateRepository.create(template);
      }

      try {
        const submitted = await this.videoGenerationProvider.generateVideo({
          prompt: spec.prompt,
          mode: GenerationMode.FAST,
          aspectRatio: '9:16',
        });

        const completedImmediately =
          submitted.status === 'completed' && Boolean(submitted.videoUrl);

        template = template.withUpdates({
          providerJobId: submitted.jobId,
          status: completedImmediately
            ? TemplateStatus.COMPLETED
            : submitted.status === 'failed'
              ? TemplateStatus.FAILED
              : TemplateStatus.PROCESSING,
          videoUrl: submitted.videoUrl ?? null,
          previewUrl: submitted.previewUrl ?? null,
        });
      } catch {
        template = template.withUpdates({ status: TemplateStatus.FAILED });
      }

      await this.templateRepository.update(template);
      bySlug.set(spec.slug, template);
      createdCount += 1;
    }

    return createdCount;
  }

  private async refreshProcessingTemplates(type: TemplateType) {
    const templates = await this.templateRepository.findByType(type, {
      activeOnly: false,
    });
    const inflight = templates.filter(
      (template) =>
        template.status === TemplateStatus.PROCESSING ||
        (template.status === TemplateStatus.PENDING &&
          Boolean(template.providerJobId)),
    );

    for (const template of inflight) {
      if (
        !template.providerJobId ||
        template.providerJobId.startsWith('template-')
      ) {
        continue;
      }

      try {
        const status = await this.videoGenerationProvider.getGenerationStatus(
          template.providerJobId,
        );
        if (status.status === 'completed' && status.videoUrl) {
          await this.templateRepository.update(
            template.withUpdates({
              status: TemplateStatus.COMPLETED,
              videoUrl: status.videoUrl,
              previewUrl: status.previewUrl ?? template.previewUrl,
            }),
          );
        } else if (status.status === 'failed') {
          await this.templateRepository.update(
            template.withUpdates({ status: TemplateStatus.FAILED }),
          );
        }
      } catch {
        // Leave as processing; next poll retries.
      }
    }
  }
}
