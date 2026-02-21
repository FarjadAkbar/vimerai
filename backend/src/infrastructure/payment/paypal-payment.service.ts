import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  Client,
  Environment,
  OrdersController,
  CheckoutPaymentIntent,
  OrderRequest,
  Order,
} from '@paypal/paypal-server-sdk';
import {
  IPaymentService,
  CreateCheckoutSessionDto,
  CreateSingleShotOrderDto,
  ActivateSubscriptionResult,
} from '@/core/ports/payment.service';
import { SubscriptionPlan } from '@/domain/subscription.entity';

interface PayPalConfig {
  clientId: string;
  secret: string;
  environment: string;
  webhookId: string;
}

@Injectable()
export class PayPalPaymentService implements IPaymentService {
  private readonly logger = new Logger(PayPalPaymentService.name);
  private readonly client: Client;
  private readonly ordersController: OrdersController;
  private readonly httpClient: AxiosInstance;
  private readonly paypalConfig: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly configService: ConfigService) {
    const paypal = this.configService.get<PayPalConfig>('payment.paypal');

    if (!paypal?.clientId || !paypal?.secret) {
      throw new Error(
        'PayPal configuration is missing (PAYPAL_CLIENT_ID, PAYPAL_SECRET)',
      );
    }

    this.paypalConfig = paypal;

    const baseURL =
      paypal.environment === 'production'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    this.httpClient = axios.create({ baseURL });

    // SDK client for Orders API (Single Shot one-time payments)
    this.client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: paypal.clientId,
        oAuthClientSecret: paypal.secret,
      },
      environment:
        paypal.environment === 'production'
          ? Environment.Production
          : Environment.Sandbox,
    });
    this.ordersController = new OrdersController(this.client);
  }

  // ─── OAuth2 Token Management ────────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${this.paypalConfig.clientId}:${this.paypalConfig.secret}`,
    ).toString('base64');

    try {
      const response = await this.httpClient.post(
        '/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Refresh 60 seconds before expiry
      this.tokenExpiresAt =
        Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken!;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to get PayPal token';
      this.logger.error(`PayPal OAuth failed: ${message}`);
      throw new BadRequestException('PayPal authentication failed');
    }
  }

  // ─── Subscription (Recurring) ───────────────────────────────────────────

  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<{ sessionId: string; url: string }> {
    // paypalPlanId is resolved from the plans DB table by the subscription service
    const planId = dto.paypalPlanId;

    if (!planId) {
      throw new BadRequestException(
        `PayPal plan ID is required for checkout. Provide paypalPlanId from frontend config.`,
      );
    }

    const token = await this.getAccessToken();

    try {
      const response = await this.httpClient.post(
        '/v1/billing/subscriptions',
        {
          plan_id: planId,
          custom_id: `${dto.userId}|${dto.plan}`,
          application_context: {
            brand_name: 'Vimerai',
            locale: 'en-US',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: dto.successUrl,
            cancel_url: dto.cancelUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
        },
      );

      const subscriptionId: string = response.data.id;
      const approveLink = (
        response.data.links as Array<{ rel: string; href: string }>
      )?.find((l) => l.rel === 'approve')?.href;

      if (!subscriptionId || !approveLink) {
        throw new BadRequestException(
          'PayPal subscription creation failed - no approval link',
        );
      }

      this.logger.log(
        `Created PayPal subscription ${subscriptionId} for user ${dto.userId}, plan ${dto.plan} (${dto.billingPeriod})`,
      );

      return {
        sessionId: subscriptionId,
        url: approveLink,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `PayPal subscription create failed: ${JSON.stringify(error.response?.data)}`,
        );
      }
      const message =
        error instanceof Error ? error.message : 'PayPal subscription failed';
      throw new BadRequestException(
        `PayPal subscription checkout failed: ${message}`,
      );
    }
  }

  async activateSubscription(
    subscriptionId: string,
  ): Promise<ActivateSubscriptionResult | null> {
    const token = await this.getAccessToken();

    try {
      // Get subscription details from PayPal
      const response = await this.httpClient.get(
        `/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data;
      const status: string = data.status;
      const customId: string | undefined = data.custom_id;

      this.logger.log(
        `PayPal subscription ${subscriptionId} status: ${status}, custom_id: ${customId}`,
      );

      // Subscription must be ACTIVE (user_action: SUBSCRIBE_NOW auto-activates)
      if (status !== 'ACTIVE') {
        this.logger.warn(
          `Subscription ${subscriptionId} is not active (status: ${status})`,
        );
        return null;
      }

      if (!customId) {
        this.logger.warn(
          `Subscription ${subscriptionId} has no custom_id`,
        );
        return null;
      }

      // Parse custom_id: "userId|plan"
      const sep = customId.indexOf('|');
      if (sep === -1) return null;

      const userId = customId.slice(0, sep);
      const planStr = customId.slice(sep + 1);

      const planMap: Record<string, SubscriptionPlan> = {
        starter: SubscriptionPlan.STARTER,
        creator: SubscriptionPlan.CREATOR,
        pro: SubscriptionPlan.PRO,
      };

      const plan = planMap[planStr];
      if (!plan || !userId) return null;

      return {
        userId,
        plan,
        paypalSubscriptionId: subscriptionId,
        status,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `PayPal subscription verify failed: ${JSON.stringify(error.response?.data)}`,
        );
      }
      const message =
        error instanceof Error ? error.message : 'Verification failed';
      this.logger.warn(
        `PayPal subscription activation failed for ${subscriptionId}: ${message}`,
      );
      return null;
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    reason = 'Customer requested cancellation',
  ): Promise<boolean> {
    const token = await this.getAccessToken();

    try {
      await this.httpClient.post(
        `/v1/billing/subscriptions/${subscriptionId}/cancel`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Cancelled PayPal subscription ${subscriptionId}`);
      return true;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `PayPal subscription cancel failed: ${JSON.stringify(error.response?.data)}`,
        );
      }
      return false;
    }
  }

  // ─── Portal Session (not applicable for PayPal) ─────────────────────────

  async createPortalSession(
    _userId: string,
    _customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    // PayPal doesn't have a customer portal like Stripe.
    // Return the return URL so the user stays on the app.
    return { url: returnUrl };
  }

  // ─── Single Shot (One-Time Order) ──────────────────────────────────────

  async createSingleShotOrder(
    dto: CreateSingleShotOrderDto,
  ): Promise<{ orderId: string; url: string }> {
    const orderRequest: OrderRequest = {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: dto.currency,
            value: dto.amount.toFixed(2),
          },
          description: 'Single Shot - 1 video credit',
          customId: dto.userId,
        },
      ],
      applicationContext: {
        returnUrl: dto.successUrl,
        cancelUrl: dto.cancelUrl,
        brandName: 'Vimerai',
      },
    };

    try {
      const response = await this.ordersController.createOrder({
        body: orderRequest,
      });

      const orderId = response.result?.id;
      const approveLink = response.result?.links?.find(
        (l) => l.rel === 'approve',
      )?.href;

      if (!orderId || !approveLink) {
        throw new BadRequestException('PayPal order creation failed');
      }

      return { orderId, url: approveLink };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'PayPal order failed';
      this.logger.warn(message);
      throw new BadRequestException(`PayPal order failed: ${message}`);
    }
  }

  async captureSingleShotOrder(
    orderId: string,
  ): Promise<{ userId: string } | null> {
    try {
      const orderResponse = await this.ordersController.getOrder({
        id: orderId,
      });
      const order = orderResponse.result as Order | undefined;
      if (!order) return null;

      const customId = order.purchaseUnits?.[0]?.customId ?? null;
      if (!customId) return null;

      await this.ordersController.captureOrder({ id: orderId });

      return { userId: customId };
    } catch (error: unknown) {
      this.logger.warn(
        `PayPal capture failed for order ${orderId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  // ─── Webhooks ──────────────────────────────────────────────────────────

  handleWebhook(
    payload: string | Buffer,
    _signature: string,
  ): { type: string; data: Record<string, unknown> } {
    try {
      const body =
        typeof payload === 'string' ? payload : payload.toString('utf8');
      const parsed = JSON.parse(body) as Record<string, unknown>;
      const eventType = (parsed.event_type as string) || 'unknown';
      const resource = (parsed.resource as Record<string, unknown>) || {};
      return { type: eventType, data: resource };
    } catch {
      return { type: 'unknown', data: {} };
    }
  }

}
