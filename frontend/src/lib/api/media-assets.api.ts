import { api } from './client';

export type MediaAssetKind = 'image' | 'video' | 'audio';

export interface MediaAsset {
  id: string;
  kind: MediaAssetKind;
  name: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAssetsListResponse {
  assets: MediaAsset[];
}

export interface MediaAssetResponse {
  asset: MediaAsset;
}

export const mediaAssetsApi = {
  list: async (kind?: MediaAssetKind): Promise<MediaAssetsListResponse> => {
    const response = await api.get<MediaAssetsListResponse>('/media-assets', {
      params: kind ? { kind } : undefined,
    });
    return response.data;
  },

  upload: async (file: File): Promise<MediaAssetResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<MediaAssetResponse>(
      '/media-assets/upload',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return response.data;
  },
};
