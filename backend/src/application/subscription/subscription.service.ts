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
import {
  PAYPAL_PLAN_IDS_BY_REGION,
  type PricingRegion,
} from '@/infrastructure/config/payment.config';

@Injectable()
export class SubscriptionService implements ISubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

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
  ) {}

  /** Resolve video-per-month limit for a plan from DB, with fallback */
  private async getPlanLimit(plan: SubscriptionPlan): Promise<number> {
    const dbPlan = await this.planRepository.getPlanBySlug(plan);
    if (dbPlan) return dbPlan.videosPerMonth;
    // Fallback if DB is empty (should not happen after seed); must match seed-plans.ts
    const fallback: Record<string, number> = {
      starter: 3,
      creator: 6,
      pro: 10,
    };
    return fallback[plan] ?? 0;
  }

  getPricingRegion(regionOverride?: PricingRegion | null): { region: 'global' | 'mea' } {
    const region =
      regionOverride ??
      this.configService.get<PricingRegion>('payment.pricingRegion') ??
      'global';
    return { region };
  }

  async getCurrentSubscription(userId: string): Promise<{
    plan: SubscriptionPlan;
    billingPeriod: 'monthly' | 'yearly' | null;
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
        billingPeriod: null,
        videosRemaining: 0,
        limit: 0,
        singleShotCredits,
      };
    }

    return {
      plan: subscription.plan,
      billingPeriod: subscription.billingPeriod,
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

  async canGenerate(
    userId: string,
    creditsNeeded = 1,
  ): Promise<boolean> {
    const needed = Math.max(1, creditsNeeded);
    const user = await this.userRepository.getUserById(userId);
    const singleShotCredits = user?.singleShotCredits ?? 0;
    if (singleShotCredits >= needed) {
      return true;
    }

    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);
    if (!subscription) {
      return false;
    }

    return subscription.canGenerate(needed);
  }

  async recordVideoGeneration(
    userId: string,
    creditsNeeded = 1,
  ): Promise<void> {
    const needed = Math.max(1, creditsNeeded);
    const user = await this.userRepository.getUserById(userId);
    const singleShotCredits = user?.singleShotCredits ?? 0;

    if (user && singleShotCredits >= needed) {
      const updatedUser = user.consumeSingleShotCredits(needed);
      await this.userRepository.updateUser(updatedUser);
      return;
    }

    const subscription =
      await this.subscriptionRepository.getSubscriptionByUserId(userId);
    if (!subscription) {
      return;
    }

    const updated = subscription.incrementUsage(needed);
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
    const amount =
      this.configService.get<number>('payment.singleShotAmount') ?? 10;

    return this.paymentService.createSingleShotOrder({
      userId,
      amount,
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
    regionOverride?: PricingRegion | null,
  ): Promise<{ sessionId: string; url: string }> {
    const pricingRegion: PricingRegion =
      regionOverride ??
      this.configService.get<PricingRegion>('payment.pricingRegion') ??
      'global';
    const regionPlans = PAYPAL_PLAN_IDS_BY_REGION[pricingRegion];
    const planKey = `${plan}-${billingPeriod}`;
    const paypalPlanId = regionPlans[planKey];
    if (!paypalPlanId) {
      throw new BadRequestException(
        `PayPal plan for ${plan} (${billingPeriod}) is not configured for region ${pricingRegion}`,
      );
    }
    return this.paymentService.createCheckoutSession({
      userId,
      plan,
      billingPeriod,
      paypalPlanId,
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
        result.billingPeriod,
      );
      const active = subscription.updateActiveStatus(true);
      await this.subscriptionRepository.createSubscription(active);
    } else {
      const currentRemaining = subscription.getRemaining();
      const totalVideos = currentRemaining + videosLimit;

      const updated = subscription
        .updatePlan(result.plan, totalVideos)
        .updatePaypalSubscriptionId(result.paypalSubscriptionId)
        .updateBillingPeriod(result.billingPeriod)
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
        const parts = customId.split('|');
        if (parts.length < 2) return;
        const userId = parts[0];
        const planStr = parts[1];
        const billingPeriod =
          parts[2] === 'yearly' ? ('yearly' as const) : ('monthly' as const);
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
            billingPeriod,
          );
          const active = subscription.updateActiveStatus(true);
          await this.subscriptionRepository.createSubscription(active);
        } else {
          const updated = subscription
            .updatePlan(plan, videosLimit)
            .updatePaypalSubscriptionId(subscriptionId)
            .updateBillingPeriod(billingPeriod)
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