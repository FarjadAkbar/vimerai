import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripePaymentService } from './stripe-payment.service';
import { PAYMENT_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  providers: [
    {
      provide: PAYMENT_SERVICE_TOKEN,
      useFactory: (configService: ConfigService) => {
        const providerType =
          configService.get<string>('payment.provider') || 'stripe';

        switch (providerType.toLowerCase()) {
          case 'stripe':
          default:
            return new StripePaymentService(configService);
          // Future: Add other payment providers here
          // case 'paypal':
          //   return new PayPalPaymentService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [PAYMENT_SERVICE_TOKEN],
})
export class PaymentModule {}
