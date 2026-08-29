import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MediaAsset, MediaAssetKind } from '@/domain/media-asset.entity';

@Entity('media_assets')
export class MediaAssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 16 })
  kind: MediaAssetKind;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', nullable: true })
  mimeType: string | null;

  @Column({ type: 'int', nullable: true })
  sizeBytes: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: MediaAssetEntity): MediaAsset {
    return new MediaAsset(
      entity.id,
      entity.userId,
      entity.kind,
      entity.name,
      entity.url,
      entity.mimeType,
      entity.sizeBytes,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: MediaAsset): MediaAssetEntity {
    const entity = new MediaAssetEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.kind = domain.kind;
    entity.name = domain.name;
    entity.url = domain.url;
    entity.mimeType = domain.mimeType;
    entity.sizeBytes = domain.sizeBytes;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
