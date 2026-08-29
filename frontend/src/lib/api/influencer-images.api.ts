import { api } from './client';

export type InfluencerContentJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface InfluencerContentItem {
  id: string;
  jobId: string;
  jobType: string;
  status: InfluencerContentJobStatus;
  error: string | null;
  mediaKind: 'image' | 'video';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InfluencerContentListResponse {
  items: InfluencerContentItem[];
}

export interface InfluencerContentItemResponse {
  item: InfluencerContentItem;
}

export type CreateInfluencerImagePayload = {
  instructions?: string;
  referenceMediaAssetIds?: string[];
};

export const influencerImagesApi = {
  list: async (influencerId: string): Promise<InfluencerContentListResponse> => {
    const response = await api.get<InfluencerContentListResponse>(
      `/ai-influencers/${influencerId}/images`,
    );
    return response.data;
  },

  listVideos: async (
    influencerId: string,
  ): Promise<InfluencerContentListResponse> => {
    const response = await api.get<InfluencerContentListResponse>(
      `/ai-influencers/${influencerId}/videos`,
    );
    return response.data;
  },

  generate: async (
    influencerId: string,
    payload: CreateInfluencerImagePayload,
  ): Promise<InfluencerContentItemResponse> => {
    const response = await api.post<InfluencerContentItemResponse>(
      `/ai-influencers/${influencerId}/images`,
      payload,
    );
    return response.data;
  },

  animate: async (
    influencerId: string,
    contentItemId: string,
  ): Promise<InfluencerContentItemResponse> => {
    const response = await api.post<InfluencerContentItemResponse>(
      `/ai-influencers/${influencerId}/images/${contentItemId}/animate`,
    );
    return response.data;
  },
};
