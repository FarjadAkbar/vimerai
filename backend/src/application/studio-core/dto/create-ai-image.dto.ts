import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type {
  AiImageAspectRatio,
  AiImageGenerationMode,
  AiImageOutputFormat,
} from '@/types/image-job/ai-image-options';

export class CreateAiImageDto {
  @IsString()
  @MaxLength(2000)
  instructions: string;

  @IsArray()
  @IsUUID('4', { each: true })
  referenceMediaAssetIds: string[];

  @IsOptional()
  @IsIn(['1:1', '9:16', '16:9', '4:5'])
  aspectRatio?: AiImageAspectRatio;

  @IsOptional()
  @IsIn(['png', 'jpeg'])
  outputFormat?: AiImageOutputFormat;

  @IsOptional()
  @IsIn(['direct', 'enhanced'])
  generationMode?: AiImageGenerationMode;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  negativePrompt?: string;
}
