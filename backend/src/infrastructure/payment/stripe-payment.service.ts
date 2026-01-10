import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  IPaymentService,
  CreateCheckoutSessionDto,
} from '@/core/ports/payment.service';
import { SubscriptionPlan } from '@/domain/subscription.entity';

@Injectable()
export class StripePaymentService implements IPaymentService {
  private stripe: Stripe;
  private readonly stripeConfig: {
    secretKey: string;
    webhookSecret: string;
    priceIds: {
      starter: string;
      creator: string;
      pro: string;
    };
  };

  constructor(private readonly configService: ConfigService) {
    const paymentConfig = this.configService.get<{
      stripe: {
      secretKey: string;
      webhookSecret: string;
      priceIds: {
        starter: string;
        creator: string;
        pro: string;
      };
      };
    }>('payment');

    if (!paymentConfig?.stripe) {
      throw new Error('Stripe configuration is missing');
    }

    this.stripeConfig = paymentConfig.stripe;
    this.stripe = new Stripe(this.stripeConfig.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<{ sessionId: string; url: string }> {
    const priceId = this.getPriceId(dto.plan);

    if (!priceId) {
      throw new BadRequestException(
        `Price ID not configured for plan: ${dto.plan}`,
      );
    }

    try {
      // Create or retrieve Stripe customer
      const customers = await this.stripe.customers.list({
        email: dto.userId, // In production, use actual user email
        limit: 1,
      });

      let customerId: string;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await this.stripe.customers.create({
          metadata: { userId: dto.userId },
        });
        customerId = customer.id;
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: {
          userId: dto.userId,
          plan: dto.plan,
        },
      });

      return {
        sessionId: session.id,
        url: session.url || '',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async createPortalSession(
    userId: string,
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create portal session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  handleWebhook(
    payload: string | Buffer,
    signature: string,
  ): { type: string; data: any } {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.stripeConfig.webhookSecret,
      );

      return {
        type: event.type,
        data: event.data.object,
      };
    } catch (error) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private getPriceId(plan: SubscriptionPlan): string | null {
    return this.stripeConfig.priceIds[plan] || null;
  }
}
