import { Module } from '@nestjs/common';
import {
  SubscriptionController,
  SubscriptionPublicController,
} from './subscription.controller';
import { SubscriptionWebhookController } from './subscription-webhook.controller';
import { SubscriptionService } from './subscription.service';
import { DatabaseModule } from '@/infrastructure/persistence/database.module';
import { TypeOrmSubscriptionRepository } from '@/infrastructure/persistence/typeorm/repositories/subscription.repository';
import { TypeOrmVideoRepository } from '@/infrastructure/persistence/typeorm/repositories/video.repository';
import { PaymentModule } from '@/infrastructure/payment/payment.module';

@Module({
  imports: [DatabaseModule, PaymentModule],
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
      provide: 'IVideoRepository',
      useClass: TypeOrmVideoRepository,
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
