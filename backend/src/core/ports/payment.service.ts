import { SubscriptionPlan } from '@/domain/subscription.entity';

export type BillingPeriod = 'monthly' | 'yearly';

export interface CreateCheckoutSessionDto {
  userId: string;
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  paypalPlanId?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface ActivateSubscriptionResult {
  userId: string;
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
  paypalSubscriptionId: string;
  status: string;
}

export interface CreateSingleShotOrderDto {
  userId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateSingleShotOrderResult {
  orderId: string;
  url: string;
}

export interface IPaymentService {
  createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<CreateCheckoutSessionResult>;

  activateSubscription(
    subscriptionId: string,
  ): Promise<ActivateSubscriptionResult | null>;

  cancelSubscription(
    subscriptionId: string,
    reason?: string,
  ): Promise<boolean>;

  createPortalSession(
    userId: string,
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }>;

  createSingleShotOrder(
    dto: CreateSingleShotOrderDto,
  ): Promise<CreateSingleShotOrderResult>;

  captureSingleShotOrder(
    orderId: string,
  ): Promise<{ userId: string } | null>;

  handleWebhook(
    payload: string | Buffer,
    signature: string,
  ): { type: string; data: Record<string, unknown> };
}
