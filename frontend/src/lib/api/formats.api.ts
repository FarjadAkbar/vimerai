import { api } from './client';

export type FormatModality = 'post' | 'video' | 'both';
export type FormatListMode = 'post' | 'video';

export interface Format {
  id: string;
  label: string;
  description: string;
  modality: FormatModality;
  promptStructure: string;
}

export interface FormatsListResponse {
  formats: Format[];
}

export const formatsApi = {
  list: async (modality: FormatListMode): Promise<FormatsListResponse> => {
    const response = await api.get<FormatsListResponse>('/formats', {
      params: { modality },
    });
    return response.data;
  },
};
