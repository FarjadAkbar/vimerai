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
