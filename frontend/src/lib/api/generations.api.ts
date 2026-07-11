import { api } from './client';
import { getApiErrorMessage } from './generator.api';

export type Goal = 'increase_sales' | 'product_launch' | 'brand_awareness';
export type LengthTier = 'teaser' | 'promo';
export type FeedPlatform = 'instagram' | 'facebook';
export type ReelPlatform = 'instagram_reels' | 'tiktok';
export type PostImageMode = 'product_photo' | 'ai_image';
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
  | 'reel-caption';

export type ArmStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationArmState {
  arm: GenerationArm;
  status: ArmStatus;
  error?: string;
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
  socialPost: {
    headline: string;
    body: string;
    cta: string;
    caption: string;
    hashtags: string[];
    postImageUrl: string;
    feedPlatform: FeedPlatform;
  } | null;
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
  } | null;
  status: GenerationStatus;
  createdAt: string;
  updatedAt: string;
}

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
};
