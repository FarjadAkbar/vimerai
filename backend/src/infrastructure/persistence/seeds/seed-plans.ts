/**
 * Standalone seed script for the `plans` table.
 *
 * Usage:
 *   pnpm seed:plans            – seed only if empty
 *   pnpm seed:plans --force    – drop existing rows and re-seed
 *
 * Reads PayPal plan IDs from .env and populates both sandbox and live columns.
 * Switch between sandbox/live at runtime by changing PAYPAL_ENVIRONMENT in .env.
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { PlanEntity } from '@/infrastructure/persistence/typeorm/entities/plan.entity';
import { UserEntity } from '@/infrastructure/persistence/typeorm/entities/user.entity';
import { VideoEntity } from '@/infrastructure/persistence/typeorm/entities/video.entity';
import { PromptTemplateEntity } from '@/infrastructure/persistence/typeorm/entities/prompt-template.entity';
import { SubscriptionEntity } from '@/infrastructure/persistence/typeorm/entities/subscription.entity';

config(); // load .env

const force = process.argv.includes('--force');

interface SeedPlan {
  slug: string;
  name: string;
  type: 'subscription' | 'one-time';
  videosPerMonth: number;
  monthlyPrice: number;
  yearlyDiscount: number;
  // PayPal sandbox
  paypalSandboxMonthly: string | null;
  paypalSandboxYearly: string | null;
  // PayPal live
  paypalLiveMonthly: string | null;
  paypalLiveYearly: string | null;
  // Stripe
  stripeTestPriceId: string | null;
  stripeLivePriceId: string | null;
  description: string;
  popular: boolean;
  sortOrder: number;
  region: string;
}

const env = process.env;

function envOrNull(key: string): string | null {
  return env[key] || null;
}

const PLANS: SeedPlan[] = [
  {
    slug: 'starter',
    name: 'Starter',
    type: 'subscription',
    videosPerMonth: 10,
    monthlyPrice: 9.99,
    yearlyDiscount: 0.15,
    paypalSandboxMonthly: envOrNull('PAYPAL_PLAN_ID_STARTER_MONTHLY'),
    paypalSandboxYearly: envOrNull('PAYPAL_PLAN_ID_STARTER_YEARLY'),
    paypalLiveMonthly: envOrNull('PAYPAL_LIVE_PLAN_ID_STARTER_MONTHLY'),
    paypalLiveYearly: envOrNull('PAYPAL_LIVE_PLAN_ID_STARTER_YEARLY'),
    stripeTestPriceId: envOrNull('STRIPE_PRICE_ID_STARTER'),
    stripeLivePriceId: envOrNull('STRIPE_LIVE_PRICE_ID_STARTER'),
    description: 'Perfect for getting started - 10 videos per month',
    popular: false,
    sortOrder: 1,
    region: 'europe',
  },
  {
    slug: 'creator',
    name: 'AI Creator',
    type: 'subscription',
    videosPerMonth: 50,
    monthlyPrice: 29.99,
    yearlyDiscount: 0.15,
    paypalSandboxMonthly: envOrNull('PAYPAL_PLAN_ID_CREATOR_MONTHLY'),
    paypalSandboxYearly: envOrNull('PAYPAL_PLAN_ID_CREATOR_YEARLY'),
    paypalLiveMonthly: envOrNull('PAYPAL_LIVE_PLAN_ID_CREATOR_MONTHLY'),
    paypalLiveYearly: envOrNull('PAYPAL_LIVE_PLAN_ID_CREATOR_YEARLY'),
    stripeTestPriceId: envOrNull('STRIPE_PRICE_ID_CREATOR'),
    stripeLivePriceId: envOrNull('STRIPE_LIVE_PRICE_ID_CREATOR'),
    description: 'For content creators and marketers - 50 videos per month',
    popular: true,
    sortOrder: 2,
    region: 'europe',
  },
  {
    slug: 'pro',
    name: 'Pro',
    type: 'subscription',
    videosPerMonth: 200,
    monthlyPrice: 99.99,
    yearlyDiscount: 0.15,
    paypalSandboxMonthly: envOrNull('PAYPAL_PLAN_ID_PRO_MONTHLY'),
    paypalSandboxYearly: envOrNull('PAYPAL_PLAN_ID_PRO_YEARLY'),
    paypalLiveMonthly: envOrNull('PAYPAL_LIVE_PLAN_ID_PRO_MONTHLY'),
    paypalLiveYearly: envOrNull('PAYPAL_LIVE_PLAN_ID_PRO_YEARLY'),
    stripeTestPriceId: envOrNull('STRIPE_PRICE_ID_PRO'),
    stripeLivePriceId: envOrNull('STRIPE_LIVE_PRICE_ID_PRO'),
    description: 'For professional creators - 200 videos per month',
    popular: false,
    sortOrder: 3,
    region: 'europe',
  },
  {
    slug: 'single-shot',
    name: 'Single Shot',
    type: 'one-time',
    videosPerMonth: 1,
    monthlyPrice: 4.99,
    yearlyDiscount: 0,
    paypalSandboxMonthly: null,
    paypalSandboxYearly: null,
    paypalLiveMonthly: null,
    paypalLiveYearly: null,
    stripeTestPriceId: null,
    stripeLivePriceId: null,
    description: 'One-time purchase - 1 video credit, no expiration',
    popular: false,
    sortOrder: 4,
    region: 'europe',
  },
];

async function main(): Promise<void> {
  const isRemote =
    process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');

  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vimerai',
    ssl: isRemote ? { rejectUnauthorized: false } : false,
    entities: [
      PlanEntity,
      UserEntity,
      VideoEntity,
      PromptTemplateEntity,
      SubscriptionEntity,
    ],
    synchronize: true,
    logging: false,
  });

  await ds.initialize();
  console.log('Database connected.');

  const repo = ds.getRepository(PlanEntity);

  if (force) {
    console.log('--force: deleting all existing plans...');
    await repo.clear();
  }

  const existing = await repo.count();
  if (existing > 0 && !force) {
    console.log(
      `Plans table already has ${existing} rows. Use --force to re-seed.`,
    );
    await ds.destroy();
    return;
  }

  console.log(`Seeding ${PLANS.length} plans...\n`);

  for (const p of PLANS) {
    const entity = new PlanEntity();
    entity.id = uuidv4();
    entity.slug = p.slug;
    entity.name = p.name;
    entity.type = p.type;
    entity.videosPerMonth = p.videosPerMonth;
    entity.monthlyPrice = p.monthlyPrice;
    entity.yearlyDiscount = p.yearlyDiscount;
    entity.paypalSandboxMonthly = p.paypalSandboxMonthly;
    entity.paypalSandboxYearly = p.paypalSandboxYearly;
    entity.paypalLiveMonthly = p.paypalLiveMonthly;
    entity.paypalLiveYearly = p.paypalLiveYearly;
    entity.stripeTestPriceId = p.stripeTestPriceId;
    entity.stripeLivePriceId = p.stripeLivePriceId;
    entity.description = p.description;
    entity.popular = p.popular;
    entity.sortOrder = p.sortOrder;
    entity.isActive = true;
    entity.region = p.region;

    await repo.save(entity);

    console.log(`  ${p.name} (${p.slug}) - EUR ${p.monthlyPrice}`);
    if (p.paypalSandboxMonthly || p.paypalSandboxYearly) {
      console.log(
        `    PayPal sandbox: monthly=${p.paypalSandboxMonthly || '-'} yearly=${p.paypalSandboxYearly || '-'}`,
      );
    }
    if (p.paypalLiveMonthly || p.paypalLiveYearly) {
      console.log(
        `    PayPal live:    monthly=${p.paypalLiveMonthly || '-'} yearly=${p.paypalLiveYearly || '-'}`,
      );
    }
    if (p.stripeTestPriceId || p.stripeLivePriceId) {
      console.log(
        `    Stripe:         test=${p.stripeTestPriceId || '-'} live=${p.stripeLivePriceId || '-'}`,
      );
    }
  }

  console.log('\nDone. Plans seeded successfully.');
  await ds.destroy();
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
