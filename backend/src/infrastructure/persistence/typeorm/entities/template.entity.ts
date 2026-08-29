import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  BlitzContentType,
  Template,
  TemplateStatus,
  TemplateType,
} from '@/domain/template.entity';

@Entity('templates')
export class TemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  slug: string;

  @Column({ type: 'varchar', length: 32 })
  type: TemplateType;

  @Column({ type: 'varchar', length: 32, nullable: true })
  contentType: BlitzContentType | null;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  videoUrl: string | null;

  @Column({ type: 'text', nullable: true })
  previewUrl: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  durationLabel: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  remixFormatId: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: TemplateStatus;

  @Column({ type: 'text', nullable: true })
  providerJobId: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: TemplateEntity): Template {
    return new Template(
      entity.id,
      entity.slug,
      entity.type,
      entity.contentType,
      entity.label,
      entity.prompt,
      entity.videoUrl,
      entity.previewUrl,
      entity.durationLabel,
      entity.remixFormatId,
      entity.status,
      entity.providerJobId,
      entity.active,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: Template): TemplateEntity {
    const entity = new TemplateEntity();
    entity.id = domain.id;
    entity.slug = domain.slug;
    entity.type = domain.type;
    entity.contentType = domain.contentType;
    entity.label = domain.label;
    entity.prompt = domain.prompt;
    entity.videoUrl = domain.videoUrl;
    entity.previewUrl = domain.previewUrl;
    entity.durationLabel = domain.durationLabel;
    entity.remixFormatId = domain.remixFormatId;
    entity.status = domain.status;
    entity.providerJobId = domain.providerJobId;
    entity.active = domain.active;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
