import type {
  AiInfluencer,
  InfluencerGender,
  PortraitSource,
} from '@/domain/ai-influencer.entity';

export interface CreateAiInfluencerInput {
  name: string;
  gender: InfluencerGender;
  age: number;
  ethnicity?: string | null;
  appearancePrompt: string;
  portraitSource: PortraitSource;
  portraitMediaAssetId?: string | null;
  portraitUrl?: string | null;
}

export interface IAiInfluencerService {
  listInfluencers(userId: string): Promise<AiInfluencer[]>;
  getInfluencer(userId: string, id: string): Promise<AiInfluencer>;
  createInfluencer(
    userId: string,
    input: CreateAiInfluencerInput,
  ): Promise<AiInfluencer>;
  deleteInfluencer(userId: string, id: string): Promise<void>;
}
