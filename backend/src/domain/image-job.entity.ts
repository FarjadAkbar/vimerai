export type ImageJobStatus = 'processing' | 'completed' | 'failed';

export class ImageJob {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly prompt: string,
    public readonly referenceImageUrls: string[],
    public readonly negativePrompt: string | null,
    public readonly status: ImageJobStatus,
    public readonly imageUrl: string | null,
    public readonly creditCharge: number,
    public readonly error: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    userId: string;
    prompt: string;
    referenceImageUrls: string[];
    negativePrompt?: string | null;
    creditCharge: number;
  }): ImageJob {
    const now = new Date();
    return new ImageJob(
      input.id,
      input.userId,
      input.prompt,
      input.referenceImageUrls,
      input.negativePrompt ?? null,
      'processing',
      null,
      input.creditCharge,
      null,
      now,
      now,
    );
  }

  withUpdates(fields: {
    status?: ImageJobStatus;
    imageUrl?: string | null;
    error?: string | null;
  }): ImageJob {
    return new ImageJob(
      this.id,
      this.userId,
      this.prompt,
      this.referenceImageUrls,
      this.negativePrompt,
      fields.status ?? this.status,
      fields.imageUrl !== undefined ? fields.imageUrl : this.imageUrl,
      this.creditCharge,
      fields.error !== undefined ? fields.error : this.error,
      this.createdAt,
      new Date(),
    );
  }
}
