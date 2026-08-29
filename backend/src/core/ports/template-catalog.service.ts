import type {
  BlitzContentType,
  Template,
  TemplateType,
} from '@/domain/template.entity';

export interface ITemplateCatalog {
  listTemplates(
    type: TemplateType,
    filter?: { contentType?: BlitzContentType; activeOnly?: boolean },
  ): Promise<Template[]>;
  getTemplateBySlug(slug: string): Promise<Template | null>;
  saveTemplate(template: Template): Promise<Template>;
}
