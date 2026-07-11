import { IsIn, IsOptional } from 'class-validator';
import { PROMO_BEATS, type PromoBeat } from '@/types/generation/generation';

export class RegenerateShotDto {
  @IsOptional()
  @IsIn([...PROMO_BEATS])
  beat?: PromoBeat;
}
