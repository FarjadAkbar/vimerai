import { api } from './client';

export interface ActiveKitResponse {
  id: string;
  name: string;
  tagline: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  shotTemplates: string[];
  assets: Array<{ key: string; url?: string }>;
}

export const kitsApi = {
  getActive: async (): Promise<ActiveKitResponse> => {
    const response = await api.get<ActiveKitResponse>('/kits/active');
    return response.data;
  },
};
