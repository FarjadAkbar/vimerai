import type { AiInfluencer } from '@/domain/ai-influencer.entity';

export type AiInfluencerResponse = {
  id: string;
  name: string;
  gender: AiInfluencer['gender'];
  age: number;
  ethnicity: string | null;
  appearancePrompt: string;
  portraitSource: AiInfluencer['portraitSource'];
  portraitMediaAssetId: string | null;
  portraitUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toAiInfluencerResponse(
  influencer: AiInfluencer,
): AiInfluencerResponse {
  return {
    id: influencer.id,
    name: influencer.name,
    gender: influencer.gender,
    age: influencer.age,
    ethnicity: influencer.ethnicity,
    appearancePrompt: influencer.appearancePrompt,
    portraitSource: influencer.portraitSource,
    portraitMediaAssetId: influencer.portraitMediaAssetId,
    portraitUrl: influencer.portraitUrl,
    createdAt: influencer.createdAt.toISOString(),
    updatedAt: influencer.updatedAt.toISOString(),
  };
}
