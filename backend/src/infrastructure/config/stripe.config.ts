import { registerAs } from '@nestjs/config';

export default registerAs('stripe', () => ({
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  priceIds: {
    starter: process.env.STRIPE_PRICE_ID_STARTER || '',
    creator: process.env.STRIPE_PRICE_ID_CREATOR || '',
    pro: process.env.STRIPE_PRICE_ID_PRO || '',
  },
}));
