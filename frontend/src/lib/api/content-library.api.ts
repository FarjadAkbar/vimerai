import { api } from './client';

export type ContentLibraryJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ContentLibraryItem {
  id: string;
  jobId: string;
  jobType: string;
  jobStatus: ContentLibraryJobStatus;
  jobError: string | null;
  mediaKind: 'image' | 'video';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContentLibraryResponse {
  items: ContentLibraryItem[];
}

export const contentLibraryApi = {
  list: async (
    jobStatus?: ContentLibraryJobStatus,
  ): Promise<ContentLibraryResponse> => {
    const response = await api.get<ContentLibraryResponse>('/content-library', {
      params: jobStatus ? { jobStatus } : undefined,
    });
    return response.data;
  },
};
