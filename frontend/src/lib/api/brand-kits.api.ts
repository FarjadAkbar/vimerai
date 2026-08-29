import { api } from './client';
import type { BlitzConfig } from '@/components/studio/blitz-data';

export type BrandKitTone =
  | 'luxury'
  | 'professional'
  | 'playful'
  | 'bold'
  | 'friendly';

export interface BrandKitColors {
  primary: string;
  secondary?: string;
}

export interface BusinessDna {
  websiteUrl: string;
  typography: string | null;
  colorPalette: string[];
  tagline: string | null;
  values: string[];
  aesthetic: string[];
  toneOfVoice: string | null;
  imageStyle: string | null;
  writingStyle: string | null;
  industry: string | null;
  primaryLanguage: string | null;
  elevatorPitch: string | null;
}

export interface BrandKit {
  id: string;
  userId: string;
  name: string;
  logoUrl: string;
  colors: { primary: string; secondary: string };
  tone: BrandKitTone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
  businessDna: BusinessDna | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandKitsListResponse {
  brandKits: BrandKit[];
}

export interface BlitzConfiguration extends BlitzConfig {
  brandId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlitzConfigurationResponse {
  configuration: BlitzConfiguration;
}

export interface BrandKitResponse {
  brandKit: BrandKit;
}

export interface CreateBrandKitRequest {
  name: string;
  logoUrl: string;
  colors: BrandKitColors;
  tone: BrandKitTone;
  audience?: string;
  thingsToAvoid?: string;
  aiInstructions?: string;
  businessDna?: BusinessDna | null;
}

export interface UpdateBrandKitRequest {
  name?: string;
  logoUrl?: string;
  colors?: BrandKitColors;
  tone?: BrandKitTone;
  audience?: string;
  thingsToAvoid?: string;
  aiInstructions?: string | null;
  businessDna?: BusinessDna | null;
}

export interface GenerateBusinessDnaRequest {
  url: string;
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

  generateBusinessDna: async (
    data: GenerateBusinessDnaRequest,
  ): Promise<BrandKitResponse> => {
    const response = await api.post<BrandKitResponse>(
      '/brand-kits/business-dna',
      data,
    );
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

  getBlitzConfiguration: async (
    brandId: string,
  ): Promise<BlitzConfigurationResponse> => {
    const response = await api.get<BlitzConfigurationResponse>(
      `/brand-kits/${brandId}/blitz-configuration`,
    );
    return response.data;
  },

  updateBlitzConfiguration: async (
    brandId: string,
    configuration: BlitzConfig,
  ): Promise<BlitzConfigurationResponse> => {
    const response = await api.put<BlitzConfigurationResponse>(
      `/brand-kits/${brandId}/blitz-configuration`,
      configuration,
    );
    return response.data;
  },
};
