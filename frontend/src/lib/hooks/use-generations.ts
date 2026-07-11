import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generationsApi,
  type CreateGenerationRequest,
  type ManualEditGenerationRequest,
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
