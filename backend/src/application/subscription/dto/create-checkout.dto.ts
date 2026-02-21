import { IsEnum, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { SubscriptionPlan } from '@/domain/subscription.entity';

export class CreateCheckoutDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsIn(['monthly', 'yearly'])
  billingPeriod: 'monthly' | 'yearly';

  @IsString()
  @IsNotEmpty()
  successUrl: string;

  @IsString()
  @IsNotEmpty()
  cancelUrl: string;
}
