import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { imageJobsApi } from '@/lib/api/image-jobs.api';
import type { CreateImageJobRequest } from '@/lib/api/image-jobs.api';

export const useImageJobs = (enabled = true) => {
  return useQuery({
    queryKey: ['image-jobs'],
    queryFn: () => imageJobsApi.list(),
    enabled,
  });
};

export const useCreateImageJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateImageJobRequest) => imageJobsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-jobs'] });
    },
  });
};

export const useRegenerateImageJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imageJobsApi.regenerate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['image-jobs'] });
    },
  });
};
