import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SaveBlitzEditDto {
  @IsString()
  videoUrl: string;

  @IsString()
  hook: string;

  @IsOptional()
  @IsString()
  formatId?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  overlayUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  volume?: number;

  @IsOptional()
  @IsObject()
  textStyle?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
  };

  @IsOptional()
  @IsBoolean()
  mentionBusiness?: boolean;

  @IsOptional()
  @IsString()
  sourceTemplateId?: string;
}
