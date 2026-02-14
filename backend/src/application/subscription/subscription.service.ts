import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ISubscriptionService } from '@/core/ports/subscription.service';
import type { ISubscriptionRepository } from '@/core/ports/subscription.repository';
import type { IUserRepository } from '@/core/ports/user.repository';
import type { IVideoRepository } from '@/core/ports/video.repository';
import type {
  IPaymentService,
  BillingPeriod,
} from '@/core/ports/payment.service';
import type { IPlanRepository } from '@/core/ports/plan.repository';
import {
  PAYMENT_SERVICE_TOKEN,
  USER_REPOSITORY_TOKEN,
  PLAN_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';
import { Subscription, SubscriptionPlan } from '@/domain/subscription.entity';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);
  private readonly paypalEnvironment: string;

  constructor(
    @Inject('ISubscriptionRepository')
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    @Inject('IVideoRepository')
    private readonly videoRepository: IVideoRepository,
    @Inject(PAYMENT_SERVICE_TOKEN)
    private readonly paymentService: IPaymentService,
    @Inject(PLAN_REPOSITORY_TOKEN)
    private readonly planRepository: IPlanRepository,
    private readonly configService: ConfigService,
  ) {
    this.paypalEnvironment =
      this.configService.get<string>('payment.paypal.environment') ?? 'sandbox';
  }

  /** Resolve video-per-month limit for a plan from DB, with fallback */
  private async getPlanLimit(plan: SubscriptionPlan): Promise<number> {
    const dbPlan = await this.planRepository.getPlanBySlug(plan);
    if (dbPlan) return dbPlan.videosPerMonth;
    // Fallback if DB is empty (should not happen after seed)
    const fallback: Record<string, number> = {
      starter: 10,
      creator: 50,
      pro: 200,
    };
    return fallback[plan] ?? 0;
  }

  async getCurrentSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    videosRemaining: number;
    limit: number;
    singleShotCredits: number;
  }> {
    const user = await this.userRepository.getUserById(userId);
    const singleShotCredits = user?.singleShotCredits ?? 0;

    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      return {
        plan: SubscriptionPlan.FREE,
        videosRemaining: 0,
        limit: 0,
        singleShotCredits,
      };
    }

    return {
      plan: subscription.plan,
      videosRemaining: subscription.getRemaining(),
      limit: subscription.videosLimit,
      singleShotCredits,
    };
  }

  async getUsage(userId: string): Promise<{
    videosUsed: number;
    videosRemaining: number;
    limit: number;
    singleShotCredits: number;
  }> {
    const user = await this.userRepository.getUserById(userId);
    const singleShotCredits = user?.singleShotCredits ?? 0;
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      return {
        videosUsed: 0,
        videosRemaining: 0,
        limit: 0,
        singleShotCredits,
      };
    }

    return {
      videosUsed: subscription.videosUsed,
      videosRemaining: subscription.getRemaining(),
      limit: subscription.videosLimit,
      singleShotCredits,
    };
  }

  async canGenerate(userId: string): Promise<boolean> {
    const user = await this.userRepository.getUserById(userId);
    const singleShotCredits = user?.singleShotCredits ?? 0;
    if (singleShotCredits > 0) {
      return true;
    }

    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);
    if (!subscription) {
      return false;
    }

    return subscription.canGenerate();
  }

  async recordVideoGeneration(userId: string): Promise<void> {
    const user = await this.userRepository.getUserById(userId);
    const singleShotCredits = user?.singleShotCredits ?? 0;

    if (user && singleShotCredits > 0) {
      const updatedUser = user.consumeSingleShotCredit();
      await this.userRepository.updateUser(updatedUser);
      return;
    }

    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);
    if (!subscription) {
      return;
    }

    const updated = subscription.incrementUsage();
    await this.subscriptionRepository.updateSubscription(updated);
  }

  async purchaseSingleShot(
    userId: string,
  ): Promise<{ singleShotCredits: number }> {
    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updatedUser = user.addSingleShotCredits(1);
    await this.userRepository.updateUser(updatedUser);
    return { singleShotCredits: updatedUser.singleShotCredits };
  }

  async createSingleShotCheckout(
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ orderId: string; url: string }> {
    // Get single-shot price from DB
    const singleShotPlan =
      await this.planRepository.getPlanBySlug('single-shot');
    const price = singleShotPlan?.monthlyPrice ?? 4.99;

    return this.paymentService.createSingleShotOrder({
      userId,
      amount: price,
      currency: 'EUR',
      successUrl,
      cancelUrl,
    });
  }

  async captureSingleShot(
    orderId: string,
  ): Promise<{ singleShotCredits: number } | null> {
    const result = await this.paymentService.captureSingleShotOrder(orderId);
    if (!result?.userId) return null;
    const { singleShotCredits } = await this.purchaseSingleShot(result.userId);
    return { singleShotCredits };
  }

  // ─── PayPal Subscription Flow ──────────────────────────────────────────

  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    billingPeriod: BillingPeriod,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ sessionId: string; url: string }> {
    // Look up plan from DB and resolve the correct PayPal plan ID for the current environment
    const dbPlan = await this.planRepository.getPlanBySlug(plan);
    const paypalPlanId = dbPlan?.getPaypalPlanId(
      this.paypalEnvironment,
      billingPeriod,
    );

    return this.paymentService.createCheckoutSession({
      userId,
      plan,
      billingPeriod,
      paypalPlanId: paypalPlanId ?? undefined,
      successUrl,
      cancelUrl,
    });
  }

  async activatePayPalSubscription(
    subscriptionId: string,
  ): Promise<{ plan: SubscriptionPlan } | null> {
    const result =
      await this.paymentService.activateSubscription(subscriptionId);
    if (!result?.userId || !result?.plan) return null;

    let subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(result.userId);

    const videosLimit = await this.getPlanLimit(result.plan);

    if (!subscription) {
      subscription = Subscription.create(
        uuidv4(),
        result.userId,
        result.plan,
        videosLimit,
        null,
        null,
        result.paypalSubscriptionId,
      );
      const active = subscription.updateActiveStatus(true);
      await this.subscriptionRepository.createSubscription(active);
    } else {
      const currentRemaining = subscription.getRemaining();
      const totalVideos = currentRemaining + videosLimit;

      const updated = subscription
        .updatePlan(result.plan, totalVideos)
        .updatePaypalSubscriptionId(result.paypalSubscriptionId)
        .updateActiveStatus(true);
      await this.subscriptionRepository.updateSubscription(updated);
    }

    return { plan: result.plan };
  }

  async cancelSubscription(userId: string): Promise<{ cancelled: boolean }> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (subscription.paypalSubscriptionId) {
      const success = await this.paymentService.cancelSubscription(
        subscription.paypalSubscriptionId,
      );
      if (!success) {
        throw new BadRequestException(
          'Failed to cancel subscription on PayPal',
        );
      }
    }

    const updated = subscription.updateActiveStatus(false);
    await this.subscriptionRepository.updateSubscription(updated);

    return { cancelled: true };
  }

  // ─── Portal / Manage ──────────────────────────────────────────────────

  async createPortalSession(
    userId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    if (subscription.stripeCustomerId) {
      return this.paymentService.createPortalSession(
        userId,
        subscription.stripeCustomerId,
        returnUrl,
      );
    }

    return { url: returnUrl };
  }

  // ─── Stripe Webhook (backward compat) ─────────────────────────────────

  async handleStripeWebhook(
    userId: string,
    subscriptionId: string,
    plan: SubscriptionPlan,
    status: string,
  ): Promise<void> {
    let subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    const isActive = status === 'active' || status === 'trialing';
    const videosLimit = await this.getPlanLimit(plan);

    if (!subscription) {
      subscription = Subscription.create(
        uuidv4(),
        userId,
        plan,
        videosLimit,
        null,
        subscriptionId,
        null,
      );
      const newSubscription = subscription.updateActiveStatus(isActive);
      await this.subscriptionRepository.createSubscription(newSubscription);
    } else {
      const updated = subscription
        .updatePlan(plan, videosLimit)
        .updateStripeIds(subscription.stripeCustomerId, subscriptionId)
        .updateActiveStatus(isActive);
      await this.subscriptionRepository.updateSubscription(updated);
    }
  }

  // ─── PayPal Webhook ───────────────────────────────────────────────────

  async handlePayPalWebhook(
    eventType: string,
    resource: Record<string, unknown>,
  ): Promise<void> {
    const subscriptionId =
      typeof resource.id === 'string' ? resource.id : undefined;
    const customId =
      typeof resource.custom_id === 'string' ? resource.custom_id : undefined;

    if (!subscriptionId) return;

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        if (!customId) return;
        const sep = customId.indexOf('|');
        if (sep === -1) return;
        const userId = customId.slice(0, sep);
        const planStr = customId.slice(sep + 1);
        const planMap: Record<string, SubscriptionPlan> = {
          starter: SubscriptionPlan.STARTER,
          creator: SubscriptionPlan.CREATOR,
          pro: SubscriptionPlan.PRO,
        };
        const plan = planMap[planStr];
        if (!plan || !userId) return;

        const videosLimit = await this.getPlanLimit(plan);
        let subscription =
          await this.subscriptionRepository.getSubscriptionByUserId(userId);

        if (!subscription) {
          subscription = Subscription.create(
            uuidv4(),
            userId,
            plan,
            videosLimit,
            null,
            null,
            subscriptionId,
          );
          const active = subscription.updateActiveStatus(true);
          await this.subscriptionRepository.createSubscription(active);
        } else {
          const updated = subscription
            .updatePlan(plan, videosLimit)
            .updatePaypalSubscriptionId(subscriptionId)
            .updateActiveStatus(true);
          await this.subscriptionRepository.updateSubscription(updated);
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        if (!customId) return;
        const sep = customId.indexOf('|');
        if (sep === -1) return;
        const userId = customId.slice(0, sep);
        if (!userId) return;

        const subscription =
          await this.subscriptionRepository.getSubscriptionByUserId(userId);
        if (!subscription) return;

        const updated = subscription.updateActiveStatus(false);
        await this.subscriptionRepository.updateSubscription(updated);
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Recurring payment received - subscription continues
        this.logger.log('PayPal recurring payment received');
        break;
      }

      default:
        break;
    }
  }

  // ─── Mock Subscription (dev/testing) ──────────────────────────────────

  async activateMockSubscription(
    userId: string,
    plan: SubscriptionPlan,
  ): Promise<{ message: string; plan: SubscriptionPlan }> {
    const videosLimit = await this.getPlanLimit(plan);
    let subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);

    if (!subscription) {
      subscription = Subscription.create(
        uuidv4(),
        userId,
        plan,
        videosLimit,
        null,
        null,
        null,
      );
      const newSubscription = subscription.updateActiveStatus(true);
      await this.subscriptionRepository.createSubscription(newSubscription);
    } else {
      const currentRemaining = subscription.getRemaining();
      const totalVideos = currentRemaining + videosLimit;

      const updated = subscription
        .updatePlan(plan, totalVideos)
        .updateActiveStatus(true);
      await this.subscriptionRepository.updateSubscription(updated);
    }

    return { message: 'Subscription activated successfully', plan };
  }
}
