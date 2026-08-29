import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  AiInfluencer,
  InfluencerGender,
  PortraitSource,
} from '@/domain/ai-influencer.entity';

@Entity('ai_influencers')
export class AiInfluencerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'varchar', length: 16 })
  gender: InfluencerGender;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'text', nullable: true })
  ethnicity: string | null;

  @Column({ type: 'text' })
  appearancePrompt: string;

  @Column({ type: 'varchar', length: 16 })
  portraitSource: PortraitSource;

  @Column({ type: 'uuid', nullable: true })
  portraitMediaAssetId: string | null;

  @Column({ type: 'text', nullable: true })
  portraitUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: AiInfluencerEntity): AiInfluencer {
    return new AiInfluencer(
      entity.id,
      entity.userId,
      entity.name,
      entity.gender,
      entity.age,
      entity.ethnicity,
      entity.appearancePrompt,
      entity.portraitSource,
      entity.portraitMediaAssetId,
      entity.portraitUrl,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: AiInfluencer): AiInfluencerEntity {
    const entity = new AiInfluencerEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.gender = domain.gender;
    entity.age = domain.age;
    entity.ethnicity = domain.ethnicity;
    entity.appearancePrompt = domain.appearancePrompt;
    entity.portraitSource = domain.portraitSource;
    entity.portraitMediaAssetId = domain.portraitMediaAssetId;
    entity.portraitUrl = domain.portraitUrl;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
