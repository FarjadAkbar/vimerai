import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ISubscriptionService } from '@/core/ports/subscription.service';
import { ISubscriptionRepository } from '@/core/ports/subscription.repository';
import { Subscription, SubscriptionPlan } from '@/domain/subscription.entity';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  // Plan limits (mock for Phase 1)
  private readonly PLAN_LIMITS = {
    [SubscriptionPlan.STARTER]: 10,
    [SubscriptionPlan.CREATOR]: 50,
    [SubscriptionPlan.PRO]: 200,
  };

  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async getCurrentSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    videosRemaining: number;
    limit: number;
  }> {
    let subscription = await this.subscriptionRepository.getSubscriptionByUserId(
      userId,
    );

    // Create default subscription if none exists (mock for Phase 1)
    if (!subscription) {
      subscription = Subscription.create(
        uuidv4(),
        userId,
        SubscriptionPlan.CREATOR,
        this.PLAN_LIMITS[SubscriptionPlan.CREATOR],
      );
      await this.subscriptionRepository.createSubscription(subscription);
    }

    return {
      plan: subscription.plan,
      videosRemaining: subscription.getRemaining(),
      limit: subscription.videosLimit,
    };
  }

  async getUsage(userId: string): Promise<{
    videosUsed: number;
    videosRemaining: number;
    limit: number;
  }> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      return { videosUsed: 0, videosRemaining: 0, limit: 0 };
    }

    return {
      videosUsed: subscription.videosUsed,
      videosRemaining: subscription.getRemaining(),
      limit: subscription.videosLimit,
    };
  }

  async canGenerate(userId: string): Promise<boolean> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      return false;
    }

    return subscription.canGenerate();
  }

  async recordVideoGeneration(userId: string): Promise<void> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const updated = subscription.incrementUsage();
    await this.subscriptionRepository.updateSubscription(updated);
  }
}

