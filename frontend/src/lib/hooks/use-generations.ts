import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generationsApi,
  type CreateGenerationRequest,
  type ManualEditGenerationRequest,
  type RegenerateSectionRequest,
  type RegenerateShotRequest,
  type RenderPostConceptsRequest,
  type RetryFailedArmsRequest,
} from '@/lib/api/generations.api';

export const useCreateGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGenerationRequest) => generationsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['generations', 'list'] });
    },
  });
};

export const useGenerations = (enabled = true) => {
  return useQuery({
    queryKey: ['generations', 'list'],
    queryFn: () => generationsApi.list(),
    enabled,
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
      void queryClient.invalidateQueries({ queryKey: ['generations', 'list'] });
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
      void queryClient.invalidateQueries({ queryKey: ['generations', 'list'] });
    },
  });
};

export const useRegenerateShot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data?: RegenerateShotRequest;
    }) => generationsApi.regenerateShot(id, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['generations', result.generation.id], result);
      void queryClient.invalidateQueries({ queryKey: ['generations', 'list'] });
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
      void queryClient.invalidateQueries({ queryKey: ['generations', 'list'] });
    },
  });
};

export const useRenderPostConcepts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: RenderPostConceptsRequest;
    }) => generationsApi.renderPostConcepts(id, data),
    onSuccess: (result) => {
      queryClient.setQueryData(['generations', result.generation.id], result);
      void queryClient.invalidateQueries({ queryKey: ['generations', 'list'] });
    },
  });
};
