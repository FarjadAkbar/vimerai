import { api } from './client';

export type GenerationMode = 'fast' | 'cinematic' | 'avatar';

export type ShotTemplate = 'hero' | 'website' | 'lifestyle';

export interface GenerateVideoRequest {
  prompt: string;
  mode?: GenerationMode;
  shotTemplate?: ShotTemplate;
}

export interface GenerateVideoResponse {
  jobId: string;
  status: string;
}

export interface GenerationStatusResponse {
  status: string;
  videoUrl?: string;
  previewUrl?: string;
  error?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const responseData = (
    error as { response?: { data?: { message?: string | string[] } } }
  ).response?.data;

  const message = responseData?.message;
  if (Array.isArray(message)) {
    return message.filter(Boolean).join(', ') || fallback;
  }
  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export const generatorApi = {
  generateVideo: async (
    data: GenerateVideoRequest,
    type: 'preview' | 'full' = 'full',
  ): Promise<GenerateVideoResponse> => {
    const response = await api.post<GenerateVideoResponse>(
      `/generator/generate?type=${type}`,
      data,
    );
    return response.data;
  },

  getGenerationStatus: async (
    jobId: string,
  ): Promise<GenerationStatusResponse> => {
    const response = await api.get<GenerationStatusResponse>(
      `/generator/status/${jobId}`,
    );
    return response.data;
  },

  downloadVideo: async (videoId: string): Promise<Blob> => {
    const response = await api.get(`/generator/download/${videoId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
