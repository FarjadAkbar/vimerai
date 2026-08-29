import { api } from './client';

export interface Video {
  id: string;
  userId: string;
  prompt: string;
  mode: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl: string | null;
  previewUrl: string | null;
  jobId: string;
  kind?: 'user' | 'template';
  formatId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideosListResponse {
  videos: Video[];
  total: number;
}

export interface StudioTemplate {
  id: string;
  slug: string;
  type: 'blitz' | 'viral_remix';
  contentType: string | null;
  label: string;
  prompt: string;
  videoUrl: string | null;
  previewUrl: string | null;
  durationLabel: string | null;
  remixFormatId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListResponse {
  templates: StudioTemplate[];
  createdCount?: number;
}

export interface VideoResponse {
  video: Video;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

export type SaveBlitzEditPayload = {
  videoUrl: string;
  hook: string;
  formatId?: string;
  audioUrl?: string;
  overlayUrl?: string;
  volume?: number;
  textStyle?: {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
  };
  mentionBusiness?: boolean;
  sourceTemplateId?: string;
};

export const videosApi = {
  getVideos: async (
    limit = 10,
    offset = 0,
  ): Promise<VideosListResponse> => {
    const response = await api.get<VideosListResponse>('/videos', {
      params: { limit, offset },
    });
    return response.data;
  },

  getTemplates: async (): Promise<TemplateListResponse> => {
    const response = await api.get<TemplateListResponse>('/videos/templates');
    return response.data;
  },

  getViralRemixTemplates: async (): Promise<TemplateListResponse> => {
    const response = await api.get<TemplateListResponse>(
      '/videos/viral-remix-templates',
    );
    return response.data;
  },

  generateViralRemixSampleTemplates:
    async (): Promise<TemplateListResponse> => {
      const response = await api.post<TemplateListResponse>(
        '/videos/viral-remix-templates/samples',
      );
      return response.data;
    },

  saveBlitzEdit: async (
    payload: SaveBlitzEditPayload,
  ): Promise<VideoResponse> => {
    const response = await api.post<VideoResponse>(
      '/videos/blitz-edits',
      payload,
    );
    return response.data;
  },

  getVideo: async (id: string): Promise<VideoResponse> => {
    const response = await api.get<VideoResponse>(`/videos/${id}`);
    return response.data;
  },

  deleteVideo: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/videos/${id}`);
    return response.data;
  },

  getDownloadUrl: async (id: string): Promise<DownloadUrlResponse> => {
    const response = await api.get<DownloadUrlResponse>(
      `/videos/${id}/download`,
    );
    return response.data;
  },
};
