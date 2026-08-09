import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import {
  REEL_PLATFORMS,
  type ReelPlatform,
} from '@/types/video-job/reel-platform';

export class CreateVideoJobDto {
  @IsUUID()
  brandId: string;

  @IsUUID()
  productId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  formatId: string;

  @IsIn([...REEL_PLATFORMS])
  reelPlatform: ReelPlatform;
}
