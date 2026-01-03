import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Video, VideoStatus, GenerationMode } from '@/domain/video.entity';

@Entity('videos')
export class VideoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('text')
  prompt: string;

  @Column({ type: 'enum', enum: GenerationMode })
  mode: GenerationMode;

  @Column({ type: 'enum', enum: VideoStatus })
  status: VideoStatus;

  @Column({ nullable: true, type: 'varchar' })
  videoUrl: string | null;

  @Column({ nullable: true, type: 'varchar' })
  previewUrl: string | null;

  @Column({ unique: true })
  jobId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: VideoEntity): Video {
    return new Video(
      entity.id,
      entity.userId,
      entity.prompt,
      entity.mode,
      entity.status,
      entity.videoUrl,
      entity.previewUrl,
      entity.jobId,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: Video): VideoEntity {
    const entity = new VideoEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.prompt = domain.prompt;
    entity.mode = domain.mode;
    entity.status = domain.status;
    entity.videoUrl = domain.videoUrl;
    entity.previewUrl = domain.previewUrl;
    entity.jobId = domain.jobId;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

