import { api } from './client';

export type ImageJobStatus = 'processing' | 'completed' | 'failed';

export interface ImageJob {
  id: string;
  userId: string;
  prompt: string;
  referenceImageUrls: string[];
  negativePrompt: string | null;
  status: ImageJobStatus;
  imageUrl: string | null;
  creditCharge: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImageJobResponse {
  imageJob: ImageJob;
}

export interface ImageJobsListResponse {
  imageJobs: ImageJob[];
}

export interface CreateImageJobRequest {
  prompt: string;
  referenceImageUrls: string[];
  negativePrompt?: string;
}

export const imageJobsApi = {
  list: async (): Promise<ImageJobsListResponse> => {
    const response = await api.get<ImageJobsListResponse>('/image-jobs');
    return response.data;
  },

  get: async (id: string): Promise<ImageJobResponse> => {
    const response = await api.get<ImageJobResponse>(`/image-jobs/${id}`);
    return response.data;
  },

  create: async (data: CreateImageJobRequest): Promise<ImageJobResponse> => {
    const response = await api.post<ImageJobResponse>('/image-jobs', data);
    return response.data;
  },

  regenerate: async (id: string): Promise<ImageJobResponse> => {
    const response = await api.post<ImageJobResponse>(
      `/image-jobs/${id}/regenerate`,
    );
    return response.data;
  },
};
