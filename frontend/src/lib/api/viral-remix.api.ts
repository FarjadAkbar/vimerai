import { api } from './client';

export type ViralRemixJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ViralRemixJob {
  jobId: string;
  status: ViralRemixJobStatus;
  error: string | null;
  contentItemId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ViralRemixJobResponse {
  remix: ViralRemixJob;
}

export type CreateViralRemixPayload = {
  brandId: string;
  formatId: string;
  referenceVideoMediaAssetId?: string;
  referenceVideoUrl?: string;
  productImageMediaAssetId?: string;
  personImageMediaAssetId?: string;
  instructions?: string;
  aspectRatio?: '9:16' | '16:9' | '1:1';
  durationSeconds?: number;
  quality?: string;
};

export const viralRemixApi = {
  create: async (
    payload: CreateViralRemixPayload,
  ): Promise<ViralRemixJobResponse> => {
    const response = await api.post<ViralRemixJobResponse>(
      '/viral-remix/jobs',
      payload,
    );
    return response.data;
  },

  get: async (jobId: string): Promise<ViralRemixJobResponse> => {
    const response = await api.get<ViralRemixJobResponse>(
      `/viral-remix/jobs/${jobId}`,
    );
    return response.data;
  },

  regenerate: async (jobId: string): Promise<ViralRemixJobResponse> => {
    const response = await api.post<ViralRemixJobResponse>(
      `/viral-remix/jobs/${jobId}/regenerate`,
    );
    return response.data;
  },
};
