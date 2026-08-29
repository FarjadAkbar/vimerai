import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ContentItem,
  ContentItemMediaKind,
} from '@/domain/content-item.entity';

@Entity('content_items')
export class ContentItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Index({ unique: true })
  @Column('uuid')
  jobId: string;

  @Column({ type: 'varchar', length: 16 })
  mediaKind: ContentItemMediaKind;

  @Column({ type: 'text', nullable: true })
  mediaUrl: string | null;

  @Column({ type: 'text', nullable: true })
  thumbnailUrl: string | null;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: ContentItemEntity): ContentItem {
    return new ContentItem(
      entity.id,
      entity.userId,
      entity.jobId,
      entity.mediaKind,
      entity.mediaUrl,
      entity.thumbnailUrl,
      entity.title,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: ContentItem): ContentItemEntity {
    const entity = new ContentItemEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.jobId = domain.jobId;
    entity.mediaKind = domain.mediaKind;
    entity.mediaUrl = domain.mediaUrl;
    entity.thumbnailUrl = domain.thumbnailUrl;
    entity.title = domain.title;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
