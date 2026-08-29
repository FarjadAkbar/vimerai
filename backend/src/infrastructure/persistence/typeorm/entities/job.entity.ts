import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job, JobStatus, JobType } from '@/domain/job.entity';

@Entity('jobs')
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  brandId: string | null;

  @Column({ type: 'varchar', length: 32 })
  type: JobType;

  @Column({ type: 'varchar', length: 20 })
  status: JobStatus;

  @Column({ type: 'jsonb', default: {} })
  input: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'text', nullable: true })
  providerJobId: string | null;

  @Column({ type: 'int', default: 0 })
  creditCharge: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: JobEntity): Job {
    return new Job(
      entity.id,
      entity.userId,
      entity.brandId,
      entity.type,
      entity.status,
      entity.input,
      entity.error,
      entity.providerJobId,
      entity.creditCharge,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: Job): JobEntity {
    const entity = new JobEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.brandId = domain.brandId;
    entity.type = domain.type;
    entity.status = domain.status;
    entity.input = domain.input;
    entity.error = domain.error;
    entity.providerJobId = domain.providerJobId;
    entity.creditCharge = domain.creditCharge;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
