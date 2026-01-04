import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPromptTemplateRepository } from '@/core/ports/prompt-template.repository';
import { PromptTemplate } from '@/domain/prompt-template.entity';
import { PromptTemplateEntity } from '../entities/prompt-template.entity';

@Injectable()
export class TypeOrmPromptTemplateRepository implements IPromptTemplateRepository {
  constructor(
    @InjectRepository(PromptTemplateEntity)
    private readonly repository: Repository<PromptTemplateEntity>,
  ) {}

  async createTemplate(template: PromptTemplate): Promise<void> {
    const entity = PromptTemplateEntity.fromDomain(template);
    await this.repository.save(entity);
  }

  async getTemplateById(id: string): Promise<PromptTemplate | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? PromptTemplateEntity.toDomain(entity) : null;
  }

  async getTemplatesByUserId(userId: string): Promise<PromptTemplate[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => PromptTemplateEntity.toDomain(e));
  }

  async updateTemplate(template: PromptTemplate): Promise<void> {
    const entity = PromptTemplateEntity.fromDomain(template);
    await this.repository.save(entity);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
