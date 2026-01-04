import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promptsApi } from '@/lib/api/prompts.api';
import type {
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
} from '@/lib/api/prompts.api';

export const usePrompts = () => {
  return useQuery({
    queryKey: ['prompts'],
    queryFn: () => promptsApi.getPrompts(),
  });
};

export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromptTemplateRequest) =>
      promptsApi.createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePromptTemplateRequest;
    }) => promptsApi.updatePrompt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promptsApi.deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
};

