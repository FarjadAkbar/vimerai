"use client";

import { useQuery } from "@tanstack/react-query";
import {
  contentLibraryApi,
  type ContentStatusBucket,
} from "@/lib/api/content-library.api";
import {
  mediaAssetsApi,
  type MediaAssetKind,
} from "@/lib/api/media-assets.api";

export function useContentLibrary(statusBucket?: ContentStatusBucket) {
  return useQuery({
    queryKey: ["content-library", statusBucket ?? "all"],
    queryFn: () => contentLibraryApi.list(statusBucket),
  });
}

export function useMediaStore(kind?: MediaAssetKind) {
  return useQuery({
    queryKey: ["media-assets", kind ?? "all"],
    queryFn: () => mediaAssetsApi.list(kind),
  });
}

export function formatJobTypeLabel(jobType: string): string {
  switch (jobType) {
    case "viral_remix":
      return "Viral Remix";
    case "blitz_compose":
      return "Blitz";
    case "ai_image":
      return "AI Image";
    case "influencer_image":
      return "Influencer Image";
    case "influencer_video_i2v":
      return "Influencer Video";
    case "influencer_talking_head":
      return "Talking Head";
    default:
      return jobType.replace(/_/g, " ");
  }
}
