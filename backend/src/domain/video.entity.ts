export enum VideoStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum GenerationMode {
  FAST = 'fast',
  CINEMATIC = 'cinematic',
  AVATAR = 'avatar',
}

export class Video {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly prompt: string,
    public readonly mode: GenerationMode,
    public readonly status: VideoStatus,
    public readonly videoUrl: string | null,
    public readonly previewUrl: string | null,
    public readonly jobId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    prompt: string,
    mode: GenerationMode,
    jobId: string,
  ): Video {
    const now = new Date();
    return new Video(
      id,
      userId,
      prompt,
      mode,
      VideoStatus.PENDING,
      null,
      null,
      jobId,
      now,
      now,
    );
  }

  updateStatus(status: VideoStatus, videoUrl?: string | null): Video {
    return new Video(
      this.id,
      this.userId,
      this.prompt,
      this.mode,
      status,
      videoUrl ?? this.videoUrl,
      this.previewUrl,
      this.jobId,
      this.createdAt,
      new Date(),
    );
  }

  updatePreviewUrl(previewUrl: string): Video {
    return new Video(
      this.id,
      this.userId,
      this.prompt,
      this.mode,
      this.status,
      this.videoUrl,
      previewUrl,
      this.jobId,
      this.createdAt,
      new Date(),
    );
  }

  updateJobId(jobId: string): Video {
    return new Video(
      this.id,
      this.userId,
      this.prompt,
      this.mode,
      this.status,
      this.videoUrl,
      this.previewUrl,
      jobId,
      this.createdAt,
      new Date(),
    );
  }
}
