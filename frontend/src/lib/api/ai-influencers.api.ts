import { api } from './client';
import type {
  InfluencerGender,
  PortraitSource,
} from '@/components/studio/influencer-data';

export interface AiInfluencer {
  id: string;
  name: string;
  gender: InfluencerGender;
  age: number;
  ethnicity: string | null;
  appearancePrompt: string;
  portraitSource: PortraitSource;
  portraitMediaAssetId: string | null;
  portraitUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiInfluencersListResponse {
  influencers: AiInfluencer[];
}

export interface AiInfluencerResponse {
  influencer: AiInfluencer;
}

export type CreateAiInfluencerPayload = {
  name: string;
  gender: InfluencerGender;
  age: number;
  ethnicity?: string;
  appearancePrompt: string;
  portraitSource: PortraitSource;
  portraitMediaAssetId?: string;
  portraitUrl?: string;
};

export const aiInfluencersApi = {
  list: async (): Promise<AiInfluencersListResponse> => {
    const response = await api.get<AiInfluencersListResponse>('/ai-influencers');
    return response.data;
  },

  get: async (id: string): Promise<AiInfluencerResponse> => {
    const response = await api.get<AiInfluencerResponse>(
      `/ai-influencers/${id}`,
    );
    return response.data;
  },

  create: async (
    payload: CreateAiInfluencerPayload,
  ): Promise<AiInfluencerResponse> => {
    const response = await api.post<AiInfluencerResponse>(
      '/ai-influencers',
      payload,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/ai-influencers/${id}`);
  },
};
