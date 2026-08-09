import { api } from './client';
import { getApiErrorMessage } from './errors';

export type Goal = 'increase_sales' | 'product_launch' | 'brand_awareness';
export type LengthTier = 'teaser' | 'promo';
export type FeedPlatform = 'instagram' | 'facebook';
export type ReelPlatform = 'instagram_reels' | 'tiktok';
export type PostImageMode = 'product_photo' | 'ai_image';
export type GenerationPath = 'multi_arm' | 'posts_only';
export type GenerationStatus =
  | 'accepted'
  | 'processing'
  | 'completed'
  | 'partial'
  | 'failed';

export interface CreateGenerationRequest {
  productId: string;
  brandKitId?: string;
  goal: Goal;
  path?: GenerationPath;
  lengthTier?: LengthTier;
  feedPlatform?: FeedPlatform;
  reelPlatform?: ReelPlatform;
  postImageMode?: PostImageMode;
}

export interface CreateGenerationResponse {
  generationId: string;
  status: GenerationStatus;
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

export interface PostConcept {
  id: string;
  hook: string;
  visualIdea: string;
  angle: string;
}

export interface SocialPostRecord {
  headline: string;
  body: string;
  cta: string;
  caption: string;
  hashtags: string[];
  postImageUrl: string;
  feedPlatform: FeedPlatform;
  conceptId?: string;
}

export interface GenerationRecord {
  id: string;
  userId: string;
  goal: Goal;
  lengthTier: LengthTier;
  feedPlatform: FeedPlatform;
  reelPlatform: ReelPlatform;
  postImageMode: PostImageMode;
  brandKitId: string;
  productId: string;
  path?: GenerationPath;
  snapshot: {
    brandKit: {
      id: string;
      name: string;
      logoUrl: string;
      colors: { primary: string; secondary: string };
      tone: string;
      audience: string;
      thingsToAvoid: string;
      aiInstructions: string | null;
    };
    product: {
      id: string;
      name: string;
      description: string;
      imageUrls: string[];
      landingPageUrl: string;
      price: string | null;
    };
  };
  arms: GenerationArmState[];
  creativeBrief: string | null;
  postConcepts?: PostConcept[] | null;
  socialPosts?: SocialPostRecord[];
  socialPost: SocialPostRecord | null;
  reelStoryboard: {
    hook: string;
    attention: string;
    productDisplay: string;
    viewerConnection: string;
    scenes: Array<{ order: number; description: string }>;
  } | null;
  reelCaption: string | null;
  video: {
    jobId: string | null;
    videoUrl: string | null;
    status: ArmStatus;
    lengthTier: LengthTier;
    reelPlatform: ReelPlatform;
    error?: string;
    shots?: Array<{
      beat: 'hook' | 'attention' | 'product_display' | 'viewer_connection';
      order: number;
      jobId: string | null;
      videoUrl: string | null;
      status: ArmStatus;
      error?: string;
    }>;
  } | null;
  status: GenerationStatus;
  textSectionRegenCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors backend LENGTH_TIER_CREDIT_WEIGHT. */
export const LENGTH_TIER_CREDIT_WEIGHT = {
  teaser: 1,
  promo: 4,
} as const;

export const POSTS_ONLY_CONCEPT_SET_CREDITS = 1;
export const POSTS_ONLY_RENDER_CREDITS = 1;
export const POSTS_ONLY_MAX_RENDER_SELECTION = 3;

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

/** Mirrors backend DEFAULT_TEXT_SECTION_REGEN_LIMIT. */
export const TEXT_SECTION_REGEN_LIMIT = 20;

export interface ManualEditSocialPostRequest {
  headline?: string;
  body?: string;
  cta?: string;
  caption?: string;
  hashtags?: string[];
}

export interface ManualEditStoryboardSceneRequest {
  order: number;
  description: string;
}

export interface ManualEditReelStoryboardRequest {
  hook?: string;
  attention?: string;
  productDisplay?: string;
  viewerConnection?: string;
  scenes?: ManualEditStoryboardSceneRequest[];
}

export interface ManualEditGenerationRequest {
  socialPost?: ManualEditSocialPostRequest;
  reelStoryboard?: ManualEditReelStoryboardRequest;
  reelCaption?: string;
}

export interface RegenerateSectionRequest {
  sectionKey: TextSectionKey;
  sceneOrder?: number;
}

export interface RegenerateShotRequest {
  beat?: "hook" | "attention" | "product_display" | "viewer_connection";
}

export interface RetryFailedArmsRequest {
  arms?: GenerationArm[];
}

export interface RenderPostConceptsRequest {
  conceptIds: string[];
}

export interface GenerationLibraryItem {
  id: string;
  status: GenerationStatus;
  goal: Goal;
  lengthTier: LengthTier;
  productName: string;
  brandKitName: string;
  createdAt: string;
  updatedAt: string;
  arms: GenerationArmState[];
}

export interface GenerationLibraryResponse {
  generations: GenerationLibraryItem[];
}

export interface GenerationResponse {
  generation: GenerationRecord;
}

export { getApiErrorMessage };

export const generationsApi = {
  create: async (
    data: CreateGenerationRequest,
  ): Promise<CreateGenerationResponse> => {
    const response = await api.post<CreateGenerationResponse>(
      '/generations',
      data,
    );
    return response.data;
  },

  list: async (): Promise<GenerationLibraryResponse> => {
    const response = await api.get<GenerationLibraryResponse>('/generations');
    return response.data;
  },

  get: async (id: string): Promise<GenerationResponse> => {
    const response = await api.get<GenerationResponse>(`/generations/${id}`);
    return response.data;
  },

  update: async (
    id: string,
    data: ManualEditGenerationRequest,
  ): Promise<GenerationResponse> => {
    const response = await api.put<GenerationResponse>(
      `/generations/${id}`,
      data,
    );
    return response.data;
  },

  regenerateSection: async (
    id: string,
    data: RegenerateSectionRequest,
  ): Promise<GenerationResponse> => {
    const response = await api.post<GenerationResponse>(
      `/generations/${id}/sections/regenerate`,
      data,
    );
    return response.data;
  },

  regenerateShot: async (
    id: string,
    data: RegenerateShotRequest = {},
  ): Promise<GenerationResponse> => {
    const response = await api.post<GenerationResponse>(
      `/generations/${id}/shots/regenerate`,
      data,
    );
    return response.data;
  },

  retryFailedArms: async (
    id: string,
    data: RetryFailedArmsRequest = {},
  ): Promise<GenerationResponse> => {
    const response = await api.post<GenerationResponse>(
      `/generations/${id}/arms/retry`,
      data,
    );
    return response.data;
  },

  renderPostConcepts: async (
    id: string,
    data: RenderPostConceptsRequest,
  ): Promise<GenerationResponse> => {
    const response = await api.post<GenerationResponse>(
      `/generations/${id}/post-concepts/render`,
      data,
    );
    return response.data;
  },
};
