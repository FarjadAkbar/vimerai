import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Plan } from '@/domain/plan.entity';
import type { PlanType } from '@/domain/plan.entity';

@Entity('plans')
export class PlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'subscription' })
  type: string;

  @Column({ type: 'int', default: 0 })
  videosPerMonth: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: PlanEntity): Plan {
    return new Plan(
      entity.id,
      entity.slug,
      entity.name,
      entity.type as PlanType,
      entity.videosPerMonth,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: Plan): PlanEntity {
    const entity = new PlanEntity();
    entity.id = domain.id;
    entity.slug = domain.slug;
    entity.name = domain.name;
    entity.type = domain.type;
    entity.videosPerMonth = domain.videosPerMonth;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
