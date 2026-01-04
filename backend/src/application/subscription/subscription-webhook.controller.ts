import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import type { IPaymentService } from '@/core/ports/payment.service';
import { Inject } from '@nestjs/common';
import { SubscriptionPlan } from '@/domain/subscription.entity';

@Controller('webhooks/stripe')
export class SubscriptionWebhookController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject('IPaymentService')
    private readonly paymentService: IPaymentService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const payload = req.rawBody || req.body;

    const event = this.paymentService.handleWebhook(payload, signature);

    // Handle different Stripe event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as SubscriptionPlan;

        if (userId && plan) {
          await this.subscriptionService.handleStripeWebhook(
            session.customer as string,
            session.subscription as string,
            plan,
            'active',
          );
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data;
        const customerId = subscription.customer as string;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        // Extract plan from subscription items
        const planItem = subscription.items?.data?.[0];
        const priceId = planItem?.price?.id;

        // Map price ID to plan (you'll need to configure this)
        const plan = this.mapPriceIdToPlan(priceId);

        if (plan && customerId) {
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
        const subscription = event.data;
        const customerId = subscription.customer as string;

        // Deactivate subscription
        await this.subscriptionService.handleStripeWebhook(
          customerId,
          subscription.id,
          SubscriptionPlan.STARTER, // Default to starter on cancellation
          'canceled',
        );
        break;
      }

      default:
        // Log unhandled events
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private mapPriceIdToPlan(priceId: string): SubscriptionPlan | null {
    // This should match your Stripe price IDs
    // You can store this mapping in config or database
    const priceIdMap: Record<string, SubscriptionPlan> = {
      [process.env.STRIPE_PRICE_ID_STARTER || '']: SubscriptionPlan.STARTER,
      [process.env.STRIPE_PRICE_ID_CREATOR || '']: SubscriptionPlan.CREATOR,
      [process.env.STRIPE_PRICE_ID_PRO || '']: SubscriptionPlan.PRO,
    };

    return priceIdMap[priceId] || null;
  }
}
