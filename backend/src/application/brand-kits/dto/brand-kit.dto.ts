import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class BrandKitColorsDto {
  @IsString()
  @IsNotEmpty()
  primary: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secondary?: string;
}

const TONES = [
  'luxury',
  'professional',
  'playful',
  'bold',
  'friendly',
] as const;

export class CreateBrandKitDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsUrl({ require_tld: false })
  logoUrl: string;

  @IsObject()
  @ValidateNested()
  @Type(() => BrandKitColorsDto)
  colors: BrandKitColorsDto;

  @IsIn(TONES)
  tone: (typeof TONES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  audience?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  thingsToAvoid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  aiInstructions?: string;
}

export class UpdateBrandKitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => BrandKitColorsDto)
  colors?: BrandKitColorsDto;

  @IsOptional()
  @IsIn(TONES)
  tone?: (typeof TONES)[number];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  audience?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  thingsToAvoid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  aiInstructions?: string | null;
}
