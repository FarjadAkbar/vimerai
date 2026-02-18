import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  SubscriptionController,
  SubscriptionPublicController,
} from './subscription.controller';
import {
  SubscriptionWebhookController,
  PayPalWebhookController,
} from './subscription-webhook.controller';
import { SubscriptionService } from './subscription.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmSubscriptionRepository } from '@/infrastructure/persistence/typeorm/repositories/subscription.repository';
import { TypeOrmUserRepository } from '@/infrastructure/persistence/typeorm/repositories/user.repository';
import { TypeOrmVideoRepository } from '@/infrastructure/persistence/typeorm/repositories/video.repository';
import { TypeOrmPlanRepository } from '@/infrastructure/persistence/typeorm/repositories/plan.repository';
import { PaymentModule } from '@/infrastructure/payment/payment.module';
import {
  USER_REPOSITORY_TOKEN,
  PLAN_REPOSITORY_TOKEN,
} from '@/core/tokens/injection.tokens';

@Module({
  imports: [DatabaseModule, PaymentModule, ConfigModule],
  controllers: [
    SubscriptionController,
    SubscriptionPublicController,
    SubscriptionWebhookController,
    PayPalWebhookController,
  ],
  providers: [
    SubscriptionService,
    {
      provide: 'ISubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'IVideoRepository',
      useClass: TypeOrmVideoRepository,
    },
    {
      provide: PLAN_REPOSITORY_TOKEN,
      useClass: TypeOrmPlanRepository,
    },
    {
      provide: 'ISubscriptionService',
      useClass: SubscriptionService,
    },
  ],
  exports: [
    SubscriptionService,
    {
      provide: 'ISubscriptionService',
      useClass: SubscriptionService,
    },
  ],
})
export class SubscriptionModule {}
