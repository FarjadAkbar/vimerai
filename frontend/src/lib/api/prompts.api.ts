import { api } from './client';

export interface PromptTemplate {
  id: string;
  userId: string;
  name: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptsListResponse {
  prompts: PromptTemplate[];
}

export interface CreatePromptTemplateRequest {
  name: string;
  template: string;
}

export interface UpdatePromptTemplateRequest {
  name?: string;
  template?: string;
}

export interface PromptTemplateResponse {
  prompt: PromptTemplate;
}

export const promptsApi = {
  getPrompts: async (): Promise<PromptsListResponse> => {
    const response = await api.get<PromptsListResponse>('/prompts');
    return response.data;
  },

  createPrompt: async (
    data: CreatePromptTemplateRequest,
  ): Promise<PromptTemplateResponse> => {
    const response = await api.post<PromptTemplateResponse>('/prompts', data);
    return response.data;
  },

  updatePrompt: async (
    id: string,
    data: UpdatePromptTemplateRequest,
  ): Promise<PromptTemplateResponse> => {
    const response = await api.put<PromptTemplateResponse>(
      `/prompts/${id}`,
      data,
    );
    return response.data;
  },

  deletePrompt: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/prompts/${id}`);
    return response.data;
  },
};

