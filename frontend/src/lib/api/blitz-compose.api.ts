import { api } from './client';

export type BlitzComposeResult = {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  contentItemId: string | null;
  mediaKind: 'image' | 'video';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface BlitzComposeResponse {
  compose: BlitzComposeResult;
}

export type ComposeBlitzEditPayload = {
  brandId: string;
  formatId: string;
  hook: string;
  sourceTemplateId?: string;
  file: File;
};

export const blitzComposeApi = {
  compose: async (
    payload: ComposeBlitzEditPayload,
  ): Promise<BlitzComposeResponse> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('brandId', payload.brandId);
    formData.append('formatId', payload.formatId);
    formData.append('hook', payload.hook);
    if (payload.sourceTemplateId) {
      formData.append('sourceTemplateId', payload.sourceTemplateId);
    }

    const response = await api.post<BlitzComposeResponse>(
      '/blitz/compose',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },

  get: async (jobId: string): Promise<BlitzComposeResponse> => {
    const response = await api.get<BlitzComposeResponse>(
      `/blitz/compose/${jobId}`,
    );
    return response.data;
  },
};
