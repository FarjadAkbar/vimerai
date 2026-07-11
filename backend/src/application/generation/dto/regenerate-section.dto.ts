import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import type { TextSectionKey } from '@/types/generation/generation';

const SECTION_KEYS = [
  'social.headline',
  'social.body',
  'social.cta',
  'social.caption',
  'social.hashtags',
  'storyboard.hook',
  'storyboard.attention',
  'storyboard.productDisplay',
  'storyboard.viewerConnection',
  'storyboard.scene',
  'reel.caption',
] as const satisfies readonly TextSectionKey[];

export class RegenerateSectionDto {
  @IsIn(SECTION_KEYS)
  sectionKey: TextSectionKey;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sceneOrder?: number;
}
