import { IsArray, IsIn, IsOptional } from 'class-validator';
import type { GenerationArm } from '@/types/generation/generation';

const ARMS = [
  'creative-brief',
  'social-post',
  'reel-storyboard',
  'video',
  'reel-caption',
] as const satisfies readonly GenerationArm[];

export class RetryFailedArmsDto {
  @IsOptional()
  @IsArray()
  @IsIn(ARMS, { each: true })
  arms?: GenerationArm[];
}
