export enum InfluencerGender {
  FEMALE = 'female',
  MALE = 'male',
  NON_BINARY = 'non_binary',
}

export enum PortraitSource {
  AI = 'ai',
  UPLOAD = 'upload',
}

export class AiInfluencer {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly gender: InfluencerGender,
    public readonly age: number,
    public readonly ethnicity: string | null,
    public readonly appearancePrompt: string,
    public readonly portraitSource: PortraitSource,
    public readonly portraitMediaAssetId: string | null,
    public readonly portraitUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(input: {
    id: string;
    userId: string;
    name: string;
    gender: InfluencerGender;
    age: number;
    ethnicity?: string | null;
    appearancePrompt: string;
    portraitSource: PortraitSource;
    portraitMediaAssetId?: string | null;
    portraitUrl?: string | null;
  }): AiInfluencer {
    const now = new Date();
    return new AiInfluencer(
      input.id,
      input.userId,
      input.name,
      input.gender,
      input.age,
      input.ethnicity ?? null,
      input.appearancePrompt,
      input.portraitSource,
      input.portraitMediaAssetId ?? null,
      input.portraitUrl ?? null,
      now,
      now,
    );
  }
}
