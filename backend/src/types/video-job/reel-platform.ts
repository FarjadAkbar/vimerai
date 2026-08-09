export const REEL_PLATFORMS = ['instagram_reels', 'tiktok'] as const;

export type ReelPlatform = (typeof REEL_PLATFORMS)[number];

export function isReelPlatform(value: string): value is ReelPlatform {
  return (REEL_PLATFORMS as readonly string[]).includes(value);
}

export const REEL_PLATFORM_LABELS: Record<ReelPlatform, string> = {
  instagram_reels: 'Instagram Reels',
  tiktok: 'TikTok',
};
