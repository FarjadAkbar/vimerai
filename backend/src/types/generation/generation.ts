import type {
  FeedPlatform,
  Goal,
  LengthTier,
  PostImageMode,
  ReelPlatform,
} from '@/types/generation/enums';

/** Prefactor input shape for createGeneration (implemented in later tickets). */
export interface CreateGenerationInput {
  productId: string;
  brandKitId?: string;
  goal: Goal;
  lengthTier?: LengthTier;
  feedPlatform?: FeedPlatform;
  reelPlatform?: ReelPlatform;
  postImageMode?: PostImageMode;
}

export interface CreateGenerationResult {
  generationId: string;
  status: 'accepted' | 'processing' | 'completed' | 'partial' | 'failed';
}

export interface ManualEditSocialPostInput {
  headline?: string;
  body?: string;
  cta?: string;
  caption?: string;
  hashtags?: string[];
}

export interface ManualEditStoryboardSceneInput {
  order: number;
  description: string;
}

export interface ManualEditReelStoryboardInput {
  hook?: string;
  attention?: string;
  productDisplay?: string;
  viewerConnection?: string;
  /** Full ordered scene list; replaces existing scenes when provided. */
  scenes?: ManualEditStoryboardSceneInput[];
}

export interface ManualEditGenerationInput {
  socialPost?: ManualEditSocialPostInput;
  reelStoryboard?: ManualEditReelStoryboardInput;
  reelCaption?: string;
}

export type GenerationArm =
  | 'creative-brief'
  | 'social-post'
  | 'reel-storyboard'
  | 'video'
  | 'reel-caption';

export type ArmStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationArmState {
  arm: GenerationArm;
  status: ArmStatus;
  error?: string;
}
