import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  VideoJob,
  type VideoJobSnapshot,
  type VideoJobStatus,
} from '@/domain/video-job.entity';
import type { ReelPlatform } from '@/types/video-job/reel-platform';

@Entity('video_jobs')
export class VideoJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  brandId: string;

  @Column('uuid')
  productId: string;

  @Column()
  formatId: string;

  @Column({ type: 'varchar', length: 40 })
  reelPlatform: ReelPlatform;

  @Column({ type: 'jsonb' })
  snapshot: VideoJobSnapshot;

  @Column({ type: 'varchar', length: 20 })
  status: VideoJobStatus;

  @Column({ type: 'text', nullable: true })
  videoUrl: string | null;

  @Column({ type: 'int' })
  durationTargetSeconds: number;

  @Column({ type: 'int' })
  creditCharge: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: VideoJobEntity): VideoJob {
    return new VideoJob(
      entity.id,
      entity.userId,
      entity.brandId,
      entity.productId,
      entity.formatId,
      entity.reelPlatform,
      entity.snapshot,
      entity.status,
      entity.videoUrl,
      entity.durationTargetSeconds,
      entity.creditCharge,
      entity.error,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: VideoJob): VideoJobEntity {
    const entity = new VideoJobEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.brandId = domain.brandId;
    entity.productId = domain.productId;
    entity.formatId = domain.formatId;
    entity.reelPlatform = domain.reelPlatform;
    entity.snapshot = domain.snapshot;
    entity.status = domain.status;
    entity.videoUrl = domain.videoUrl;
    entity.durationTargetSeconds = domain.durationTargetSeconds;
    entity.creditCharge = domain.creditCharge;
    entity.error = domain.error;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
