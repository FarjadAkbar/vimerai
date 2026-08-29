export interface InfluencerImageJobInput {
  influencerId: string;
  instructions: string | null;
  referenceMediaAssetIds: string[];
  referenceImageUrls: string[];
  prompt: string;
}

export interface InfluencerAnimateJobInput {
  influencerId: string;
  sourceContentItemId: string;
  sourceImageUrl: string;
  prompt: string;
}

export interface CreateInfluencerImageInput {
  instructions?: string | null;
  referenceMediaAssetIds?: string[];
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

export interface IInfluencerImageService {
  generateImage(
    userId: string,
    influencerId: string,
    input: CreateInfluencerImageInput,
  ): Promise<InfluencerContentItemResult>;
  animateImage(
    userId: string,
    influencerId: string,
    contentItemId: string,
  ): Promise<InfluencerContentItemResult>;
  listInfluencerImages(
    userId: string,
    influencerId: string,
  ): Promise<InfluencerContentItemResult[]>;
  listInfluencerVideos(
    userId: string,
    influencerId: string,
  ): Promise<InfluencerContentItemResult[]>;
}
