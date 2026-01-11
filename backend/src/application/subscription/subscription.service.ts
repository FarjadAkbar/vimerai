import { Injectable, NotFoundException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ISubscriptionService } from '@/core/ports/subscription.service';
import type { ISubscriptionRepository } from '@/core/ports/subscription.repository';
import type { IVideoRepository } from '@/core/ports/video.repository';
import type { IPaymentService } from '@/core/ports/payment.service';
import { PAYMENT_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';
import { Subscription, SubscriptionPlan } from '@/domain/subscription.entity';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  // Plan limits
  private readonly PLAN_LIMITS = {
    [SubscriptionPlan.STARTER]: 10,
    [SubscriptionPlan.CREATOR]: 50,
    [SubscriptionPlan.PRO]: 200,
  };

  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
    @Inject(PAYMENT_SERVICE_TOKEN)
    private readonly paymentService: IPaymentService,
  ) {}

  async getCurrentSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    videosRemaining: number;
    limit: number;
  }> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    // If no subscription exists, return free plan data (no DB entry)
    if (!subscription) {
      // Check if user has already used their free preview
      const userVideos = await this.videoRepository.getVideosByUserId(
        userId,
        100,
        0,
      );
      const hasUsedPreview = userVideos.videos.some(
        (v) => v.previewUrl !== null,
      );

      return {
        plan: SubscriptionPlan.FREE,
        videosRemaining: hasUsedPreview ? 0 : 1, // Only 1 preview allowed
        limit: 1,
      };
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

    // If no subscription, check if user can use free preview
    if (!subscription) {
      const userVideos = await this.videoRepository.getVideosByUserId(
        userId,
        100,
        0,
      );
      const hasUsedPreview = userVideos.videos.some(
        (v) => v.previewUrl !== null,
      );
      // Free users can only generate preview if they haven't used it yet
      return !hasUsedPreview;
    }

    return subscription.canGenerate();
  }

  async recordVideoGeneration(userId: string): Promise<void> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    // Free plan users don't have a subscription, so don't record usage
    // (preview usage is tracked via video.previewUrl existence)
    if (!subscription) {
      return;
    }

    const updated = subscription.incrementUsage();
    await this.subscriptionRepository.updateSubscription(updated);
  }

  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ sessionId: string; url: string }> {
    return this.paymentService.createCheckoutSession({
      userId,
      plan,
      successUrl,
      cancelUrl,
    });
  }

  async createPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription || !subscription.stripeCustomerId) {
      throw new NotFoundException('No active subscription found');
    }

    return this.paymentService.createPortalSession(
      userId,
      subscription.stripeCustomerId,
      returnUrl,
    );
  }

  async handleStripeWebhook(
    userId: string,
    subscriptionId: string,
    plan: SubscriptionPlan,
    status: string,
  ): Promise<void> {
    // Find subscription by user ID
    let subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    const isActive = status === 'active' || status === 'trialing';

    if (!subscription) {
      // Create new subscription from webhook
      subscription = Subscription.create(
        uuidv4(),
        userId,
        plan,
        this.PLAN_LIMITS[plan],
        null, // stripeCustomerId - will be set when we have it
        subscriptionId,
      );
      // Create a new subscription with isActive set correctly
      const newSubscription = subscription.updateActiveStatus(isActive);
      await this.subscriptionRepository.createSubscription(newSubscription);
    } else {
      // Update existing subscription
      const updated = subscription
        .updatePlan(plan, this.PLAN_LIMITS[plan])
        .updateStripeIds(subscription.stripeCustomerId, subscriptionId)
        .updateActiveStatus(isActive);
      await this.subscriptionRepository.updateSubscription(updated);
    }
  }
}
