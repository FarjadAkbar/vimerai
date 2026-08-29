"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  blitzComposeApi,
  type ComposeBlitzEditPayload,
} from "@/lib/api/blitz-compose.api";

export function useComposeBlitzEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ComposeBlitzEditPayload) =>
      blitzComposeApi.compose(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}
