import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  Generation,
  type GenerationSnapshot,
  type ReelStoryboardContent,
  type SocialPostContent,
  type VideoContent,
} from '@/domain/generation.entity';
import type {
  FeedPlatform,
  Goal,
  LengthTier,
  PostImageMode,
  ReelPlatform,
} from '@/types/generation/enums';
import type { GenerationArmState } from '@/types/generation/generation';

@Entity('generations')
export class GenerationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column()
  goal: Goal;

  @Column()
  lengthTier: LengthTier;

  @Column()
  feedPlatform: FeedPlatform;

  @Column()
  reelPlatform: ReelPlatform;

  @Column()
  postImageMode: PostImageMode;

  @Column('uuid')
  brandKitId: string;

  @Column('uuid')
  productId: string;

  @Column({ type: 'jsonb' })
  snapshot: GenerationSnapshot;

  @Column({ type: 'jsonb' })
  arms: GenerationArmState[];

  @Column({ type: 'text', nullable: true })
  creativeBrief: string | null;

  @Column({ type: 'jsonb', nullable: true })
  socialPost: SocialPostContent | null;

  @Column({ type: 'jsonb', nullable: true })
  reelStoryboard: ReelStoryboardContent | null;

  @Column({ type: 'text', nullable: true })
  reelCaption: string | null;

  @Column({ type: 'jsonb', nullable: true })
  video: VideoContent | null;

  @Column()
  status: Generation['status'];

  @Column({ type: 'int', default: 0 })
  textSectionRegenCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: GenerationEntity): Generation {
    return new Generation(
      entity.id,
      entity.userId,
      entity.goal,
      entity.lengthTier,
      entity.feedPlatform,
      entity.reelPlatform,
      entity.postImageMode,
      entity.brandKitId,
      entity.productId,
      entity.snapshot,
      entity.arms,
      entity.creativeBrief,
      entity.socialPost,
      entity.reelStoryboard,
      entity.reelCaption,
      entity.video,
      entity.status,
      entity.createdAt,
      entity.updatedAt,
      entity.textSectionRegenCount ?? 0,
    );
  }

  static fromDomain(domain: Generation): GenerationEntity {
    const entity = new GenerationEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.goal = domain.goal;
    entity.lengthTier = domain.lengthTier;
    entity.feedPlatform = domain.feedPlatform;
    entity.reelPlatform = domain.reelPlatform;
    entity.postImageMode = domain.postImageMode;
    entity.brandKitId = domain.brandKitId;
    entity.productId = domain.productId;
    entity.snapshot = domain.snapshot;
    entity.arms = domain.arms;
    entity.creativeBrief = domain.creativeBrief;
    entity.socialPost = domain.socialPost;
    entity.reelStoryboard = domain.reelStoryboard;
    entity.reelCaption = domain.reelCaption;
    entity.video = domain.video;
    entity.status = domain.status;
    entity.textSectionRegenCount = domain.textSectionRegenCount;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
