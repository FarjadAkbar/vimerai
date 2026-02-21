import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  provider: process.env.PAYMENT_PROVIDER || 'paypal',

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
}));
