import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { ITemplateCatalog } from '@/core/ports/template-catalog.service';
import type { ITemplateRepository } from '@/core/ports/template.repository';
import { TEMPLATE_REPOSITORY_TOKEN } from '@/core/tokens/injection.tokens';
import {
  BlitzContentType,
  Template,
  TemplateType,
} from '@/domain/template.entity';

@Injectable()
export class TemplateCatalogService implements ITemplateCatalog {
  constructor(
    @Inject(TEMPLATE_REPOSITORY_TOKEN)
    private readonly templateRepository: ITemplateRepository,
  ) {}

  async listTemplates(
    type: TemplateType,
    filter?: { contentType?: BlitzContentType; activeOnly?: boolean },
  ): Promise<Template[]> {
    return this.templateRepository.findByType(type, filter);
  }

  async getTemplateBySlug(slug: string): Promise<Template | null> {
    return this.templateRepository.findBySlug(slug);
  }

  async saveTemplate(template: Template): Promise<Template> {
    const existing = await this.templateRepository.findById(template.id);
    if (existing) {
      await this.templateRepository.update(template);
    } else {
      await this.templateRepository.create(template);
    }
    return template;
  }

  async upsertTemplate(input: {
    slug: string;
    type: TemplateType;
    label: string;
    prompt: string;
    contentType?: BlitzContentType | null;
    durationLabel?: string | null;
    remixFormatId?: string | null;
  }): Promise<Template> {
    const existing = await this.templateRepository.findBySlug(input.slug);
    if (existing) {
      return existing;
    }

    const template = Template.create({
      id: uuidv4(),
      slug: input.slug,
      type: input.type,
      label: input.label,
      prompt: input.prompt,
      contentType: input.contentType,
      durationLabel: input.durationLabel,
      remixFormatId: input.remixFormatId,
    });
    await this.templateRepository.create(template);
    return template;
  }

  async requireTemplateBySlug(slug: string): Promise<Template> {
    const template = await this.getTemplateBySlug(slug);
    if (!template) {
      throw new NotFoundException(`Template not found: ${slug}`);
    }
    return template;
  }
}
