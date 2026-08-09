import type { Tone } from '@/types/generation/enums';
import type { FormatModality } from '@/types/format/format';

export type PostJobStatus =
  | 'processing'
  | 'completed'
  | 'failed';

export interface PostJobBrandSnapshot {
  id: string;
  name: string;
  logoUrl: string;
  colors: { primary: string; secondary: string };
  tone: Tone;
  audience: string;
  thingsToAvoid: string;
  aiInstructions: string | null;
}

export interface PostJobProductSnapshot {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  landingPageUrl: string;
  price: string | null;
}

export interface PostJobFormatSnapshot {
  id: string;
  label: string;
  description: string;
  modality: FormatModality;
  promptStructure: string;
}

export interface PostJobSnapshot {
  brand: PostJobBrandSnapshot;
  product: PostJobProductSnapshot;
  format: PostJobFormatSnapshot;
}

export class PostJob {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly brandId: string,
    public readonly productId: string,
    public readonly formatId: string,
    public readonly snapshot: PostJobSnapshot,
    public readonly status: PostJobStatus,
    public readonly postImageUrl: string | null,
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
    snapshot: PostJobSnapshot;
    creditCharge: number;
  }): PostJob {
    const now = new Date();
    return new PostJob(
      input.id,
      input.userId,
      input.brandId,
      input.productId,
      input.formatId,
      input.snapshot,
      'processing',
      null,
      input.creditCharge,
      null,
      now,
      now,
    );
  }

  withUpdates(fields: {
    status?: PostJobStatus;
    postImageUrl?: string | null;
    error?: string | null;
  }): PostJob {
    return new PostJob(
      this.id,
      this.userId,
      this.brandId,
      this.productId,
      this.formatId,
      this.snapshot,
      fields.status ?? this.status,
      fields.postImageUrl !== undefined
        ? fields.postImageUrl
        : this.postImageUrl,
      this.creditCharge,
      fields.error !== undefined ? fields.error : this.error,
      this.createdAt,
      new Date(),
    );
  }
}
