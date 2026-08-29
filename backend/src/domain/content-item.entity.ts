export enum ContentItemMediaKind {
  IMAGE = 'image',
  VIDEO = 'video',
}

export class ContentItem {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly jobId: string,
    public readonly mediaKind: ContentItemMediaKind,
    public readonly mediaUrl: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly title: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    userId: string;
    jobId: string;
    mediaKind: ContentItemMediaKind;
    mediaUrl?: string | null;
    thumbnailUrl?: string | null;
    title?: string | null;
  }): ContentItem {
    const now = new Date();
    return new ContentItem(
      input.id,
      input.userId,
      input.jobId,
      input.mediaKind,
      input.mediaUrl ?? null,
      input.thumbnailUrl ?? null,
      input.title ?? null,
      now,
      now,
    );
  }

  withUpdates(fields: {
    mediaUrl?: string | null;
    thumbnailUrl?: string | null;
    title?: string | null;
  }): ContentItem {
    return new ContentItem(
      this.id,
      this.userId,
      this.jobId,
      this.mediaKind,
      fields.mediaUrl !== undefined ? fields.mediaUrl : this.mediaUrl,
      fields.thumbnailUrl !== undefined
        ? fields.thumbnailUrl
        : this.thumbnailUrl,
      fields.title !== undefined ? fields.title : this.title,
      this.createdAt,
      new Date(),
    );
  }
}
