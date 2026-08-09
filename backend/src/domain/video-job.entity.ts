import type { Tone } from '@/types/generation/enums';
import type { FormatModality } from '@/types/format/format';
import type { ReelPlatform } from '@/types/video-job/reel-platform';

export type VideoJobStatus = 'processing' | 'completed' | 'failed';

export interface VideoJobBrandSnapshot {
  id: string;
  name: string;
  logoUrl: string;
  colors: { primary: string; secondary: string };
  tone: Tone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
}

export interface VideoJobProductSnapshot {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price: string | null;
}

export interface VideoJobFormatSnapshot {
  id: string;
  label: string;
  description: string;
  modality: FormatModality;
  promptStructure: string;
}

export interface VideoJobSnapshot {
  brand: VideoJobBrandSnapshot;
  product: VideoJobProductSnapshot;
  format: VideoJobFormatSnapshot;
  reelPlatform: ReelPlatform;
}

export class VideoJob {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly brandId: string,
    public readonly productId: string,
    public readonly formatId: string,
    public readonly reelPlatform: ReelPlatform,
    public readonly snapshot: VideoJobSnapshot,
    public readonly status: VideoJobStatus,
    public readonly videoUrl: string | null,
    public readonly durationTargetSeconds: number,
    public readonly creditCharge: number,
    public readonly error: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    userId: string;
    brandId: string;
    productId: string;
    formatId: string;
    reelPlatform: ReelPlatform;
    snapshot: VideoJobSnapshot;
    durationTargetSeconds: number;
    creditCharge: number;
  }): VideoJob {
    const now = new Date();
    return new VideoJob(
      input.id,
      input.userId,
      input.brandId,
      input.productId,
      input.formatId,
      input.reelPlatform,
      input.snapshot,
      'processing',
      null,
      input.durationTargetSeconds,
      input.creditCharge,
      null,
      now,
      now,
    );
  }

  withUpdates(fields: {
    status?: VideoJobStatus;
    videoUrl?: string | null;
    error?: string | null;
  }): VideoJob {
    return new VideoJob(
      this.id,
      this.userId,
      this.brandId,
      this.productId,
      this.formatId,
      this.reelPlatform,
      this.snapshot,
      fields.status ?? this.status,
      fields.videoUrl !== undefined ? fields.videoUrl : this.videoUrl,
      this.durationTargetSeconds,
      this.creditCharge,
      fields.error !== undefined ? fields.error : this.error,
      this.createdAt,
      new Date(),
    );
  }
}
