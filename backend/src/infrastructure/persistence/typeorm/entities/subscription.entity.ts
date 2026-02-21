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

  @Column({ nullable: true, type: 'varchar' })
  stripeCustomerId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeSubscriptionId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  paypalSubscriptionId: string | null;

  @Column({ nullable: true, type: 'varchar', length: 20 })
  billingPeriod: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static toDomain(entity: SubscriptionEntity): Subscription {
    const billingPeriod =
      entity.billingPeriod === 'yearly' || entity.billingPeriod === 'monthly'
        ? (entity.billingPeriod as 'monthly' | 'yearly')
        : null;
    return new Subscription(
      entity.id,
      entity.userId,
      entity.plan,
      entity.videosUsed,
      entity.videosLimit,
      entity.isActive,
      entity.stripeCustomerId,
      entity.stripeSubscriptionId,
      entity.paypalSubscriptionId ?? null,
      billingPeriod,
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
    entity.stripeCustomerId = domain.stripeCustomerId;
    entity.stripeSubscriptionId = domain.stripeSubscriptionId;
    entity.paypalSubscriptionId = domain.paypalSubscriptionId;
    entity.billingPeriod = domain.billingPeriod;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
