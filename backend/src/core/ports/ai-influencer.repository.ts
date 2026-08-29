import type { AiInfluencer } from '@/domain/ai-influencer.entity';

export interface IAiInfluencerRepository {
  create(influencer: AiInfluencer): Promise<void>;
  findById(id: string): Promise<AiInfluencer | null>;
  findByUserId(userId: string): Promise<AiInfluencer[]>;
  delete(id: string): Promise<void>;
}
