import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripePaymentService } from './stripe-payment.service';
import { PayPalPaymentService } from './paypal-payment.service';
import { PAYMENT_SERVICE_TOKEN } from '@/core/tokens/injection.tokens';

@Module({
  providers: [
    {
      provide: PAYMENT_SERVICE_TOKEN,
      useFactory: (configService: ConfigService) => {
        const providerType =
          configService.get<string>('payment.provider') || 'paypal';

        switch (providerType.toLowerCase()) {
          case 'stripe':
            return new StripePaymentService(configService);
          case 'paypal':
            return new PayPalPaymentService(configService);
          default:
            return new PayPalPaymentService(configService);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [PAYMENT_SERVICE_TOKEN],
})
export class PaymentModule {}
