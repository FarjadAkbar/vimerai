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
  createdAt: string;
  updatedAt: string;
}

export interface VideosListResponse {
  videos: Video[];
  total: number;
}

export interface VideoResponse {
  video: Video;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
}

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

