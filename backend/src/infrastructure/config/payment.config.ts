import { registerAs } from '@nestjs/config';

/** Pricing region: global (default) or mea (Middle East & Africa). Set via PRICING_REGION. */
export type PricingRegion = 'global' | 'mea';

/** PayPal billing plan IDs by region. Resolved server-side so clients cannot override. */
export const PAYPAL_PLAN_IDS_BY_REGION: Record<
  PricingRegion,
  Record<string, string>
> = {
  global: {
    'starter-monthly': 'P-75882301ND5681332NGRKOXA',
    'starter-yearly': 'P-6DY751180M643744MNGRKQPY',
    'creator-monthly': 'P-7Y517839V5545894MNGRKU5Y',
    'creator-yearly': 'P-1H4124281G8816200NGRKTTI',
    'pro-monthly': 'P-12788584S1812424DNGRKVTY',
    'pro-yearly': 'P-4RV53746V8610891XNGRKXGI', // Add when Pro Yearly is created in PayPal
  },
  mea: {
    'starter-monthly': 'P-59697990383382252NGRKPMI',
    'starter-yearly': 'P-1F79038650783411XNGRKRCY',
    'creator-monthly': 'P-1A6018685X745000MNGRKUMQ',
    'creator-yearly': 'P-3US52302RD616225KNGRKT6A',
    'pro-monthly': 'P-09T053911R890533CNGRKV5A',
    'pro-yearly': 'P-3UY68319TA620063UNGRKWWA',
  },
};

export default registerAs('payment', () => {
  const regionRaw = process.env.PRICING_REGION?.toLowerCase();
  const pricingRegion: PricingRegion =
    regionRaw === 'mea' ? 'mea' : 'global';

  return {
  provider: process.env.PAYMENT_PROVIDER || 'paypal',

  /** Server-side pricing region; used to resolve PayPal plan IDs. Not sent by client. */
  pricingRegion,

  // Stripe credentials (when PAYMENT_PROVIDER=stripe)
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIds: {
      starter: process.env.STRIPE_PRICE_ID_STARTER || '',
      creator: process.env.STRIPE_PRICE_ID_CREATOR || '',
      pro: process.env.STRIPE_PRICE_ID_PRO || '',
    },
  },

  // PayPal credentials
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    secret: process.env.PAYPAL_SECRET || '',
    environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
  },

  // Single-shot one-time purchase amount (EUR); pricing managed on PayPal
  singleShotAmount: Number(process.env.SINGLE_SHOT_AMOUNT || '10') || 10,
};
});
