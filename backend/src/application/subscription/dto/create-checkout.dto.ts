import { IsEnum, IsString, IsIn } from 'class-validator';
import { SubscriptionPlan } from '@/domain/subscription.entity';

export class CreateCheckoutDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsIn(['monthly', 'yearly'])
  billingPeriod: 'monthly' | 'yearly';

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;
}
