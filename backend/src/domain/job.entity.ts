export enum JobType {
  TEMPLATE_SEED = 'template_seed',
  VIRAL_REMIX = 'viral_remix',
  BLITZ_COMPOSE = 'blitz_compose',
  AI_IMAGE = 'ai_image',
  INFLUENCER_IMAGE = 'influencer_image',
  INFLUENCER_VIDEO_I2V = 'influencer_video_i2v',
  INFLUENCER_TALKING_HEAD = 'influencer_talking_head',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class Job {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly brandId: string | null,
    public readonly type: JobType,
    public readonly status: JobStatus,
    public readonly input: Record<string, unknown>,
    public readonly error: string | null,
    public readonly providerJobId: string | null,
    public readonly creditCharge: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    userId: string;
    type: JobType;
    jobInput: Record<string, unknown>;
    brandId?: string | null;
    creditCharge?: number;
    status?: JobStatus;
    providerJobId?: string | null;
  }): Job {
    const now = new Date();
    return new Job(
      input.id,
      input.userId,
      input.brandId ?? null,
      input.type,
      input.status ?? JobStatus.PENDING,
      input.jobInput,
      null,
      input.providerJobId ?? null,
      input.creditCharge ?? 0,
      now,
      now,
    );
  }

  withUpdates(fields: {
    status?: JobStatus;
    error?: string | null;
    providerJobId?: string | null;
    input?: Record<string, unknown>;
  }): Job {
    return new Job(
      this.id,
      this.userId,
      this.brandId,
      this.type,
      fields.status ?? this.status,
      fields.input ?? this.input,
      fields.error !== undefined ? fields.error : this.error,
      fields.providerJobId !== undefined
        ? fields.providerJobId
        : this.providerJobId,
      this.creditCharge,
      this.createdAt,
      new Date(),
    );
  }
}
