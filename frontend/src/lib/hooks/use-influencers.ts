"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  aiInfluencersApi,
  type CreateAiInfluencerPayload,
} from "@/lib/api/ai-influencers.api";

export function useInfluencers() {
  const query = useQuery({
    queryKey: ["ai-influencers"],
    queryFn: () => aiInfluencersApi.list(),
  });

  return {
    influencers: query.data?.influencers ?? [],
    ready: !query.isLoading,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInfluencer(id: string | undefined) {
  return useQuery({
    queryKey: ["ai-influencers", id],
    queryFn: () => aiInfluencersApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useCreateInfluencer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAiInfluencerPayload) =>
      aiInfluencersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-influencers"] });
    },
  });
}

export function useDeleteInfluencer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => aiInfluencersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-influencers"] });
    },
  });
}
