import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  PostJob,
  type PostJobSnapshot,
  type PostJobStatus,
} from '@/domain/post-job.entity';

@Entity('post_jobs')
export class PostJobEntity {
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

  @Column({ type: 'jsonb' })
  snapshot: PostJobSnapshot;

  @Column({ type: 'varchar', length: 20 })
  status: PostJobStatus;

  @Column({ type: 'text', nullable: true })
  postImageUrl: string | null;

  @Column({ type: 'int' })
  creditCharge: number;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: PostJobEntity): PostJob {
    return new PostJob(
      entity.id,
      entity.userId,
      entity.brandId,
      entity.productId,
      entity.formatId,
      entity.snapshot,
      entity.status,
      entity.postImageUrl,
      entity.creditCharge,
      entity.error,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: PostJob): PostJobEntity {
    const entity = new PostJobEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.brandId = domain.brandId;
    entity.productId = domain.productId;
    entity.formatId = domain.formatId;
    entity.snapshot = domain.snapshot;
    entity.status = domain.status;
    entity.postImageUrl = domain.postImageUrl;
    entity.creditCharge = domain.creditCharge;
    entity.error = domain.error;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
