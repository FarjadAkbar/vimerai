import { IsIn, IsOptional, IsUUID } from 'class-validator';

const GOALS = [
  'increase_sales',
  'product_launch',
  'brand_awareness',
] as const;

const LENGTH_TIERS = ['teaser', 'promo'] as const;
const FEED_PLATFORMS = ['instagram', 'facebook'] as const;
const REEL_PLATFORMS = ['instagram_reels', 'tiktok'] as const;
const POST_IMAGE_MODES = ['product_photo', 'ai_image'] as const;

export class CreateGenerationDto {
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsUUID()
  brandKitId?: string;

  @IsIn(GOALS)
  goal: (typeof GOALS)[number];

  @IsOptional()
  @IsIn(LENGTH_TIERS)
  lengthTier?: (typeof LENGTH_TIERS)[number];

  @IsOptional()
  @IsIn(FEED_PLATFORMS)
  feedPlatform?: (typeof FEED_PLATFORMS)[number];

  @IsOptional()
  @IsIn(REEL_PLATFORMS)
  reelPlatform?: (typeof REEL_PLATFORMS)[number];

  @IsOptional()
  @IsIn(POST_IMAGE_MODES)
  postImageMode?: (typeof POST_IMAGE_MODES)[number];
}
