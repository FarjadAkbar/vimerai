import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BrandKit, type BrandKitColors } from '@/domain/brand-kit.entity';
import type { Tone } from '@/types/generation/enums';

@Entity('brand_kits')
export class BrandKitEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  name: string;

  @Column()
  logoUrl: string;

  @Column({ type: 'jsonb' })
  colors: BrandKitColors;

  @Column()
  tone: Tone;

  @Column('text')
  audience: string;

  @Column('text')
  thingsToAvoid: string;

  @Column({ type: 'text', nullable: true })
  aiInstructions: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: BrandKitEntity): BrandKit {
    return new BrandKit(
      entity.id,
      entity.userId,
      entity.name,
      entity.logoUrl,
      entity.colors,
      entity.tone,
      entity.audience,
      entity.thingsToAvoid,
      entity.aiInstructions,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: BrandKit): BrandKitEntity {
    const entity = new BrandKitEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.name = domain.name;
    entity.logoUrl = domain.logoUrl;
    entity.colors = domain.colors;
    entity.tone = domain.tone;
    entity.audience = domain.audience;
    entity.thingsToAvoid = domain.thingsToAvoid;
    entity.aiInstructions = domain.aiInstructions;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
