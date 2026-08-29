import { api } from './client';

export type AiImageJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type AiImageAspectRatio = '1:1' | '9:16' | '16:9' | '4:5';
export type AiImageOutputFormat = 'png' | 'jpeg';
export type AiImageGenerationMode = 'direct' | 'enhanced';

export interface AiImageContentItem {
  id: string;
  jobId: string;
  jobType: string;
  status: AiImageJobStatus;
  error: string | null;
  mediaKind: 'image';
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiImageListResponse {
  items: AiImageContentItem[];
}

export interface AiImageItemResponse {
  item: AiImageContentItem;
}

export type CreateAiImagePayload = {
  instructions: string;
  referenceMediaAssetIds: string[];
  aspectRatio?: AiImageAspectRatio;
  outputFormat?: AiImageOutputFormat;
  generationMode?: AiImageGenerationMode;
  negativePrompt?: string;
};

export const aiImagesApi = {
  list: async (): Promise<AiImageListResponse> => {
    const response = await api.get<AiImageListResponse>('/ai-images');
    return response.data;
  },

  get: async (jobId: string): Promise<AiImageItemResponse> => {
    const response = await api.get<AiImageItemResponse>(`/ai-images/${jobId}`);
    return response.data;
  },

  generate: async (
    payload: CreateAiImagePayload,
  ): Promise<AiImageItemResponse> => {
    const response = await api.post<AiImageItemResponse>(
      '/ai-images',
      payload,
    );
    return response.data;
  },

  regenerate: async (jobId: string): Promise<AiImageItemResponse> => {
    const response = await api.post<AiImageItemResponse>(
      `/ai-images/${jobId}/regenerate`,
    );
    return response.data;
  },
};
