import { IsBoolean, IsIn, IsObject } from 'class-validator';
import type {
  BlitzEnabledFormats,
  MentionFrequency,
} from '@/domain/blitz-configuration.entity';

const MENTION_FREQUENCIES = [
  'never',
  'rarely',
  'sometimes',
  'often',
  'always',
] as const satisfies readonly MentionFrequency[];

export class UpdateBlitzConfigurationDto {
  @IsIn(MENTION_FREQUENCIES)
  mentionFrequency: MentionFrequency;

  @IsBoolean()
  showInfluencerMaterials: boolean;

  @IsObject()
  enabledFormats: BlitzEnabledFormats;
}
