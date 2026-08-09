import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { videoJobsApi } from '@/lib/api/video-jobs.api';
import type { CreateVideoJobRequest } from '@/lib/api/video-jobs.api';

export const useVideoJobs = (enabled = true) => {
  return useQuery({
    queryKey: ['video-jobs'],
    queryFn: () => videoJobsApi.list(),
    enabled,
  });
};

export const useCreateVideoJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVideoJobRequest) => videoJobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
    },
  });
};

export const useRegenerateVideoJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => videoJobsApi.regenerate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-jobs'] });
    },
  });
};
