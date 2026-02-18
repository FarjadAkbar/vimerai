import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import type { IPaymentService } from '@/core/ports/payment.service';
import { Inject } from '@nestjs/common';
import { PAYMENT_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';
import { SubscriptionPlan } from '@/domain/subscription.entity';

// ─── PayPal Webhook Controller ──────────────────────────────────────────

@Controller('webhooks/paypal')
export class PayPalWebhookController {
  private readonly logger = new Logger(PayPalWebhookController.name);

  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject(PAYMENT_SERVICE_TOKEN)
    private readonly paymentService: IPaymentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('paypal-transmission-id') transmissionId: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;
    let payload: string | Buffer;
    if (rawBody) {
      payload = rawBody;
    } else if (typeof req.body === 'string') {
      payload = req.body;
    } else {
      payload = JSON.stringify(req.body);
    }

    const event = this.paymentService.handleWebhook(
      payload,
      transmissionId || '',
    );

    this.logger.log(`PayPal webhook event: ${event.type}`);

    await this.subscriptionService.handlePayPalWebhook(event.type, event.data);

    return { received: true };
  }
}

// ─── Stripe Webhook Controller (kept for backward compat) ───────────────

@Controller('webhooks/stripe')
export class SubscriptionWebhookController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject(PAYMENT_SERVICE_TOKEN)
    private readonly paymentService: IPaymentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;
    let payload: string | Buffer;
    if (rawBody) {
      payload = rawBody;
    } else if (typeof req.body === 'string') {
      payload = req.body;
    } else {
      payload = JSON.stringify(req.body);
    }

    const event = this.paymentService.handleWebhook(payload, signature);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data as {
          metadata?: { userId?: string; plan?: string };
          customer?: unknown;
          subscription?: unknown;
        };
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as SubscriptionPlan | undefined;
        const subscriptionId = session.subscription as string | undefined;

        if (userId && plan && subscriptionId) {
          await this.subscriptionService.handleStripeWebhook(
            userId,
            subscriptionId,
            plan,
            'active',
          );
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data as {
          customer?: unknown;
          id?: unknown;
          status?: string;
          items?: {
            data?: Array<{
              price?: { id?: string };
            }>;
          };
        };
        const customerId = subscription.customer as string | undefined;
        const subscriptionId = subscription.id as string | undefined;
        const status = subscription.status;

        const planItem = subscription.items?.data?.[0];
        const priceId = planItem?.price?.id;
        const plan = priceId ? this.mapPriceIdToPlan(priceId) : null;

        if (plan && customerId && subscriptionId && status) {
          await this.subscriptionService.handleStripeWebhook(
            customerId,
            subscriptionId,
            plan,
            status,
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data as {
          customer?: unknown;
          id?: unknown;
        };
        const customerId = subscription.customer as string | undefined;
        const subscriptionId = subscription.id as string | undefined;

        if (customerId && subscriptionId) {
          await this.subscriptionService.handleStripeWebhook(
            customerId,
            subscriptionId,
            SubscriptionPlan.STARTER,
            'canceled',
          );
        }
        break;
      }

      default:
        break;
    }

    return { received: true };
  }

  private mapPriceIdToPlan(priceId: string): SubscriptionPlan | null {
    const priceIdMap: Record<string, SubscriptionPlan> = {
      [process.env.STRIPE_PRICE_ID_STARTER || '']: SubscriptionPlan.STARTER,
      [process.env.STRIPE_PRICE_ID_CREATOR || '']: SubscriptionPlan.CREATOR,
      [process.env.STRIPE_PRICE_ID_PRO || '']: SubscriptionPlan.PRO,
    };

    return priceIdMap[priceId] || null;
  }
}
