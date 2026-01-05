import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { generatorApi } from '@/lib/api/generator.api';
import type {
  GenerateVideoRequest,
  GeneratePreviewRequest,
} from '@/lib/api/generator.api';

export const useGenerateVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GenerateVideoRequest) =>
      generatorApi.generateVideo(data),
    onSuccess: () => {
      // Invalidate videos query so home page and other pages pick up the new video
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
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
      // Continue polling until we get a final status (completed or failed)
      if (data?.status === 'pending' || data?.status === 'processing') {
        return 3000; // Poll every 3 seconds
      }
      // Stop polling only when we have a final status
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      // If no data yet or unknown status, keep polling
      return 3000;
    },
    // Retry on error to ensure we keep polling even if API temporarily fails
    retry: (failureCount, error) => {
      // Always retry for processing videos (up to 20 times = 1 minute of retries)
      // This ensures we don't give up too early if API has temporary issues
      return failureCount < 20;
    },
    retryDelay: 3000, // Retry after 3 seconds
    // Don't throw errors immediately - let the polling continue
    throwOnError: false,
  });
};

