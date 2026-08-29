"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  influencerImagesApi,
  type CreateInfluencerImagePayload,
} from "@/lib/api/influencer-images.api";

function influencerImagesKey(influencerId: string) {
  return ["ai-influencers", influencerId, "images"] as const;
}

function influencerVideosKey(influencerId: string) {
  return ["ai-influencers", influencerId, "videos"] as const;
}

export function useInfluencerImages(influencerId: string | undefined) {
  return useQuery({
    queryKey: influencerImagesKey(influencerId ?? ""),
    queryFn: () => influencerImagesApi.list(influencerId!),
    enabled: Boolean(influencerId),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const hasBuilding = items.some(
        (item) => item.status === "pending" || item.status === "processing",
      );
      return hasBuilding ? 3000 : false;
    },
  });
}

export function useInfluencerVideos(influencerId: string | undefined) {
  return useQuery({
    queryKey: influencerVideosKey(influencerId ?? ""),
    queryFn: () => influencerImagesApi.listVideos(influencerId!),
    enabled: Boolean(influencerId),
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      const hasBuilding = items.some(
        (item) => item.status === "pending" || item.status === "processing",
      );
      return hasBuilding ? 3000 : false;
    },
  });
}

export function useGenerateInfluencerImage(influencerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInfluencerImagePayload) =>
      influencerImagesApi.generate(influencerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: influencerImagesKey(influencerId),
      });
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}

export function useAnimateInfluencerImage(influencerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentItemId: string) =>
      influencerImagesApi.animate(influencerId, contentItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: influencerVideosKey(influencerId),
      });
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });
}
