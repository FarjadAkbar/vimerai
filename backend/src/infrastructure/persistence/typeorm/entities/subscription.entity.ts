import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Subscription, SubscriptionPlan } from '@/domain/subscription.entity';

@Entity('subscriptions')
@Unique(['userId'])
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'enum', enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @Column({ default: 0 })
  videosUsed: number;

  @Column()
  videosLimit: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: SubscriptionEntity): Subscription {
    return new Subscription(
      entity.id,
      entity.userId,
      entity.plan,
      entity.videosUsed,
      entity.videosLimit,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static fromDomain(domain: Subscription): SubscriptionEntity {
    const entity = new SubscriptionEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.plan = domain.plan;
    entity.videosUsed = domain.videosUsed;
    entity.videosLimit = domain.videosLimit;
    entity.isActive = domain.isActive;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

