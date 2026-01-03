import { Module } from '@nestjs/common';
import {
  SubscriptionController,
  SubscriptionPublicController,
} from './subscription.controller';
import { SubscriptionWebhookController } from './subscription-webhook.controller';
import { SubscriptionService } from './subscription.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmSubscriptionRepository } from '@/infrastructure/persistence/typeorm/repositories/subscription.repository';
import { StripePaymentService } from '@/infrastructure/payment/stripe-payment.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    SubscriptionController,
    SubscriptionPublicController,
    SubscriptionWebhookController,
  ],
  providers: [
    SubscriptionService,
    {
      provide: 'ISubscriptionRepository',
      useClass: TypeOrmSubscriptionRepository,
    },
    {
      provide: 'ISubscriptionService',
      useClass: SubscriptionService,
    },
    {
      provide: 'IPaymentService',
      useClass: StripePaymentService,
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
