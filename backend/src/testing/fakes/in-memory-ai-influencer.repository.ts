import type { AiInfluencer } from '@/domain/ai-influencer.entity';

export class InMemoryAiInfluencerRepository {
  private readonly store = new Map<string, AiInfluencer>();

  async create(influencer: AiInfluencer): Promise<void> {
    this.store.set(influencer.id, influencer);
  }

  async findById(id: string): Promise<AiInfluencer | null> {
    return this.store.get(id) ?? null;
  }

  async findByUserId(userId: string): Promise<AiInfluencer[]> {
    return [...this.store.values()]
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
