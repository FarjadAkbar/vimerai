import { api } from './client';
import type { FormatModality } from './formats.api';

export type VideoJobStatus = 'processing' | 'completed' | 'failed';

export type ReelPlatform = 'instagram_reels' | 'tiktok';

export interface VideoJobBrandSnapshot {
  id: string;
  name: string;
  logoUrl: string;
  colors: { primary: string; secondary: string };
  tone: string;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
}

export interface VideoJobProductSnapshot {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price: string | null;
}

export interface VideoJobFormatSnapshot {
  id: string;
  label: string;
  description: string;
  modality: FormatModality;
  promptStructure: string;
}

export interface VideoJobSnapshot {
  brand: VideoJobBrandSnapshot;
  product: VideoJobProductSnapshot;
  format: VideoJobFormatSnapshot;
  reelPlatform: ReelPlatform;
  viralRemix?: {
    referenceVideoUrl: string;
    productImageUrl: string | null;
    personImageUrl: string | null;
    instructions: string | null;
  };
}

export interface VideoJob {
  id: string;
  userId: string;
  brandId: string;
  productId: string;
  formatId: string;
  reelPlatform: ReelPlatform;
  snapshot: VideoJobSnapshot;
  status: VideoJobStatus;
  videoUrl: string | null;
  durationTargetSeconds: number;
  creditCharge: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoJobResponse {
  videoJob: VideoJob;
}

export interface VideoJobsListResponse {
  videoJobs: VideoJob[];
}

export interface CreateVideoJobRequest {
  brandId?: string;
  productId?: string;
  formatId: string;
  reelPlatform?: ReelPlatform;
  referenceVideoUrl?: string;
  productImageUrl?: string;
  personImageUrl?: string;
  instructions?: string;
}

export const REEL_PLATFORM_OPTIONS: Array<{
  value: ReelPlatform;
  label: string;
}> = [
  { value: 'instagram_reels', label: 'Instagram Reels' },
  { value: 'tiktok', label: 'TikTok' },
];

export const videoJobsApi = {
  list: async (): Promise<VideoJobsListResponse> => {
    const response = await api.get<VideoJobsListResponse>('/video-jobs');
    return response.data;
  },

  get: async (id: string): Promise<VideoJobResponse> => {
    const response = await api.get<VideoJobResponse>(`/video-jobs/${id}`);
    return response.data;
  },

  create: async (data: CreateVideoJobRequest): Promise<VideoJobResponse> => {
    const response = await api.post<VideoJobResponse>('/video-jobs', data);
    return response.data;
  },

  regenerate: async (id: string): Promise<VideoJobResponse> => {
    const response = await api.post<VideoJobResponse>(
      `/video-jobs/${id}/regenerate`,
    );
    return response.data;
  },

  uploadReferenceVideo: async (file: File): Promise<{ videoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ videoUrl: string }>(
      '/video-jobs/reference-videos',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
