import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export enum InfluencerVideoModeDto {
  IMAGE_TO_VIDEO = 'image_to_video',
  TALKING_HEAD = 'talking_head',
}

export class CreateInfluencerVideoDto {
  @IsEnum(InfluencerVideoModeDto)
  mode: InfluencerVideoModeDto;

  @IsOptional()
  @IsUUID('4')
  sourceContentItemId?: string;

  @IsOptional()
  @IsUUID('4')
  sourceMediaAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @ValidateIf((dto: CreateInfluencerVideoDto) =>
    dto.mode === InfluencerVideoModeDto.TALKING_HEAD,
  )
  @IsString()
  @MaxLength(2000)
  script?: string;
}
