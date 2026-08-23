import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import {
  REEL_PLATFORMS,
  type ReelPlatform,
} from '@/types/video-job/reel-platform';

export class CreateVideoJobDto {
  @ValidateIf((dto: CreateVideoJobDto) => !dto.referenceVideoUrl)
  @IsUUID()
  brandId?: string;

  @ValidateIf((dto: CreateVideoJobDto) => !dto.referenceVideoUrl)
  @IsUUID()
  productId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  formatId: string;

  @IsOptional()
  @IsIn([...REEL_PLATFORMS])
  reelPlatform?: ReelPlatform;

  /** Viral Remix — reference video is required in remix mode. */
  @IsOptional()
  @IsUrl()
  referenceVideoUrl?: string;

  @IsOptional()
  @IsUrl()
  productImageUrl?: string;

  @IsOptional()
  @IsUrl()
  personImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;
}
