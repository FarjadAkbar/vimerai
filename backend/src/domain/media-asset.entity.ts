export enum MediaAssetKind {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export class MediaAsset {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly kind: MediaAssetKind,
    public readonly name: string,
    public readonly url: string,
    public readonly mimeType: string | null,
    public readonly sizeBytes: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    userId: string;
    kind: MediaAssetKind;
    name: string;
    url: string;
    mimeType?: string | null;
    sizeBytes?: number | null;
  }): MediaAsset {
    const now = new Date();
    return new MediaAsset(
      input.id,
      input.userId,
      input.kind,
      input.name,
      input.url,
      input.mimeType ?? null,
      input.sizeBytes ?? null,
      now,
      now,
    );
  }
}
