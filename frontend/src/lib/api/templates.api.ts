import { api } from './client';

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

export const templatesApi = {
  listBlitz: async (): Promise<TemplateListResponse> => {
    const response = await api.get<TemplateListResponse>('/templates/blitz');
    return response.data;
  },

  listViralRemix: async (): Promise<TemplateListResponse> => {
    const response = await api.get<TemplateListResponse>(
      '/templates/viral-remix',
    );
    return response.data;
  },

  generateBlitzSamples: async (): Promise<TemplateListResponse> => {
    const response = await api.post<TemplateListResponse>(
      '/templates/blitz/samples',
    );
    return response.data;
  },

  generateViralRemixSamples: async (): Promise<TemplateListResponse> => {
    const response = await api.post<TemplateListResponse>(
      '/templates/viral-remix/samples',
    );
    return response.data;
  },
};
