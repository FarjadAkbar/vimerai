import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  ImageJob,
  type ImageJobStatus,
} from '@/domain/image-job.entity';

@Entity('image_jobs')
export class ImageJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'jsonb', default: [] })
  referenceImageUrls: string[];

  @Column({ type: 'text', nullable: true })
  negativePrompt: string | null;

  @Column({ type: 'varchar', length: 20 })
  status: ImageJobStatus;

  @Column({ type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'int' })
  creditCharge: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: ImageJobEntity): ImageJob {
    return new ImageJob(
      entity.id,
      entity.userId,
      entity.prompt,
      entity.referenceImageUrls,
      entity.negativePrompt,
      entity.status,
      entity.imageUrl,
      entity.creditCharge,
      entity.error,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: ImageJob): ImageJobEntity {
    const entity = new ImageJobEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.prompt = domain.prompt;
    entity.referenceImageUrls = domain.referenceImageUrls;
    entity.negativePrompt = domain.negativePrompt;
    entity.status = domain.status;
    entity.imageUrl = domain.imageUrl;
    entity.creditCharge = domain.creditCharge;
    entity.error = domain.error;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
