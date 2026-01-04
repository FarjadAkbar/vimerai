import { api } from './client';

export type GenerationMode = 'fast' | 'cinematic' | 'avatar';

export interface GenerateVideoRequest {
  prompt: string;
  mode?: GenerationMode;
}

export interface GenerateVideoResponse {
  jobId: string;
  status: string;
}

export interface GeneratePreviewRequest {
  prompt: string;
}

export interface GeneratePreviewResponse {
  previewUrl: string;
  used: boolean;
}

export interface GenerationStatusResponse {
  status: string;
  videoUrl?: string;
}

export const generatorApi = {
  generateVideo: async (
    data: GenerateVideoRequest,
  ): Promise<GenerateVideoResponse> => {
    const response = await api.post<GenerateVideoResponse>(
      '/generator/generate',
      data,
    );
    return response.data;
  },

  generatePreview: async (
    data: GeneratePreviewRequest,
  ): Promise<GeneratePreviewResponse> => {
    const response = await api.post<GeneratePreviewResponse>(
      '/generator/preview',
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

