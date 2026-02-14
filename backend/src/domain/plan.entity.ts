export type PlanType = 'subscription' | 'one-time';

export class Plan {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly type: PlanType,
    public readonly videosPerMonth: number,
    public readonly monthlyPrice: number,
    public readonly yearlyDiscount: number,
    // PayPal plan IDs — sandbox
    public readonly paypalSandboxMonthly: string | null,
    public readonly paypalSandboxYearly: string | null,
    // PayPal plan IDs — live
    public readonly paypalLiveMonthly: string | null,
    public readonly paypalLiveYearly: string | null,
    // Stripe price IDs
    public readonly stripeTestPriceId: string | null,
    public readonly stripeLivePriceId: string | null,
    public readonly description: string,
    public readonly popular: boolean,
    public readonly sortOrder: number,
    public readonly isActive: boolean,
    public readonly region: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get yearlyPrice(): number {
    return (
      Math.round(
        this.monthlyPrice * 12 * (1 - this.yearlyDiscount) * 100,
      ) / 100
    );
  }

  /** Resolve the PayPal plan ID for the given environment and billing period */
  getPaypalPlanId(
    environment: string,
    billingPeriod: 'monthly' | 'yearly',
  ): string | null {
    const isLive = environment === 'production' || environment === 'live';
    if (billingPeriod === 'monthly') {
      return isLive ? this.paypalLiveMonthly : this.paypalSandboxMonthly;
    }
    return isLive ? this.paypalLiveYearly : this.paypalSandboxYearly;
  }

  /** Resolve the Stripe price ID for the given environment */
  getStripePriceId(environment: string): string | null {
    const isLive = environment === 'production' || environment === 'live';
    return isLive ? this.stripeLivePriceId : this.stripeTestPriceId;
  }
}
