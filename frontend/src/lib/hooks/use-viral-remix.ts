"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  viralRemixApi,
  type CreateViralRemixPayload,
} from "@/lib/api/viral-remix.api";
import {
  contentLibraryApi,
  type ContentLibraryItem,
  type ContentLibraryJobStatus,
} from "@/lib/api/content-library.api";

export function useCreateViralRemix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateViralRemixPayload) =>
      viralRemixApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}

export function useViralRemixJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ["viral-remix", jobId],
    queryFn: () => viralRemixApi.get(jobId!),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.remix.status;
      if (status === "pending" || status === "processing") {
        return 3000;
      }
      return false;
    },
  });
}

export function useRegenerateViralRemix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => viralRemixApi.regenerate(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}

export function useContentLibrary(jobStatus?: ContentLibraryJobStatus) {
  return useQuery({
    queryKey: ["content-library", jobStatus ?? "all"],
    queryFn: () => contentLibraryApi.list(jobStatus),
  });
}
