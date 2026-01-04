import { useMutation, useQuery } from '@tanstack/react-query';
import { generatorApi } from '@/lib/api/generator.api';
import type {
  GenerateVideoRequest,
  GeneratePreviewRequest,
} from '@/lib/api/generator.api';

export const useGenerateVideo = () => {
  return useMutation({
    mutationFn: (data: GenerateVideoRequest) =>
      generatorApi.generateVideo(data),
  });
};

export const useGeneratePreview = () => {
  return useMutation({
    mutationFn: (data: GeneratePreviewRequest) =>
      generatorApi.generatePreview(data),
  });
};

export const useGenerationStatus = (jobId: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['generation-status', jobId],
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required');
      return generatorApi.getGenerationStatus(jobId);
    },
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 3000; // Poll every 3 seconds
      }
      return false; // Stop polling when completed or failed
    },
  });
};

