import { IsEnum, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { SubscriptionPlan } from '@/domain/subscription.entity';

export class CreateCheckoutDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsIn(['monthly', 'yearly'])
  billingPeriod: 'monthly' | 'yearly';

  /** PayPal billing plan ID (from frontend config by region). */
  @IsString()
  @IsNotEmpty()
  paypalPlanId: string;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;
}
