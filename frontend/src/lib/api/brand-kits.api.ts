import { api } from './client';

export type BrandKitTone =
  | 'luxury'
  | 'professional'
  | 'playful'
  | 'bold'
  | 'friendly';

export interface BrandKitColors {
  primary: string;
  secondary: string;
}

export interface BrandKit {
  id: string;
  userId: string;
  name: string;
  logoUrl: string;
  colors: BrandKitColors;
  tone: BrandKitTone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandKitsListResponse {
  brandKits: BrandKit[];
}

export interface BrandKitResponse {
  brandKit: BrandKit;
}

export interface CreateBrandKitRequest {
  name: string;
  logoUrl: string;
  colors: BrandKitColors;
  tone: BrandKitTone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions?: string;
}

export interface UpdateBrandKitRequest {
  name?: string;
  logoUrl?: string;
  colors?: BrandKitColors;
  tone?: BrandKitTone;
  audience?: string;
  thingsToAvoid?: string;
  aiInstructions?: string | null;
}

export const brandKitsApi = {
  list: async (): Promise<BrandKitsListResponse> => {
    const response = await api.get<BrandKitsListResponse>('/brand-kits');
    return response.data;
  },

  create: async (data: CreateBrandKitRequest): Promise<BrandKitResponse> => {
    const response = await api.post<BrandKitResponse>('/brand-kits', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateBrandKitRequest,
  ): Promise<BrandKitResponse> => {
    const response = await api.put<BrandKitResponse>(`/brand-kits/${id}`, data);
    return response.data;
  },

  uploadLogo: async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ logoUrl: string }>(
      '/brand-kits/logo',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );
    return response.data;
  },
};
