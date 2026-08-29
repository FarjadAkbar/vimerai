import type { VideoAspectRatio } from '@/types/video-job/aspect-ratio';

export interface ViralRemixJobInput {
  brandId: string;
  formatId: string;
  referenceVideoUrl: string;
  referenceVideoMediaAssetId: string | null;
  productImageUrl: string | null;
  productImageMediaAssetId: string | null;
  personImageUrl: string | null;
  personImageMediaAssetId: string | null;
  instructions: string | null;
  aspectRatio: VideoAspectRatio;
  durationSeconds: number;
  quality: string;
  brandSnapshot: {
    id: string;
    name: string;
    logoUrl: string;
    colors: { primary: string; secondary: string };
    tone: string;
    audience: string;
    thingsToAvoid: string;
    aiInstructions: string | null;
  };
}

export interface CreateViralRemixInput {
  brandId: string;
  formatId: string;
  referenceVideoMediaAssetId?: string | null;
  referenceVideoUrl?: string | null;
  productImageMediaAssetId?: string | null;
  personImageMediaAssetId?: string | null;
  instructions?: string | null;
  aspectRatio?: VideoAspectRatio;
  durationSeconds?: number;
  quality?: string;
}

export interface ViralRemixJobResult {
  jobId: string;
  status: string;
  error: string | null;
  contentItemId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IViralRemixService {
  createRemix(
    userId: string,
    input: CreateViralRemixInput,
  ): Promise<ViralRemixJobResult>;
  getRemix(userId: string, jobId: string): Promise<ViralRemixJobResult>;
  regenerateRemix(
    userId: string,
    jobId: string,
  ): Promise<ViralRemixJobResult>;
}
