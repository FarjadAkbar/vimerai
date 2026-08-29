import type {
  ITemplateRepository,
  ListTemplatesFilter,
} from '@/core/ports/template.repository';
import { Template, TemplateType } from '@/domain/template.entity';

export class InMemoryTemplateRepository implements ITemplateRepository {
  private readonly items = new Map<string, Template>();

  async create(template: Template): Promise<void> {
    this.items.set(template.id, template);
  }

  async findById(id: string): Promise<Template | null> {
    return this.items.get(id) ?? null;
  }

  async findBySlug(slug: string): Promise<Template | null> {
    return (
      [...this.items.values()].find((template) => template.slug === slug) ??
      null
    );
  }

  async findByType(
    type: TemplateType,
    filter?: ListTemplatesFilter,
  ): Promise<Template[]> {
    return [...this.items.values()]
      .filter((template) => template.type === type)
      .filter((template) =>
        filter?.contentType
          ? template.contentType === filter.contentType
          : true,
      )
      .filter((template) =>
        filter?.activeOnly === false ? true : template.active,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async update(template: Template): Promise<void> {
    this.items.set(template.id, template);
  }
}
