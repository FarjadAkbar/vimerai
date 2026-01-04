import { IsEnum, IsString } from 'class-validator';
import { SubscriptionPlan } from '@/domain/subscription.entity';

export class CreateCheckoutDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @IsString()
  successUrl: string;

  @IsString()
  cancelUrl: string;
}
