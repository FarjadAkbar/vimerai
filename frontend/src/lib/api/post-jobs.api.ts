import { api } from './client';
import type { FormatModality } from './formats.api';

export type PostJobStatus = 'processing' | 'completed' | 'failed';

export interface PostJobBrandSnapshot {
  id: string;
  name: string;
  logoUrl: string;
  colors: { primary: string; secondary: string };
  tone: string;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
}

export interface PostJobProductSnapshot {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price: string | null;
}

export interface PostJobFormatSnapshot {
  id: string;
  label: string;
  description: string;
  modality: FormatModality;
  promptStructure: string;
}

export interface PostJobSnapshot {
  brand: PostJobBrandSnapshot;
  product: PostJobProductSnapshot;
  format: PostJobFormatSnapshot;
}

export interface PostJob {
  id: string;
  userId: string;
  brandId: string;
  productId: string;
  formatId: string;
  snapshot: PostJobSnapshot;
  status: PostJobStatus;
  postImageUrl: string | null;
  creditCharge: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostJobResponse {
  postJob: PostJob;
}

export interface PostJobsListResponse {
  postJobs: PostJob[];
}

export interface CreatePostJobRequest {
  brandId: string;
  productId: string;
  formatId: string;
}

export const postJobsApi = {
  list: async (): Promise<PostJobsListResponse> => {
    const response = await api.get<PostJobsListResponse>('/post-jobs');
    return response.data;
  },

  get: async (id: string): Promise<PostJobResponse> => {
    const response = await api.get<PostJobResponse>(`/post-jobs/${id}`);
    return response.data;
  },

  create: async (data: CreatePostJobRequest): Promise<PostJobResponse> => {
    const response = await api.post<PostJobResponse>('/post-jobs', data);
    return response.data;
  },

  regenerate: async (id: string): Promise<PostJobResponse> => {
    const response = await api.post<PostJobResponse>(
      `/post-jobs/${id}/regenerate`,
    );
    return response.data;
  },
};
