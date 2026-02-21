import { registerAs } from '@nestjs/config';

/** Pricing region: global (default) or mea (Middle East & Africa). Set via PRICING_REGION. */
export type PricingRegion = 'global' | 'mea';

/** PayPal billing plan IDs by region. Resolved server-side so clients cannot override. */
export const PAYPAL_PLAN_IDS_BY_REGION: Record<
  PricingRegion,
  Record<string, string>
> = {
  global: {
    'starter-monthly': 'P-5RB13907GD995821JNGIBRNY',
    'starter-yearly': 'P-47G2072900228090SNGIBRVQ',
    'creator-monthly': 'P-2NY89093PP844033WNGIBR3I',
    'creator-yearly': 'P-84P92151Y06445051NGIBSCQ',
    'pro-monthly': 'P-2436777566582301GNGIBSII',
    'pro-yearly': '', // Add when Pro Yearly is created in PayPal
  },
  mea: {
    'starter-monthly': 'P-9XX436710M2019608NGMY6SI',
    'starter-yearly': 'P-6CE45123R0141430BNGMY6PI',
    'creator-monthly': 'P-3KU15133MU8595837NGMY6MI',
    'creator-yearly': 'P-2B2535621A749143CNGMY6JA',
    'pro-monthly': 'P-01W64641HT0541055NGMY6DQ',
    'pro-yearly': 'P-656176366S7907807NGMY57Y',
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
