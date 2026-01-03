import { SubscriptionPlan } from '@/domain/subscription.entity';

export interface CreateCheckoutSessionDto {
  userId: string;
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface IPaymentService {
  createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<CreateCheckoutSessionResult>;
  createPortalSession(
    userId: string,
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }>;
  handleWebhook(
    payload: string | Buffer,
    signature: string,
  ): { type: string; data: any };
}
