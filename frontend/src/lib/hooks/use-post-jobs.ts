import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postJobsApi } from '@/lib/api/post-jobs.api';
import type { CreatePostJobRequest } from '@/lib/api/post-jobs.api';

export const usePostJobs = (enabled = true) => {
  return useQuery({
    queryKey: ['post-jobs'],
    queryFn: () => postJobsApi.list(),
    enabled,
  });
};

export const useCreatePostJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostJobRequest) => postJobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-jobs'] });
    },
  });
};

export const useRegeneratePostJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postJobsApi.regenerate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-jobs'] });
    },
  });
};
