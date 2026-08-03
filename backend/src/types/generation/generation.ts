import type {
  FeedPlatform,
  Goal,
  LengthTier,
  PostImageMode,
  ReelPlatform,
} from '@/types/generation/enums';

/** Multi-arm (Social Post + Storyboard + Video) vs Posts-only (Post Concepts). */
export type GenerationPath = 'multi_arm' | 'posts_only';

/** Prefactor input shape for createGeneration (implemented in later tickets). */
export interface CreateGenerationInput {
  productId: string;
  brandKitId?: string;
  goal: Goal;
  /** Defaults to multi_arm. */
  path?: GenerationPath;
  lengthTier?: LengthTier;
  feedPlatform?: FeedPlatform;
  reelPlatform?: ReelPlatform;
  postImageMode?: PostImageMode;
}

export interface PostConcept {
  id: string;
  hook: string;
  visualIdea: string;
  angle: string;
}

export interface RenderPostConceptsInput {
  /** Post Concept ids to render; max 3. */
  conceptIds: string[];
}

export interface CreateGenerationResult {
  generationId: string;
  status: 'accepted' | 'processing' | 'completed' | 'partial' | 'failed';
}

/** Library row: enough to scan status without loading full Content Outputs. */
export interface GenerationLibraryItem {
  id: string;
  status: CreateGenerationResult['status'];
  goal: Goal;
  lengthTier: LengthTier;
  productName: string;
  brandKitName: string;
  createdAt: Date;
  updatedAt: Date;
  arms: GenerationArmState[];
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

/** Text section regenerate targets (ticket 06). */
export type TextSectionKey =
  | 'social.headline'
  | 'social.body'
  | 'social.cta'
  | 'social.caption'
  | 'social.hashtags'
  | 'storyboard.hook'
  | 'storyboard.attention'
  | 'storyboard.productDisplay'
  | 'storyboard.viewerConnection'
  | 'storyboard.scene'
  | 'reel.caption';

export interface RegenerateSectionInput {
  sectionKey: TextSectionKey;
  /** Required when sectionKey is storyboard.scene */
  sceneOrder?: number;
}

export interface RetryFailedArmsInput {
  /** When omitted, retries every failed arm. */
  arms?: GenerationArm[];
}

/** Default fair-use cap of free text section regenerates per Generation. */
export const DEFAULT_TEXT_SECTION_REGEN_LIMIT = 20;

/** Weighted Generation credits by Length Tier (ADR 0013). */
export const LENGTH_TIER_CREDIT_WEIGHT = {
  teaser: 1,
  promo: 4,
} as const;

/** Extra Generation credits when Post image mode is AI (not free like text regen). */
export const AI_POST_IMAGE_CREDIT_SURCHARGE = 1;

/** Credits for producing the ten Post Concepts in Posts-only Generation. */
export const POSTS_ONLY_CONCEPT_SET_CREDITS = 1;

/** Credits to render one selected Post Concept into a Social Post (includes AI Post image). */
export const POSTS_ONLY_RENDER_CREDITS = 1;

export const POSTS_ONLY_CONCEPT_COUNT = 10;
export const POSTS_ONLY_MAX_RENDER_SELECTION = 3;

/** Credits charged to regenerate one Video Shot (ADR 0014 / CONTEXT). */
export const VIDEO_SHOT_REGEN_CREDIT_COST = 1;

export const PROMO_BEATS = [
  'hook',
  'attention',
  'product_display',
  'viewer_connection',
] as const;

export type PromoBeat = (typeof PROMO_BEATS)[number];

export interface RegenerateShotInput {
  /**
   * Promo beat to regenerate. Required for Promo; ignored for Teaser
   * (single shot).
   */
  beat?: PromoBeat;
}

export type GenerationArm =
  | 'creative-brief'
  | 'social-post'
  | 'reel-storyboard'
  | 'video'
  | 'reel-caption'
  | 'post-concepts';

export type ArmStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationArmState {
  arm: GenerationArm;
  status: ArmStatus;
  error?: string;
}
