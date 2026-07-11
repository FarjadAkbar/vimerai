import { useMutation, useQuery } from '@tanstack/react-query';
import {
  generationsApi,
  type CreateGenerationRequest,
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
