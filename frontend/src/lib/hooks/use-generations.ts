import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generationsApi,
  type CreateGenerationRequest,
  type ManualEditGenerationRequest,
  type RegenerateSectionRequest,
  type RetryFailedArmsRequest,
} from '@/lib/api/generations.api';

export const useCreateGeneration = () => {
  return useMutation({
    mutationFn: (data: CreateGenerationRequest) => generationsApi.create(data),
  });
};

export const useGeneration = (id: string | null, enabled = true) => {
  return useQuery({
    queryKey: ['generations', id],
    queryFn: () => generationsApi.get(id!),
    enabled: enabled && !!id,
  });
};

export const useUpdateGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ManualEditGenerationRequest;
    }) => generationsApi.update(id, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['generations', result.generation.id], result);
    },
  });
};

export const useRegenerateSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RegenerateSectionRequest;
    }) => generationsApi.regenerateSection(id, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['generations', result.generation.id], result);
    },
  });
};

export const useRetryFailedArms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: RetryFailedArmsRequest;
    }) => generationsApi.retryFailedArms(id, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['generations', result.generation.id], result);
    },
  });
};
