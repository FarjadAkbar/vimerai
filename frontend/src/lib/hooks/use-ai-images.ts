"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  aiImagesApi,
  type CreateAiImagePayload,
} from "@/lib/api/ai-images.api";

export function useAiImages() {
  return useQuery({
    queryKey: ["ai-images"],
    queryFn: () => aiImagesApi.list(),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const hasBuilding = items.some(
        (item) => item.status === "pending" || item.status === "processing",
      );
      return hasBuilding ? 3000 : false;
    },
  });
}

export function useAiImageJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ["ai-images", jobId],
    queryFn: () => aiImagesApi.get(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.item.status;
      if (status === "pending" || status === "processing") {
        return 3000;
      }
      return false;
    },
  });
}

export function useGenerateAiImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAiImagePayload) => aiImagesApi.generate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-images"] });
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}

export function useRegenerateAiImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => aiImagesApi.regenerate(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-images"] });
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}
