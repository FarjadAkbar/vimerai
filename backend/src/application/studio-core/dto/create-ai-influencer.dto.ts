import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  InfluencerGender,
  PortraitSource,
} from '@/domain/ai-influencer.entity';

export class CreateAiInfluencerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEnum(InfluencerGender)
  gender: InfluencerGender;

  @IsInt()
  @Min(18)
  @Max(60)
  age: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ethnicity?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  appearancePrompt: string;

  @IsEnum(PortraitSource)
  portraitSource: PortraitSource;

  @IsOptional()
  @IsUUID()
  portraitMediaAssetId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  portraitUrl?: string;
}
