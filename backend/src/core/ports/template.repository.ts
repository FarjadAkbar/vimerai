import type {
  BlitzContentType,
  Template,
  TemplateType,
} from '@/domain/template.entity';

export interface ListTemplatesFilter {
  contentType?: BlitzContentType;
  activeOnly?: boolean;
}

export interface ITemplateRepository {
  create(template: Template): Promise<void>;
  findById(id: string): Promise<Template | null>;
  findBySlug(slug: string): Promise<Template | null>;
  findByType(type: TemplateType, filter?: ListTemplatesFilter): Promise<Template[]>;
  update(template: Template): Promise<void>;
}
