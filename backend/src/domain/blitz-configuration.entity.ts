export type MentionFrequency =
  | 'never'
  | 'rarely'
  | 'sometimes'
  | 'often'
  | 'always';

export type BlitzFormatSlug =
  | 'slideshow'
  | 'wall-of-text'
  | 'hook-demo'
  | 'green-screen';

export type BlitzEnabledFormats = Record<BlitzFormatSlug, boolean>;

export const DEFAULT_BLITZ_ENABLED_FORMATS: BlitzEnabledFormats = {
  slideshow: true,
  'wall-of-text': true,
  'hook-demo': true,
  'green-screen': true,
};

export class BlitzConfiguration {
  constructor(
    public readonly id: string,
    public readonly brandId: string,
    public readonly userId: string,
    public readonly mentionFrequency: MentionFrequency,
    public readonly showInfluencerMaterials: boolean,
    public readonly enabledFormats: BlitzEnabledFormats,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static createDefault(
    id: string,
    brandId: string,
    userId: string,
  ): BlitzConfiguration {
    const now = new Date();
    return new BlitzConfiguration(
      id,
      brandId,
      userId,
      'sometimes',
      false,
      { ...DEFAULT_BLITZ_ENABLED_FORMATS },
      now,
      now,
    );
  }

  withUpdates(fields: {
    mentionFrequency?: MentionFrequency;
    showInfluencerMaterials?: boolean;
    enabledFormats?: BlitzEnabledFormats;
  }): BlitzConfiguration {
    return new BlitzConfiguration(
      this.id,
      this.brandId,
      this.userId,
      fields.mentionFrequency ?? this.mentionFrequency,
      fields.showInfluencerMaterials ?? this.showInfluencerMaterials,
      fields.enabledFormats ?? this.enabledFormats,
      this.createdAt,
      new Date(),
    );
  }
}
