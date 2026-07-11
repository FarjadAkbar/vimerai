import { useMutation, useQuery } from '@tanstack/react-query';
import { generatorApi } from '@/lib/api/generator.api';
import type { GenerateVideoRequest } from '@/lib/api/generator.api';

const POLL_INTERVAL_MS = 5000;

export const useGenerateVideo = () => {
  return useMutation({
    mutationFn: ({
      data,
      type = 'full',
    }: {
      data: GenerateVideoRequest;
      type?: 'preview' | 'full';
    }) => generatorApi.generateVideo(data, type),
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
        return POLL_INTERVAL_MS;
      }
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return POLL_INTERVAL_MS;
    },
    // fal jobs can run for several minutes; keep retrying transient failures
    retry: (failureCount) => failureCount < 60,
    retryDelay: POLL_INTERVAL_MS,
    throwOnError: false,
  });
};
