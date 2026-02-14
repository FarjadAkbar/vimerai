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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.15 })
  yearlyDiscount: number;

  // ─── PayPal plan IDs (sandbox) ─────────────────────────────────────────
  @Column({ nullable: true, type: 'varchar' })
  paypalSandboxMonthly: string | null;

  @Column({ nullable: true, type: 'varchar' })
  paypalSandboxYearly: string | null;

  // ─── PayPal plan IDs (live / production) ───────────────────────────────
  @Column({ nullable: true, type: 'varchar' })
  paypalLiveMonthly: string | null;

  @Column({ nullable: true, type: 'varchar' })
  paypalLiveYearly: string | null;

  // ─── Stripe price IDs ─────────────────────────────────────────────────
  @Column({ nullable: true, type: 'varchar' })
  stripeTestPriceId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  stripeLivePriceId: string | null;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ default: false })
  popular: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'europe' })
  region: string;

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
      Number(entity.monthlyPrice),
      Number(entity.yearlyDiscount),
      entity.paypalSandboxMonthly,
      entity.paypalSandboxYearly,
      entity.paypalLiveMonthly,
      entity.paypalLiveYearly,
      entity.stripeTestPriceId,
      entity.stripeLivePriceId,
      entity.description,
      entity.popular,
      entity.sortOrder,
      entity.isActive,
      entity.region,
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
    entity.monthlyPrice = domain.monthlyPrice;
    entity.yearlyDiscount = domain.yearlyDiscount;
    entity.paypalSandboxMonthly = domain.paypalSandboxMonthly;
    entity.paypalSandboxYearly = domain.paypalSandboxYearly;
    entity.paypalLiveMonthly = domain.paypalLiveMonthly;
    entity.paypalLiveYearly = domain.paypalLiveYearly;
    entity.stripeTestPriceId = domain.stripeTestPriceId;
    entity.stripeLivePriceId = domain.stripeLivePriceId;
    entity.description = domain.description;
    entity.popular = domain.popular;
    entity.sortOrder = domain.sortOrder;
    entity.isActive = domain.isActive;
    entity.region = domain.region;
    if (domain.createdAt) entity.createdAt = domain.createdAt;
    if (domain.updatedAt) entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
