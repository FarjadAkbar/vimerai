import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { VideoAspectRatio } from '@/types/video-job/aspect-ratio';

const ASPECT_RATIOS: VideoAspectRatio[] = ['9:16', '16:9', '1:1'];

export class CreateViralRemixDto {
  @IsUUID()
  brandId: string;

  @IsString()
  @IsNotEmpty()
  formatId: string;

  @IsOptional()
  @IsUUID()
  referenceVideoMediaAssetId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  referenceVideoUrl?: string;

  @IsOptional()
  @IsUUID()
  productImageMediaAssetId?: string;

  @IsOptional()
  @IsUUID()
  personImageMediaAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @IsOptional()
  @IsIn(ASPECT_RATIOS)
  aspectRatio?: VideoAspectRatio;

  @IsOptional()
  @IsInt()
  @Min(6)
  @Max(60)
  durationSeconds?: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  quality?: string;
}
