export type InfluencerVideoMode = 'image_to_video' | 'talking_head';

export interface InfluencerVideoJobInput {
  influencerId: string;
  mode: InfluencerVideoMode;
  sourceImageUrl: string;
  sourceContentItemId: string | null;
  sourceMediaAssetId: string | null;
  instructions: string | null;
  script: string | null;
  prompt: string;
}

export interface CreateInfluencerVideoInput {
  mode: InfluencerVideoMode;
  sourceContentItemId?: string;
  sourceMediaAssetId?: string;
  instructions?: string | null;
  script?: string | null;
}

export interface InfluencerContentItemResult {
  id: string;
  jobId: string;
  jobType: string;
  status: string;
  error: string | null;
  mediaKind: 'image' | 'video';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IInfluencerVideoService {
  generateVideo(
    userId: string,
    influencerId: string,
    input: CreateInfluencerVideoInput,
  ): Promise<InfluencerContentItemResult>;
  animateFromContentItem(
    userId: string,
    influencerId: string,
    contentItemId: string,
  ): Promise<InfluencerContentItemResult>;
  listInfluencerVideos(
    userId: string,
    influencerId: string,
  ): Promise<InfluencerContentItemResult[]>;
}
