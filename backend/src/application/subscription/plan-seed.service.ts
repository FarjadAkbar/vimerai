import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IPlanRepository } from '@/core/ports/plan.repository';
import { Plan } from '@/domain/plan.entity';
import { PLAN_REPOSITORY_TOKEN } from '@/core/tokens/injection.tokens';

/**
 * Auto-seeds the plans table on first boot if it is empty.
 * Plans store only name and limit; PayPal plan IDs live on frontend / PayPal.
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
      this.logger.log(`Plans table has ${count} entries – skipping auto-seed.`);
      return;
    }

    this.logger.log('Plans table is empty – inserting default plans (name + limit only).');
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    const now = new Date();

    const defaults: Array<{
      slug: string;
      name: string;
      type: 'subscription' | 'one-time';
      videos: number;
    }> = [
      { slug: 'starter', name: 'AI Starter', type: 'subscription', videos: 3 },
      { slug: 'creator', name: 'AI Creator', type: 'subscription', videos: 6 },
      { slug: 'pro', name: 'AI Pro Studio', type: 'subscription', videos: 10 },
      { slug: 'single-shot', name: 'AI Single Shot', type: 'one-time', videos: 1 },
    ];

    for (const d of defaults) {
      const plan = new Plan(
        uuidv4(),
        d.slug,
        d.name,
        d.type,
        d.videos,
        now,
        now,
      );
      await this.planRepository.upsertPlan(plan);
    }

    this.logger.log('Default plans inserted (4 rows).');
  }
}
