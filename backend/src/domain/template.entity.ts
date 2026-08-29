export enum TemplateType {
  BLITZ = 'blitz',
  VIRAL_REMIX = 'viral_remix',
}

export enum BlitzContentType {
  SLIDESHOW = 'slideshow',
  WALL_OF_TEXT = 'wall_of_text',
  HOOK_DEMO = 'hook_demo',
  GREEN_SCREEN = 'green_screen',
}

export enum TemplateStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class Template {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly type: TemplateType,
    public readonly contentType: BlitzContentType | null,
    public readonly label: string,
    public readonly prompt: string,
    public readonly videoUrl: string | null,
    public readonly previewUrl: string | null,
    public readonly durationLabel: string | null,
    public readonly remixFormatId: string | null,
    public readonly status: TemplateStatus,
    public readonly providerJobId: string | null,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    slug: string;
    type: TemplateType;
    label: string;
    prompt: string;
    contentType?: BlitzContentType | null;
    durationLabel?: string | null;
    remixFormatId?: string | null;
    videoUrl?: string | null;
    previewUrl?: string | null;
    status?: TemplateStatus;
    providerJobId?: string | null;
    active?: boolean;
  }): Template {
    const now = new Date();
    return new Template(
      input.id,
      input.slug,
      input.type,
      input.contentType ?? null,
      input.label,
      input.prompt,
      input.videoUrl ?? null,
      input.previewUrl ?? null,
      input.durationLabel ?? null,
      input.remixFormatId ?? null,
      input.status ?? TemplateStatus.PENDING,
      input.providerJobId ?? null,
      input.active ?? true,
      now,
      now,
    );
  }

  withUpdates(fields: {
    videoUrl?: string | null;
    previewUrl?: string | null;
    status?: TemplateStatus;
    providerJobId?: string | null;
    active?: boolean;
  }): Template {
    return new Template(
      this.id,
      this.slug,
      this.type,
      this.contentType,
      this.label,
      this.prompt,
      fields.videoUrl !== undefined ? fields.videoUrl : this.videoUrl,
      fields.previewUrl !== undefined ? fields.previewUrl : this.previewUrl,
      this.durationLabel,
      this.remixFormatId,
      fields.status ?? this.status,
      fields.providerJobId !== undefined
        ? fields.providerJobId
        : this.providerJobId,
      fields.active ?? this.active,
      this.createdAt,
      new Date(),
    );
  }
}
