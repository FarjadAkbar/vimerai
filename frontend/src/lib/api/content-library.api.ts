import { api } from './client';

export type ContentStatusBucket = 'building' | 'created' | 'failed';

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
    statusBucket?: ContentStatusBucket,
  ): Promise<ContentLibraryResponse> => {
    const response = await api.get<ContentLibraryResponse>('/content-library', {
      params: statusBucket ? { statusBucket } : undefined,
    });
    return response.data;
  },
};
