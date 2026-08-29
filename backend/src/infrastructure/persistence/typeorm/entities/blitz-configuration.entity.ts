import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlitzConfiguration } from '@/domain/blitz-configuration.entity';
import type {
  BlitzEnabledFormats,
  MentionFrequency,
} from '@/domain/blitz-configuration.entity';

@Entity('blitz_configurations')
export class BlitzConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column('uuid')
  brandId: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 16 })
  mentionFrequency: MentionFrequency;

  @Column({ type: 'boolean', default: false })
  showInfluencerMaterials: boolean;

  @Column({ type: 'jsonb' })
  enabledFormats: BlitzEnabledFormats;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: BlitzConfigurationEntity): BlitzConfiguration {
    return new BlitzConfiguration(
      entity.id,
      entity.brandId,
      entity.userId,
      entity.mentionFrequency,
      entity.showInfluencerMaterials,
      entity.enabledFormats,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: BlitzConfiguration): BlitzConfigurationEntity {
    const entity = new BlitzConfigurationEntity();
    entity.id = domain.id;
    entity.brandId = domain.brandId;
    entity.userId = domain.userId;
    entity.mentionFrequency = domain.mentionFrequency;
    entity.showInfluencerMaterials = domain.showInfluencerMaterials;
    entity.enabledFormats = domain.enabledFormats;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
