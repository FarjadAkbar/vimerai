import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IPlanRepository } from '@/core/ports/plan.repository';
import { Plan } from '@/domain/plan.entity';

const PLAN_REPOSITORY_TOKEN = 'IPlanRepository';

/**
 * Auto-seeds the plans table on first boot if it is empty.
 * For manual seeding with PayPal plan IDs, use:
 *   pnpm seed:plans          (skip if rows exist)
 *   pnpm seed:plans --force  (drop and re-create)
 */
@Injectable()
export class PlanSeedService implements OnModuleInit {
  private readonly logger = new Logger(PlanSeedService.name);

  constructor(
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepository: IPlanRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.planRepository.countPlans();
    if (count > 0) {
      this.logger.log(
        `Plans table has ${count} entries – skipping auto-seed. Use "pnpm seed:plans --force" to re-seed.`,
      );
      return;
    }

    this.logger.warn(
      'Plans table is empty – inserting default plans. Run "pnpm seed:plans" to populate PayPal plan IDs from .env.',
    );
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    const now = new Date();

    const defaults: Array<{
      slug: string;
      name: string;
      type: 'subscription' | 'one-time';
      videos: number;
      price: number;
      discount: number;
      popular: boolean;
      order: number;
      desc: string;
    }> = [
      {
        slug: 'starter',
        name: 'Starter',
        type: 'subscription',
        videos: 10,
        price: 9.99,
        discount: 0.15,
        popular: false,
        order: 1,
        desc: 'Perfect for getting started - 10 videos per month',
      },
      {
        slug: 'creator',
        name: 'AI Creator',
        type: 'subscription',
        videos: 50,
        price: 29.99,
        discount: 0.15,
        popular: true,
        order: 2,
        desc: 'For content creators and marketers - 50 videos per month',
      },
      {
        slug: 'pro',
        name: 'Pro',
        type: 'subscription',
        videos: 200,
        price: 99.99,
        discount: 0.15,
        popular: false,
        order: 3,
        desc: 'For professional creators - 200 videos per month',
      },
      {
        slug: 'single-shot',
        name: 'Single Shot',
        type: 'one-time',
        videos: 1,
        price: 4.99,
        discount: 0,
        popular: false,
        order: 4,
        desc: 'One-time purchase - 1 video credit, no expiration',
      },
    ];

    for (const d of defaults) {
      const plan = new Plan(
        uuidv4(),
        d.slug,
        d.name,
        d.type,
        d.videos,
        d.price,
        d.discount,
        null, // paypalSandboxMonthly — fill via CLI seeder
        null, // paypalSandboxYearly
        null, // paypalLiveMonthly
        null, // paypalLiveYearly
        null, // stripeTestPriceId
        null, // stripeLivePriceId
        d.desc,
        d.popular,
        d.order,
        true,
        'europe',
        now,
        now,
      );
      await this.planRepository.upsertPlan(plan);
    }

    this.logger.log('Default plans inserted (4 rows).');
  }
}
