import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  ITemplateRepository,
  ListTemplatesFilter,
} from '@/core/ports/template.repository';
import { Template, TemplateType } from '@/domain/template.entity';
import { TemplateEntity } from '../entities/template.entity';

@Injectable()
export class TypeOrmTemplateRepository implements ITemplateRepository {
  constructor(
    @InjectRepository(TemplateEntity)
    private readonly repository: Repository<TemplateEntity>,
  ) {}

  async create(template: Template): Promise<void> {
    await this.repository.save(TemplateEntity.fromDomain(template));
  }

  async findById(id: string): Promise<Template | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? TemplateEntity.toDomain(entity) : null;
  }

  async findBySlug(slug: string): Promise<Template | null> {
    const entity = await this.repository.findOne({ where: { slug } });
    return entity ? TemplateEntity.toDomain(entity) : null;
  }

  async findByType(
    type: TemplateType,
    filter?: ListTemplatesFilter,
  ): Promise<Template[]> {
    const qb = this.repository
      .createQueryBuilder('template')
      .where('template.type = :type', { type })
      .orderBy('template.createdAt', 'DESC');

    if (filter?.contentType) {
      qb.andWhere('template.contentType = :contentType', {
        contentType: filter.contentType,
      });
    }
    if (filter?.activeOnly !== false) {
      qb.andWhere('template.active = :active', { active: true });
    }

    const entities = await qb.getMany();
    return entities.map((entity) => TemplateEntity.toDomain(entity));
  }

  async update(template: Template): Promise<void> {
    await this.repository.save(TemplateEntity.fromDomain(template));
  }
}
