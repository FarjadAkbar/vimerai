import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PromptTemplate } from '@/domain/prompt-template.entity';

@Entity('prompt_templates')
export class PromptTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  name: string;

  @Column('text')
  template: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: PromptTemplateEntity): PromptTemplate {
    return new PromptTemplate(
      entity.id,
      entity.userId,
      entity.name,
      entity.template,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: PromptTemplate): PromptTemplateEntity {
    const entity = new PromptTemplateEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.template = domain.template;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
