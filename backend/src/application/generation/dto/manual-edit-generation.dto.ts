import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ManualEditSocialPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  body?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  cta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  hashtags?: string[];
}

export class ManualEditStoryboardSceneDto {
  @IsInt()
  @Min(1)
  order: number;

  @IsString()
  @MaxLength(1000)
  description: string;
}

export class ManualEditReelStoryboardDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  hook?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  attention?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  productDisplay?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  viewerConnection?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManualEditStoryboardSceneDto)
  scenes?: ManualEditStoryboardSceneDto[];
}

export class ManualEditGenerationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ManualEditSocialPostDto)
  socialPost?: ManualEditSocialPostDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ManualEditReelStoryboardDto)
  reelStoryboard?: ManualEditReelStoryboardDto;

  @IsOptional()
  @IsString()
  @MaxLength(2200)
  reelCaption?: string;
}
